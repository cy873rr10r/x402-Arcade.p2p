// components/WalletProvider.jsx
"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { AptosWalletAdapter } from "@manahippo/aptos-wallet-adapter";
import React from "react";

// List of wallets you want to support
const wallets = [new AptosWalletAdapter()];

export default function WalletProvider({ children }) {
  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      {children}
    </AptosWalletAdapterProvider>
  );
}
