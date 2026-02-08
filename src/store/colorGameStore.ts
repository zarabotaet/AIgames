import { createStore, createEvent } from "effector";

export type Difficulty = "easy" | "normal" | "hard" | "expert";

export interface Flask {
  id: number;
  colors: string[];
  maxCapacity: number;
}

export interface ColorGameState {
  flasks: Flask[];
  selectedFlask: number | null;
  score: number;
  moves: number;
  isGameOver: boolean;
  isGameWon: boolean;
  gameStarted: boolean;
  difficulty: Difficulty;
  bestScore: Record<Difficulty, number>;
  groupedMoves: boolean;
  history: { flasks: Flask[]; moves: number }[];
}

// Events
export const colorGameStarted = createEvent();
export const colorGameEnded = createEvent();
export const flaskSelected = createEvent<number>();
export const colorMoved = createEvent();
export const colorGameReset = createEvent();
export const scoredPoints = createEvent<number>();
export const difficultySelected = createEvent<Difficulty>();
export const groupedMovesSelected = createEvent<boolean>();
export const bestScoreUpdated = createEvent<{
  difficulty: Difficulty;
  moves: number;
}>();
export const undoColorMove = createEvent();

// LocalStorage helpers
const BEST_SCORE_KEY = "colorGame_bestScores";

const loadBestScores = (): Record<Difficulty, number> => {
  if (typeof window === "undefined")
    return {
      easy: Infinity,
      normal: Infinity,
      hard: Infinity,
      expert: Infinity,
    };
  try {
    const stored = localStorage.getItem(BEST_SCORE_KEY);
    return stored
      ? JSON.parse(stored)
      : { easy: Infinity, normal: Infinity, hard: Infinity, expert: Infinity };
  } catch {
    return {
      easy: Infinity,
      normal: Infinity,
      hard: Infinity,
      expert: Infinity,
    };
  }
};

const saveBestScores = (scores: Record<Difficulty, number>) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BEST_SCORE_KEY, JSON.stringify(scores));
    } catch {
      // Silently fail
    }
  }
};

const DIFFICULTY_KEY = "colorGame_difficulty";

const loadDifficulty = (): Difficulty => {
  if (typeof window === "undefined") return "normal";
  try {
    const stored = localStorage.getItem(DIFFICULTY_KEY);
    return stored && ["easy", "normal", "hard", "expert"].includes(stored)
      ? (stored as Difficulty)
      : "normal";
  } catch {
    return "normal";
  }
};

const saveDifficulty = (difficulty: Difficulty) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DIFFICULTY_KEY, difficulty);
    } catch {
      // Silently fail
    }
  }
};

const GROUPED_MOVES_KEY = "colorGame_groupedMoves";

const loadGroupedMoves = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(GROUPED_MOVES_KEY);
    return stored === "true";
  } catch {
    return false;
  }
};

const saveGroupedMoves = (enabled: boolean) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(GROUPED_MOVES_KEY, String(enabled));
    } catch {
      // Silently fail
    }
  }
};

// Color palette with many colors
const colorPalette = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B88B",
  "#85C1E2",
  "#52B788",
  "#FF006E",
  "#FFBE0B",
  "#3A86FF",
  "#FB5607",
];

// Win check: every flask must be either empty or completely full with one color
const isWinState = (flasks: Flask[]): boolean =>
  flasks.every((flask) => {
    if (flask.colors.length === 0) return true;
    // Must be full (at capacity) and all pieces must be the same color
    return (
      flask.colors.length === flask.maxCapacity &&
      flask.colors.every((c) => c === flask.colors[0])
    );
  });

// Get difficulty settings: defines how many flasks we have for each hardness
const getDifficultySettings = (difficulty: Difficulty) => {
  switch (difficulty) {
    case "easy":
      return { totalFlasks: 4 };
    case "normal":
      return { totalFlasks: 6 };
    case "hard":
      return { totalFlasks: 8 };
    case "expert":
      return { totalFlasks: 10 };
  }
};

// Initialize flasks with colors based on difficulty
// Rules:
// - amount_of_flasks depends on hardness (see getDifficultySettings)
// - each flask capacity = amount_of_flasks + 1
// - number of different colors = amount_of_flasks - 1
// - pieces per color = amount_of_flasks + 1
// - total pieces = (amount_of_flasks - 1) * (amount_of_flasks + 1)
const initializeFlasks = (difficulty: Difficulty = "normal"): Flask[] => {
  const { totalFlasks } = getDifficultySettings(difficulty);
  const colorCapacity = totalFlasks + 1;
  const numColors = Math.max(2, totalFlasks - 1);
  const piecesPerColor = totalFlasks + 1;
  const colors = colorPalette.slice(0, numColors);

  // Build the color pool with exactly piecesPerColor of each color
  const colorPool: string[] = [];
  for (let colorIndex = 0; colorIndex < numColors; colorIndex++) {
    for (let piece = 0; piece < piecesPerColor; piece++) {
      colorPool.push(colors[colorIndex]);
    }
  }

  // Shuffle the pool for randomness
  for (let i = colorPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colorPool[i], colorPool[j]] = [colorPool[j], colorPool[i]];
  }

  // Initialize empty flasks
  const flasks: Flask[] = [];
  for (let i = 0; i < totalFlasks; i++) {
    flasks.push({
      id: i,
      colors: [],
      maxCapacity: colorCapacity,
    });
  }

  // Distribute pieces evenly using round-robin
  let poolIndex = 0;
  let flaskIndex = 0;
  while (poolIndex < colorPool.length) {
    flasks[flaskIndex].colors.push(colorPool[poolIndex]);
    poolIndex++;
    flaskIndex = (flaskIndex + 1) % totalFlasks;
  }

  return flasks;
};

