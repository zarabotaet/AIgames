import React, { useRef } from "react";
import { useStore } from "effector-react";
import {
  $score,
  $isGameRunning,
  scoreIncremented,
  gameStarted,
  gameEnded,
  scoreReset,
} from "@store/gameStore";
import { useGameCanvas } from "@hooks/useGameCanvas";

interface Point {
  x: number;
  y: number;
}

interface GameCanvasProps {
  onBack?: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const score = useStore($score);
  const isGameRunning = useStore($isGameRunning);
  const positionRef = useRef<Point>({ x: 400, y: 300 });

  const gameLoop = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => {
    // Clear canvas
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player (simple circle)
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(positionRef.current.x, positionRef.current.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw score text
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 20, 40);

    if (!isGameRunning) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Click Start to Play", canvas.width / 2, canvas.height / 2);
    }
  };

  useGameCanvas(canvasRef, gameLoop);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isGameRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked on player
    const distance = Math.sqrt(
      Math.pow(clickX - positionRef.current.x, 2) +
        Math.pow(clickY - positionRef.current.y, 2),
    );

    if (distance < 20) {
      scoreIncremented(10);
      // Random new position
      positionRef.current = {
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
      };
    }
  };

  const handleStart = () => {
    gameStarted();
    positionRef.current = { x: 400, y: 300 };
    scoreReset();
  };

  const handleEnd = () => {
    gameEnded();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition"
        >
          ← Back to Menu
        </button>
      )}

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-4">🎯 Click Master</h1>
        <p className="text-gray-300 text-lg">
          Click the blue circle to score points!
        </p>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        className="border-4 border-blue-500 rounded-lg shadow-lg cursor-pointer mb-6"
      />

      <div className="flex gap-4">
        <button
          onClick={handleStart}
          disabled={isGameRunning}
          className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
        >
          Start Game
        </button>
        <button
          onClick={handleEnd}
          disabled={!isGameRunning}
          className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition"
        >
          End Game
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-300 text-xl">Final Score: {score}</p>
      </div>
    </div>
  );
};

export default GameCanvas;
