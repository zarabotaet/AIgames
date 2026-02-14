import { createStore, createEvent } from "effector";

export type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  mergedFrom?: number[];
};

export interface Game2048State {
  grid: (number | null)[][];
  tiles: Tile[];
  score: number;
  bestScore: number;
  isGameOver: boolean;
  isGameWon: boolean;
  gameStarted: boolean;
  history: Array<{
    grid: (number | null)[][];
    tiles: Tile[];
    score: number;
  }>;
  startTime: number | null;
  undoCount: number;
}

// Events
export const game2048Started = createEvent();
export const game2048Reset = createEvent();
export const moveUp = createEvent();
export const moveDown = createEvent();
export const moveLeft = createEvent();
export const moveRight = createEvent();
export const undoMove = createEvent();

// LocalStorage helpers
const BEST_SCORE_KEY = "game2048_bestScore";

const loadBestScore = (): number => {
  if (typeof window === "undefined") return 0;
  try {
    const stored = localStorage.getItem(BEST_SCORE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

const saveBestScore = (score: number) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BEST_SCORE_KEY, String(score));
    } catch {
      // Silently fail
    }
  }
};

// Helper functions
let nextTileId = 1;

const createEmptyGrid = (): (number | null)[][] => {
  return Array(4)
    .fill(null)
    .map(() => Array(4).fill(null));
};

const getEmptyCells = (
  grid: (number | null)[][],
): { row: number; col: number }[] => {
  const empty: { row: number; col: number }[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (grid[row][col] === null) {
        empty.push({ row, col });
      }
    }
  }
  return empty;
};

const addRandomTile = (
  grid: (number | null)[][],
  tiles: Tile[],
): { grid: (number | null)[][]; tiles: Tile[] } => {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) return { grid, tiles };

  const { row, col } =
    emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newGrid = grid.map((r) => [...r]);
  newGrid[row][col] = value;

  const newTile: Tile = {
    id: nextTileId++,
    value,
    row,
    col,
    isNew: true,
  };

  return { grid: newGrid, tiles: [...tiles, newTile] };
};

const initializeGame = (): { grid: (number | null)[][]; tiles: Tile[] } => {
  nextTileId = 1;
  let grid = createEmptyGrid();
  let tiles: Tile[] = [];

  // Add two initial tiles
  const result1 = addRandomTile(grid, tiles);
  grid = result1.grid;
  tiles = result1.tiles;

  const result2 = addRandomTile(grid, tiles);
  grid = result2.grid;
  tiles = result2.tiles;

  return { grid, tiles };
};

const canMove = (grid: (number | null)[][]): boolean => {
  // Check if there are empty cells
  if (getEmptyCells(grid).length > 0) return true;

  // Check if adjacent cells can merge
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const current = grid[row][col];
      if (current === null) continue;

      // Check right
      if (col < 3 && grid[row][col + 1] === current) return true;
      // Check down
      if (row < 3 && grid[row + 1][col] === current) return true;
    }
  }

  return false;
};