// Color Game Store
const initialBestScores = loadBestScores();
const initialDifficulty = loadDifficulty();
const initialGroupedMoves = loadGroupedMoves();

export const $colorGame = createStore<ColorGameState>({
  flasks: initializeFlasks(initialDifficulty),
  selectedFlask: null,
  score: 0,
  moves: 0,
  isGameOver: false,
  isGameWon: false,
  gameStarted: false,
  difficulty: initialDifficulty,
  bestScore: initialBestScores,
  groupedMoves: initialGroupedMoves,
  history: [],
})
  .on(difficultySelected, (state, difficulty) => {
    saveDifficulty(difficulty);
    return {
      ...state,
      difficulty,
      flasks: initializeFlasks(difficulty),
      history: [],
      moves: 0,
      selectedFlask: null,
      isGameWon: false,
    };
  })
  .on(groupedMovesSelected, (state, enabled) => {
    saveGroupedMoves(enabled);
    return {
      ...state,
      groupedMoves: enabled,
    };
  })
  .on(colorGameStarted, (state) => ({
    ...state,
    gameStarted: true,
    isGameOver: false,
    isGameWon: false,
  }))
  .on(flaskSelected, (state, targetId) => {
    const sourceId = state.selectedFlask;

    // First click: select source
    if (sourceId === null) {
      return { ...state, selectedFlask: targetId };
    }

    // Click same flask: deselect
    if (sourceId === targetId) {
      return { ...state, selectedFlask: null };
    }

    // Prepare mutable copies
    const flasks = state.flasks.map((f) => ({ ...f, colors: [...f.colors] }));
    const source = flasks.find((f) => f.id === sourceId);
    const target = flasks.find((f) => f.id === targetId);
    if (!source || !target) return state;

    // If no color to move or target is full, just switch selection
    if (
      source.colors.length === 0 ||
      target.colors.length >= target.maxCapacity
    ) {
      return { ...state, selectedFlask: targetId };
    }

    const movingColor = source.colors[source.colors.length - 1];
    if (!movingColor) return state;

    let moveCount = 1;
    if (state.groupedMoves) {
      moveCount = 0;
      for (let i = source.colors.length - 1; i >= 0; i--) {
        if (source.colors[i] === movingColor) {
          moveCount++;
        } else {
          break;
        }
      }
    }

    if (state.groupedMoves) {
      const hasSpace = target.colors.length + moveCount <= target.maxCapacity;
      if (!hasSpace) {
        return { ...state, selectedFlask: targetId };
      }
    }

    // Save current state to history before making the move
    const newHistory = [
      ...state.history,
      {
        flasks: state.flasks.map((f) => ({ ...f, colors: [...f.colors] })),
        moves: state.moves,
      },
    ];

    for (let i = 0; i < moveCount; i++) {
      const popped = source.colors.pop();
      if (!popped) break;
      target.colors.push(popped);
    }

    return {
      ...state,
      flasks,
      selectedFlask: null,
      moves: state.moves + 1,
      isGameWon: isWinState(flasks),
      history: newHistory,
    };
  })
  .on(colorMoved, (state) => ({
    ...state,
    moves: state.moves + 1,
  }))
  .on(scoredPoints, (state, points) => ({
    ...state,
    score: state.score + points,
  }))
  .on(colorGameEnded, (state) => ({
    ...state,
    isGameOver: true,
  }))
  .on(colorGameReset, (state) => ({
    flasks: initializeFlasks(state.difficulty),
    selectedFlask: null,
    score: 0,
    moves: 0,
    isGameOver: false,
    isGameWon: false,
    gameStarted: false,
    difficulty: state.difficulty,
    bestScore: state.bestScore,
    groupedMoves: state.groupedMoves,
    history: [],
  }))
  .on(undoColorMove, (state) => {
    if (state.history.length === 0) return state;
    
    const previousState = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);
    
    return {
      ...state,
      flasks: previousState.flasks.map((f) => ({ ...f, colors: [...f.colors] })),
      moves: previousState.moves,
      history: newHistory,
      selectedFlask: null,
      isGameWon: false,
    };
  })
  .on(bestScoreUpdated, (state, { difficulty, moves }) => {
    const updatedScores = { ...state.bestScore };
    if (moves < (updatedScores[difficulty] ?? Infinity)) {
      updatedScores[difficulty] = moves;
      saveBestScores(updatedScores);
    }
    return {
      ...state,
      bestScore: updatedScores,
    };
  });
