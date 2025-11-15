import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Top Bar component for games
 */
const TopBar = memo(({
    leftContent,
    rightContent,
    centerContent
}) => {
    return (
        <nav className="navbar navbar-expand-lg bg-dark border-bottom border-secondary px-3 py-2 mb-3">
            <div className="container-fluid">
                <div className="navbar-nav me-auto">
                    {leftContent}
                </div>
                <div className="navbar-nav mx-auto">
                    {centerContent}
                </div>
                <div className="navbar-nav ms-auto">
                    {rightContent}
                </div>
            </div>
        </nav>
    );
});

TopBar.propTypes = {
    leftContent: PropTypes.node,
    rightContent: PropTypes.node,
    centerContent: PropTypes.node,
};

TopBar.displayName = 'TopBar';

export default TopBar;