import React, { useRef, useEffect } from "react";
import { CanvasUtility } from "../CanvasUtility";

const MyCanvasComponent = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        CanvasUtility.drawCanvas(context);

        // Other canvas drawing code here...
    }, []);

    const getAnimatedValue = (initial, final, duration, timestamp) => {
        const percent = CanvasUtility.getAnimationPercent(duration, timestamp);

        if (percent >= 1 || initial === final) return final;

        const diff = final - initial;

        return initial + diff * percent;
    };

    const getAnimationPercent = (duration, timestamp) => {
        if (timestamp === null) return 1;

        const now = new Date().getTime();
        const diff = now - timestamp;

        return diff / duration;
    };

    return (
        <canvas
            ref={canvasRef}
            height={window.innerHeight}
            width={window.innerWidth}
        />
    );
};

export default MyCanvasComponent;
