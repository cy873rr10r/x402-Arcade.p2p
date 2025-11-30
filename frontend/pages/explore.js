"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import clsx from "clsx";
import WalletConnect from "../components/WalletConnect";
import Player from "lottie-react";
import { useRouter } from "next/router"; // Import useRouter
import { useWallet } from "@aptos-labs/wallet-adapter-react"; // Import useWallet
import EditGameDialog from "../components/EditGameDialog"; // Import EditGameDialog

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allGames, setAllGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter(); // Initialize useRouter
  const { account } = useWallet(); // Destructure account from useWallet

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [gameToEdit, setGameToEdit] = useState(null);

  useEffect(() => {
    // Simulate fetching all games from an API
    const fetchGames = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call delay

      const userAddress = account?.address?.toString();

      const games = [
        {
          id: "1",
          gameName: "Taboo the AI",
          arcadeAddress: "0x123...abc",
          creatorUsername: "AptosGamer",
          timesPlayed: 150,
        },
        {
          id: "2",
          gameName: "Quiz Master",
          arcadeAddress: "0x456...def",
          creatorUsername: "CryptoDev",
          timesPlayed: 80,
        },
        {
          id: "3",
          gameName: "Memory Challenge",
          arcadeAddress: "0x789...ghi",
          creatorUsername: "BrainyPlayer",
          timesPlayed: 210,
        },
        {
          id: "4",
          gameName: "Word Scramble",
          arcadeAddress: "0xabc...jkl",
          creatorUsername: "WordSmith",
          timesPlayed: 55,
        },
      ];
      setAllGames(games);
      setFilteredGames(games);
      setIsLoading(false);
    };
    fetchGames();
  }, []); // Remove account from dependency array

  useEffect(() => {
    console.log("filteredGames useEffect triggered. allGames changed.", allGames);
    const results = allGames.filter(
      (game) =>
        game.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.creatorUsername.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGames(results);
  }, [searchQuery, allGames]);

  const handleEditClick = (game) => {
    setGameToEdit(game);
    setShowEditDialog(true);
  };

  const handleSaveGame = (id, newGameName, newArcadeAddress, newCreatorAddress, newCreatorName) => {
    console.log("handleSaveGame called for ID:", id);
    console.log("New values:", { newGameName, newArcadeAddress, newCreatorAddress, newCreatorName });

    setAllGames(prevGames => {
      console.log("Previous games state:", prevGames);
      const updatedGames = prevGames.map(game => {
        if (game.id === id) {
          const updatedGame = { ...game, gameName: newGameName, arcadeAddress: newArcadeAddress, creatorUsername: newCreatorName };
          console.log(`Updating game ${id}:`, updatedGame);
          return updatedGame;
        }
        return game;
      });
      console.log("Updated games state (after map):", updatedGames);
      return updatedGames;
    });
    // Close the dialog after attempting to save
    setShowEditDialog(false);
  };

  return (
    <>
      <Head>
        <title>x402 Arcade — Explore Games</title>
        <meta name="description" content="Explore all available games on x402 Arcade." />
      </Head>

      <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 to-purple-800 p-6">
        <Player
          src="/lottie-game.json"
          loop
          autoplay
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        {/* Wallet Connect Button */}
        <div className="absolute top-6 right-6 z-50">
          <WalletConnect />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto pt-20">
          <h1 className="text-4xl font-bold text-center text-[#ffd54a] mb-12">Explore All Games</h1>

          <div className="w-full flex gap-4 mb-8">
            <input
              type="text"
              placeholder="Search by creator username or game name..."
              className="flex-grow px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#ffd54a]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <motion.button
              onClick={() => router.push("/create")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-lg font-semibold bg-[#ffd54a] text-black hover:bg-[#ffb86b] shadow-md transition-colors"
              title="Create New Game"
            >
              +
            </motion.button>
          </div>

          {isLoading ? (
            <p className="text-center text-white/70 text-lg">Loading games...</p>
          ) : filteredGames.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredGames.map((game) => (
                <div key={game.id} className="p-6 bg-panel border border-white/6 rounded-lg shadow-xl">
                  <h3 className="text-xl font-bold text-[#ffd54a]">{game.gameName}</h3>
                  <p className="text-white/70 text-sm mt-2">Arcade Address: <span className="font-mono text-purple-300">{game.arcadeAddress}</span></p>
                  <p className="text-white/70 text-sm">Creator: <span className="text-blue-300">@{game.creatorUsername}</span></p>
                  <div className="flex items-center mt-4 space-x-2">
                    <button
                      onClick={() => {
                        if (account?.address) {
                          router.push(`/play-game-start?id=${game.id}&arcadeAddress=${game.arcadeAddress}`);
                        } else {
                          alert("Please connect your wallet to play games.");
                        }
                      }}
                      className="px-4 py-2 rounded-lg font-semibold bg-[#ffd54a] text-black hover:bg-[#ffb86b] transition-colors"
                    >
                      Play Game
                    </button>
                    <span className="text-white/70 text-sm ml-2">Played: {game.timesPlayed}</span>
                    <motion.button
                      onClick={() => handleEditClick(game)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white shadow-md transition-colors"
                      title="Edit Game"
                    >
                      ✏️
                    </motion.button>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <p className="text-white/50 text-center text-lg">No games found for "{searchQuery}".</p>
          )}
        </div>
      </div>

      <EditGameDialog
        show={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        game={gameToEdit}
        onSave={handleSaveGame}
      />
    </>
  );
}
