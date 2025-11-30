"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function ExploreGames() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    // In a real application, you would fetch data from an API here.
    // For now, let's simulate some results.
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call delay
    setSearchResults([
      {
        id: "1",
        gameName: "Taboo the AI",
        arcadeAddress: "0x123...abc",
        creatorUsername: "AptosGamer",
      },
      {
        id: "2",
        gameName: "Quiz Master",
        arcadeAddress: "0x456...def",
        creatorUsername: "CryptoDev",
      },
    ]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-6 bg-panel border border-white/6 rounded-lg shadow-xl">
      <div className="w-full flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by creator username or game name..."
          className="flex-grow px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#ffd54a]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className={clsx(
            "px-6 py-3 rounded-lg font-semibold text-black shadow-md transition-all duration-300",
            isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-[#ffd54a] hover:bg-[#ffb86b]"
          )}
        >
          {isLoading ? "Searching..." : "Search Games"}
        </button>
      </div>

      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full space-y-4"
        >
          {searchResults.map((game) => (
            <div key={game.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold text-[#ffd54a]">{game.gameName}</h3>
              <p className="text-white/70 text-sm mt-1">Arcade Address: <span className="font-mono text-purple-300">{game.arcadeAddress}</span></p>
              <p className="text-white/70 text-sm">Creator: <span className="text-blue-300">@{game.creatorUsername}</span></p>
            </div>
          ))}
        </motion.div>
      )}

      {searchResults.length === 0 && !isLoading && searchQuery && (
        <p className="text-white/50">No games found for "{searchQuery}".</p>
      )}
    </div>
  );
}
