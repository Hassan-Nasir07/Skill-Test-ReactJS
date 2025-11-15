import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Play, RotateCcw, Trophy, Clock, Target, Activity, AlertCircle } from 'lucide-react';
import useLocalStorage from '../shared/hooks/useLocalStorage';
import GamePopup from '../shared/components/GamePopup';
import Leaderboard from '../shared/components/Leaderboard';
import TopBar from '../shared/components/TopBar';
import GameDropdown from '../shared/components/GameDropdown';

/**
 * Modern RefleX Game - 2025 Design Standards
 * Reaction time training with modern UI
 */
const ModernRefleXGame = ({ onGameChange }) => {
    // Game state
    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [canClick, setCanClick] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [reactionTimes, setReactionTimes] = useState([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [gameMode, setGameMode] = useState('standard');
    const [falseStarts, setFalseStarts] = useState(0);

    // Target display
    const [showTarget, setShowTarget] = useState(false);
    const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
    const [targetColor, setTargetColor] = useState('#ef4444');

    // References
    const gameAreaRef = useRef(null);
    const nameInputRef = useRef(null);
    const timeoutRef = useRef(null);

    // Local storage
    const [players, setPlayers] = useLocalStorage('reflexPlayers', []);

    // Game modes configuration
    const gameModes = {
        standard: {
            name: 'Standard',
            icon: '⚡',
            description: 'Classic reaction time test',
            rounds: 5,
            minDelay: 1000,
            maxDelay: 4000,
            targets: false
        },
        precision: {
            name: 'Precision',
            icon: '🎯',
            description: 'Click on specific targets',
            rounds: 8,
            minDelay: 800,
            maxDelay: 3000,
            targets: true
        },
        endurance: {
            name: 'Endurance',
            icon: '💪',
            description: 'Extended reaction training',
            rounds: 10,
            minDelay: 600,
            maxDelay: 3500,
            targets: false
        },
        blitz: {
            name: 'Blitz',
            icon: '💥',
            description: 'Rapid-fire reactions',
            rounds: 15,
            minDelay: 400,
            maxDelay: 2000,
            targets: true
        }
    };

    // Navigation handlers
    const handleGameSelect = (gameKey) => {
        // Close dropdown first
        setDropdownOpen(false);
        // Navigate to selected game
        onGameChange(gameKey);
    };

    const games = [
        { key: 'precision', label: 'Precision' },
        { key: 'aim', label: 'Aim✜Trainer' },
        { key: 'typing', label: 'Typing Test' }
    ];

    // Generate random target position
    const generateTargetPosition = useCallback(() => {
        if (!gameAreaRef.current) return { x: 300, y: 300 }; // Fallback position

        const rect = gameAreaRef.current.getBoundingClientRect();
        const targetSize = 60;
        const margin = Math.max(targetSize / 2 + 20, 50); // Ensure adequate margin for 60px targets

        // Use actual dimensions with safety checks
        const availableWidth = Math.max(rect.width - margin * 2, 100);
        const availableHeight = Math.max(rect.height - margin * 2, 100);

        const position = {
            x: Math.random() * availableWidth + margin,
            y: Math.random() * availableHeight + margin
        };

        // Additional bounds validation
        const maxX = rect.width - targetSize / 2;
        const maxY = rect.height - targetSize / 2;
        const minX = targetSize / 2;
        const minY = targetSize / 2;

        position.x = Math.max(minX, Math.min(maxX, position.x));
        position.y = Math.max(minY, Math.min(maxY, position.y));

        return position;
    }, []);

    // Generate random color for variety
    const generateTargetColor = () => {
        const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    // Finish game
    const finishGame = useCallback(() => {
        setGameFinished(true);
        setShowResults(true);
        setIsWaiting(false);
        setCanClick(false);
        setShowTarget(false);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    // Start next round
    const startNextRound = useCallback((roundNumber) => {
        // Use passed roundNumber or currentRound
        const nextRound = roundNumber !== undefined ? roundNumber : currentRound;
        
        if (nextRound > gameModes[gameMode].rounds) {
            finishGame();
            return;
        }

        setIsWaiting(true);
        setCanClick(false);
        setShowTarget(false);

        const config = gameModes[gameMode];
        const delay = Math.random() * (config.maxDelay - config.minDelay) + config.minDelay;

        timeoutRef.current = setTimeout(() => {
            setStartTime(Date.now());
            setCanClick(true);
            setIsWaiting(false);

            if (config.targets) {
                setTargetPosition(generateTargetPosition());
                setTargetColor(generateTargetColor());
                setShowTarget(true);
            }
        }, delay);
    }, [currentRound, gameMode, generateTargetPosition, finishGame]);

    // Handle reaction click - OPTIMIZED
    const handleReactionClick = useCallback((event) => {
        if (!gameStarted || gameFinished) return;

        if (isWaiting) {
            // False start
            setFalseStarts(prev => prev + 1);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Restart round immediately (removed setTimeout for instant response)
            setIsWaiting(false);
            startNextRound();
            return;
        }

        if (!canClick) return;

        const reactionTime = Date.now() - startTime;

        // If it's a target mode, check if clicked on target
        if (gameModes[gameMode].targets && showTarget) {
            const rect = gameAreaRef.current.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            const distance = Math.sqrt(
                Math.pow(clickX - targetPosition.x, 2) +
                Math.pow(clickY - targetPosition.y, 2)
            );

            // Target radius is 30px
            if (distance > 30) {
                // Missed target, restart round immediately
                startNextRound();
                return;
            }
        }

        // Record successful reaction
        setReactionTimes(prev => [...prev, reactionTime]);
        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);
        setCanClick(false);
        setShowTarget(false);

        // Start next round immediately (removed 800ms delay for faster gameplay)
        // Use requestAnimationFrame for optimal DOM performance
        requestAnimationFrame(() => {
            startNextRound(nextRound);
        });
    }, [gameStarted, gameFinished, isWaiting, canClick, startTime, gameMode, showTarget, targetPosition, currentRound, startNextRound]);

    // Start game
    const startGame = useCallback(() => {
        setGameStarted(true);
        setGameFinished(false);
        setReactionTimes([]);
        setCurrentRound(0);
        setFalseStarts(0);
        setIsWaiting(false);
        setCanClick(false);
        setShowTarget(false);

        // Start first round after brief delay
        setTimeout(() => {
            setCurrentRound(1);
            startNextRound();
        }, 1000);
    }, [startNextRound]);

    // Reset game
    const resetGame = useCallback(() => {
        setGameStarted(false);
        setGameFinished(false);
        setShowResults(false);
        setReactionTimes([]);
        setCurrentRound(0);
        setFalseStarts(0);
        setIsWaiting(false);
        setCanClick(false);
        setShowTarget(false);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    // Handle name submission for leaderboard
    const handleNameSubmit = () => {
        const playerName = nameInputRef.current?.value?.trim();
        if (playerName && reactionTimes.length > 0) {
            const avgReactionTime = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
            const bestReactionTime = Math.min(...reactionTimes);

            const newPlayer = {
                name: playerName,
                averageTime: avgReactionTime,
                bestTime: bestReactionTime,
                totalRounds: reactionTimes.length,
                falseStarts,
                gameMode,
                timestamp: new Date().toISOString(),
                id: Date.now()
            };

            const updatedPlayers = [...players, newPlayer]
                .sort((a, b) => a.averageTime - b.averageTime)
                .slice(0, 10);

            setPlayers(updatedPlayers);
            setShowResults(false);
            setShowLeaderboard(true);
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Calculate statistics
    const avgReactionTime = reactionTimes.length > 0
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
        : 0;
    const bestReactionTime = reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0;
    const consistency = reactionTimes.length > 1
        ? Math.round(Math.sqrt(reactionTimes.reduce((sum, time) => sum + Math.pow(time - avgReactionTime, 2), 0) / reactionTimes.length))
        : 0;

    const leaderboardColumns = [
        { key: 'averageTime', label: 'Avg Time', render: (player) => `${player.averageTime}ms` },
        { key: 'bestTime', label: 'Best Time', render: (player) => `${player.bestTime}ms` },
        { key: 'gameMode', label: 'Mode', render: (player) => gameModes[player.gameMode]?.name || player.gameMode }
    ];

    return (
        <div className="game-container">
            {/* Modern Header */}
            <motion.div
                className="game-header"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <TopBar
                    leftContent={
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem' }}>
                            <GameDropdown
                                isOpen={dropdownOpen}
                                onToggle={() => setDropdownOpen(!dropdownOpen)}
                                onGameSelect={handleGameSelect}
                                currentGame="reflex"
                                games={games}
                            />
                        </div>
                    }
                    centerContent={
                        <motion.h1
                            style={{
                                margin: 0,
                                color: 'var(--primary-color)',
                                fontSize: '1.5rem',
                                fontFamily: 'var(--font-gaming)',
                                textShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
                            }}
                            animate={{
                                textShadow: [
                                    '0 0 10px rgba(99, 102, 241, 0.5)',
                                    '0 0 20px rgba(99, 102, 241, 0.8)',
                                    '0 0 10px rgba(99, 102, 241, 0.5)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            ⚡ RefleX Trainer
                        </motion.h1>
                    }
                    rightContent={
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <motion.button
                                className="btn btn-secondary"
                                onClick={() => setShowLeaderboard(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Trophy size={16} />
                                Leaderboard
                            </motion.button>
                        </div>
                    }
                />
            </motion.div>

            <div className="game-content">
                <AnimatePresence mode="wait">
                    {!gameStarted ? (
                        // Game Mode Selection Screen
                        <motion.div
                            key="mode-selection"
                            className="typing-container"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                                <motion.h2
                                    style={{
                                        color: 'var(--text-primary)',
                                        marginBottom: 'var(--spacing-xl)',
                                        fontSize: '2rem',
                                        fontWeight: 'bold'
                                    }}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    ⚡ Select Training Mode
                                </motion.h2>

                                <div className="stats-grid mb-xl">
                                    {Object.entries(gameModes).map(([mode, config], index) => (
                                        <motion.div
                                            key={mode}
                                            className={`stat-card ${gameMode === mode ? 'scale-in' : ''}`}
                                            style={{
                                                cursor: 'pointer',
                                                border: gameMode === mode ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)',
                                                background: gameMode === mode ? 'var(--glass-border)' : 'var(--glass-bg)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                minHeight: '140px'
                                            }}
                                            onClick={() => setGameMode(mode)}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            {gameMode === mode && (
                                                <motion.div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                                                        borderRadius: 'var(--radius-md)'
                                                    }}
                                                    layoutId="mode-selection"
                                                />
                                            )}
                                            <div className="stat-value" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                                {config.icon}
                                            </div>
                                            <div className="stat-label" style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                                {config.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                {config.description}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                {config.rounds} rounds • {config.targets ? 'Target Mode' : 'Screen Mode'}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Mode Details */}
                                <motion.div
                                    className="glass-card mb-xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                                        ⚡ {gameModes[gameMode].name} Details:
                                    </h4>
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-value">{gameModes[gameMode].rounds}</div>
                                            <div className="stat-label">Rounds</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{gameModes[gameMode].minDelay}ms</div>
                                            <div className="stat-label">Min Delay</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{gameModes[gameMode].maxDelay}ms</div>
                                            <div className="stat-label">Max Delay</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{gameModes[gameMode].targets ? 'Target' : 'Screen'}</div>
                                            <div className="stat-label">Mode</div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.button
                                    className="btn btn-primary"
                                    onClick={startGame}
                                    style={{
                                        fontSize: '1.2rem',
                                        padding: 'var(--spacing-md) var(--spacing-2xl)',
                                        minWidth: '200px'
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <Play size={20} />
                                    Start Training
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        // Active Game Screen
                        <motion.div
                            key="active-game"
                            className="typing-container"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            style={{ height: '100%', maxWidth: 'none', width: '100%' }}
                        >
                            {/* Game Stats */}
                            <motion.div
                                className="stats-grid mb-lg"
                                initial={{ y: -30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.1))' }}>
                                    <div className="stat-value" style={{ color: 'var(--primary-color)' }}>
                                        <Activity size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {currentRound}/{gameModes[gameMode].rounds}
                                    </div>
                                    <div className="stat-label">Round</div>
                                </div>
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))' }}>
                                    <div className="stat-value" style={{ color: 'var(--success-color)' }}>
                                        <Clock size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {avgReactionTime}ms
                                    </div>
                                    <div className="stat-label">Avg Time</div>
                                </div>
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))' }}>
                                    <div className="stat-value" style={{ color: 'var(--warning-color)' }}>
                                        <Zap size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {bestReactionTime}ms
                                    </div>
                                    <div className="stat-label">Best Time</div>
                                </div>
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))' }}>
                                    <div className="stat-value" style={{ color: 'var(--error-color)' }}>
                                        <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {falseStarts}
                                    </div>
                                    <div className="stat-label">False Starts</div>
                                </div>
                            </motion.div>

                            {/* Game Area */}
                            <motion.div
                                ref={gameAreaRef}
                                className="glass-card"
                                style={{
                                    height: '500px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    background: isWaiting
                                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))'
                                        : canClick || showTarget
                                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))'
                                            : 'var(--glass-bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    transition: 'background 0s',
                                    userSelect: 'none',
                                    willChange: 'background'
                                }}
                                onMouseDown={handleReactionClick}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {/* Game Status Display */}
                                <AnimatePresence mode="wait">
                                    {isWaiting && (
                                        <motion.div
                                            key="waiting"
                                            style={{ textAlign: 'center' }}
                                            initial={{ opacity: 1 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0 }}
                                        >
                                            <AlertCircle size={64} color="var(--error-color)" />
                                            <h3 style={{ color: 'var(--error-color)', margin: '1rem 0' }}>Wait for it...</h3>
                                            <p style={{ color: 'var(--text-secondary)' }}>Don't click yet! Wait for the signal.</p>
                                        </motion.div>
                                    )}

                                    {canClick && !gameModes[gameMode].targets && (
                                        <motion.div
                                            key="click-now"
                                            style={{ textAlign: 'center' }}
                                            initial={{ opacity: 1 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0 }}
                                        >
                                            <Zap size={96} color="var(--success-color)" />
                                            <motion.h3
                                                style={{ color: 'var(--success-color)', margin: '1rem 0' }}
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 0.5, repeat: Infinity }}
                                            >
                                                CLICK NOW!
                                            </motion.h3>
                                            <p style={{ color: 'var(--text-secondary)' }}>React as fast as you can!</p>
                                        </motion.div>
                                    )}

                                    {!gameStarted && !isWaiting && !canClick && (
                                        <motion.div
                                            key="ready"
                                            style={{ textAlign: 'center' }}
                                            initial={{ opacity: 1 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0 }}
                                        >
                                            <Target size={64} color="var(--text-muted)" />
                                            <h3 style={{ color: 'var(--text-primary)', margin: '1rem 0' }}>Get Ready</h3>
                                            <p style={{ color: 'var(--text-secondary)' }}>
                                                {gameModes[gameMode].targets ? 'Click on targets when they appear' : 'Click when the screen turns green'}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Target for target modes */}
                                <AnimatePresence>
                                    {showTarget && gameModes[gameMode].targets && (
                                        <motion.div
                                            style={{
                                                position: 'absolute',
                                                left: targetPosition.x - 30,
                                                top: targetPosition.y - 30,
                                                width: 60,
                                                height: 60,
                                                borderRadius: '50%',
                                                background: `radial-gradient(circle, ${targetColor}, ${targetColor}aa)`,
                                                boxShadow: `0 0 30px ${targetColor}66`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            initial={{ scale: 1, opacity: 1 }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                                boxShadow: [
                                                    `0 0 30px ${targetColor}66`,
                                                    `0 0 50px ${targetColor}aa`,
                                                    `0 0 30px ${targetColor}66`
                                                ]
                                            }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{
                                                scale: { duration: 0 },
                                                opacity: { duration: 0 },
                                                boxShadow: { duration: 1, repeat: Infinity }
                                            }}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <Target size={30} color="white" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Reaction Times History */}
                            {reactionTimes.length > 0 && (
                                <motion.div
                                    className="glass-card mt-lg"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                                        📊 Reaction Times:
                                    </h4>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        justifyContent: 'center'
                                    }}>
                                        {reactionTimes.map((time, index) => (
                                            <motion.div
                                                key={index}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: time < 200 ? 'var(--success-color)' : time < 300 ? 'var(--warning-color)' : 'var(--error-color)',
                                                    color: 'white',
                                                    borderRadius: 'var(--radius-md)',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 'bold'
                                                }}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                {time}ms
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Game Controls */}
                            <motion.div
                                className="flex items-center justify-center gap-md mt-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    Mode: <strong style={{ color: 'var(--primary-color)' }}>
                                        {gameModes[gameMode].name}
                                    </strong>
                                </span>
                                <motion.button
                                    className="btn"
                                    onClick={resetGame}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <RotateCcw size={16} />
                                    Reset
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Results Popup */}
            <GamePopup
                isOpen={showResults}
                onClose={() => setShowResults(false)}
                title="⚡ Training Complete!"
                showNameInput={true}
                nameInputRef={nameInputRef}
                onNameSubmit={handleNameSubmit}
                actionButtonText="Save Score"
            >
                <motion.div
                    className="results-content"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="row g-3 mb-4">
                        <div className="col-6">
                            <div className="stat-card text-center p-3 bg-secondary rounded">
                                <div className="stat-value h4 mb-1 text-primary">{avgReactionTime}ms</div>
                                <div className="stat-label small text-muted">Average Time</div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="stat-card text-center p-3 bg-secondary rounded">
                                <div className="stat-value h4 mb-1 text-success">{bestReactionTime}ms</div>
                                <div className="stat-label small text-muted">Best Time</div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="stat-card text-center p-3 bg-secondary rounded">
                                <div className="stat-value h4 mb-1 text-warning">{consistency}ms</div>
                                <div className="stat-label small text-muted">Consistency</div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="stat-card text-center p-3 bg-secondary rounded">
                                <div className="stat-value h6 mb-1 text-info">{gameModes[gameMode].name}</div>
                                <div className="stat-label small text-muted">Mode</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {avgReactionTime < 200 ? '🚀 Lightning fast!' :
                                avgReactionTime < 300 ? '⚡ Great reflexes!' :
                                    avgReactionTime < 400 ? '👍 Good job!' :
                                        '💪 Keep practicing!'}
                        </p>
                    </div>
                </motion.div>
            </GamePopup>

            {/* Leaderboard */}
            <Leaderboard
                isOpen={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
                players={players.filter(p => p.gameMode === gameMode)}
                topPlayers={players.filter(p => p.gameMode === gameMode).slice(0, 3)}
                columns={leaderboardColumns}
            />
        </div>
    );
};

ModernRefleXGame.propTypes = {
    onGameChange: PropTypes.func.isRequired,
};

ModernRefleXGame.displayName = 'ModernRefleXGame';

export default ModernRefleXGame;