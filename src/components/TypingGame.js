import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { TYPING_PARAGRAPHS } from '../shared/constants/typingParagraphs';
import { GAME_CONFIG, LOCAL_STORAGE_KEYS, MEDAL_THRESHOLDS } from '../shared/constants/gameConfig';
import { calculateTypingStats } from '../shared/utils/gameUtils';
import { getMedalInfo } from '../shared/utils/medalUtils';
import useLocalStorage from '../shared/hooks/useLocalStorage';
import GamePopup from '../shared/components/GamePopup';
import Leaderboard from '../shared/components/Leaderboard';
import TopBar from '../shared/components/TopBar';
import GameDropdown from '../shared/components/GameDropdown';
import { useGameTimer } from '../shared/hooks/useGameTimer';
import '../App.css';

/**
 * TypingGame Component - A typing speed test game with multiple difficulty levels
 */
const TypingGame = ({ onBack }) => {
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
    const { timer, startGameTimer, stopTimer, resetTimer } = useGameTimer(
        GAME_CONFIG.TYPING_GAME.TIMER_DURATION,
        handleGameComplete
    );

    // Initialize paragraph when difficulty changes
    useEffect(() => {
        if (!gameStarted) {
            const paragraphs = TYPING_PARAGRAPHS[difficulty];
            const randomIndex = Math.floor(Math.random() * paragraphs.length);
            setCurrentParagraph(paragraphs[randomIndex]);
        }
    }, [difficulty, gameStarted]);

    // Handle game completion
    function handleGameComplete() {
        if (gameStarted && !gameFinished) {
            finishGame();
        }
    }

    // Start the game
    const handleStartGame = useCallback(() => {
        setGameStarted(true);
        setGameFinished(false);
        setUserInput('');
        setStats({ wpm: 0, accuracy: 0, errors: 0, correctChars: 0, totalChars: 0 });
        startGameTimer();

        // Focus on input after a small delay
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    }, [startGameTimer]);

    // Handle user typing
    const handleInputChange = useCallback((e) => {
        if (!gameStarted || gameFinished) return;

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
            finishGame();
        }
    }, [gameStarted, gameFinished, currentParagraph, timer]);

    // Calculate typing errors
    const calculateErrors = (input, target) => {
        let errors = 0;
        for (let i = 0; i < input.length; i++) {
            if (i >= target.length || input[i] !== target[i]) {
                errors++;
            }
        }
        return errors;
    };

    // Finish the game
    const finishGame = useCallback(() => {
        setGameFinished(true);
        setGameStarted(false);
        stopTimer();

        // Calculate final statistics
        const timeElapsed = GAME_CONFIG.TYPING_GAME.TIMER_DURATION - parseInt(timer.split(':')[1]) - parseInt(timer.split(':')[0]) * 60;
        const finalStats = calculateTypingStats(stats.correctChars, timeElapsed, stats.errors, stats.totalChars);

        // Get medal based on performance
        const medalInfo = getMedalInfo(finalStats.wpm, finalStats.accuracy);

        setStats(finalStats);
        setMedal(medalInfo);
        setGameResults({
            ...finalStats,
            medal: medalInfo,
            timeElapsed,
            paragraph: currentParagraph.substring(0, Math.min(50, currentParagraph.length)) + '...'
        });

        setShowResults(true);
    }, [stats, timer, stopTimer, currentParagraph]);

    // Handle name submission for leaderboard
    const handleNameSubmit = useCallback(() => {
        const name = nameInputRef.current?.value.trim();
        if (name && gameResults) {
            const newPlayer = {
                name: name.toUpperCase(),
                wpm: gameResults.wpm,
                accuracy: gameResults.accuracy,
                medal: gameResults.medal.name,
                difficulty: difficulty,
                timestamp: new Date().toISOString()
            };

            setPlayers(prevPlayers => {
                const updatedPlayers = [...prevPlayers, newPlayer];
                return updatedPlayers.sort((a, b) => b.wpm - a.wpm); // Sort by WPM descending
            });
        }

        setShowResults(false);
        resetGame();
    }, [gameResults, difficulty, setPlayers]);

    // Reset the game
    const resetGame = useCallback(() => {
        setGameStarted(false);
        setGameFinished(false);
        setShowResults(false);
        setUserInput('');
        setStats({ wpm: 0, accuracy: 0, errors: 0, correctChars: 0, totalChars: 0 });
        setGameResults(null);
        setMedal(null);
        resetTimer();

        // Generate new paragraph
        const paragraphs = TYPING_PARAGRAPHS[difficulty];
        const randomIndex = Math.floor(Math.random() * paragraphs.length);
        setCurrentParagraph(paragraphs[randomIndex]);
    }, [difficulty, resetTimer]);

    // Render typed text with correct/incorrect highlighting
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

    // Navigation handlers
    const handleGameSelect = (gameKey) => {
        if (gameKey === 'precision') {
            onBack();
        }
        // For now, all games redirect back to precision
        // TODO: Implement proper multi-game navigation
        onBack();
    };

    const games = [
        { key: 'precision', label: 'Precision' },
        { key: 'aim', label: 'Aim✜Trainer' },
        { key: 'reflex', label: 'RefleX' }
    ];

    const leaderboardColumns = [
        { key: 'wpm', label: 'WPM', render: (player) => `${player.wpm} WPM` },
        { key: 'accuracy', label: 'Accuracy', render: (player) => `${player.accuracy}%` },
        { key: 'medal', label: 'Medal', render: (player) => player.medal }
    ];

    return (
        <div className="App">
            {/* Top Navigation Bar */}
            <TopBar
                leftContent={
                    <div style={{ display: 'inline-flex' }}>
                        <GameDropdown
                            isOpen={dropdownOpen}
                            onToggle={() => setDropdownOpen(!dropdownOpen)}
                            onGameSelect={handleGameSelect}
                            currentGame="typing"
                            games={games}
                        />
                        <button
                            className="game2"
                            onClick={() => setShowLeaderboard(!showLeaderboard)}
                            style={{
                                backgroundColor: showLeaderboard ? '#dd4a4a' : '#a0e575',
                                color: showLeaderboard ? '#f5f5f5' : '#0c5594'
                            }}
                        >
                            {showLeaderboard ? '✕ Close' : 'Leaderboard'}
                        </button>
                    </div>
                }
                rightContent={
                    <div>
                        <span style={{ marginRight: '20px' }}>WPM: {stats.wpm}</span>
                        <span style={{ marginRight: '20px' }}>Accuracy: {stats.accuracy}%</span>
                        <span>Time: {timer}</span>
                    </div>
                }
            />

            {/* Game Content */}
            <div className="wrapper">
                {!gameStarted && !gameFinished && (
                    <div className="content-box">
                        <div className="content">
                            <h1>Typing Speed Test</h1>

                            {/* Difficulty Selection */}
                            <div className="difficulty-selection">
                                <h3>Select Difficulty:</h3>
                                <div className="difButtonContainer">
                                    {['easy', 'moderate', 'hard'].map((level) => (
                                        <button
                                            key={level}
                                            className={`difButton ${difficulty === level ? 'active' : ''}`}
                                            onClick={() => setDifficulty(level)}
                                        >
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Paragraph Preview */}
                            <div className="typing-text">
                                <p>{currentParagraph}</p>
                            </div>

                            <button className="resetBtn" onClick={handleStartGame}>
                                Start Typing Test
                            </button>
                        </div>
                    </div>
                )}

                {gameStarted && (
                    <div className="content-box">
                        <div className="content">
                            <div className="typing-text">
                                <p>{renderTypedText()}</p>
                            </div>

                            <textarea
                                ref={inputRef}
                                value={userInput}
                                onChange={handleInputChange}
                                placeholder="Start typing here..."
                                className="typing-input"
                                disabled={gameFinished}
                                rows={4}
                                autoFocus
                            />

                            <div className="stats">
                                <div className="result-details">
                                    <li>
                                        <span>WPM: <b>{stats.wpm}</b></span>
                                    </li>
                                    <li>
                                        <span>Accuracy: <b>{stats.accuracy}%</b></span>
                                    </li>
                                    <li className="errors">
                                        <span>Errors: <b>{stats.errors}</b></span>
                                    </li>
                                    <li className="timeLeft">
                                        <span>Time Left: <b>{timer}</b></span>
                                    </li>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Popup */}
            <GamePopup
                isOpen={showResults}
                onClose={() => setShowResults(false)}
                title="Typing Test Complete!"
                showNameInput={true}
                nameInputRef={nameInputRef}
                onNameSubmit={handleNameSubmit}
                actionButtonText="Save Score"
            >
                <div className="results-content">
                    <div className="medal-display">
                        {medal && (
                            <div>
                                <img src={medal.image} alt={medal.name} style={{ width: '80px', height: '80px' }} />
                                <h3>{medal.name}</h3>
                                <p>{medal.congratsText}</p>
                            </div>
                        )}
                    </div>

                    <div className="stats">
                        <p><strong>WPM:</strong> {stats.wpm}</p>
                        <p><strong>Accuracy:</strong> {stats.accuracy}%</p>
                        <p><strong>Errors:</strong> {stats.errors}</p>
                        <p><strong>Difficulty:</strong> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
                    </div>
                </div>
            </GamePopup>

            {/* Leaderboard */}
            <Leaderboard
                isOpen={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
                players={players}
                topPlayers={players.slice(0, 3)}
                columns={leaderboardColumns}
            />
        </div>
    );
};

TypingGame.propTypes = {
    onBack: PropTypes.func.isRequired,
};

TypingGame.displayName = 'TypingGame';

export default TypingGame;