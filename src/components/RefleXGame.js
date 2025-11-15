import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import useLocalStorage from "../shared/hooks/useLocalStorage";
import Popup from "./Popup";
import Leaderboard from "./Leaderboard";
import useInterval from "../hooks/useInterval";
import unknown from "../assets/images/grey.png";

// Custom hook for managing reflex game state
function useReflexGame() {
  const [sum, setSum] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(Date.now());
  const [time, setTime] = useState(Date.now());
  const [count, setCount] = useState(30);
  const [flag, setFlag] = useState(false);
  const [avg, setAvg] = useState(0);
  const [reactionArr, setReactArr] = useState([]);
  const [init, setInit] = useState(true);

  const startGame = () => {
    setReactArr([]);
    setCount(30);
    setFlag(false);
    setAvg(0);
    setInit(true);
  };

  const recordClick = (clicked) => {
    if (!flag && count > 0) {
      const now = Date.now();
      setEndTime(now);

      if (clicked) {
        const reaction = now - startTime;
        setSum(prev => prev + reaction);
        setReactArr(prev => [...prev, reaction]);
      }

      setCount(prev => prev - 1);

      if (count === 1) {
        // Last click, calculate average
        const average = reactionArr.length > 0
          ? Math.round(sum / reactionArr.length)
          : 0;
        setAvg(average);
        setFlag(true);
      } else {
        // Set a random delay for the next target
        const randomDelay = Math.random() * 3000 + 1000; // Between 1-4 seconds
        setTimeout(() => {
          setStartTime(Date.now());
          setTime(Date.now());
        }, randomDelay);
      }
    }
  };

  return {
    sum,
    startTime,
    endTime,
    time,
    count,
    flag,
    avg,
    reactionArr,
    init,
    setInit,
    startGame,
    recordClick
  };
}

const RefleXGame = ({ onBack }) => {
  // Game state from custom hook
  const reflexGame = useReflexGame();

  // Component state
  const [visible, setVisible] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const [leadopenFlag, setLeadOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useLocalStorage('reflexPlayers', []);
  const nameInputRef = useRef(null);
  const gameAreaRef = useRef(null);
  const highscoreRef = useRef(null);

  // Calculate and set random position for target
  const setRandomPosition = () => {
    if (gameAreaRef.current) {
      const gameWidth = gameAreaRef.current.clientWidth - 50;
      const gameHeight = gameAreaRef.current.clientHeight - 50;

      setTargetPosition({
        x: Math.floor(Math.random() * gameWidth),
        y: Math.floor(Math.random() * gameHeight)
      });
    }
  };

  // Start game
  const handleStartGame = () => {
    reflexGame.startGame();
    setVisible(true);
    setRandomPosition();

    // Start with a random delay
    const randomDelay = Math.random() * 3000 + 1000;
    setTimeout(() => {
      reflexGame.setInit(false);
    }, randomDelay);
  };

  // Handle target click
  const handleTargetClick = () => {
    if (!reflexGame.flag && !reflexGame.init) {
      reflexGame.recordClick(true);
      setRandomPosition();
      setVisible(false);

      // Show target again after delay (handled in useEffect)
    }
  };

  // Handle game completion
  useEffect(() => {
    if (reflexGame.flag) {
      setShowPopup(true);
      setVisible(false);
    }
  }, [reflexGame.flag]);

  // Show/hide target based on game state
  useEffect(() => {
    if (!reflexGame.init && !reflexGame.flag && reflexGame.count > 0) {
      setVisible(true);
    }
  }, [reflexGame.time, reflexGame.init, reflexGame.flag, reflexGame.count]);

  // Handle popup close and save score
  const closePopup = () => {
    if (playerName.trim()) {
      setPlayers(prevPlayers => [
        ...prevPlayers,
        { name: playerName, score: reflexGame.avg }
      ].sort((a, b) => a.score - b.score)); // Lower time is better
    }

    setShowPopup(false);
    setPlayerName("");
  };

  // Toggle leaderboard
  const toggleLeaderboard = () => {
    setLeadOpen(!leadopenFlag);
  };

  return (
    <div className="reflex-game" ref={gameAreaRef}>
      <div className="game-header">
        <button className="game2" onClick={onBack}>Back</button>
        <button
          className="game2"
          onClick={toggleLeaderboard}
          style={{
            backgroundColor: leadopenFlag ? '#dd4a4a' : '#a0e575',
            color: leadopenFlag ? '#f5f5f5' : '#0c5594'
          }}
        >
          {leadopenFlag ? '✕ Close' : 'Leaderboard'}
        </button>
        <div className="game-stats">
          <span>Attempts: {30 - reflexGame.count}/30</span>
          <span>Avg Reaction: {reflexGame.avg || "--"} ms</span>
        </div>
      </div>

      <div className="game-area" style={{ position: 'relative', height: '70vh' }}>
        {!visible && reflexGame.init && !reflexGame.flag && (
          <button
            className="start-button"
            onClick={handleStartGame}
          >
            Start Game
          </button>
        )}

        {visible && (
          <button
            className="target"
            style={{
              position: 'absolute',
              left: `${targetPosition.x}px`,
              top: `${targetPosition.y}px`
            }}
            onClick={handleTargetClick}
            aria-label="Click target"
          >
            ⊹
          </button>
        )}
      </div>

      {leadopenFlag && (
        <Leaderboard
          players={players.sort((a, b) => a.score - b.score)}
          onClose={toggleLeaderboard}
        />
      )}

      <Popup show={showPopup} onClose={closePopup}>
        <h2>Game Complete!</h2>
        <p>Your average reaction time: {reflexGame.avg} ms</p>
        <div className="input-group">
          <label htmlFor="player-name">Enter your name:</label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your Name"
            ref={nameInputRef}
            aria-label="Enter your name"
          />
        </div>
      </Popup>
    </div>
  );
};

RefleXGame.propTypes = {
  onBack: PropTypes.func.isRequired
};

export default RefleXGame;
