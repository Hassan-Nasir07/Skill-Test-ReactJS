import { useState, useEffect, useCallback } from 'react';
import useInterval from './useInterval';

/**
 * Custom hook for managing countdown timers in games
 * @param {number} initialTime - Initial time in seconds
 * @param {function} onComplete - Function to call when timer reaches zero
 * @param {boolean} autoStart - Whether to start the timer automatically
 * @returns {Object} Timer state and control functions
 */
export default function useGameTimer(initialTime = 30, onComplete = () => {}, autoStart = false) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  
  // Format time as MM:SS
  const formattedTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [timeLeft]);
  
  // Start timer
  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);
  
  // Pause timer
  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);
  
  // Resume timer
  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);
  
  // Reset timer
  const resetTimer = useCallback((newTime = initialTime) => {
    setTimeLeft(newTime);
    setIsActive(false);
    setIsPaused(false);
  }, [initialTime]);

  // Handle countdown logic
  useInterval(
    () => {
      if (timeLeft <= 1) {
        setTimeLeft(0);
        setIsActive(false);
        onComplete();
      } else {
        setTimeLeft(timeLeft - 1);
      }
    },
    isActive && !isPaused ? 1000 : null
  );
  
  return {
    timeLeft,
    formattedTime: formattedTime(),
    isActive,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer
  };
}
