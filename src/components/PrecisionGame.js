import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Popup from "./Popup";
import Leaderboard from "./Leaderboard";
import useLocalStorage from "../useLocalStorage";
import unknown from "../images/grey.png";
import "../App.css";

const PrecisionGame = ({ onBack }) => {
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);
  const Ref = useRef(null);
  const btnRef = useRef(null);
  const [highscore, setHighscore] = useLocalStorage('precisionhighscore', 0);
  const [timer, setTimer] = useState('00:30');
  const [bulletHoles, setBulletHoles] = useState([]);
  const [leadopenFlag, setLeadOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const nameInputRef = useRef(null);
  const [existingPlayers, setExistingPlayers] = useLocalStorage('hitplayers', []);
  const [showpopup, setShowPopUp] = useState(false);

  // Timer logic (simplified for brevity)
  useEffect(() => {
    setTimer('00:30');
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      setTimer((prev) => {
        const [min, sec] = prev.split(":").map(Number);
        if (min === 0 && sec === 0) {
          clearInterval(id);
          setShowPopUp(true);
          return '00:00';
        }
        let totalSec = min * 60 + sec - 1;
        const newMin = Math.floor(totalSec / 60);
        const newSec = totalSec % 60;
        return `${newMin.toString().padStart(2, '0')}:${newSec.toString().padStart(2, '0')}`;
      });
    }, 1000);
    Ref.current = id;
    return () => clearInterval(id);
  }, []);

  const handleClick = (x, y) => {
    setCount((c) => c + 1);
    setBulletHoles((prev) => [...prev, { x, y, image: unknown }]);
  };

  const handlePlay = () => {
    setVisible(true);
    setCount(0);
    setBulletHoles([]);
    setTimer('00:30');
    setShowPopUp(false);
  };

  const closePopup = () => {
    setShowPopUp(false);
    if (count > highscore) setHighscore(count);
    setExistingPlayers((prev) => [...prev, { name: playerName || 'Player', score: count }]);
    setPlayerName("");
  };

  const openLeaderBoard = () => setLeadOpen((f) => !f);

  return (
    <div className="precision-game">
      <button onClick={onBack} className="game2">Back</button>
      <button className="game2" onClick={openLeaderBoard} style={{ backgroundColor: leadopenFlag ? '#dd4a4a' : '#a0e575', color: leadopenFlag ? '#f5f5f5' : '#0c5594' }}>{leadopenFlag ? '✕ Close' : 'Leaderboard'}</button>
      <label style={{ fontSize: '15px', marginRight: '20px' }}>Highscore: {highscore}</label>
      <label id="counter">| Score {count} | Time {timer}s</label>
      {leadopenFlag && <Leaderboard players={existingPlayers} onClose={openLeaderBoard} />}
      <Popup show={showpopup} onClose={closePopup}>
        <h2>YOU SCORED {count} Points!</h2>
        <span id='difbtnSpace'>
          <input type="text" id="txtname" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Enter Your Name" ref={nameInputRef} />
        </span>
      </Popup>
      <button type="button" ref={btnRef} name="target" className="buttonT" onMouseDown={e => handleClick(e.clientX, e.clientY)}>⊹</button>
      {visible && <button type="button" name="resetBtn" className="resetBtn" onClick={handlePlay}>Play</button>}
      {bulletHoles.map((bulletHole, index) => (
        bulletHole.image && (
          <img
            key={index}
            className="Bhole"
            src={bulletHole.image}
            style={{ position: 'absolute', left: bulletHole.x - 9, top: bulletHole.y - 9 }}
            alt="Bullet Hole"
          />
        )
      ))}
    </div>
  );
};

PrecisionGame.propTypes = {
  onBack: PropTypes.func.isRequired
};

export default PrecisionGame;
