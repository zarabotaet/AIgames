// Типы для игры Doodle Jump

export interface Vector2 {
  x: number;
  y: number;
}

export interface Player extends Vector2 {
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
}

export interface Platform extends Vector2 {
  width: number;
  height: number;
  type: 'normal' | 'moving' | 'breakable';
}

export interface Enemy extends Vector2 {
  width: number;
  height: number;
  velocityX: number;
}

export interface Bullet extends Vector2 {
  width: number;
  height: number;
  velocityY: number;
}

export interface PowerUp extends Vector2 {
  width: number;
  height: number;
  type: 'shield' | 'rocket' | 'spring';
}

export interface GameState {
  player: Player;
  platforms: Platform[];
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  camera: number; // Y координата камеры
  score: number;
  height: number;
  maxHeight: number; // Максимальная достигнутая высота
  gameOver: boolean;
  isPaused: boolean;
  bestScore: number;
  shield: boolean;
  shieldDuration: number;
}
