import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Crosshair component
 */
const Crosshair = memo(({ isVisible = true }) => {
    if (!isVisible) return null;

    return (
        <div>
            <div className="crosslines" id="vertical"></div>
            <div className="crosslines" id="horizontal"></div>
        </div>
    );
});

Crosshair.propTypes = {
    isVisible: PropTypes.bool,
};

Crosshair.displayName = 'Crosshair';

export default Crosshair;