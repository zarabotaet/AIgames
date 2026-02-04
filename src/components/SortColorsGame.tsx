import React, { useRef, useState, useEffect } from "react";
import { useStore } from "effector-react";
import {
  $colorGame,
  colorGameStarted,
  flaskSelected,
  colorGameReset,
  difficultySelected,
  bestScoreUpdated,
  type Difficulty,
} from "@store/colorGameStore";
import { backToMenu } from "@store/gameStore";
import { toggleFullscreen } from "@lib/utils";

const SortColorsGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameState = useStore($colorGame);
  const [showDifficultyButtons, setShowDifficultyButtons] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1400,
  );
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 900,
  );

  // Auto-start game on mount
  useEffect(() => {
    if (!gameState.gameStarted) {
      colorGameStarted();
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save best score when game is won
  useEffect(() => {
    if (gameState.isGameWon) {
      bestScoreUpdated({
        difficulty: gameState.difficulty,
        moves: gameState.moves,
      });
    }
  }, [gameState.isGameWon]);

  // Responsive dimensions based on viewport size and orientation
  const isMobile = windowWidth < 768;
  const isPortrait = windowHeight > windowWidth;

  // Calculate grid layout first
  const totalFlasks = gameState.flasks.length;
  const flasksPerRow = Math.ceil(totalFlasks / 2);
  const numRows = Math.ceil(totalFlasks / flasksPerRow);

  // Available space (accounting for UI elements)
  const topBottomMargin = isMobile ? 120 : 150; // Space for buttons and text
  const availableWidth = windowWidth;
  const availableHeight = windowHeight - topBottomMargin;

  // Dynamic sizing to fit all flasks
  const spacingBetweenFlasks = isPortrait ? 15 : 20;
  const maxFlaskWidth = Math.min(
    (availableWidth - (flasksPerRow - 1) * spacingBetweenFlasks) / flasksPerRow,
    isPortrait ? 70 : isMobile ? 60 : 80,
  );
  const flaskSpacing = maxFlaskWidth * (isPortrait ? 1.4 : isMobile ? 2 : 2.2);

  // Flask height based on orientation and available space
  const rowSpacing = isPortrait ? 30 : 40;
  const maxFlaskHeight = Math.min(
    ((availableHeight - (numRows - 1) * rowSpacing) / numRows) * 0.8,
    maxFlaskWidth * (isPortrait ? 3.5 : 2.5),
  );

  const flaskWidth = Math.floor(maxFlaskWidth);
  const flaskHeight = Math.floor(maxFlaskHeight);
  const rowHeight = flaskHeight * (isPortrait ? 1.2 : 1.3);

  const svgWidth = availableWidth;
  const svgHeight = availableHeight;

  // Center the grid
  const totalWidth = (flasksPerRow - 1) * flaskSpacing + flaskWidth;
  const totalHeight = (numRows - 1) * rowHeight + flaskHeight;
  const startX = (svgWidth - totalWidth) / 2;
  const startY = (svgHeight - totalHeight) / 2;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!gameState.gameStarted || gameState.isGameWon) return;

    const svg = e.currentTarget;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const clickXPixel = e.clientX - rect.left;
    const clickYPixel = e.clientY - rect.top;

    // Convert pixel coordinates to SVG viewBox coordinates
    const scaleX = svgWidth / rect.width;
    const scaleY = svgHeight / rect.height;
    const clickX = clickXPixel * scaleX;
    const clickY = clickYPixel * scaleY;

    gameState.flasks.forEach((flask) => {
      const row = Math.floor(flask.id / flasksPerRow);
      const col = flask.id % flasksPerRow;
      const x = startX + col * flaskSpacing;
      const y = startY + row * rowHeight;

      if (
        clickX >= x &&
        clickX <= x + flaskWidth &&
        clickY >= y &&
        clickY <= y + flaskHeight
      ) {
        flaskSelected(flask.id);
      }
    });
  };

  const handleNewGame = () => {
    colorGameReset();
    colorGameStarted();
  };

  const handleToggleDifficulty = () => {
    setShowDifficultyButtons(!showDifficultyButtons);
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    difficultySelected(difficulty);
    colorGameReset();
    colorGameStarted();
    setShowDifficultyButtons(false);
  };

  const handlePlayAgain = () => {
    colorGameReset();
    colorGameStarted();
  };

  const difficultyOptions: {
    level: Difficulty;
    label: string;
  }[] = [
    { level: "easy", label: "🟢 Easy" },
    { level: "normal", label: "🟡 Normal" },
    { level: "hard", label: "🔴 Hard" },
    { level: "expert", label: "⚫ Expert" },
  ];

  return (
    <div
      className="bg-slate-900 w-screen h-screen overflow-hidden p-0 flex items-center justify-center"
      ref={containerRef}
    >
      {/* SVG Game Board */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        onClick={handleSvgClick}
        className="cursor-pointer bg-slate-950"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* Draw flasks */}
        {gameState.flasks.map((flask) => {
          const row = Math.floor(flask.id / flasksPerRow);
          const col = flask.id % flasksPerRow;
          const x = startX + col * flaskSpacing;
          const y = startY + row * rowHeight;
          const isSelected = gameState.selectedFlask === flask.id;
          const colorHeight = flaskHeight / flask.maxCapacity;

          return (
            <g key={flask.id}>
              {/* Flask outline */}
              <rect
                x={x}
                y={y}
                width={flaskWidth}
                height={flaskHeight}
                fill="#1e293b"
                stroke="#ffffff"
                strokeWidth={2}
              />

              {/* Flask colors */}
              {flask.colors.map((color, idx) => {
                const isTopPiece = idx === flask.colors.length - 1;
                const pieceY = y + flaskHeight - (idx + 1) * colorHeight + 2;

                return (
                  <rect
                    key={idx}
                    x={x + 2}
                    y={pieceY}
                    width={flaskWidth - 4}
                    height={colorHeight - 2}
                    fill={color}
                  >
                    {isSelected && isTopPiece && (
                      <animateTransform
                        attributeName="transform"
                        attributeType="XML"
                        type="translate"
                        values="0 0; 0 -8; 0 0"
                        dur="0.6s"
                        repeatCount="indefinite"
                      />
                    )}
                  </rect>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Victory Overlay */}
      {gameState.isGameWon && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-lg border-2 border-emerald-400">
          {/* Confetti Animation */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
            viewBox="0 0 1400 900"
          >
            {Array.from({ length: 500 }).map((_, i) => {
              const colors = [
                "#FF6B6B",
                "#4ECDC4",
                "#45B7D1",
                "#FFA07A",
                "#98D8C8",
                "#F7DC6F",
                "#BB8FCE",
                "#85C1E2",
                "#F8B88B",
                "#52B788",
                "#FF006E",
                "#FFBE0B",
                "#3A86FF",
                "#FB5607",
              ];
              const randomColor = colors[i % colors.length];
              const randomX = Math.random() * 1400;
              const randomDelay = Math.random() * 0.1;
              const randomDuration = 1.2 + Math.random() * 0.8;
              const randomRotation = Math.random() * 720;
              const randomSwing = -100 + Math.random() * 200;
              const randomSize = 10 + Math.random() * 6;

              return (
                <g key={i}>
                  <rect
                    x={randomX}
                    y={-20}
                    width={randomSize}
                    height={randomSize}
                    fill={randomColor}
                    opacity="0.9"
                  >
                    <animate
                      attributeName="y"
                      from="-20"
                      to="920"
                      dur={`${randomDuration}s`}
                      begin={`${randomDelay}s`}
                      repeatCount="1"
                      fill="remove"
                    />
                    <animate
                      attributeName="x"
                      from={randomX}
                      to={randomX + randomSwing}
                      dur={`${randomDuration}s`}
                      begin={`${randomDelay}s`}
                      repeatCount="1"
                      fill="remove"
                    />
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      from={`0 ${randomX + randomSize / 2} ${-14}`}
                      to={`${randomRotation} ${randomX + randomSwing + randomSize / 2} ${900}`}
                      dur={`${randomDuration}s`}
                      begin={`${randomDelay}s`}
                      repeatCount="1"
                      fill="remove"
                      additive="sum"
                    />
                  </rect>
                </g>
              );
            })}
          </svg>

          <h2
            className={`font-bold text-white mb-2 ${isMobile ? "text-2xl" : "text-3xl"}`}
          >
            You Win!
          </h2>
          <p
            className={`text-gray-200 mb-4 ${isMobile ? "text-sm" : "text-lg"}`}
          >
            Moves: {gameState.moves}
            {gameState.bestScore[gameState.difficulty] &&
              gameState.bestScore[gameState.difficulty] !== gameState.moves && (
                <span className="ml-4">
                  Best: {gameState.bestScore[gameState.difficulty]}
                </span>
              )}
            {gameState.bestScore[gameState.difficulty] === gameState.moves && (
              <span className="ml-4 text-yellow-400">🎉 New Best!</span>
            )}
          </p>
          <div className={`flex gap-3 ${isMobile ? "flex-col" : "flex-row"}`}>
            <button
              onClick={handlePlayAgain}
              className={`${isMobile ? "px-4 py-2" : "px-5 py-3"} bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 ${isMobile ? "text-sm" : ""}`}
            >
              New Puzzle
            </button>
            <button
              onClick={() => backToMenu()}
              className={`${isMobile ? "px-4 py-2" : "px-5 py-3"} bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 ${isMobile ? "text-sm" : ""}`}
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Back Button - Top Left */}
      <button
        onClick={() => backToMenu()}
        className="absolute top-4 left-4 hover:scale-110 transition z-10 w-8 h-8 flex items-center justify-center"
        title="Back to Menu"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="w-full h-full text-white"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Fullscreen Button - Top Right (Desktop only) */}
      {!isMobile && (
        <button
          onClick={() =>
            containerRef.current && toggleFullscreen(containerRef.current)
          }
          className="absolute top-4 right-4 hover:scale-110 transition z-10 w-8 h-8 flex items-center justify-center"
          title="Toggle Fullscreen"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-full h-full text-white"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
      )}

      {/* Moves Counter - Top Center */}
      <div
        className={`absolute top-4 left-1/2 transform -translate-x-1/2 text-white font-bold ${isMobile ? "text-xs" : "text-lg"} z-10 text-center`}
      >
        <div>Moves: {gameState.moves}</div>
        {gameState.bestScore[gameState.difficulty] &&
          gameState.bestScore[gameState.difficulty] !== Infinity && (
            <div
              className={`${isMobile ? "text-xs" : "text-sm"} text-gray-300`}
            >
              Best: {gameState.bestScore[gameState.difficulty]}
            </div>
          )}
      </div>

      {/* Difficulty Buttons - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10">
        {!showDifficultyButtons ? (
          <button
            onClick={handleToggleDifficulty}
            className="hover:scale-110 transition w-8 h-8 flex items-center justify-center"
            title="Select Difficulty"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-full h-full text-white"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
              <circle cx="12" cy="5" r="1" />
            </svg>
          </button>
        ) : (
          <div className="flex flex-col gap-2 bg-slate-800 p-3 rounded-lg border border-blue-500">
            {difficultyOptions.map((option) => (
              <button
                key={option.level}
                onClick={() => handleDifficultySelect(option.level)}
                className={`px-3 py-2 ${isMobile ? "text-xs" : "text-sm"} font-bold rounded transition ${
                  gameState.difficulty === option.level
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              onClick={() => setShowDifficultyButtons(false)}
              className={`px-3 py-2 ${isMobile ? "text-xs" : "text-sm"} font-bold rounded bg-gray-700 text-white hover:bg-gray-600 transition`}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* New Game Button - Bottom Right */}
      <button
        onClick={handleNewGame}
        className="absolute bottom-4 right-4 hover:scale-110 transition z-10 w-8 h-8 flex items-center justify-center"
        title="New Game"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="w-full h-full text-white"
        >
          <path d="M1 4v6h6M23 20v-6h-6" />
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
        </svg>
      </button>
    </div>
  );
};

export default SortColorsGame;
