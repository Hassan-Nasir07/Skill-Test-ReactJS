import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Game Popup component for score display and name input
 */
const GamePopup = memo(({
    isOpen,
    onClose,
    title,
    score,
    additionalInfo,
    showNameInput = false,
    nameInputRef,
    onNameSubmit,
    actionButtonText = "OK",
    children
}) => {
    if (!isOpen) return null;

    const handleSubmit = () => {
        if (showNameInput && onNameSubmit) {
            onNameSubmit();
        } else {
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="modal d-flex show" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered d-flex align-items-center justify-content-center">
                <div className="modal-content bg-dark text-light border-secondary" style={{ minWidth: '400px' }}>
                    <div className="modal-header border-secondary">
                        <h5 className="modal-title text-center w-100">{title}</h5>
                    </div>
                    <div className="modal-body text-center">
                        {score !== undefined && <p className="mb-2">Score: <strong>{score}</strong></p>}
                        {additionalInfo && <p className="mb-3">{additionalInfo}</p>}
                        {children}
                    </div>
                    <div className="modal-footer border-secondary d-flex justify-content-center">
                        {showNameInput ? (
                            <div className="d-flex flex-column align-items-center w-100">
                                <input
                                    type="text"
                                    className="form-control mb-3 bg-secondary text-light border-secondary"
                                    placeholder="Enter Your Name"
                                    ref={nameInputRef}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                />
                                <button className="btn btn-primary px-4" onClick={handleSubmit}>
                                    {actionButtonText}
                                </button>
                            </div>
                        ) : (
                            <button className="btn btn-primary px-4" onClick={onClose}>
                                {actionButtonText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

GamePopup.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    additionalInfo: PropTypes.string,
    showNameInput: PropTypes.bool,
    nameInputRef: PropTypes.oneOfType([PropTypes.object, PropTypes.shape({ current: PropTypes.any })]),
    onNameSubmit: PropTypes.func,
    actionButtonText: PropTypes.string,
    children: PropTypes.node,
};

GamePopup.displayName = 'GamePopup';

export default GamePopup;