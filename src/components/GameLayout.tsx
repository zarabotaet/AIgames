import React, { useEffect, useState } from "react";
import { useGameNavigation } from "@hooks/useGameNavigation";

interface GameLayoutProps {
  children: React.ReactNode;
  onNewGame: () => void;
  onConfig?: () => void;
  showConfigButton?: boolean;
  score?: number;
  bestScore?: number;
  onResetBestScore?: () => void;
  onUndo?: () => void;
  undoDisabled?: boolean;
}

export const GameLayout: React.FC<GameLayoutProps> = ({
  children,
  onNewGame,
  onConfig,
  showConfigButton = true,
  score,
  bestScore,
  onResetBestScore,
  onUndo,
  undoDisabled = false,
}) => {
  const { goToMenu } = useGameNavigation();
  const [bestResetArmed, setBestResetArmed] = useState(false);

  useEffect(() => {
    setBestResetArmed(false);
  }, [bestScore]);

  const handleBestScoreClick = () => {
    if (!onResetBestScore) return;

    if (bestResetArmed) {
      onResetBestScore();
      setBestResetArmed(false);
      return;
    }

    setBestResetArmed(true);
  };

  return (
    <div className="bg-slate-900 w-full h-full overflow-hidden flex flex-col items-center justify-center relative">
      {/* Top Left - Return to Menu */}
      <button
        onClick={() => goToMenu()}
        className="absolute top-4 left-4 px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition flex items-center justify-center hover:scale-110 z-20"
        title="Back to Menu"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="w-6 h-6 text-white"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Top Center - Score Display */}
      {(score !== undefined || bestScore !== undefined || !!onResetBestScore) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {score !== undefined && (
            <div className="bg-slate-700 px-6 py-3 rounded-lg text-center">
              <div className="text-gray-400 text-xs font-bold uppercase">
                Score
              </div>
              <div className="text-white text-2xl font-bold">{score}</div>
            </div>
          )}
          {(bestScore !== undefined || onResetBestScore) && (
            <button
              onClick={handleBestScoreClick}
              className={`bg-slate-700 px-6 py-3 rounded-lg text-center transition-all ${onResetBestScore ? "hover:bg-slate-600" : "cursor-default"} ${bestResetArmed ? "animate-best-reset scale-105" : ""}`}
              title={
                onResetBestScore
                  ? bestResetArmed
                    ? "Click again to reset best score"
                    : "Click to prepare best score reset"
                  : "Best score"
              }
              disabled={!onResetBestScore}
            >
              <div className="text-gray-400 text-xs font-bold uppercase flex items-center justify-center gap-1">
                {bestResetArmed ? "Reset" : "Best"}
                {bestResetArmed && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="w-3.5 h-3.5 text-amber-300"
                  >
                    <path d="M3 12a9 9 0 109-9" />
                    <path d="M3 4v8h8" />
                  </svg>
                )}
              </div>
              <div className="text-white text-2xl font-bold">
                {bestScore !== undefined ? bestScore : "—"}
              </div>
            </button>
          )}
        </div>
      )}

      {/* Top Right - Undo Button */}
      {onUndo && (
        <button
          onClick={onUndo}
          disabled={undoDisabled}
          className="absolute top-4 right-4 px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition flex items-center justify-center hover:scale-110 z-20 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo last move"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-6 h-6 text-white"
          >
            <path d="M9 14L4 9m0 0l5-5M4 9h10.5a5.5 5.5 0 015.5 5.5v0a5.5 5.5 0 01-5.5 5.5H13" />
          </svg>
        </button>
      )}

      {/* Game Content */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
        {children}
      </div>

      {/* Bottom Left - Config Button */}
      {showConfigButton && onConfig && (
        <button
          onClick={onConfig}
          className="absolute bottom-4 left-4 px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition flex items-center justify-center hover:scale-110 z-20"
          title="Game Settings"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-6 h-6 text-white"
          >
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      )}

      {/* Bottom Right - New Game Button */}
      <button
        onClick={onNewGame}
        className="absolute bottom-4 right-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg transition flex items-center justify-center hover:scale-110 z-20 shadow-lg"
        title="New Game"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="w-6 h-6 text-white"
        >
          <path d="M12 2v20M2 12h20" />
        </svg>
      </button>
    </div>
  );
};
