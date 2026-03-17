import React from 'react';
import { moveLeft, moveRight, stopMove } from '../store/doodleJumpStore';

interface ControlButtonsProps {
  disabled?: boolean;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({ disabled = false }) => {
  const handleMouseDown = (direction: 'left' | 'right') => {
    if (disabled) return;
    if (direction === 'left') {
      moveLeft();
    } else {
      moveRight();
    }
  };

  const handleMouseUp = () => {
    if (disabled) return;
    stopMove();
  };

  const handleTouchStart = (direction: 'left' | 'right') => {
    if (disabled) return;
    if (direction === 'left') {
      moveLeft();
    } else {
      moveRight();
    }
  };

  const handleTouchEnd = () => {
    if (disabled) return;
    stopMove();
  };

  return (
    <div className="flex w-full h-24 bg-gradient-to-t from-black via-black to-transparent">
      {/* Левая кнопка - Влево */}
      <button
        onMouseDown={() => handleMouseDown('left')}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={() => handleTouchStart('left')}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center transition-all ${
          disabled ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100 active:scale-95 active:bg-white/20 cursor-pointer'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-12 h-12 text-blue-400"
        >
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      {/* Правая кнопка - Вправо */}
      <button
        onMouseDown={() => handleMouseDown('right')}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={() => handleTouchStart('right')}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center transition-all ${
          disabled ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100 active:scale-95 active:bg-white/20 cursor-pointer'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-12 h-12 text-blue-400"
        >
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    </div>
  );
};
