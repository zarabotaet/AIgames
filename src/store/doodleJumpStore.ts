import { createEvent, createStore, EventCallable } from 'effector';
import { GameState, Platform, Bullet } from '../types/doodleJump';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 800;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const GRAVITY = 0.4;
const JUMP_POWER = 12;
const PLATFORM_HEIGHT = 15;
const PLATFORM_WIDTH = 60;
const ENEMY_WIDTH = 35;
const ENEMY_HEIGHT = 35;
const BULLET_WIDTH = 8;
const BULLET_HEIGHT = 15;

// Генерируем начальные платформы
function generateInitialPlatforms(): Platform[] {
  const platforms: Platform[] = [];
  
  // Первая платформа точно под игроком
  platforms.push({
    x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2,
    y: CANVAS_HEIGHT - 120,
    width: PLATFORM_WIDTH,
    height: PLATFORM_HEIGHT,
    type: 'normal',
  });
  
  // Остальные платформы случайно
  for (let i = 1; i < 15; i++) {
    const type = Math.random() < 0.1 ? 'breakable' : Math.random() < 0.15 ? 'moving' : 'normal';
    platforms.push({
      x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
      y: CANVAS_HEIGHT - i * 80 - 100,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      type,
    });
  }
  return platforms;
}

const initialState: GameState = {
  player: {
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - 150,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    velocityX: 0,
    velocityY: 0,
    isJumping: true,
  },
  platforms: generateInitialPlatforms(),
  enemies: [],
  bullets: [],
  powerUps: [],
  camera: 0,
  score: 0,
  height: 0,
  maxHeight: 0,
  gameOver: false,
  isPaused: false,
  bestScore: parseInt(localStorage.getItem('doodleJumpBestScore') || '0'),
  shield: false,
  shieldDuration: 0,
};

// События
export const moveLeft = createEvent<void>();
export const moveRight = createEvent<void>();
export const stopMove = createEvent<void>();
export const powerJump = createEvent<void>();
export const shoot = createEvent<void>();
export const updateGame: EventCallable<void> = createEvent<void>();
export const gameOver = createEvent<void>();
export const resetGame = createEvent<void>();
export const doodleJumpBestScoreReset = createEvent<void>();

// Store
export const $doodleJumpState = createStore<GameState>(initialState);

// Обработчики событий
$doodleJumpState.on(moveLeft, (state) => ({
  ...state,
  player: { ...state.player, velocityX: -8 },
}));

$doodleJumpState.on(moveRight, (state) => ({
  ...state,
  player: { ...state.player, velocityX: 8 },
}));

$doodleJumpState.on(stopMove, (state) => ({
  ...state,
  player: { ...state.player, velocityX: 0 },
}));

$doodleJumpState.on(powerJump, (state) => {
  if (state.gameOver || state.isPaused) return state;
  
  return {
    ...state,
    player: {
      ...state.player,
      velocityY: -JUMP_POWER * 1.5,
      isJumping: true,
    },
  };
});

$doodleJumpState.on(shoot, (state) => {
  if (state.gameOver || state.isPaused) return state;
  
  const newBullet: Bullet = {
    x: state.player.x + state.player.width / 2 - BULLET_WIDTH / 2,
    y: state.player.y,
    width: BULLET_WIDTH,
    height: BULLET_HEIGHT,
    velocityY: -15,
  };

  return {
    ...state,
    bullets: [...state.bullets, newBullet],
  };
});

