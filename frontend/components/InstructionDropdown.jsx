"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstructionDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto mt-4 text-center relative z-50">
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-3 rounded-lg font-semibold text-black bg-yellow-300 hover:bg-yellow-400 transition"
      >
        {isOpen ? "Hide Instructions ▲" : "Show Instructions ▼"}
      </button>

      {/* Dropdown content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-4 text-white text-lg space-y-4 text-left px-4"
          >
            <p>
              <strong>🎮 Play:</strong> Play with an opponent and enter the
              creator's game's arcade address to get started.
            </p>
            <p>
              <strong>🛠 Create:</strong> Choose the in-built game (Taboo the
              AI) or create your own games and share the arcade's address with
              players to get started.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
