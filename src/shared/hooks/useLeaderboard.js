import { useState, useCallback } from 'react';

/**
 * Custom hook for managing leaderboard functionality
 * @param {string} storageKey - localStorage key for the players
 * @param {string} sortKey - key to sort players by (default: 'score')
 * @returns {object} Leaderboard state and functions
 */
export const useLeaderboard = (storageKey, sortKey = 'score') => {
    const getStoredPlayers = useCallback(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    }, [storageKey]);

    const [players, setPlayers] = useState(getStoredPlayers);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

    const sortPlayers = useCallback((playersArray) => {
        return [...playersArray].sort((a, b) => {
            if (sortKey === 'react') {
                // For reaction time, lower is better
                return a[sortKey] - b[sortKey];
            }
            // For scores, higher is better
            return b[sortKey] - a[sortKey];
        });
    }, [sortKey]);

    const addPlayer = useCallback((playerData) => {
        const newPlayer = {
            ...playerData,
            id: Date.now(), // Simple ID generation
            timestamp: new Date().toISOString(),
        };

        setPlayers(currentPlayers => {
            const updatedPlayers = [...currentPlayers, newPlayer];
            const sortedPlayers = sortPlayers(updatedPlayers);

            try {
                localStorage.setItem(storageKey, JSON.stringify(sortedPlayers));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }

            return sortedPlayers;
        });
    }, [storageKey, sortPlayers]);

    const getTopPlayers = useCallback((count = 3) => {
        const sortedPlayers = sortPlayers(players);
        return sortedPlayers.slice(0, count);
    }, [players, sortPlayers]);

    const toggleLeaderboard = useCallback(() => {
        setIsLeaderboardOpen(prev => !prev);
    }, []);

    const closeLeaderboard = useCallback(() => {
        setIsLeaderboardOpen(false);
    }, []);

    return {
        players: sortPlayers(players),
        topPlayers: getTopPlayers(),
        isLeaderboardOpen,
        addPlayer,
        toggleLeaderboard,
        closeLeaderboard,
        getTopPlayers,
    };
};