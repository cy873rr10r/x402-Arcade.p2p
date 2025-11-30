// components/Hero.jsx
import React from "react";
import { Player } from "@lottiefiles/react-lottie-player"; // we'll use lottie-react import alternative below
import { motion } from "framer-motion";

export default function Hero({ lottieJson }) {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-16">
      <motion.h1 initial={{ y: -20, opacity: 0}} animate={{ y: 0, opacity: 1}} transition={{ delay: 0.05 }} className="text-4xl md:text-6xl font-extrabold tracking-tight" style={{ fontFamily: "'Press Start 2P', monospace", color: "#ffd54a" }}>
        🎮 x402 Arcade
      </motion.h1>
      <motion.p initial={{ y: 10, opacity: 0}} animate={{ y: 0, opacity: 1}} transition={{ delay: 0.12 }} className="mt-6 max-w-2xl text-white/80">
      PvP • Player-to-Player • Win-to-Earn — Play or Create AI mini-games and win prizes on Aptos.
      </motion.p>

    </div>
  );
}
