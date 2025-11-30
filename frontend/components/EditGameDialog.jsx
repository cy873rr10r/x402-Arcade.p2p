"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function EditGameDialog({ show, onClose, game, onSave }) {
  const { account } = useWallet();
  const [editedGameName, setEditedGameName] = useState(game?.gameName || "");
  const [editedArcadeAddress, setEditedArcadeAddress] = useState(game?.arcadeAddress || "");
  const [editedCreatorAddress, setEditedCreatorAddress] = useState(account?.address?.toString() || game?.creatorUsername || "");
  const [editedCreatorName, setEditedCreatorName] = useState(game?.creatorUsername || ""); // New state for creator name

  useEffect(() => {
    if (game) {
      setEditedGameName(game.gameName);
      setEditedArcadeAddress(game.arcadeAddress);
      // Prioritize connected account's address for editing, otherwise use game's creator
      setEditedCreatorAddress(account?.address?.toString() || game.creatorUsername);
      setEditedCreatorName(game.creatorUsername); // Initialize creator name
    }
  }, [game, account]); // Add account to dependency array

  const handleSave = () => {
    if (!account?.address) {
      alert("Please connect your wallet to save changes.");
      return;
    }
    // Pass the new creator name as well
    onSave(game.id, editedGameName, editedArcadeAddress, editedCreatorAddress, editedCreatorName);
    onClose();
  };

  if (!show || !game) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-panel border border-white/6 rounded-lg shadow-xl p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-center text-[#ffd54a] mb-6">Edit Game: {game.gameName}</h2>

            {/* Creator's Wallet Address (Editable) */}
            <div className="mb-4">
              <label htmlFor="creatorAddress" className="block text-white/70 text-sm font-semibold mb-2">Creator's Wallet Address:</label>
              <input
                type="text"
                id="creatorAddress"
                value={editedCreatorAddress}
                onChange={(e) => setEditedCreatorAddress(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#ffd54a]"
              />
            </div>

            {/* Creator Name (Editable) */}
            <div className="mb-4">
              <label htmlFor="creatorName" className="block text-white/70 text-sm font-semibold mb-2">Creator Name:</label>
              <input
                type="text"
                id="creatorName"
                value={editedCreatorName}
                onChange={(e) => setEditedCreatorName(e.target.value)}
                placeholder="Enter Creator's Name"
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#ffd54a]"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="gameName" className="block text-white/70 text-sm font-semibold mb-2">Game Name:</label>
              <input
                type="text"
                id="gameName"
                value={editedGameName}
                onChange={(e) => setEditedGameName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#ffd54a]"
              />
            </div>

            {/* Game Arcade's Address (Editable) */}
            <div className="mb-6">
              <label htmlFor="arcadeAddress" className="block text-white/70 text-sm font-semibold mb-2">Game Arcade's Address:</label>
              <input
                type="text"
                id="arcadeAddress"
                value={editedArcadeAddress}
                onChange={(e) => setEditedArcadeAddress(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#ffd54a]"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white shadow-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg font-semibold bg-[#ffd54a] text-black hover:bg-[#ffb86b] shadow-md transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