const moveAndMerge = (
  grid: (number | null)[][],
  _tiles: Tile[],
  direction: "up" | "down" | "left" | "right",
): {
  grid: (number | null)[][];
  tiles: Tile[];
  scoreGained: number;
  moved: boolean;
} => {
  const newGrid = createEmptyGrid();
  let scoreGained = 0;
  let moved = false;
  const mergedPositions = new Set<string>(); // Track which positions had merges

  const processLine = (
    line: (number | null)[],
  ): { values: (number | null)[]; merges: Map<number, boolean> } => {
    const nonNull = line.filter((v) => v !== null) as number[];
    const merged: number[] = [];
    const mergeFlags = new Map<number, boolean>();
    let i = 0;
    let resultIndex = 0;

    while (i < nonNull.length) {
      if (i + 1 < nonNull.length && nonNull[i] === nonNull[i + 1]) {
        const value = nonNull[i] * 2;
        merged.push(value);
        mergeFlags.set(resultIndex, true);
        scoreGained += value;
        i += 2;
      } else {
        merged.push(nonNull[i]);
        mergeFlags.set(resultIndex, false);
        i++;
      }
      resultIndex++;
    }

    const values = [...merged, ...Array(4 - merged.length).fill(null)];
    return { values, merges: mergeFlags };
  };

  if (direction === "left" || direction === "right") {
    for (let row = 0; row < 4; row++) {
      let line = grid[row];
      const originalLine = [...line];
      if (direction === "right") {
        line = [...line].reverse();
      }

      const { values, merges } = processLine(line);
      const finalValues = direction === "right" ? values.reverse() : values;

      for (let col = 0; col < 4; col++) {
        const value = finalValues[col];
        newGrid[row][col] = value;

        if (originalLine[col] !== value) {
          moved = true;
        }

        if (
          value !== null &&
          merges.get(direction === "right" ? 3 - col : col)
        ) {
          mergedPositions.add(`${row},${col}`);
        }
      }
    }
  } else {
    for (let col = 0; col < 4; col++) {
      let line = grid.map((row) => row[col]);
      const originalLine = [...line];
      if (direction === "down") {
        line = [...line].reverse();
      }

      const { values, merges } = processLine(line);
      const finalValues = direction === "down" ? values.reverse() : values;

      for (let row = 0; row < 4; row++) {
        const value = finalValues[row];
        newGrid[row][col] = value;

        if (originalLine[row] !== value) {
          moved = true;
        }

        if (
          value !== null &&
          merges.get(direction === "down" ? 3 - row : row)
        ) {
          mergedPositions.add(`${row},${col}`);
        }
      }
    }
  }

  // Rebuild tiles array completely from new grid to avoid overlaps
  const newTiles: Tile[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const value = newGrid[row][col];
      if (value !== null) {
        newTiles.push({
          id: nextTileId++,
          value,
          row,
          col,
          isNew: mergedPositions.has(`${row},${col}`),
        });
      }
    }
  }

  // If any tiles merged, that's a change that should be counted as a move
  if (scoreGained > 0) {
    moved = true;
  }

  return { grid: newGrid, tiles: newTiles, scoreGained, moved };
};

// Store
const initialBestScore = loadBestScore();
const initialState = initializeGame();

export const $game2048 = createStore<Game2048State>({
  grid: initialState.grid,
  tiles: initialState.tiles,
  score: 0,
  bestScore: initialBestScore,
  isGameOver: false,
  isGameWon: false,
  gameStarted: false,
  history: [],
  startTime: null,
  undoCount: 0,
})
  .on(game2048Started, (state) => ({
    ...state,
    gameStarted: true,
    startTime: state.startTime || Date.now(),
  }))
  .on(game2048Reset, (state) => {
    const newState = initializeGame();
    return {
      ...newState,
      score: 0,
      bestScore: state.bestScore,
      isGameOver: false,
      isGameWon: false,
      gameStarted: true,
      history: [],
      startTime: Date.now(),
      undoCount: 0,
    };
  });

// Helper to handle move logic
const handleMove = (
  state: Game2048State,
  direction: "up" | "down" | "left" | "right",
): Game2048State => {
  if (state.isGameOver) return state;

  const result = moveAndMerge(state.grid, state.tiles, direction);

  if (!result.moved) return state;

  // Save current state to history before making the move
  const newHistory = [
    ...state.history,
    {
      grid: state.grid.map((row) => [...row]),
      tiles: state.tiles.map((tile) => ({ ...tile })),
      score: state.score,
    },
  ];

  // Add new tile
  const withNewTile = addRandomTile(result.grid, result.tiles);
  // Score is calculated based on elapsed time in seconds + undo penalties
  const elapsedSeconds = state.startTime
    ? Math.floor((Date.now() - state.startTime) / 1000)
    : 0;
  const newScore = elapsedSeconds + state.undoCount * 10;
  const newBestScore = Math.max(state.bestScore, newScore);

  if (newBestScore > state.bestScore) {
    saveBestScore(newBestScore);
  }

  const isGameWon =
    !state.isGameWon && withNewTile.tiles.some((t) => t.value === 2048);
  const isGameOver = !canMove(withNewTile.grid);

  return {
    ...state,
    grid: withNewTile.grid,
    tiles: withNewTile.tiles,
    score: newScore,
    bestScore: newBestScore,
    isGameWon,
    isGameOver,
    history: newHistory,
  };
};

$game2048
  .on(moveUp, (state) => handleMove(state, "up"))
  .on(moveDown, (state) => handleMove(state, "down"))
  .on(moveLeft, (state) => handleMove(state, "left"))
  .on(moveRight, (state) => handleMove(state, "right"))
  .on(undoMove, (state) => {
    if (state.history.length === 0) return state;

    const previousState = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);

    return {
      ...state,
      grid: previousState.grid.map((row) => [...row]),
      tiles: previousState.tiles.map((tile) => ({ ...tile })),
      score: previousState.score,
      history: newHistory,
      undoCount: state.undoCount + 1,
      // Reset game over state since we're undoing
      isGameOver: false,
    };
  });
