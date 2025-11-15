import { MEDAL_THRESHOLDS } from '../constants/gameConfig';
import bronze from '../../assets/images/BronzeStar.png';
import silver from '../../assets/images/SilverStar.png';
import gold from '../../assets/images/GoldStar.png';
import platinum from '../../assets/images/Platinum.png';
import diamond from '../../assets/images/Diamond.png';
import ace from '../../assets/images/Ace.png';
import fail from '../../assets/images/Fail.png';

/**
 * Determine medal based on WPM and accuracy
 * Awards medal if EITHER wpm OR accuracy threshold is met (more motivating)
 * @param {number} wpm - Words per minute (Gross WPM recommended for fairness)
 * @param {number} accuracy - Accuracy percentage
 * @returns {object} Medal information with image, name, and congratulations text
 */
export const getMedalInfo = (wpm, accuracy) => {
    // Check for failure conditions - must meet EITHER wpm OR accuracy minimum
    if (wpm < MEDAL_THRESHOLDS.BRONZE.wpm && accuracy < MEDAL_THRESHOLDS.BRONZE.accuracy) {
        return {
            image: fail,
            name: "No Medal - Keep Practicing!",
            congratsText: "Better luck next time",
            isFail: true,
        };
    }

    // Check for each medal tier (highest to lowest) - EITHER condition awards medal
    if (wpm >= MEDAL_THRESHOLDS.ACE.wpm || accuracy >= MEDAL_THRESHOLDS.ACE.accuracy) {
        return {
            image: ace,
            name: "ACE Medal - You're a Typing Master!",
            congratsText: "Incredible Achievement",
            isFail: false,
        };
    }

    if (wpm >= MEDAL_THRESHOLDS.DIAMOND.wpm || accuracy >= MEDAL_THRESHOLDS.DIAMOND.accuracy) {
        return {
            image: diamond,
            name: "Diamond Medal - Outstanding Performance!",
            congratsText: "Excellent Work",
            isFail: false,
        };
    }

    if (wpm >= MEDAL_THRESHOLDS.PLATINUM.wpm || accuracy >= MEDAL_THRESHOLDS.PLATINUM.accuracy) {
        return {
            image: platinum,
            name: "Platinum Medal - Great Job!",
            congratsText: "Fantastic Performance",
            isFail: false,
        };
    }

    if (wpm >= MEDAL_THRESHOLDS.GOLD.wpm || accuracy >= MEDAL_THRESHOLDS.GOLD.accuracy) {
        return {
            image: gold,
            name: "Gold Medal - Well Done!",
            congratsText: "Great Achievement",
            isFail: false,
        };
    }

    if (wpm >= MEDAL_THRESHOLDS.SILVER.wpm || accuracy >= MEDAL_THRESHOLDS.SILVER.accuracy) {
        return {
            image: silver,
            name: "Silver Medal - Good Work!",
            congratsText: "Nice Job",
            isFail: false,
        };
    }

    // Bronze medal (minimum requirements already checked)
    return {
        image: bronze,
        name: "Bronze Medal - Keep Improving!",
        congratsText: "Good Start",
        isFail: false,
    };
};