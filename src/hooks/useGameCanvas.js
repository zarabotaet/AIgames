import { useEffect, useState } from "react";
export const useGameCanvas = (canvasRef, gameLoop) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        let animationId;
        const animate = () => {
            gameLoop(ctx, canvas);
            animationId = requestAnimationFrame(animate);
        };
        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [gameLoop]);
};
export const useMousePosition = (canvasRef) => {
    const [mousePos, setMousePos] = useState(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        };
        canvas.addEventListener("mousemove", handleMouseMove);
        return () => canvas.removeEventListener("mousemove", handleMouseMove);
    }, []);
    return mousePos;
};
//# sourceMappingURL=useGameCanvas.js.map