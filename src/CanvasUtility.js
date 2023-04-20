export const CanvasUtility = {
    getAnimatedValue: (initial, final, duration, timestamp) => {
        const percent = CanvasUtility.getAnimationPercent(duration, timestamp);

        if (percent >= 1 || initial === final) return final;

        const diff = final - initial;

        return initial + (diff * percent);
    },
    drawCanvas: (context) => {
        const height = context.canvas.clientHeight;
        const width = context.canvas.clientWidth;

        context.canvas.height = height;
        context.canvas.width = width;
    },
    getAnimationPercent: (duration, timestamp) => {
        if (timestamp === null) return 1;

        const now = new Date().getTime();
        const diff = now - timestamp;

        return diff / duration;
    },
};
export const getAnimatedValue = CanvasUtility.getAnimatedValue;