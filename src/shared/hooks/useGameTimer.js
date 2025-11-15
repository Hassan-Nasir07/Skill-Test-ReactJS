import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for managing game timer functionality
 * @param {number} initialTime - Initial time in seconds
 * @returns {object} Timer state and controls
 */
export const useGameTimer = (initialTime = 30) => {
    const [timer, setTimer] = useState(`${Math.floor(initialTime / 60).toString().padStart(2, '0')}:${(initialTime % 60).toString().padStart(2, '0')}`);
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    const getTimeRemaining = useCallback((endTime) => {
        const total = Date.parse(endTime) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        return { total, minutes, seconds };
    }, []);

    const startTimer = useCallback((endTime) => {
        const { total, minutes, seconds } = getTimeRemaining(endTime);
        if (total >= 0) {
            const formattedTime = `${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`;
            setTimer(formattedTime);
            setTimeLeft(minutes * 60 + seconds);
        } else {
            setTimeLeft(0);
            setIsRunning(false);
        }
    }, [getTimeRemaining]);

    const getDeadTime = useCallback(() => {
        const deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + initialTime);
        return deadline;
    }, [initialTime]);

    const startGameTimer = useCallback(() => {
        const endTime = getDeadTime();
        setIsRunning(true);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            startTimer(endTime);
        }, 1000);
    }, [getDeadTime, startTimer]);

    const resetTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setIsRunning(false);
        setTimeLeft(initialTime);
        setTimer(`${Math.floor(initialTime / 60).toString().padStart(2, '0')}:${(initialTime % 60).toString().padStart(2, '0')}`);
    }, [initialTime]);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setIsRunning(false);
    }, []);

    return {
        timer,
        timeLeft,
        isRunning,
        startGameTimer,
        resetTimer,
        stopTimer,
    };
};