import { useStore } from "effector-react";
import GameCanvas from "@components/GameCanvas";
import StartScreen from "@components/StartScreen";
import SortColorsGame from "@components/SortColorsGame";
import Game2048 from "@components/Game2048";
import { $currentGame } from "@store/gameStore";

function App() {
  const currentGame = useStore($currentGame);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {currentGame === "menu" && <StartScreen />}
      {currentGame === "click-game" && <GameCanvas />}
      {currentGame === "sort-colors" && <SortColorsGame />}
      {currentGame === "game-2048" && <Game2048 />}
    </div>
  );
}

export default App;
