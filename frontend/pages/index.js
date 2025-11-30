"use client";

import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import PortalCard from "../components/PortalCard";
import Hero from "../components/Hero";
import WalletConnect from "../components/WalletConnect";
import InstructionDropdown from "../components/InstructionDropdown";
import ExploreGames from "../components/ExploreGames";
import Player from "lottie-react";
import ExploreNav from "../components/ExploreNav";
import { useRouter } from "next/router";
import { useWallet } from "@aptos-labs/wallet-adapter-react"; // Import useWallet

export default function Home() {
  const router = useRouter();
  const { connected } = useWallet(); // Get connected status

  return (
    <>
      <Head>
        <title>x402 Arcade — PvP Gaming</title>
        <meta
          name="description"
          content="PvP • Player-to-Player • Win-to-Earn — Play or Create AI mini-games and win prizes on Aptos."
        />
      </Head>

      {/* Hero / Background Animation */}
      <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 to-purple-800">
        <Player
          src="/lottie-game.json"
          loop
          autoplay
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        {/* Wallet Connect Button */}
        <div className="absolute top-6 right-6 z-50 flex items-center space-x-4">
          <ExploreNav />
          <WalletConnect />
        </div>

        {/* Hero Section */}
        <Hero />

        {/* Centered Portals + Instructions stacked */}
        <div className="mt-6 px-6 flex flex-col items-center gap-4">
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 md:max-w-4xl w-full">
            <PortalCard
              title="🎮 Play"
              description="Play with an opponent! Enter the creator's game's arcade address and get started."
              onClick={() => {
                if (connected) {
                  router.push("/explore");
                } else {
                  alert("Please connect your wallet to play games.");
                }
              }}
            />
            <PortalCard
              title="🛠 Create"
              description="Choose the in-built game (Taboo the AI) or create your own games and share the arcade's address with players to get started."
              onClick={() => {
                if (connected) {
                  router.push("/taboo-challenge"); // Navigate to the new Taboo Challenge page
                } else {
                  alert("Please connect your wallet to create games.");
                }
              }}
            />
          </div>

          {/* Instruction Dropdown centered under the two cards */}
          <InstructionDropdown />
        </div>

        {/* Platform Info / Features: 2 cards on first row, 1 centered below */}
        <div className="mt-16 md:mt-24 grid md:grid-cols-2 gap-8 px-6 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-gradient-to-br from-purple-700 to-purple-500 rounded-2xl shadow-lg text-white max-w-xl justify-self-center mx-auto"
          >
            <h3 className="text-xl font-bold mb-2">AI-Powered Games</h3>
            <p>Mini-games like Taboo and quizzes powered by AI for fun and challenge.</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-gradient-to-br from-purple-700 to-purple-500 rounded-2xl shadow-lg text-white"
          >
            <h3 className="text-xl font-bold mb-2">x402 Payments</h3>
            <p>Seamless Pay-to-Play using Aptos blockchain and x402 payment protocol.</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-gradient-to-br from-purple-700 to-purple-500 rounded-2xl shadow-lg text-white md:col-span-2 md:max-w-lg md:mx-auto md:justify-self-center"
          >
            <h3 className="text-xl font-bold mb-2">Win-to-Earn</h3>
            <p>Win PvP games and automatically receive rewards directly in your wallet.</p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
