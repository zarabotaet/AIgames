import { useCallback } from "react";
import { gameSelected, backToMenu } from "@store/gameStore";
import type { GameType } from "@store/gameStore";

export interface UseGameNavigationReturn {
  goToGame: (game: GameType) => void;
  goToMenu: () => void;
}

export const useGameNavigation = (): UseGameNavigationReturn => {
  const goToGame = useCallback((game: GameType) => {
    gameSelected(game);
  }, []);

  const goToMenu = useCallback(() => {
    backToMenu();
  }, []);

  return { goToGame, goToMenu };
};
