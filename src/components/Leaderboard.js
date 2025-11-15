import React from "react";
import PropTypes from "prop-types";
import "../App.css";

const Leaderboard = ({ players, onClose }) => {
  if (!players || players.length === 0) return null;
  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-content">
        <h2>Leaderboard</h2>
        <ol>
          {players.map((player, idx) => (
            <li key={idx}>
              {player.name}: {player.score}
            </li>
          ))}
        </ol>
        <button className="leaderboard-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

Leaderboard.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired
    })
  ),
  onClose: PropTypes.func.isRequired
};

export default Leaderboard;
