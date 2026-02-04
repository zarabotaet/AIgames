import { createStore, createEvent } from "effector";

export type GameType = "menu" | "click-game" | "sort-colors";

// Navigation Events
export const gameSelected = createEvent<GameType>();
export const backToMenu = createEvent();

// Game Events
export const scoreIncremented = createEvent<number>();
export const scoreReset = createEvent();
export const gameStarted = createEvent();
export const gameEnded = createEvent();

// Navigation Store
export const $currentGame = createStore<GameType>("menu")
  .on(gameSelected, (_, game) => game)
  .on(backToMenu, () => "menu");

// Score Store
export const $score = createStore(0)
  .on(scoreIncremented, (current, amount) => current + amount)
  .on(scoreReset, () => 0)
  .on(backToMenu, () => 0); // Reset score when going back to menu

// Game Running Store
export const $isGameRunning = createStore(false)
  .on(gameStarted, () => true)
  .on(gameEnded, () => false)
  .on(backToMenu, () => false); // Stop game when going back to menu

// Combined Game State
export const $gameState = createStore({
  currentGame: "menu" as GameType,
  score: 0,
  isRunning: false,
})
  .on(gameSelected, (state, game) => ({
    ...state,
    currentGame: game,
  }))
  .on(backToMenu, (state) => ({
    ...state,
    currentGame: "menu",
    isRunning: false,
    score: 0,
  }))
  .on(scoreIncremented, (state, amount) => ({
    ...state,
    score: state.score + amount,
  }))
  .on(gameStarted, (state) => ({
    ...state,
    isRunning: true,
  }))
  .on(gameEnded, (state) => ({
    ...state,
    isRunning: false,
  }))
  .on(scoreReset, (state) => ({
    ...state,
    score: 0,
  }));
