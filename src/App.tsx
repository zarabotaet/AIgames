import { useState } from "react";
import GameCanvas from "@components/GameCanvas";
import StartScreen from "@components/StartScreen";

type GameType = "menu" | "click-game";

function App() {
  const [currentGame, setCurrentGame] = useState<GameType>("menu");

  const handleGameSelect = (game: GameType) => {
    setCurrentGame(game);
  };

  const handleBackToMenu = () => {
    setCurrentGame("menu");
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {currentGame === "menu" && (
        <StartScreen onSelectGame={handleGameSelect} />
      )}
      {currentGame === "click-game" && <GameCanvas onBack={handleBackToMenu} />}
    </div>
  );
}

export default App;
