// components/WalletConnect.jsx
"use client";

import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link"; // Import Link for navigation

export default function WalletConnect() {
  const { connect, disconnect, connected, account, wallet } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    try {
      await connect("Petra");
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address.toString());
      // Optional: Add a visual cue that address is copied
      setShowDropdown(false);
    }
  };

  const handleLogout = () => {
    disconnect();
    setShowDropdown(false);
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        onClick={connected ? () => setShowDropdown(!showDropdown) : handleConnect}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className={
          "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
          + (connected ? " bg-[#ffd54a] text-black hover:bg-[#ffb86b]" : " bg-[#ffd54a] text-black hover:bg-[#ffb86b]")
        }
      >
        {connected && account?.address ? (
          <>
            {wallet?.icon && <Image src={wallet.icon} alt={wallet.name} width={20} height={20} />}
            {`${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}`}
          </>
        ) : (
          "Connect Petra Wallet"
        )}
      </motion.button>

      <AnimatePresence>
        {showDropdown && connected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-48 bg-panel border border-white/6 rounded-lg shadow-xl overflow-hidden z-50"
          >
            <button
              onClick={copyAddress}
              className="block w-full text-left px-4 py-2 text-white/80 hover:bg-white/10 transition-colors"
            >
              Copy Address
            </button>
            <Link href="/account" passHref>
              <button
                className="block w-full text-left px-4 py-2 text-white/80 hover:bg-white/10 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                Account
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-white/80 hover:bg-white/10 transition-colors"
            >
              Log Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
