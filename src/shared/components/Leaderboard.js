import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Leaderboard component
 */
const Leaderboard = memo(({
    isOpen,
    onClose,
    players = [],
    topPlayers = [],
    columns = []
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content bg-dark text-light">
                    <div className="modal-header border-secondary">
                        <h4 className="modal-title">🏆 Leaderboard</h4>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>

                    <div className="modal-body">
                        {/* Top Players Podium */}
                        {topPlayers.length > 0 && (
                            <div className="row mb-4">
                                <div className="col-12">
                                    <h5 className="text-center mb-3 text-warning">🥇 Top Champions</h5>
                                    <div className="d-flex justify-content-center align-items-end gap-3 flex-wrap">
                                        {topPlayers.map((leader, index) => {
                                            // Position indicators with different colors and sizes
                                            const positions = [
                                                { medal: '🥇', rank: '1st', color: '#ffc107', size: '80px', textSize: 'fs-5' },
                                                { medal: '🥈', rank: '2nd', color: '#6c757d', size: '70px', textSize: 'fs-6' },
                                                { medal: '🥉', rank: '3rd', color: '#cd7f32', size: '60px', textSize: 'small' }
                                            ];
                                            const position = positions[index];
                                            
                                            return (
                                                <div key={leader.id || index} className="text-center">
                                                    <div className="position-relative mb-2">
                                                        <img
                                                            className="rounded-circle border border-3"
                                                            src={leader.image || require("../../assets/images/grey.png")}
                                                            alt={`${leader.name} avatar`}
                                                            style={{ 
                                                                width: position.size, 
                                                                height: position.size,
                                                                borderColor: `${position.color} !important`,
                                                                boxShadow: `0 0 15px ${position.color}`
                                                            }}
                                                        />
                                                        <div 
                                                            className="position-absolute top-0 start-50 translate-middle"
                                                            style={{ fontSize: '2rem' }}
                                                        >
                                                            {position.medal}
                                                        </div>
                                                        <div 
                                                            className="position-absolute bottom-0 start-50 translate-middle-x badge"
                                                            style={{ 
                                                                backgroundColor: position.color,
                                                                color: '#000',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.75rem',
                                                                marginBottom: '-10px'
                                                            }}
                                                        >
                                                            {position.rank}
                                                        </div>
                                                    </div>
                                                    <div className="fw-bold" style={{ color: position.color }}>
                                                        {leader.name}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Players Table */}
                        <div className="table-responsive">
                            <table className="table table-dark table-striped table-hover">
                                <thead className="table-warning">
                                    <tr>
                                        <th scope="col" className="text-center">#</th>
                                        <th scope="col">Player</th>
                                        {columns.map((column, index) => (
                                            <th key={index} scope="col" className="text-center">{column.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {players.map((player, index) => (
                                        <tr key={player.id || index}>
                                            <td className="text-center fw-bold text-info">{index + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <img
                                                        className="rounded-circle"
                                                        src={player.image || require("../../assets/images/grey.png")}
                                                        alt={`${player.name} avatar`}
                                                        style={{ width: '32px', height: '32px' }}
                                                    />
                                                    <span className="fw-semibold">{player.name}</span>
                                                </div>
                                            </td>
                                            {columns.map((column, colIndex) => (
                                                <td key={colIndex} className="text-center">
                                                    <span className="badge bg-primary fs-6">
                                                        {column.render ? column.render(player) : player[column.key]}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

Leaderboard.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    players: PropTypes.arrayOf(PropTypes.object),
    topPlayers: PropTypes.arrayOf(PropTypes.object),
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            render: PropTypes.func,
        })
    ),
};

Leaderboard.displayName = 'Leaderboard';

export default Leaderboard;