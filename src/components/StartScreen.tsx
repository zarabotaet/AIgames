import React, { useState } from "react";
import { useGameNavigation } from "@hooks/useGameNavigation";

const StartScreen: React.FC = () => {
  const { goToGame } = useGameNavigation();
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [proposalText, setProposalText] = useState("");

  const handleSendProposal = () => {
    if (proposalText.trim()) {
      const message = `Game Proposal: ${proposalText}`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://t.me/zarabotaet?text=${encodedMessage}`, "_blank");
      setProposalText("");
      setShowProposalDialog(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
          Games for Mike and Margo
        </h1>
        <p className="text-xl text-gray-300">
          Browser-based games created by AI for Mike and Margo
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
        {/* Sort Colors Game */}
        <div
          className="relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer shadow-lg"
          onClick={() => goToGame("sort-colors")}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600" />

          {/* Content */}
          <div className="relative p-6 h-48 flex flex-col justify-center items-center text-center">
            <div className="text-5xl mb-4">🎨</div>
            <h2 className="text-3xl font-bold text-white mb-2">Sort Colors</h2>
            <p className="text-gray-100 text-sm">
              Sort colors into matching flasks
            </p>
          </div>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
        </div>

        {/* 2048 Game */}
        <div
          className="relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer shadow-lg"
          onClick={() => goToGame("game-2048")}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-600" />

          {/* Content */}
          <div className="relative p-6 h-48 flex flex-col justify-center items-center text-center">
            <div className="text-5xl mb-4">🔢</div>
            <h2 className="text-3xl font-bold text-white mb-2">2048</h2>
            <p className="text-gray-100 text-sm">Merge tiles to reach 2048</p>
          </div>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
        </div>

        {/* Propose Your Game */}
        <div
          className="relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer shadow-lg"
          onClick={() => setShowProposalDialog(true)}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-600" />

          {/* Content */}
          <div className="relative p-6 h-48 flex flex-col justify-center items-center text-center">
            <div className="text-5xl mb-4">💡</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Propose Your Game
            </h2>
            <p className="text-gray-100 text-sm">
              Share your ideas for future games
            </p>
          </div>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
        </div>
      </div>

      {/* Proposal Dialog */}
      {showProposalDialog && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setShowProposalDialog(false)}
        >
          <div
            className="bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Propose Your Game Idea
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Tell us what game you'd like to see next!
            </p>
            <textarea
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              placeholder="Describe your game idea..."
              className="w-full h-32 p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSendProposal}
                disabled={!proposalText.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
              >
                Send to Mike Wazowski
              </button>
              <button
                onClick={() => {
                  setShowProposalDialog(false);
                  setProposalText("");
                }}
                className="px-4 py-2 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-gray-400 text-sm">
        <p>Created with ❤️ by AI | More games coming soon</p>
      </div>
    </div>
  );
};

export default StartScreen;
