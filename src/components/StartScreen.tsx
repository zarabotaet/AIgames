import React from "react";

interface Game {
  id: string;
  title: string;
  description: string;
  status: "available" | "coming-soon";
  icon: string;
}

interface StartScreenProps {
  onSelectGame: (game: "click-game") => void;
}

const games: Game[] = [
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

const StartScreen: React.FC<StartScreenProps> = ({ onSelectGame }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
          AI Games
        </h1>
        <p className="text-xl text-gray-300">
          Browser-based games created by AI for you and your wife
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
        {games.map((game) => (
          <div
            key={game.id}
            className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
              game.status === "available"
                ? "hover:scale-105 hover:shadow-2xl cursor-pointer shadow-lg"
                : "opacity-75 cursor-not-allowed"
            }`}
            onClick={() =>
              game.status === "available" &&
              game.id === "click-game" &&
              onSelectGame("click-game")
            }
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 ${
                game.status === "available"
                  ? "bg-gradient-to-br from-blue-600 to-purple-600"
                  : "bg-gradient-to-br from-gray-600 to-gray-700"
              }`}
            />

            {/* Content */}
            <div className="relative p-6 h-48 flex flex-col justify-between">
              <div>
                <div className="text-4xl mb-3">{game.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {game.title}
                </h2>
                <p className="text-gray-100 text-sm">{game.description}</p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                {game.status === "available" ? (
                  <span className="inline-block px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-full">
                    Play Now
                  </span>
                ) : (
                  <span className="inline-block px-4 py-2 bg-gray-800 text-gray-300 text-sm font-semibold rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>

            {/* Hover effect overlay */}
            {game.status === "available" && (
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-400 text-sm">
        <p>Created with ❤️ by AI | More games coming soon</p>
      </div>
    </div>
  );
};

export default StartScreen;
