import React from "react";
import Head from "next/head";
export default function Play() {
  return (
    <>
      <Head><title>Play — x402 Arcade</title></Head>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Player Portal</h1>
          <p className="mt-4 text-white/70">This is the player area — wallet connect and matchmaking UI will be added here.</p>
        </div>
      </div>
    </>
  );
}
