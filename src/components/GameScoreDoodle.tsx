import React from 'react';
import { useStore } from 'effector-react';
import { $doodleJumpState } from '../store/doodleJumpStore';

export const GameScore: React.FC = () => {
  const state = useStore($doodleJumpState);

  return (
    <div className="absolute top-4 left-4 z-10 text-white font-bold">
      <div className="text-2xl mb-2">📏 Высота: {Math.floor(state.height)}</div>
      <div className="text-xl mb-2">⭐ Счет: {state.score}</div>
      <div className="text-lg text-yellow-400">🏆 Рекорд: {state.bestScore}</div>
    </div>
  );
};
