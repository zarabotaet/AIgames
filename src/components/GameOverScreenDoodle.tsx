import React from 'react';
import { useStore } from 'effector-react';
import { $doodleJumpState, resetGame } from '../store/doodleJumpStore';

export const GameOverScreen: React.FC = () => {
  const state = useStore($doodleJumpState);

  return (
    <div className="absolute inset-0 z-20 bg-black bg-opacity-80 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-8">GAME OVER</h1>
        
        <div className="bg-white bg-opacity-10 rounded-lg p-8 mb-8 backdrop-blur-sm">
          <p className="text-3xl text-yellow-400 font-bold mb-4">Счет: {state.score}</p>
          <p className="text-2xl text-green-400 font-bold">Рекорд: {state.bestScore}</p>
        </div>

        <button
          onClick={() => resetGame()}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg transition-all active:scale-95"
        >
          🔄 Играть снова
        </button>
      </div>
    </div>
  );
};
