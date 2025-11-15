import { useState, useCallback } from 'react';

/**
 * Custom hook for managing crosshair display
 * @returns {object} Crosshair management functions
 */
export const useCrosshair = () => {
    const [isVisible, setIsVisible] = useState(true);

    const initializeCrosshair = useCallback(() => {
        const handleMouseMove = (e) => {
            const vertical = document.querySelector("#vertical");
            const horizontal = document.querySelector("#horizontal");

            if (vertical && horizontal) {
                vertical.style.transform = `translateX(${e.clientX}px)`;
                horizontal.style.transform = `translateY(${e.clientY}px)`;
            }
        };

        document.addEventListener("mousemove", handleMouseMove);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const showCrosshair = useCallback(() => {
        setIsVisible(true);
    }, []);

    const hideCrosshair = useCallback(() => {
        setIsVisible(false);
    }, []);

    return {
        isVisible,
        initializeCrosshair,
        showCrosshair,
        hideCrosshair,
    };
};