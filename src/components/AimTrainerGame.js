import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import useLocalStorage from "../shared/hooks/useLocalStorage";
import Popup from "./Popup";
import Leaderboard from "./Leaderboard";
import useInterval from "../hooks/useInterval";
import useTimeout from "../hooks/useTimeout";
import unknown from "../assets/images/grey.png";

// Custom hook for timer logic
function useGameTimer(initialTime = '00:30') {
  const [timer, setTimer] = useState(initialTime);
  const timerRef = useRef(null);

  const getTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    return {
      total, minutes, seconds
    };
  };

  const startTimer = (endTime) => {
    const { total, minutes, seconds } = getTimeRemaining(endTime);
    if (total >= 0) {
      setTimer(
        (minutes > 9 ? minutes : '0' + minutes) + ':' +
        (seconds > 9 ? seconds : '0' + seconds)
      );
    }
  };

  const clearTimer = (endTime) => {
    setTimer(initialTime);
    if (timerRef.current) clearInterval(timerRef.current);

    const id = setInterval(() => {
      startTimer(endTime);
    }, 1000);

    timerRef.current = id;
    return () => clearInterval(id);
  };

  const getDeadTime = () => {
    let deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + parseInt(initialTime.split(':')[1]));
    return deadline;
  };

  const startCountdown = () => {
    return clearTimer(getDeadTime());
  };

  return {
    timer,
    startCountdown,
    timerRef
  };
}

// Custom hook for bullet holes
function useBulletHoles() {
  const [bulletHoles, setBulletHoles] = useState([]);

  const addBulletHole = (x, y, image) => {
    setBulletHoles(prevBulletHoles => [
      ...prevBulletHoles,
      { x, y, image }
    ]);
  };

  const clearBulletHoles = () => {
    setBulletHoles([]);
  };

  return {
    bulletHoles,
    addBulletHole,
    clearBulletHoles
  };
}

const AimTrainerGame = ({ onBack }) => {
  // Game state
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);
  const btnRef = useRef(null);
  const [highscore, setHighscore] = useLocalStorage('aimhighscore', 0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [leadopenFlag, setLeadOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const nameInputRef = useRef(null);
  const [existingPlayers, setExistingPlayers] = useLocalStorage('aimplayers', []);
  const [showpopup, setShowPopUp] = useState(false);

  // Custom hooks
  const { timer, startCountdown, timerRef } = useGameTimer('00:30');
  const { bulletHoles, addBulletHole, clearBulletHoles } = useBulletHoles();

  // Button positioning
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const getPosition = () => {
    if (!btnRef.current) return;

    const maxX = window.innerWidth - btnRef.current.offsetWidth;
    const maxY = window.innerHeight - btnRef.current.offsetHeight;

    const newX = Math.floor(Math.random() * maxX);
    const newY = Math.floor(Math.random() * maxY);

    setX(newX);
    setY(newY);
  };

  // Handle click on target
  const handleClick = () => {
    setCount(prevCount => prevCount + 1);
    addBulletHole(x + 20, y + 20, unknown);
    getPosition();
  };

  // Game logic for time over
  const timeOver = () => {
    setVisible(true);
    setShowPopUp(true);

    if (count > highscore) {
      setHighscore(count);
    }
  };

  // Start the game
  const handlePlay = () => {
    setVisible(false);
    setCount(0);
    clearBulletHoles();
    getPosition();
    startCountdown();
  };

  // Timer effect
  useEffect(() => {
    if (timer === '00:00' && !visible) {
      timeOver();
    }
  }, [timer, visible]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Leaderboard functions
  const openLeaderBoard = () => {
    setLeadOpen(prev => !prev);
  };

  const closePopup = () => {
    if (playerName.trim() !== "") {
      const newPlayer = {
        name: playerName,
        score: count
      };

      const playerExists = existingPlayers.some(player => player.name === playerName);

      if (playerExists) {
        setExistingPlayers(
          existingPlayers.map(player =>
            player.name === playerName && player.score < count
              ? newPlayer
              : player
          )
        );
      } else {
        setExistingPlayers([...existingPlayers, newPlayer]);
      }
    }

    setShowPopUp(false);
    setPlayerName("");
  };

  return (
    <div className="aim-trainer-game">
      <div className="game-header">
        <span className="game-controls">
          <button onClick={onBack} className="game2">Back</button>
          <button className="game2" onClick={openLeaderBoard}
            style={{
              backgroundColor: leadopenFlag ? '#dd4a4a' : '#a0e575',
              color: leadopenFlag ? '#f5f5f5' : '#0c5594'
            }}>
            {leadopenFlag ? '✕ Close' : 'Leaderboard'}
          </button>
        </span>
        <div>
          <label style={{ fontSize: '15px', marginRight: '20px' }}>Highscore: {highscore}</label>
          <label id="counter">| Score {count} | Time {timer}s</label>
        </div>
      </div>

      {/* Leaderboard */}
      {leadopenFlag && (
        <Leaderboard players={existingPlayers} onClose={openLeaderBoard} />
      )}

      {/* Popup for score */}
      <Popup show={showpopup} onClose={closePopup}>
        <h2>YOU SCORED {count} Points!</h2>
        <span id='difbtnSpace'>
          <input
            type="text"
            id="txtname"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && closePopup()}
            placeholder="Enter Your Name"
            ref={nameInputRef}
          />
        </span>
      </Popup>

      {/* Game area */}
      <button
        type="button"
        ref={btnRef}
        name="target"
        style={{
          position: visible ? 'static' : 'absolute',
          left: x,
          top: y
        }}
        className="buttonT"
        onMouseDown={handleClick}
      >
        ⊹
      </button>

      {visible && (
        <button
          type="button"
          name="resetBtn"
          className="resetBtn"
          onClick={handlePlay}
        >
          Play
        </button>
      )}

      {bulletHoles.map((bulletHole, index) => (
        bulletHole.image && (
          <img
            key={index}
            className="Bhole"
            src={bulletHole.image}
            alt="Bullet Hole"
            style={{
              position: 'absolute',
              left: bulletHole.x - 9,
              top: bulletHole.y - 9
            }}
          />
        )
      ))}
    </div>
  );
};

AimTrainerGame.propTypes = {
  onBack: PropTypes.func.isRequired
};

export default AimTrainerGame;
