import { createStore, createEvent } from "effector";

// Events
export const scoreIncremented = createEvent<number>();
export const scoreReset = createEvent();
export const gameStarted = createEvent();
export const gameEnded = createEvent();

// Stores
export const $score = createStore(0)
  .on(scoreIncremented, (current, amount) => current + amount)
  .on(scoreReset, () => 0);

export const $isGameRunning = createStore(false)
  .on(gameStarted, () => true)
  .on(gameEnded, () => false);

export const $gameState = createStore({
  score: 0,
  isRunning: false,
})
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
