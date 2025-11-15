/**
 * Utility functions for games
 */

/**
 * Generate random position within screen bounds
 * @param {number} maxX - Maximum X position
 * @param {number} maxY - Maximum Y position
 * @param {number} minMargin - Minimum margin from edges
 * @param {number} topMargin - Top margin offset
 * @returns {object} Position object with x and y coordinates
 */
export const generateRandomPosition = (maxX, maxY, minMargin = 20, topMargin = 80) => {
    // Generate position within safe bounds
    const safeMaxX = Math.max(maxX - minMargin, minMargin);
    const safeMaxY = Math.max(maxY - minMargin, topMargin);

    let posX = Math.floor(Math.random() * (safeMaxX - minMargin)) + minMargin;
    let posY = Math.floor(Math.random() * (safeMaxY - topMargin)) + topMargin;

    // Additional safety constraints
    posX = Math.max(minMargin, Math.min(posX, maxX - minMargin));
    posY = Math.max(topMargin, Math.min(posY, maxY - minMargin));

    return { x: posX, y: posY };
};

/**
 * Calculate screen bounds for element positioning
 * @param {HTMLElement} element - Element to calculate bounds for
 * @returns {object} Bounds object with maxX and maxY
 */
export const calculateScreenBounds = (element) => {
    if (!element) return { maxX: window.innerWidth, maxY: window.innerHeight };

    return {
        maxX: window.innerWidth - element.offsetWidth,
        maxY: window.innerHeight - element.offsetHeight,
    };
};

/**
 * Format time from seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Debounce function to limit function execution frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Validate player name input
 * @param {string} name - Player name to validate
 * @returns {object} Validation result with isValid and error message
 */
export const validatePlayerName = (name) => {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
        return { isValid: false, error: "Name cannot be empty!" };
    }

    if (trimmedName.length > 20) {
        return { isValid: false, error: "Name cannot be longer than 20 characters!" };
    }

    return { isValid: true, error: null };
};

/**
 * Calculate typing statistics
 * @param {number} correctChars - Number of correct characters
 * @param {number} timeElapsed - Time elapsed in seconds
 * @param {number} errors - Number of errors
 * @param {number} totalChars - Total characters typed
 * @returns {object} Statistics object with WPM, CPM, and accuracy
 */
export const calculateTypingStats = (correctChars, timeElapsed, errors, totalChars) => {
    // Prevent division by zero - require at least 1 second of typing
    if (timeElapsed < 1) {
        return {
            wpm: 0,
            cpm: 0,
            netWpm: 0,
            accuracy: 100,
        };
    }

    const timeInMinutes = timeElapsed / 60;
    
    // Standard WPM formula: (Total Characters / 5) / Time in Minutes
    // Using totalChars (not correctChars) for gross WPM
    const grossWpm = Math.round((totalChars / 5) / timeInMinutes);
    
    // CPM (Characters Per Minute)
    const cpm = Math.round(totalChars / timeInMinutes);
    
    // Accuracy: (Correct Characters / Total Characters) × 100
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    
    // Net WPM = Gross WPM - (Errors / Time in Minutes)
    // Alternative: Gross WPM * (Accuracy / 100)
    const netWpm = Math.max(0, Math.round(grossWpm - (errors / timeInMinutes)));

    return {
        wpm: grossWpm,
        cpm,
        netWpm,
        accuracy,
    };
};