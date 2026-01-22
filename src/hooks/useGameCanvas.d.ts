import { RefObject } from "react";
export declare const useGameCanvas: (canvasRef: RefObject<HTMLCanvasElement>, gameLoop: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void) => void;
export declare const useMousePosition: (canvasRef: RefObject<HTMLCanvasElement>) => {
    x: number;
    y: number;
} | null;
//# sourceMappingURL=useGameCanvas.d.ts.map