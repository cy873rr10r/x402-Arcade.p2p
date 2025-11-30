import React from "react";
import Head from "next/head";
import { useWallet } from "@aptos-labs/wallet-adapter-react"; // Import useWallet

export default function Create() {
  const { connected } = useWallet(); // Get connected status

  return (
    <>
      <Head><title>Create — x402 Arcade</title></Head>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {connected ? (
            <>
              <h1 className="text-3xl font-bold">Creator Portal</h1>
              <p className="mt-4 text-white/70">This is the creator area — build arenas, set entry fee, and view treasury balance.</p>
            </>
          ) : (
            <h1 className="text-3xl font-bold text-white/70">Please connect your wallet to create games.</h1>
          )}
        </div>
      </div>
    </>
  );
}