$doodleJumpState.on(updateGame, (state) => {
  if (state.gameOver || state.isPaused) return state;

  let newPlayer = { ...state.player };
  let newScore = state.score;
  let newShield = state.shield;
  let newShieldDuration = Math.max(0, state.shieldDuration - 1);

  // Обновляем щит
  if (newShieldDuration === 0) {
    newShield = false;
  }

  // Применяем гравитацию
  newPlayer.velocityY += GRAVITY;

  // Обновляем позицию
  newPlayer.x += newPlayer.velocityX;
  newPlayer.y += newPlayer.velocityY;

  // Обновляем камеру (нужно сделать это рано для фильтрации)
  let newCamera = state.camera;
  if (newPlayer.y < state.camera + CANVAS_HEIGHT * 0.4) {
    newCamera = newPlayer.y - CANVAS_HEIGHT * 0.4;
  }

  // Обновляем высоту
  const newHeight = Math.max(0, CANVAS_HEIGHT - state.camera - newPlayer.y);
  let newMaxHeight = state.maxHeight;
  
  if (newHeight > state.maxHeight) {
    const heightDifference = newHeight - state.maxHeight;
    // Множитель растет с высотой: каждые 500 пиксель +1 к множителю
    // На 0-499: 2 очка, на 500-999: 3 очка, на 1000+: 4 очка и т.д.
    const multiplier = 2 + Math.floor(state.maxHeight / 500);
    newScore = state.score + Math.floor(heightDifference * multiplier);
    newMaxHeight = newHeight;
  }

  // Оборачиваем персонажа по X
  if (newPlayer.x < -newPlayer.width) {
    newPlayer.x = CANVAS_WIDTH;
  }
  if (newPlayer.x > CANVAS_WIDTH) {
    newPlayer.x = -newPlayer.width;
  }

  // Проверяем столкновения с платформами
  let platforms = [...state.platforms];
  let newEnemies = [...state.enemies];

  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    if (
      newPlayer.velocityY > 0 &&
      newPlayer.y + newPlayer.height >= platform.y &&
      newPlayer.y + newPlayer.height <= platform.y + platform.height + 10 &&
      newPlayer.x + newPlayer.width > platform.x &&
      newPlayer.x < platform.x + platform.width
    ) {
      newPlayer.velocityY = -JUMP_POWER;
      newPlayer.isJumping = true;

      // Хрупкие платформы разрушаются
      if (platform.type === 'breakable') {
        platforms.splice(i, 1);
      }
      break;
    }
  }

  // Обновляем пули
  let newBullets = state.bullets
    .map((b) => ({ ...b, y: b.y + b.velocityY }))
    .filter((b) => b.y < newCamera + CANVAS_HEIGHT + 200); // Удаляем пули только если они вышли за экран вниз

  // Проверяем столкновения пуль с врагами
  newBullets = newBullets.filter((bullet) => {
    let hit = false;
    newEnemies = newEnemies.filter((enemy) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        hit = true;
        newScore += 100; // Бонус за уничтожение врага
        return false; // Удаляем врага
      }
      return true;
    });
    return !hit;
  });

  // Обновляем врагов
  newEnemies = newEnemies
    .map((e) => {
      let newE = { ...e, x: e.x + e.velocityX };
      // Отражаем врагов от стен
      if (newE.x < 0) {
        newE.x = 0;
        newE.velocityX = -newE.velocityX;
      }
      if (newE.x + newE.width > CANVAS_WIDTH) {
        newE.x = CANVAS_WIDTH - newE.width;
        newE.velocityX = -newE.velocityX;
      }
      return newE;
    })
    .filter((e) => e.y > newCamera - CANVAS_HEIGHT - 200 && e.y < newCamera + CANVAS_HEIGHT + 200);

  // Проверяем столкновения с врагами
  // Сначала проверяем прыжок сверху на врага (как мера на платформу)
  for (let i = 0; i < newEnemies.length; i++) {
    const enemy = newEnemies[i];
    if (
      newPlayer.velocityY > 0 &&
      newPlayer.y + newPlayer.height >= enemy.y &&
      newPlayer.y + newPlayer.height <= enemy.y + enemy.height + 10 &&
      newPlayer.x + newPlayer.width > enemy.x &&
      newPlayer.x < enemy.x + enemy.width
    ) {
      // Прыгнули на врага - он умирает
      newEnemies.splice(i, 1);
      newScore += 100; // Бонус за убийство врага прыжком
      newPlayer.velocityY = -JUMP_POWER; // Отскочить
      newPlayer.isJumping = true;
      break;
    }
  }

  // Проверяем обычные столкновения с врагами (когда коснулись сбоку)
  for (let enemy of newEnemies) {
    if (
      newPlayer.x < enemy.x + enemy.width &&
      newPlayer.x + newPlayer.width > enemy.x &&
      newPlayer.y < enemy.y + enemy.height &&
      newPlayer.y + newPlayer.height > enemy.y
    ) {
      if (newShield) {
        newShieldDuration = 0;
        newShield = false;
        // Враг удаляется при столкновении с щитом
        newEnemies = newEnemies.filter((e) => e !== enemy);
      } else {
        return { ...state, gameOver: true, bestScore: Math.max(state.bestScore, newScore) };
      }
    }
  }

  // Генерируем новые платформы и врагов
  const minPlatformY = newCamera - CANVAS_HEIGHT - 100;
  platforms = platforms.filter((p) => p.y > minPlatformY);

  let lastPlatformY = platforms.length > 0 ? Math.min(...platforms.map((p) => p.y)) : minPlatformY + 200;
  if (lastPlatformY > minPlatformY + 100) {
    for (let i = 0; i < 3; i++) {
      const type = Math.random() < 0.1 ? 'breakable' : Math.random() < 0.15 ? 'moving' : 'normal';
      platforms.push({
        x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
        y: lastPlatformY - 80 - Math.random() * 40,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
        type,
      });

      // Иногда спауним врага на платформе
      if (Math.random() < 0.3) {
        newEnemies.push({
          x: Math.random() * (CANVAS_WIDTH - ENEMY_WIDTH),
          y: lastPlatformY - 80 - Math.random() * 40 - ENEMY_HEIGHT - 10,
          width: ENEMY_WIDTH,
          height: ENEMY_HEIGHT,
          velocityX: (Math.random() < 0.5 ? -1 : 1) * 3,
        });
      }
    }
  }

  // Движущиеся платформы
  platforms = platforms.map((p) => {
    if (p.type === 'moving') {
      return {
        ...p,
        x: p.x + Math.sin((newCamera + p.y) / 50) * 2,
      };
    }
    return p;
  });

  // Проверяем game over
  if (newPlayer.y > newCamera + CANVAS_HEIGHT) {
    return { ...state, gameOver: true, bestScore: Math.max(state.bestScore, newScore) };
  }

  // Сохраняем лучший счет
  if (newScore > state.bestScore) {
    localStorage.setItem('doodleJumpBestScore', String(newScore));
  }

  return {
    ...state,
    player: newPlayer,
    platforms,
    enemies: newEnemies,
    bullets: newBullets,
    camera: newCamera,
    score: newScore,
    height: newHeight,
    maxHeight: newMaxHeight,
    shield: newShield,
    shieldDuration: newShieldDuration,
  };
});

$doodleJumpState.on(gameOver, (state) => ({
  ...state,
  gameOver: true,
  bestScore: Math.max(state.bestScore, state.score),
}));

$doodleJumpState.on(powerJump, (state) => {
  if (state.gameOver || state.isPaused) return state;
  
  return {
    ...state,
    player: {
      ...state.player,
      velocityY: -JUMP_POWER * 1.5, // Усиленный прыжок в 1.5 раза
      isJumping: true,
    },
  };
});

$doodleJumpState.on(resetGame, (state) => {
  const newInitialState = {
    ...initialState,
    platforms: generateInitialPlatforms(),
    bestScore: state.bestScore,
  };
  return newInitialState;
});

$doodleJumpState.on(doodleJumpBestScoreReset, (state) => {
  localStorage.setItem('doodleJumpBestScore', '0');
  return {
    ...state,
    bestScore: 0,
  };
});
