import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Bullet hole component for visual effects
 */
const BulletHole = memo(({
    bulletHole,
    onAnimationEnd
}) => {
    if (!bulletHole.image) return null;

    return (
        <img
            className="Bhole"
            src={bulletHole.image}
            alt="Bullet hole"
            style={{
                position: 'absolute',
                left: bulletHole.x,
                top: bulletHole.y,
                pointerEvents: 'none',
                zIndex: 1
            }}
            onAnimationEnd={onAnimationEnd}
        />
    );
});

BulletHole.propTypes = {
    bulletHole: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        image: PropTypes.string.isRequired,
    }).isRequired,
    onAnimationEnd: PropTypes.func,
};

BulletHole.displayName = 'BulletHole';

export default BulletHole;