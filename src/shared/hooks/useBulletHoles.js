import { useState, useCallback } from 'react';

/**
 * Custom hook for managing bullet hole effects
 * @returns {object} Bullet hole state and management functions
 */
// Import the bullet hole images (outside the hook to avoid re-creation)
const bulletHoleImages = [
    require('../../assets/images/Bhole1.png'),
    require('../../assets/images/Bhole2.png'),
    require('../../assets/images/Bhole3.png'),
    require('../../assets/images/Bhole4.png'),
    require('../../assets/images/Bhole5.png'),
    require('../../assets/images/Bhole6.png'),
    require('../../assets/images/Bhole7.png'),
    require('../../assets/images/Bhole8.png'),
];

export const useBulletHoles = () => {
    const [bulletHoles, setBulletHoles] = useState([]);
    const [showBulletHole, setShowBulletHole] = useState(false);

    const addBulletHole = useCallback((x, y) => {
        const randomIndex = Math.floor(Math.random() * bulletHoleImages.length);
        const newBulletHole = {
            id: Date.now() + Math.random(),
            x: x - 9, // Offset for centering
            y: y - 9, // Offset for centering
            image: bulletHoleImages[randomIndex],
        };

        setBulletHoles(prev => [...prev, newBulletHole]);
        setShowBulletHole(true);

        // Hide bullet hole effect after 5 seconds
        setTimeout(() => {
            setShowBulletHole(false);
        }, 5000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const removeBulletHole = useCallback((bulletHoleId) => {
        setBulletHoles(prev => prev.filter(hole => hole.id !== bulletHoleId));
    }, []);

    const clearAllBulletHoles = useCallback(() => {
        setBulletHoles([]);
        setShowBulletHole(false);
    }, []);

    const handleBulletHoleClick = useCallback((event) => {
        const x = event.clientX;
        const y = event.clientY;
        addBulletHole(x, y);
    }, [addBulletHole]);

    return {
        bulletHoles,
        showBulletHole,
        addBulletHole,
        removeBulletHole,
        clearAllBulletHoles,
        handleBulletHoleClick,
    };
};