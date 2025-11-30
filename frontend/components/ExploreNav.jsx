"use client";

import React from "react";
import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react"; // Import useWallet

export default function ExploreNav() {
  const { connected } = useWallet(); // Get connected status

  return (
    <>
      {connected ? (
        <Link href="/explore" passHref>
          <button className="px-6 py-3 rounded-lg font-semibold bg-[#ffd54a] text-black hover:bg-[#ffb86b] shadow-md transition-colors">
            Explore Games
          </button>
        </Link>
      ) : (
        <button
          onClick={() => alert("Please connect your wallet to explore games.")}
          className="px-6 py-3 rounded-lg font-semibold bg-gray-500 text-white cursor-not-allowed shadow-md"
          disabled
        >
          Explore Games
        </button>
      )}
    </>
  );
}
