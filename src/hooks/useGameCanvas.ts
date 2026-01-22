import { RefObject, useEffect, useState } from "react";

export const useGameCanvas = (
  canvasRef: RefObject<HTMLCanvasElement>,
  gameLoop: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      gameLoop(ctx, canvas);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [gameLoop]);
};

export const useMousePosition = (canvasRef: RefObject<HTMLCanvasElement>) => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
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
