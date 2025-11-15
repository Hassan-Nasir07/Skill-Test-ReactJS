// Game configuration constants
export const GAME_CONFIG = {
    PRECISION_GAME: {
        TIMER_DURATION: 30, // seconds
        MIN_BUTTON_MARGIN: 20,
        TOP_MARGIN: 80,
    },
    AIM_TRAINER: {
        TARGET_COUNT: 30,
        MIN_BUTTON_MARGIN: 20,
        TOP_MARGIN: 80,
    },
    REFLEX_GAME: {
        TIMER_DURATION: 60, // seconds
        MAX_BUTTONS: 5,
        TARGET_MOVE_INTERVAL: 3500, // milliseconds
    },
    TYPING_GAME: {
        TIMER_DURATION: 120, // seconds
        MIN_WPM_FOR_MEDAL: 25,
        MIN_ACCURACY_FOR_MEDAL: 60,
        DIFFICULTY_LEVELS: {
            EASY: 'Easy',
            MODERATE: 'Moderate',
            HARD: 'Hard',
        },
    },
};

export const LOCAL_STORAGE_KEYS = {
    PRECISION_HIGHSCORE: 'precisionhighscore',
    AIM_HIGHSCORE: 'aimhighscore',
    REFLEX_HIGHSCORE: 'reflexhighscore',
    HIT_PLAYERS: 'hitplayers',
    AIM_PLAYERS: 'aimplayers',
    REFLEX_PLAYERS: 'reflexplayers',
    TYPING_PLAYERS: 'players',
};

// Medal thresholds - Awards medal if EITHER wpm OR accuracy threshold is met
// This motivates both speed-focused and accuracy-focused typists
export const MEDAL_THRESHOLDS = {
    BRONZE: { wpm: 20, accuracy: 70 },      // Entry level - achievable for beginners
    SILVER: { wpm: 35, accuracy: 80 },      // Casual typist with decent skills
    GOLD: { wpm: 50, accuracy: 85 },        // Good proficiency - productive typing
    PLATINUM: { wpm: 70, accuracy: 90 },    // Advanced typist
    DIAMOND: { wpm: 90, accuracy: 95 },     // Expert typist - top 10%
    ACE: { wpm: 120, accuracy: 98 },        // Master typist - tournament level
};

export const BULLET_HOLE_DURATION = 5000; // milliseconds
export const POPUP_DISPLAY_DURATION = 50; // milliseconds

export const GAME_ROUTES = {
    PRECISION: 'precision',
    AIM_TRAINER: 'aim-trainer',
    REFLEX: 'reflex',
    TYPING: 'typing',
};