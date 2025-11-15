import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useGameTimer } from '../../shared/hooks/useGameTimer';
import { useLeaderboard } from '../../shared/hooks/useLeaderboard';
import { useCrosshair } from '../../shared/hooks/useCrosshair';
import { useBulletHoles } from '../../shared/hooks/useBulletHoles';
import { generateRandomPosition, calculateScreenBounds, validatePlayerName } from '../../shared/utils/gameUtils';
import { GAME_CONFIG, LOCAL_STORAGE_KEYS } from '../../shared/constants/gameConfig';
import GameDropdown from '../../shared/components/GameDropdown';
import Leaderboard from '../../shared/components/Leaderboard';
import Crosshair from '../../shared/components/Crosshair';
import TopBar from '../../shared/components/TopBar';
import GamePopup from '../../shared/components/GamePopup';
import BulletHole from '../../shared/components/BulletHole';
import useLocalStorage from '../../shared/hooks/useLocalStorage';

const PrecisionGame = memo(({ onGameChange }) => {
    // Game state
    const [visible, setVisible] = useState(true);
    const [count, setCount] = useState(0);
    const [newGame, setNewGame] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    // const [playerName, setPlayerName] = useState(""); // Currently unused

    // Refs
    const btnRef = useRef(null);
    const nameInputRef = useRef(null);

    // Local storage for high score
    const [highScore, setHighScore] = useLocalStorage(
        LOCAL_STORAGE_KEYS.PRECISION_HIGHSCORE,
        localStorage.getItem(LOCAL_STORAGE_KEYS.PRECISION_HIGHSCORE) || 0
    );

    // Custom hooks
    const { timer, startGameTimer, stopTimer } = useGameTimer(GAME_CONFIG.PRECISION_GAME.TIMER_DURATION);
    const { players, topPlayers, isLeaderboardOpen, addPlayer, toggleLeaderboard } = useLeaderboard(LOCAL_STORAGE_KEYS.HIT_PLAYERS);
    const { initializeCrosshair } = useCrosshair();
    const { bulletHoles, handleBulletHoleClick, removeBulletHole } = useBulletHoles();

    // Game configuration
    const games = [
        { key: 'aim', label: 'Aim✜Trainer' },
        { key: 'reflex', label: 'RefleX' },
        { key: 'typing', label: 'SpeedType' }
    ];

    const leaderboardColumns = [
        { key: 'score', label: 'Score' }
    ];

    // Initialize crosshair effect
    useEffect(() => {
        const cleanup = initializeCrosshair();
        return cleanup;
    }, [initializeCrosshair]);

    // Position button randomly on mount and resize
    useEffect(() => {
        if (!btnRef.current) return;

        const positionButton = () => {
            const bounds = calculateScreenBounds(btnRef.current);
            const position = generateRandomPosition(
                bounds.maxX,
                bounds.maxY,
                GAME_CONFIG.PRECISION_GAME.MIN_BUTTON_MARGIN,
                GAME_CONFIG.PRECISION_GAME.TOP_MARGIN
            );

            btnRef.current.style.top = `${position.y}px`;
            btnRef.current.style.left = `${position.x}px`;
        };

        positionButton();

        const handleResize = () => {
            if (btnRef.current) {
                positionButton();
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleGameOver = useCallback(() => {
        const currentScore = count;
        const storedHighScore = parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.PRECISION_HIGHSCORE)) || 0;

        if (currentScore > storedHighScore || newGame) {
            setHighScore(currentScore);
        }

        stopTimer();
        setShowPopup(true);
        setVisible(true);
        setNewGame(false);
    }, [count, newGame, setHighScore, stopTimer]);

    // Handle game over when timer reaches zero
    useEffect(() => {
        if (timer === '00:00' && btnRef.current) {
            btnRef.current.style.position = 'static';
            handleGameOver();
        }
    }, [timer, handleGameOver]);

    const handleButtonClick = useCallback(() => {
        if (!btnRef.current) return;

        const bounds = calculateScreenBounds(btnRef.current);
        const position = generateRandomPosition(
            bounds.maxX,
            bounds.maxY,
            GAME_CONFIG.PRECISION_GAME.MIN_BUTTON_MARGIN,
            GAME_CONFIG.PRECISION_GAME.TOP_MARGIN
        );

        btnRef.current.style.top = `${position.y}px`;
        btnRef.current.style.left = `${position.x}px`;

        if (visible) {
            btnRef.current.style.position = 'static';
        } else {
            btnRef.current.style.position = 'absolute';
            setCount(prev => prev + 1);
        }
    }, [visible]);

    const handlePlay = useCallback(() => {
        startGameTimer();
        setVisible(false);
        setShowPopup(false);
        setCount(0);
    }, [startGameTimer]);

    const handleNameSubmit = useCallback(() => {
        const name = nameInputRef.current?.value.trim().toUpperCase();
        const validation = validatePlayerName(name);

        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        addPlayer({
            name,
            score: count,
        });

        setShowPopup(false);
    }, [count, addPlayer]);

    const handleBulletHoleAnimationEnd = useCallback((bulletHoleId) => {
        setTimeout(() => {
            removeBulletHole(bulletHoleId);
        }, 50);
    }, [removeBulletHole]);

    return (
        <div className="container-fluid min-vh-100 bg-dark text-light position-relative overflow-hidden" onMouseDown={handleBulletHoleClick}>
            <div className="row">
                <div className="col-12">
                    <TopBar
                        leftContent={
                            <div className="d-flex flex-wrap align-items-center gap-2">
                                <GameDropdown
                                    isOpen={dropdownOpen}
                                    onToggle={() => setDropdownOpen(!dropdownOpen)}
                                    onGameSelect={onGameChange}
                                    currentGame="precision"
                                    games={games}
                                />
                                <button
                                    className={`btn btn-sm px-3 ${isLeaderboardOpen ? 'btn-danger' : 'btn-success'}`}
                                    onClick={toggleLeaderboard}
                                >
                                    {isLeaderboardOpen ? '✕ Close' : 'Leaderboard'}
                                </button>
                            </div>
                        }
                        rightContent={
                            <div className="d-flex flex-column flex-sm-row align-items-center gap-2 small">
                                <span className="text-info">
                                    Highscore: <strong>{highScore}</strong>
                                </span>
                                <span className="text-warning">
                                    Score: <strong>{count}</strong> | Time: <strong>{timer}s</strong>
                                </span>
                            </div>
                        }
                    />

                    <Crosshair />

                    <Leaderboard
                        isOpen={isLeaderboardOpen}
                        onClose={toggleLeaderboard}
                        players={players}
                        topPlayers={topPlayers}
                        columns={leaderboardColumns}
                    />

                    <GamePopup
                        isOpen={showPopup}
                        title={`YOU SCORED ${count} Points!`}
                        showNameInput={true}
                        nameInputRef={nameInputRef}
                        onNameSubmit={handleNameSubmit}
                        onClose={() => setShowPopup(false)}
                    />

                    <button
                        type="button"
                        ref={btnRef}
                        name="target"
                        className="btn btn-outline-danger btn-lg rounded-circle d-flex align-items-center justify-content-center"
                        onMouseDown={handleButtonClick}
                        style={{
                            position: visible ? 'static' : 'absolute',
                            width: '80px',
                            height: '80px',
                            fontSize: '2rem',
                            border: '3px solid #dc3545',
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            cursor: 'crosshair'
                        }}
                    >
                        ⊹
                    </button>

                    {visible && (
                        <div className="position-absolute top-50 start-50 translate-middle">
                            <button
                                type="button"
                                name="resetBtn"
                                className="btn btn-success btn-lg px-4 py-2 fs-4"
                                onClick={handlePlay}
                            >
                                ▶ Play
                            </button>
                        </div>
                    )}

                    {bulletHoles.map((bulletHole) => (
                        <BulletHole
                            key={bulletHole.id}
                            bulletHole={bulletHole}
                            onAnimationEnd={() => handleBulletHoleAnimationEnd(bulletHole.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

PrecisionGame.displayName = 'PrecisionGame';

export default PrecisionGame;