import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const games = [
    {
        id: "click-game",
        title: "🎯 Click Master",
        description: "Test your clicking skills and reflexes",
        status: "available",
        icon: "⚡",
    },
    {
        id: "puzzle-game",
        title: "🧩 Puzzle Quest",
        description: "Solve mind-bending puzzles",
        status: "coming-soon",
        icon: "🧠",
    },
    {
        id: "memory-game",
        title: "🧠 Memory Match",
        description: "Challenge your memory with matching games",
        status: "coming-soon",
        icon: "💭",
    },
    {
        id: "racing-game",
        title: "🏎️ Speed Race",
        description: "Race against the clock",
        status: "coming-soon",
        icon: "💨",
    },
    {
        id: "adventure-game",
        title: "⚔️ Adventure Quest",
        description: "Epic adventure awaits",
        status: "coming-soon",
        icon: "🗺️",
    },
    {
        id: "strategy-game",
        title: "♟️ Strategy Master",
        description: "Test your strategic thinking",
        status: "coming-soon",
        icon: "🎲",
    },
];
const StartScreen = ({ onSelectGame }) => {
    return (_jsxs("div", { className: "min-h-screen w-full flex flex-col items-center justify-center p-4", children: [_jsxs("div", { className: "text-center mb-12 animate-fade-in", children: [_jsx("h1", { className: "text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4", children: "AI Games" }), _jsx("p", { className: "text-xl text-gray-300", children: "Browser-based games created by AI for you and your wife" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full", children: games.map((game) => (_jsxs("div", { className: `relative overflow-hidden rounded-lg transition-all duration-300 ${game.status === "available"
                        ? "hover:scale-105 hover:shadow-2xl cursor-pointer shadow-lg"
                        : "opacity-75 cursor-not-allowed"}`, onClick: () => game.status === "available" && game.id === "click-game" && onSelectGame("click-game"), children: [_jsx("div", { className: `absolute inset-0 ${game.status === "available"
                                ? "bg-gradient-to-br from-blue-600 to-purple-600"
                                : "bg-gradient-to-br from-gray-600 to-gray-700"}` }), _jsxs("div", { className: "relative p-6 h-48 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-4xl mb-3", children: game.icon }), _jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: game.title }), _jsx("p", { className: "text-gray-100 text-sm", children: game.description })] }), _jsx("div", { className: "flex items-center justify-between", children: game.status === "available" ? (_jsx("span", { className: "inline-block px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-full", children: "Play Now" })) : (_jsx("span", { className: "inline-block px-4 py-2 bg-gray-800 text-gray-300 text-sm font-semibold rounded-full", children: "Coming Soon" })) })] }), game.status === "available" && (_jsx("div", { className: "absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" }))] }, game.id))) }), _jsx("div", { className: "mt-12 text-center text-gray-400 text-sm", children: _jsx("p", { children: "Created with \u2764\uFE0F by AI | More games coming soon" }) })] }));
};
export default StartScreen;
//# sourceMappingURL=StartScreen.js.map