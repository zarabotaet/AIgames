import { describe, it, expect, beforeEach } from "vitest";
import {
  $score,
  $isGameRunning,
  scoreIncremented,
  scoreReset,
  gameStarted,
  gameEnded,
} from "./gameStore";

describe("Game Store", () => {
  beforeEach(() => {
    scoreReset();
  });

  it("should initialize with score 0", () => {
    expect($score.getState()).toBe(0);
  });

  it("should initialize with game not running", () => {
    expect($isGameRunning.getState()).toBe(false);
  });

  it("should increment score", () => {
    scoreIncremented(10);
    expect($score.getState()).toBe(10);

    scoreIncremented(5);
    expect($score.getState()).toBe(15);
  });

  it("should reset score", () => {
    scoreIncremented(50);
    scoreReset();
    expect($score.getState()).toBe(0);
  });

  it("should start and end game", () => {
    gameStarted();
    expect($isGameRunning.getState()).toBe(true);

    gameEnded();
    expect($isGameRunning.getState()).toBe(false);
  });
});
