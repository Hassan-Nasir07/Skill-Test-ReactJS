import { useState, useCallback } from 'react';
import useLocalStorage from '../useLocalStorage';

/**
 * Custom hook for managing game scores and leaderboards
 * @param {string} storageKey - Local storage key for persisting scores
 * @param {boolean} lowerIsBetter - Whether lower scores are better (e.g., for time-based games)
 * @returns {Object} Score state and management functions
 */
export default function useScoreManager(storageKey, lowerIsBetter = false) {
  const [highscore, setHighscore] = useLocalStorage(`${storageKey}_highscore`, lowerIsBetter ? Infinity : 0);
  const [players, setPlayers] = useLocalStorage(`${storageKey}_players`, []);
  const [currentScore, setCurrentScore] = useState(0);
  
  // Add a new score to the leaderboard
  const addScore = useCallback((name, score) => {
    const playerName = name.trim() || 'Anonymous';
    const newPlayer = { name: playerName, score };
    
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers, newPlayer];
      return newPlayers.sort((a, b) => 
        lowerIsBetter ? a.score - b.score : b.score - a.score
      );
    });
    
    // Update highscore if needed
    if (lowerIsBetter) {
      if (score < highscore) setHighscore(score);
    } else {
      if (score > highscore) setHighscore(score);
    }
    
    return true;
  }, [highscore, setHighscore, setPlayers, lowerIsBetter]);
  
  // Reset current score
  const resetScore = useCallback(() => {
    setCurrentScore(0);
  }, []);
  
  // Update current score
  const updateScore = useCallback((newScore) => {
    setCurrentScore(newScore);
  }, []);
  
  // Increment score by amount (default: 1)
  const incrementScore = useCallback((amount = 1) => {
    setCurrentScore(prev => prev + amount);
  }, []);
  
  return {
    highscore,
    players,
    currentScore,
    addScore,
    resetScore,
    updateScore,
    incrementScore,
    setHighscore,
    setPlayers
  };
}
