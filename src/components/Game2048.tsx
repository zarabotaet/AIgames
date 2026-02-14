import React, { useEffect, useRef, useState } from "react";
import { useStore } from "effector-react";
import {
  $game2048,
  game2048Started,
  game2048Reset,
  moveUp,
  moveDown,
  moveLeft,
  moveRight,
  undoMove,
} from "@store/game2048Store";
import { useGameNavigation } from "@hooks/useGameNavigation";
import { GameLayout } from "./GameLayout";

const Game2048: React.FC = () => {
  const gameState = useStore($game2048);
  const { goToMenu } = useGameNavigation();
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 400,
  );
  const [winAlertDismissed, setWinAlertDismissed] = useState(false);
  const [winContinued, setWinContinued] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  // Calculate real-time score based on elapsed time + undo penalties
  useEffect(() => {
    if (!gameState.startTime || !gameState.gameStarted) return;

    const updateScore = () => {
      const elapsedSeconds = Math.floor(
        (Date.now() - gameState.startTime!) / 1000,
      );
      const timeScore = elapsedSeconds + gameState.undoCount * 10;
      setDisplayScore(timeScore);
    };

    updateScore();
    const interval = setInterval(updateScore, 100); // Update 10x per second
    return () => clearInterval(interval);
  }, [gameState.startTime, gameState.gameStarted, gameState.undoCount]);

  // Auto-start game on mount
  useEffect(() => {
    if (!gameState.gameStarted) {
      game2048Started();
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          moveUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          moveDown();
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveLeft();
          break;
        case "ArrowRight":
          e.preventDefault();
          moveRight();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.isGameOver]);

  // Touch/swipe controls
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!boardRef.current?.contains(e.target as Node)) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gameState.isGameOver) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    const minSwipeDistance = 15; // Reduced for better mobile responsiveness
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Only register if movement is significant enough
    if (absDeltaX < minSwipeDistance && absDeltaY < minSwipeDistance) {
      touchStartRef.current = null;
      return;
    }

    // Determine direction based on which axis has more movement
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0) {
        moveRight();
      } else {
        moveLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        moveDown();
      } else {
        moveUp();
      }
    }

    touchStartRef.current = null;
  };

  const handleNewGame = () => {
    game2048Reset();
    setWinAlertDismissed(false);
    setWinContinued(false);
  };

  const handleContinuePlayingAfterWin = () => {
    setWinAlertDismissed(true);
    setWinContinued(true);
  };

  const isMobile = windowWidth < 768;
  const gridSize = isMobile ? Math.min(windowWidth - 40, 400) : 500;
  const cellSize = (gridSize - 60) / 4;
  const tileSize = cellSize - 8;

  const getTileColor = (value: number): string => {
    const colors: { [key: number]: string } = {
      2: "#eee4da",
      4: "#ede0c8",
      8: "#f2b179",
      16: "#f59563",
      32: "#f67c5f",
      64: "#f65e3b",
      128: "#edcf72",
      256: "#edcc61",
      512: "#edc850",
      1024: "#edc53f",
      2048: "#edc22e",
    };
    return colors[value] || "#3c3a32";
  };

  const getTileTextColor = (value: number): string => {
    return value <= 4 ? "#776e65" : "#f9f6f2";
  };

  const getTileFontSize = (value: number): number => {
    if (value < 100) return isMobile ? 40 : 55;
    if (value < 1000) return isMobile ? 35 : 45;
    return isMobile ? 28 : 35;
  };

  return (
    <GameLayout
      onNewGame={handleNewGame}
      showConfigButton={false}
      score={displayScore}
      bestScore={gameState.bestScore}
      onUndo={() => undoMove()}
      undoDisabled={gameState.history.length === 0 || winContinued}
    >
      <div
        className="flex flex-col items-center justify-center p-4 w-full h-full overflow-hidden"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "none" }}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-center w-full max-w-xl">
          <h1
            className={`font-bold text-white ${isMobile ? "text-4xl" : "text-5xl"}`}
          >
            2048
          </h1>
        </div>

      {/* Game Grid */}
      <div
        className="relative bg-slate-700 rounded-lg p-3 select-none"
        ref={boardRef}
        style={{
          width: `${gridSize}px`,
          height: `${gridSize}px`,
          touchAction: "none",
        }}
      >
        {/* Grid cells (background) */}
        <div className="absolute inset-3 grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-800 rounded-lg"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
            />
          ))}
        </div>

        {/* Tiles */}
        {gameState.tiles.map((tile) => (
          <div
            key={tile.id}
            className="absolute flex items-center justify-center font-bold rounded-lg transition-all duration-150 ease-in-out select-none"
            style={{
              left: `${12 + tile.col * (cellSize + 8) + (cellSize - tileSize) / 2}px`,
              top: `${12 + tile.row * (cellSize + 8) + (cellSize - tileSize) / 2}px`,
              width: `${tileSize}px`,
              height: `${tileSize}px`,
              backgroundColor: getTileColor(tile.value),
              color: getTileTextColor(tile.value),
              fontSize: `${getTileFontSize(tile.value)}px`,
              transform: tile.isNew ? "scale(0)" : "scale(1)",
              animation: tile.isNew
                ? "tile-appear 0.2s ease-out forwards"
                : "none",
            }}
          >
            {tile.value}
          </div>
        ))}

        {/* Game Over Overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
            <h2
              className={`font-bold text-white mb-4 ${isMobile ? "text-3xl" : "text-4xl"}`}
            >
              Game Over!
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Score: {displayScore}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleNewGame}
                className="px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700"
              >
                Try Again
              </button>
              <button
                onClick={() => goToMenu()}
                className="px-6 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600"
              >
                Menu
              </button>
            </div>
          </div>
        )}

        {/* Win Alert */}
        {gameState.isGameWon && !winAlertDismissed && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
            {/* Celebration confetti - only shown in alert */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
              viewBox={`0 0 ${gridSize} ${gridSize}`}
            >
              {/* Celebration particles */}
              {Array.from({ length: 100 }).map((_, i) => {
                const colors = [
                  "#FFD700",
                  "#FFA500",
                  "#FF6347",
                  "#32CD32",
                  "#00CED1",
                ];
                const centerX = gridSize / 2;
                const centerY = gridSize / 2;
                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + Math.random() * 200;
                const endX = centerX + Math.cos(angle) * distance;
                const endY = centerY + Math.sin(angle) * distance;

                const randomDelay = Math.random() * 0.2;
                const randomDuration = 1.2 + Math.random() * 0.8;
                const randomSize = 6 + Math.random() * 10;
                const randomColor =
                  colors[Math.floor(Math.random() * colors.length)];

                return (
                  <g key={i}>
                    <circle
                      cx={centerX}
                      cy={centerY}
                      r={randomSize}
                      fill={randomColor}
                      opacity="0"
                    >
                      <animate
                        attributeName="opacity"
                        from="1"
                        to="0"
                        dur={`${randomDuration}s`}
                        begin={`${randomDelay}s`}
                        fill="freeze"
                      />
                      <animate
                        attributeName="cx"
                        from={centerX}
                        to={endX}
                        dur={`${randomDuration}s`}
                        begin={`${randomDelay}s`}
                        fill="freeze"
                      />
                      <animate
                        attributeName="cy"
                        from={centerY}
                        to={endY}
                        dur={`${randomDuration}s`}
                        begin={`${randomDelay}s`}
                        fill="freeze"
                      />
                    </circle>
                  </g>
                );
              })}
            </svg>

            <div className="relative z-10 text-center">
              <h2
                className={`font-bold text-white mb-4 ${isMobile ? "text-3xl" : "text-4xl"}`}
              >
                🎉 You Reached 2048! 🎉
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Score: {displayScore}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleContinuePlayingAfterWin}
                  className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                >
                  Keep Playing
                </button>
                <button
                  onClick={handleNewGame}
                  className="px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700"
                >
                  New Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

        {/* Instructions */}
        <p className="mt-4 text-gray-400 text-center text-sm max-w-md">
          {isMobile
            ? "Swipe to move tiles. Merge tiles with the same number to reach 2048!"
            : "Use arrow keys to move tiles. Merge tiles with the same number to reach 2048!"}
        </p>

        <style>{`
          @keyframes tile-appear {
            from {
              transform: scale(0);
            }
            to {
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </GameLayout>
  );
};

export default Game2048;
