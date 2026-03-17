import React, { useEffect, useRef } from 'react';
import { useStore } from 'effector-react';
import { $doodleJumpState, updateGame, resetGame, shoot, doodleJumpBestScoreReset } from '../store/doodleJumpStore';
import { ControlButtons } from './ControlButtons';
import { GameLayout } from './GameLayout';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 800;
const FPS = 60;

export const DoodleJump: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useStore($doodleJumpState);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      updateGame();
    }, 1000 / FPS);

    return () => clearInterval(interval);
  }, []);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем холст
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Рисуем звезды (фон)
    ctx.fillStyle = 'white';
    for (let i = 0; i < 20; i++) {
      const x = (i * 1234) % CANVAS_WIDTH;
      const y = ((i * 5678) % CANVAS_HEIGHT + state.camera) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 2, 2);
    }

    // Рисуем платформы
    ctx.fillStyle = '#4CAF50';
    state.platforms.forEach((platform) => {
      const screenY = platform.y - state.camera;
      if (screenY > -platform.height && screenY < CANVAS_HEIGHT) {
        // Цвет зависит от типа платформы
        if (platform.type === 'breakable') {
          ctx.fillStyle = '#FF6B6B'; // Красные - хрупкие
        } else if (platform.type === 'moving') {
          ctx.fillStyle = '#4169E1'; // Синие - движущиеся
        } else {
          ctx.fillStyle = '#4CAF50'; // Зелёные - обычные
        }
        
        ctx.fillRect(platform.x, screenY, platform.width, platform.height);
        
        // Обводка платформы
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, screenY, platform.width, platform.height);
      }
    });

    // Рисуем врагов
    state.enemies.forEach((enemy) => {
      const screenY = enemy.y - state.camera;
      if (screenY > -enemy.height && screenY < CANVAS_HEIGHT) {
        // Тело врага (красный)
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(enemy.x, screenY, enemy.width, enemy.height);
        
        // Глаза врага
        ctx.fillStyle = 'white';
        ctx.fillRect(enemy.x + 6, screenY + 5, 6, 6);
        ctx.fillRect(enemy.x + 23, screenY + 5, 6, 6);
        
        // Зрачки
        ctx.fillStyle = 'black';
        ctx.fillRect(enemy.x + 7, screenY + 6, 4, 4);
        ctx.fillRect(enemy.x + 24, screenY + 6, 4, 4);
        
        // Обводка
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x, screenY, enemy.width, enemy.height);
      }
    });

    // Рисуем пули
    ctx.fillStyle = '#FFD700';
    state.bullets.forEach((bullet) => {
      const screenY = bullet.y - state.camera;
      if (screenY > -bullet.height && screenY < CANVAS_HEIGHT) {
        ctx.fillRect(bullet.x, screenY, bullet.width, bullet.height);
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 1;
        ctx.strokeRect(bullet.x, screenY, bullet.width, bullet.height);
      }
    });

    // Рисуем персонажа
    const playerScreenY = state.player.y - state.camera;
    const centerX = state.player.x + state.player.width / 2;
    const centerY = playerScreenY + state.player.height / 2;
    
    // Щит если активен
    if (state.shield) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, state.player.width / 2 + 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Тело персонажа (жёлтое, как в оригинале)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, state.player.width / 2 - 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Обводка тела
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, state.player.width / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();

    // Глаза персонажа (большие белые)
    ctx.fillStyle = 'white';
    // Левый глаз
    ctx.beginPath();
    ctx.arc(centerX - 8, centerY - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    // Правый глаз
    ctx.beginPath();
    ctx.arc(centerX + 8, centerY - 6, 5, 0, Math.PI * 2);
    ctx.fill();

    // Зрачки (чёрные, большие)
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX - 8, centerY - 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 8, centerY - 6, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Улыбка (простая дуга)
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 2, 6, 0, Math.PI);
    ctx.stroke();
  }, [state]);

  return (
    <GameLayout
      score={state.score}
      bestScore={state.bestScore}
      onNewGame={resetGame}
      onResetBestScore={() => doodleJumpBestScoreReset()}
      showConfigButton={false}
      showNewGameButton={false}
    >
      <div className="relative flex flex-col items-center justify-start flex-1 w-full h-full">
        <div 
          className="relative flex-1 w-full flex items-center justify-center bg-sky-400"
          onClick={() => {
            if (!state.gameOver) {
              shoot();
            }
          }}
          onTouchStart={() => {
            if (!state.gameOver) {
              shoot();
            }
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full max-h-[calc(100vh-200px)] cursor-crosshair touch-none"
            style={{ 
              aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
              display: 'block',
              pointerEvents: 'none'
            }}
          />

          {/* Game Over Overlay */}
          {state.gameOver && (
            <div className="absolute inset-0 z-20 bg-black bg-opacity-80 flex flex-col items-center justify-center pointer-events-auto">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-6">GAME OVER</h1>
                <button
                  onClick={() => resetGame()}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg transition-all active:scale-95"
                >
                  NEW GAME
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full">
          <ControlButtons disabled={state.gameOver} />
        </div>
      </div>
    </GameLayout>
  );
};
