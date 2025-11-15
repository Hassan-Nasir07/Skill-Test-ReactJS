import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Dropdown component for game navigation
 */
const GameDropdown = memo(({
    isOpen,
    onToggle,
    onGameSelect,
    currentGame,
    games = []
}) => {
    const handleGameClick = (gameKey) => {
        onGameSelect(gameKey);
    };

    return (
        <div className="dropdown">
            <button
                className="btn btn-outline-info dropdown-toggle"
                type="button"
                onClick={onToggle}
                aria-label="Toggle games menu"
                aria-expanded={isOpen}
            >
                🎮 Games
            </button>

            {isOpen && (
                <ul className="dropdown-menu dropdown-menu-dark show position-absolute">
                    {games.map((game) => (
                        <li key={game.key}>
                            <button
                                type="button"
                                className={`dropdown-item ${game.key === currentGame ? 'active' : ''}`}
                                onClick={() => handleGameClick(game.key)}
                                disabled={game.key === currentGame}
                            >
                                {game.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
});

GameDropdown.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    onGameSelect: PropTypes.func.isRequired,
    currentGame: PropTypes.string,
    games: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ),
};

GameDropdown.displayName = 'GameDropdown';

export default GameDropdown;