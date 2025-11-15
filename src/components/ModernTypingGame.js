import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Target, Zap, Clock, AlertCircle } from 'lucide-react';
import { TYPING_PARAGRAPHS } from '../shared/constants/typingParagraphs';
import { GAME_CONFIG, LOCAL_STORAGE_KEYS } from '../shared/constants/gameConfig';
import { calculateTypingStats } from '../shared/utils/gameUtils';
import { getMedalInfo } from '../shared/utils/medalUtils';
import useLocalStorage from '../shared/hooks/useLocalStorage';
import GamePopup from '../shared/components/GamePopup';
import Leaderboard from '../shared/components/Leaderboard';
import TopBar from '../shared/components/TopBar';
import GameDropdown from '../shared/components/GameDropdown';
import { useGameTimer } from '../shared/hooks/useGameTimer';

/**
 * Modern TypingGame Component - 2025 Design Standards
 */
const ModernTypingGame = ({ onGameChange }) => {
    // Game state
    const [difficulty, setDifficulty] = useState('easy');
    const [currentParagraph, setCurrentParagraph] = useState('');
    const [userInput, setUserInput] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Typing statistics
    const [stats, setStats] = useState({
        wpm: 0,
        accuracy: 0,
        errors: 0,
        correctChars: 0,
        totalChars: 0
    });

    // Medal and results
    const [medal, setMedal] = useState(null);
    const [gameResults, setGameResults] = useState(null);

    // References
    const inputRef = useRef(null);
    const nameInputRef = useRef(null);

    // Local storage
    const [players, setPlayers] = useLocalStorage(LOCAL_STORAGE_KEYS.TYPING_PLAYERS, []);

    // Timer hook
    const { timer, timeLeft, startGameTimer, stopTimer, resetTimer } = useGameTimer(
        GAME_CONFIG.TYPING_GAME.TIMER_DURATION,
        () => {
            setGameFinished(true);
            finishGame();
        }
    );

    // Difficulty configurations
    const difficultyConfig = {
        easy: { icon: '🟢', label: 'Beginner', description: 'Simple words and sentences' },
        moderate: { icon: '🟡', label: 'Intermediate', description: 'Mixed complexity text' },
        hard: { icon: '🟠', label: 'Advanced', description: 'Complex vocabulary' },
        expert: { icon: '🔴', label: 'Expert', description: 'Professional level' }
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
        { key: 'reflex', label: 'RefleX' }
    ];

    // Calculate errors in real-time
    const calculateErrors = (input, target) => {
        let errors = 0;
        for (let i = 0; i < input.length; i++) {
            if (input[i] !== target[i]) {
                errors++;
            }
        }
        return errors;
    };

    // Finish game and show results
    const finishGame = useCallback(() => {
        // Calculate actual time elapsed (TIMER_DURATION - remaining time in seconds)
        const timeElapsed = GAME_CONFIG.TYPING_GAME.TIMER_DURATION - timeLeft;

        // Use the calculateTypingStats utility for accurate calculation
        const finalStats = calculateTypingStats(
            stats.correctChars,
            timeElapsed,
            stats.errors,
            stats.totalChars
        );

        // Merge with existing stats
        const completeStats = {
            ...stats,
            ...finalStats
        };

        setStats(completeStats);

        // Get medal based on performance (use Gross WPM - errors already reflected in accuracy)
        const medalInfo = getMedalInfo(completeStats.wpm, completeStats.accuracy);
        setMedal(medalInfo);

        // Store game results
        const results = {
            ...completeStats,
            difficulty,
            timestamp: new Date().toISOString(),
            medal: medalInfo.name
        };
        setGameResults(results);
        setShowResults(true);
    }, [stats, difficulty, timeLeft]);

    // Handle input change with real-time stats
    const handleInputChange = useCallback((e) => {
        if (gameFinished) return;

        const newInput = e.target.value;
        setUserInput(newInput);

        // Calculate real-time statistics
        const errors = calculateErrors(newInput, currentParagraph);
        const correctChars = newInput.length - errors;
        const timeElapsed = GAME_CONFIG.TYPING_GAME.TIMER_DURATION - parseInt(timer.split(':')[1]) - parseInt(timer.split(':')[0]) * 60;

        const newStats = calculateTypingStats(correctChars, timeElapsed, errors, newInput.length);
        setStats({
            ...newStats,
            errors,
            correctChars,
            totalChars: newInput.length
        });

        // Check if paragraph is completed
        if (newInput.length >= currentParagraph.length) {
            setGameFinished(true);
            stopTimer();
            finishGame();
        }
    }, [currentParagraph, gameFinished, timer, stopTimer, finishGame, calculateErrors]);

    // Start game
    const startGame = useCallback(() => {
        const paragraphs = TYPING_PARAGRAPHS[difficulty];
        const randomIndex = Math.floor(Math.random() * paragraphs.length);
        const selectedParagraph = paragraphs[randomIndex];

        setCurrentParagraph(selectedParagraph);
        setUserInput('');
        setGameStarted(true);
        setGameFinished(false);
        setStats({
            wpm: 0,
            accuracy: 0,
            errors: 0,
            correctChars: 0,
            totalChars: 0
        });

        startGameTimer();

        // Focus input after state updates
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    }, [difficulty, startGameTimer]);

    // Reset game
    const resetGame = useCallback(() => {
        setGameStarted(false);
        setGameFinished(false);
        setShowResults(false);
        setUserInput('');
        setStats({
            wpm: 0,
            accuracy: 0,
            errors: 0,
            correctChars: 0,
            totalChars: 0
        });
        resetTimer();

        // Generate new paragraph
        const paragraphs = TYPING_PARAGRAPHS[difficulty];
        const randomIndex = Math.floor(Math.random() * paragraphs.length);
        setCurrentParagraph(paragraphs[randomIndex]);
    }, [difficulty, resetTimer]);

    // Handle name submission for leaderboard
    const handleNameSubmit = () => {
        const playerName = nameInputRef.current?.value?.trim();
        if (playerName && gameResults) {
            const newPlayer = {
                name: playerName,
                ...gameResults,
                id: Date.now()
            };

            const updatedPlayers = [...players, newPlayer]
                .sort((a, b) => b.wpm - a.wpm)
                .slice(0, 10);

            setPlayers(updatedPlayers);
            setShowResults(false);
            setShowLeaderboard(true);
        }
    };

    // Initialize paragraph on difficulty change
    useEffect(() => {
        if (!gameStarted) {
            const paragraphs = TYPING_PARAGRAPHS[difficulty];
            const randomIndex = Math.floor(Math.random() * paragraphs.length);
            setCurrentParagraph(paragraphs[randomIndex]);
        }
    }, [difficulty, gameStarted]);

    // Render typed text with highlighting
    const renderTypedText = () => {
        return currentParagraph.split('').map((char, index) => {
            let className = 'char';

            if (index < userInput.length) {
                className += userInput[index] === char ? ' correct' : ' incorrect';
            } else if (index === userInput.length) {
                className += ' current';
            }

            return (
                <span key={index} className={className}>
                    {char}
                </span>
            );
        });
    };

    const leaderboardColumns = [
        { key: 'wpm', label: 'WPM', render: (player) => `${player.wpm} WPM` },
        { key: 'accuracy', label: 'Accuracy', render: (player) => `${player.accuracy}%` },
        { key: 'medal', label: 'Medal', render: (player) => player.medal }
    ];

    return (
        <div className="container-fluid min-vh-100 bg-dark text-light">
            <div className="row">
                <div className="col-12">
                    {/* Modern Header */}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <TopBar
                            leftContent={
                                <div className="d-flex align-items-center gap-2">
                                    <GameDropdown
                                        isOpen={dropdownOpen}
                                        onToggle={() => setDropdownOpen(!dropdownOpen)}
                                        onGameSelect={handleGameSelect}
                                        currentGame="typing"
                                        games={games}
                                    />
                                </div>
                            }
                            centerContent={
                                <motion.h1
                                    className="m-0 text-primary fs-3 fw-bold"
                                    style={{
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
                                    ⚡ Typing Speed Test
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
                                // Difficulty Selection Screen
                                <motion.div
                                    key="difficulty-selection"
                                    className="typing-container"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -50 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                                            🎯 Choose Your Challenge
                                        </motion.h2>

                                        <div className="stats-grid mb-xl">
                                            {Object.entries(difficultyConfig).map(([level, config], index) => (
                                                <motion.div
                                                    key={level}
                                                    className={`stat-card ${difficulty === level ? 'scale-in' : ''}`}
                                                    style={{
                                                        cursor: 'pointer',
                                                        border: difficulty === level ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)',
                                                        background: difficulty === level ? 'var(--glass-border)' : 'var(--glass-bg)',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}
                                                    onClick={() => setDifficulty(level)}
                                                    whileHover={{ scale: 1.05, y: -5 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    initial={{ opacity: 0, y: 50 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                >
                                                    {difficulty === level && (
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
                                                            layoutId="difficulty-selection"
                                                        />
                                                    )}
                                                    <div className="stat-value" style={{ fontSize: '2rem' }}>
                                                        {config.icon}
                                                    </div>
                                                    <div className="stat-label" style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                                        {config.label}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {config.description}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Preview Text */}
                                        <motion.div
                                            className="glass-card mb-xl"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <h4 style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                                                📝 Preview Text:
                                            </h4>
                                            <div
                                                className="typing-text"
                                                style={{
                                                    fontSize: '1rem',
                                                    lineHeight: 1.6,
                                                    maxHeight: '120px',
                                                    overflow: 'hidden',
                                                    position: 'relative'
                                                }}
                                            >
                                                {currentParagraph.substring(0, 200)}...
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '40px',
                                                    background: 'linear-gradient(transparent, var(--glass-bg))'
                                                }} />
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
                                            Start Typing Test
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
                                >
                                    {/* Real-time Stats */}
                                    <motion.div
                                        className="stats-grid mb-lg"
                                        initial={{ y: -30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))' }}>
                                            <div className="stat-value" style={{ color: 'var(--error-color)' }}>
                                                <Clock size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                                {timer}
                                            </div>
                                            <div className="stat-label">Time Left</div>
                                        </div>
                                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.1))' }}>
                                            <div className="stat-value" style={{ color: 'var(--primary-color)' }}>
                                                <Zap size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                                {stats.wpm}
                                            </div>
                                            <div className="stat-label">WPM</div>
                                        </div>
                                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))' }}>
                                            <div className="stat-value" style={{ color: 'var(--success-color)' }}>
                                                <Target size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                                {stats.accuracy}%
                                            </div>
                                            <div className="stat-label">Accuracy</div>
                                        </div>
                                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))' }}>
                                            <div className="stat-value" style={{ color: 'var(--warning-color)' }}>
                                                <AlertCircle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                                {stats.errors}
                                            </div>
                                            <div className="stat-label">Errors</div>
                                        </div>
                                    </motion.div>

                                    {/* Progress Bar */}
                                    <motion.div
                                        className="glass-card mb-lg"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="progress-bar">
                                            <motion.div
                                                className="progress-fill"
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${Math.min((userInput.length / currentParagraph.length) * 100, 100)}%`
                                                }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <p style={{
                                            margin: 'var(--spacing-sm) 0 0 0',
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.875rem',
                                            textAlign: 'center'
                                        }}>
                                            Progress: {userInput.length} / {currentParagraph.length} characters
                                            ({Math.round((userInput.length / currentParagraph.length) * 100)}%)
                                        </p>
                                    </motion.div>

                                    {/* Text Display */}
                                    <motion.div
                                        className="glass-card mb-lg"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <div className="typing-text">
                                            {renderTypedText()}
                                        </div>
                                    </motion.div>

                                    {/* Input Section */}
                                    <motion.div
                                        className="glass-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <textarea
                                            ref={inputRef}
                                            value={userInput}
                                            onChange={handleInputChange}
                                            placeholder="Start typing the text above..."
                                            className="form-control bg-dark text-light border-secondary mb-3"
                                            disabled={gameFinished}
                                            rows={4}
                                            autoFocus
                                            style={{
                                                fontSize: '1.1rem',
                                                lineHeight: 1.6,
                                                resize: 'none',
                                                fontFamily: 'monospace'
                                            }}
                                        />

                                        <div className="flex items-center justify-between">
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                Difficulty: <strong style={{ color: 'var(--primary-color)' }}>
                                                    {difficultyConfig[difficulty]?.label}
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
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Results Popup */}
                    <GamePopup
                        isOpen={showResults}
                        onClose={() => setShowResults(false)}
                        title="🎉 Typing Test Complete!"
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
                            <div className="medal-display">
                                {medal && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ duration: 0.6, type: "spring" }}
                                    >
                                        <img
                                            src={medal.image}
                                            alt={medal.name}
                                            style={{ width: '100px', height: '100px' }}
                                        />
                                        <h3>{medal.name}</h3>
                                        <p>{medal.congratsText}</p>
                                    </motion.div>
                                )}
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <div className="stat-card text-center p-3 bg-secondary rounded">
                                        <div className="stat-value h4 mb-1 text-primary">{stats.wpm}</div>
                                        <div className="stat-label small text-muted">WPM</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="stat-card text-center p-3 bg-secondary rounded">
                                        <div className="stat-value h4 mb-1 text-success">{stats.accuracy}%</div>
                                        <div className="stat-label small text-muted">Accuracy</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="stat-card text-center p-3 bg-secondary rounded">
                                        <div className="stat-value h4 mb-1 text-danger">{stats.errors}</div>
                                        <div className="stat-label small text-muted">Errors</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="stat-card text-center p-3 bg-secondary rounded">
                                        <div className="stat-value h6 mb-1 text-info">{difficultyConfig[difficulty]?.label}</div>
                                        <div className="stat-label small text-muted">Difficulty</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </GamePopup>

                    {/* Leaderboard */}
                    <Leaderboard
                        isOpen={showLeaderboard}
                        onClose={() => setShowLeaderboard(false)}
                        players={players.filter(p => p.difficulty === difficulty)}
                        topPlayers={players.filter(p => p.difficulty === difficulty).slice(0, 3)}
                        columns={leaderboardColumns}
                    />
                </div>
            </div>
        </div>
    );
};

ModernTypingGame.propTypes = {
    onGameChange: PropTypes.func.isRequired,
};

ModernTypingGame.displayName = 'ModernTypingGame';

export default ModernTypingGame;