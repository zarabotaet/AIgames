import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import GameCanvas from "@components/GameCanvas";
import StartScreen from "@components/StartScreen";
function App() {
    const [currentGame, setCurrentGame] = useState("menu");
    const handleGameSelect = (game) => {
        setCurrentGame(game);
    };
    const handleBackToMenu = () => {
        setCurrentGame("menu");
    };
    return (_jsxs("div", { className: "w-full h-screen bg-gradient-to-b from-slate-900 to-slate-950", children: [currentGame === "menu" && (_jsx(StartScreen, { onSelectGame: handleGameSelect })), currentGame === "click-game" && _jsx(GameCanvas, { onBack: handleBackToMenu })] }));
}
export default App;
//# sourceMappingURL=App.js.map