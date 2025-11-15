import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Play, RotateCcw, Trophy, Crosshair, Zap, Clock, Award } from 'lucide-react';
import useLocalStorage from '../shared/hooks/useLocalStorage';
import GamePopup from '../shared/components/GamePopup';
import Leaderboard from '../shared/components/Leaderboard';
import TopBar from '../shared/components/TopBar';
import GameDropdown from '../shared/components/GameDropdown';

/**
 * Modern AimTrainer Game - 2025 Design Standards
 */
const ModernAimTrainerGame = ({ onGameChange }) => {
    // Game state
    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [targets, setTargets] = useState([]);
    const [timer, setTimer] = useState(30);
    const [accuracy, setAccuracy] = useState(100);
    const [shots, setShots] = useState(0);
    const [hits, setHits] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [gameMode, setGameMode] = useState('classic');

    // Game area dimensions (now handled directly via getBoundingClientRect)

    // Bullet holes for visual feedback
    const [bulletHoles, setBulletHoles] = useState([]);

    // References
    const gameAreaRef = useRef(null);
    const nameInputRef = useRef(null);
    const timerRef = useRef(null);

    // Local storage
    const [players, setPlayers] = useLocalStorage('aimTrainerPlayers', []);

    // Game modes configuration
    const gameModes = {
        classic: {
            name: 'Classic',
            icon: '🎯',
            description: 'Standard aim training',
            targetSize: 50,
            targetCount: 1,
            targetSpeed: 2000,
            timeLimit: 30
        },
        rapid: {
            name: 'Rapid Fire',
            icon: '⚡',
            description: 'Fast targets, quick reflexes',
            targetSize: 40,
            targetCount: 2,
            targetSpeed: 1000,
            timeLimit: 30
        },
        precision: {
            name: 'Precision',
            icon: '🎖️',
            description: 'Small targets, perfect accuracy',
            targetSize: 30,
            targetCount: 1,
            targetSpeed: 3000,
            timeLimit: 45
        },
        chaos: {
            name: 'Chaos Mode',
            icon: '💥',
            description: 'Multiple fast targets',
            targetSize: 35,
            targetCount: 3,
            targetSpeed: 800,
            timeLimit: 30
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
        { key: 'reflex', label: 'RefleX' },
        { key: 'typing', label: 'Typing Test' }
    ];

    // Generate random position within game area
    const generateRandomPosition = useCallback(() => {
        if (!gameAreaRef.current) return { x: 300, y: 300 }; // Fallback position

        const config = gameModes[gameMode];
        const rect = gameAreaRef.current.getBoundingClientRect();
        const margin = Math.max(config.targetSize / 2 + 20, 50); // Ensure adequate margin

        // Use actual dimensions with safety checks
        const availableWidth = Math.max(rect.width - margin * 2, 100);
        const availableHeight = Math.max(rect.height - margin * 2, 100);

        return {
            x: Math.random() * availableWidth + margin,
            y: Math.random() * availableHeight + margin
        };
    }, [gameMode]);

    // Create new target with bounds validation
    const createTarget = useCallback(() => {
        const config = gameModes[gameMode];
        const position = generateRandomPosition();

        // Additional bounds validation
        const rect = gameAreaRef.current?.getBoundingClientRect();
        if (rect) {
            const maxX = rect.width - config.targetSize / 2;
            const maxY = rect.height - config.targetSize / 2;
            const minX = config.targetSize / 2;
            const minY = config.targetSize / 2;

            position.x = Math.max(minX, Math.min(maxX, position.x));
            position.y = Math.max(minY, Math.min(maxY, position.y));
        }

        return {
            id: Date.now() + Math.random(),
            x: position.x,
            y: position.y,
            size: config.targetSize,
            createdAt: Date.now()
        };
    }, [gameMode, generateRandomPosition]);

    // Add targets based on game mode
    const addTargets = useCallback(() => {
        // Ensure game area is available before generating targets
        if (!gameAreaRef.current) {
            setTimeout(() => addTargets(), 50);
            return;
        }

        const config = gameModes[gameMode];
        const newTargets = [];

        for (let i = 0; i < config.targetCount; i++) {
            newTargets.push(createTarget());
        }

        setTargets(newTargets);
    }, [gameMode, createTarget]);

    // Handle target hit
    const handleTargetHit = useCallback((targetId, x, y) => {
        setScore(prev => prev + 10);
        setHits(prev => prev + 1);
        setShots(prev => prev + 1);

        // Add bullet hole
        setBulletHoles(prev => [...prev, {
            id: Date.now(),
            x: x,
            y: y,
            type: 'hit'
        }]);

        // Remove the hit target and create a new one
        setTargets(prev => {
            const remaining = prev.filter(target => target.id !== targetId);
            const newTarget = createTarget();
            return [...remaining, newTarget];
        });

        // Update accuracy
        setAccuracy(Math.round((hits + 1) / (shots + 1) * 100));
    }, [hits, shots, createTarget]);

    // Handle missed shot
    const handleMissedShot = useCallback((x, y) => {
        setShots(prev => prev + 1);

        // Add bullet hole for miss
        setBulletHoles(prev => [...prev, {
            id: Date.now(),
            x: x,
            y: y,
            type: 'miss'
        }]);

        // Update accuracy
        setAccuracy(Math.round(hits / (shots + 1) * 100));
    }, [hits, shots]);

    // Handle game area click
    const handleGameAreaClick = useCallback((e) => {
        if (!gameStarted || gameFinished) return;

        // Prevent event propagation to ensure clean click detection
        e.stopPropagation();

        const rect = gameAreaRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Check if any target was hit
        let targetHit = false;
        
        // Use for...of instead of forEach for better performance and early exit
        for (const target of targets) {
            const distance = Math.sqrt(
                Math.pow(clickX - target.x, 2) + Math.pow(clickY - target.y, 2)
            );

            // Use slightly larger hitbox for better UX (radius + 5px tolerance)
            if (distance <= (target.size / 2) + 5) {
                handleTargetHit(target.id, clickX, clickY);
                targetHit = true;
                break; // Exit immediately after first hit
            }
        }

        // If no target was hit, record a miss
        if (!targetHit) {
            handleMissedShot(clickX, clickY);
        }
    }, [gameStarted, gameFinished, targets, handleTargetHit, handleMissedShot]);

    // Start game
    const startGame = useCallback(() => {
        const config = gameModes[gameMode];

        setGameStarted(true);
        setGameFinished(false);
        setScore(0);
        setHits(0);
        setShots(0);
        setAccuracy(100);
        setTimer(config.timeLimit);
        setBulletHoles([]);

        // Ensure game area is ready, then add initial targets
        setTimeout(() => {
            addTargets();
        }, 100); // Small delay to ensure game area is rendered

        // Start timer
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setGameFinished(true);
                    setShowResults(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [gameMode, addTargets]);

    // Reset game
    const resetGame = useCallback(() => {
        setGameStarted(false);
        setGameFinished(false);
        setShowResults(false);
        setScore(0);
        setHits(0);
        setShots(0);
        setAccuracy(100);
        setTargets([]);
        setBulletHoles([]);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    }, []);

    // Handle name submission for leaderboard
    const handleNameSubmit = () => {
        const playerName = nameInputRef.current?.value?.trim();
        if (playerName) {
            const newPlayer = {
                name: playerName,
                score,
                accuracy,
                hits,
                shots,
                gameMode,
                timestamp: new Date().toISOString(),
                id: Date.now()
            };

            const updatedPlayers = [...players, newPlayer]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);

            setPlayers(updatedPlayers);
            setShowResults(false);
            setShowLeaderboard(true);
        }
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const leaderboardColumns = [
        { key: 'score', label: 'Score', render: (player) => player.score },
        { key: 'accuracy', label: 'Accuracy', render: (player) => `${player.accuracy}%` },
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
                                currentGame="aim"
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
                            🎯 Aim Trainer
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
                                    🎮 Select Training Mode
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
                                                {config.timeLimit}s • {config.targetCount} target{config.targetCount > 1 ? 's' : ''}
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
                                        🎯 {gameModes[gameMode].name} Details:
                                    </h4>
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-value">{gameModes[gameMode].timeLimit}s</div>
                                            <div className="stat-label">Duration</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{gameModes[gameMode].targetCount}</div>
                                            <div className="stat-label">Targets</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{gameModes[gameMode].targetSize}px</div>
                                            <div className="stat-label">Size</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{gameModes[gameMode].targetSpeed / 1000}s</div>
                                            <div className="stat-label">Speed</div>
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
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))' }}>
                                    <div className="stat-value" style={{ color: 'var(--error-color)' }}>
                                        <Clock size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {timer}s
                                    </div>
                                    <div className="stat-label">Time Left</div>
                                </div>
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.1))' }}>
                                    <div className="stat-value" style={{ color: 'var(--primary-color)' }}>
                                        <Award size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {score}
                                    </div>
                                    <div className="stat-label">Score</div>
                                </div>
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))' }}>
                                    <div className="stat-value" style={{ color: 'var(--success-color)' }}>
                                        <Target size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {accuracy}%
                                    </div>
                                    <div className="stat-label">Accuracy</div>
                                </div>
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))' }}>
                                    <div className="stat-value" style={{ color: 'var(--warning-color)' }}>
                                        <Zap size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {hits}/{shots}
                                    </div>
                                    <div className="stat-label">Hits</div>
                                </div>
                            </motion.div>

                            {/* Game Area */}
                            <motion.div
                                ref={gameAreaRef}
                                className="glass-card"
                                style={{
                                    height: '600px',
                                    position: 'relative',
                                    cursor: 'crosshair',
                                    background: 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%), var(--glass-bg)',
                                    overflow: 'hidden',
                                    userSelect: 'none'
                                }}
                                onMouseDown={handleGameAreaClick}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {/* Crosshair cursor effect */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.875rem',
                                        opacity: targets.length === 0 ? 1 : 0,
                                        transition: 'opacity 0.3s'
                                    }}
                                >
                                    <Crosshair size={32} />
                                    <p style={{ margin: '1rem 0 0 0' }}>Click on targets to score points</p>
                                </div>

                                {/* Targets */}
                                <AnimatePresence>
                                    {targets.map((target) => (
                                        <motion.div
                                            key={target.id}
                                            className="target"
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                const rect = gameAreaRef.current.getBoundingClientRect();
                                                const clickX = e.clientX - rect.left;
                                                const clickY = e.clientY - rect.top;
                                                handleTargetHit(target.id, clickX, clickY);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                left: target.x - target.size / 2,
                                                top: target.y - target.size / 2,
                                                width: target.size,
                                                height: target.size,
                                                borderRadius: '50%',
                                                background: 'radial-gradient(circle, var(--error-color) 0%, var(--warning-color) 70%, var(--accent-color) 100%)',
                                                boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                                                cursor: 'crosshair',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                userSelect: 'none',
                                                pointerEvents: 'auto',
                                                zIndex: 10
                                            }}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                                boxShadow: [
                                                    '0 0 20px rgba(239, 68, 68, 0.5)',
                                                    '0 0 30px rgba(239, 68, 68, 0.8)',
                                                    '0 0 20px rgba(239, 68, 68, 0.5)'
                                                ]
                                            }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{
                                                scale: { duration: 0.2 },
                                                opacity: { duration: 0.2 },
                                                boxShadow: { duration: 1, repeat: Infinity }
                                            }}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <Target size={target.size * 0.4} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Bullet Holes */}
                                <AnimatePresence>
                                    {bulletHoles.map((hole) => (
                                        <motion.div
                                            key={hole.id}
                                            style={{
                                                position: 'absolute',
                                                left: hole.x - 6,
                                                top: hole.y - 6,
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                background: hole.type === 'hit'
                                                    ? 'radial-gradient(circle, var(--success-color), transparent)'
                                                    : 'radial-gradient(circle, var(--text-muted), transparent)',
                                                pointerEvents: 'none',
                                                zIndex: 5
                                            }}
                                            initial={{ scale: 0, opacity: 1 }}
                                            animate={{ scale: 1, opacity: 0.7 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                            {/* Game Controls */}
                            <motion.div
                                className="flex items-center justify-center gap-md mt-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
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
                title="🎯 Training Complete!"
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
                                <div className="stat-value h4 mb-1 text-primary">{score}</div>
                                <div className="stat-label small text-muted">Final Score</div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="stat-card text-center p-3 bg-secondary rounded">
                                <div className="stat-value h4 mb-1 text-success">{accuracy}%</div>
                                <div className="stat-label small text-muted">Accuracy</div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="stat-card text-center p-3 bg-secondary rounded">
                                <div className="stat-value h4 mb-1 text-warning">{hits}</div>
                                <div className="stat-label small text-muted">Targets Hit</div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="stat-card text-center p-3 bg-secondary rounded">
                                <div className="stat-value h6 mb-1 text-info">{gameModes[gameMode].name}</div>
                                <div className="stat-label small text-muted">Mode</div>
                            </div>
                        </div>
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

ModernAimTrainerGame.propTypes = {
    onGameChange: PropTypes.func.isRequired,
};

ModernAimTrainerGame.displayName = 'ModernAimTrainerGame';

export default ModernAimTrainerGame;