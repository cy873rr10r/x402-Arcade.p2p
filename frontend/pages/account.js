"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Player from "lottie-react";
import { useRouter } from "next/router"; // Import useRouter

export default function AccountPage() {
  const { connected, account, network } = useWallet();
  const router = useRouter(); // Initialize useRouter
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
  const [transactions, setTransactions] = useState([]);
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (connected && account?.address && network?.url) {
      setIsLoading(true);
      setError(null);
      fetchAccountDetails(network.url);
    } else if (!connected) {
      setError("Wallet not connected.");
      setIsLoading(false);
    }
  }, [connected, account?.address, network?.url]);

  // Add delay between requests to avoid rate limiting
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchAccountDetails = async (fullNodeUrl) => {
    if (!account?.address || !fullNodeUrl) {
      return;
    }

    try {
      const address = account.address.toString();
      console.log("Fetching data for address:", address);

      // Fetch data with delays to avoid rate limiting
      const [transactionsData, coinsData] = await Promise.allSettled([
        fetchWithRetry(`${fullNodeUrl}/accounts/${address}/transactions?limit=10`),
        delay(500).then(() => fetchWithRetry(`${fullNodeUrl}/accounts/${address}/resources`))
      ]);

      // Handle transactions response
      if (transactionsData.status === 'fulfilled' && transactionsData.value) {
        const txs = transactionsData.value;
        console.log("Transactions data:", txs);
        
        const formattedTxs = txs.slice(0, 10).map(tx => {
          const timestamp = tx.timestamp_usecs 
            ? new Date(parseInt(tx.timestamp_usecs / 1000)).toLocaleString()
            : tx.timestamp 
            ? new Date(tx.timestamp).toLocaleString()
            : "N/A";

          let amount = "N/A";
          // Try to extract amount from different possible locations
          if (tx.payload?.type === "entry_function_payload" && tx.payload.arguments && tx.payload.arguments.length > 1) {
            const potentialAmount = tx.payload.arguments[1];
            if (typeof potentialAmount === 'string' && !isNaN(potentialAmount)) {
              amount = `${(parseInt(potentialAmount) / Math.pow(10, 8)).toFixed(4)} APT`;
            }
          }

          return {
            version: tx.version || "N/A",
            type: tx.type || "N/A",
            timestamp: timestamp,
            sender: tx.sender || "N/A",
            sentTo: tx.payload?.arguments?.[0] || "N/A",
            func: tx.payload?.function || tx.type || "N/A",
            amount: amount,
          };
        });
        setTransactions(formattedTxs);
      } else {
        console.warn("Failed to fetch transactions:", transactionsData.reason);
        setTransactions([]);
      }

      // Handle coins response
      if (coinsData.status === 'fulfilled' && coinsData.value) {
        const resources = coinsData.value;
        console.log("Resources data:", resources);
        
        const fetchedCoins = resources
          .filter(resource => resource.type && resource.type.includes("coin::CoinStore"))
          .map(resource => {
            const coinTypeMatch = resource.type.match(/<(.+)>/);
            const coinType = coinTypeMatch ? coinTypeMatch[1] : "Unknown";
            const balance = resource.data?.coin?.value || 0;
            const coinName = coinType.split("::").pop() || "Unknown Coin";
            
            return {
              name: coinName,
              assetType: coinType,
              asset: coinName,
              verified: true,
              amount: (parseInt(balance) / Math.pow(10, 8)).toFixed(4),
              usdValue: "N/A",
            };
          });

        // Always include APT coin
        if (!fetchedCoins.find(coin => coin.name === "APT")) {
          fetchedCoins.unshift({
            name: "APT",
            assetType: "0x1::aptos_coin::AptosCoin",
            asset: "APT",
            verified: true,
            amount: "0.0000",
            usdValue: "N/A",
          });
        }
        
        setCoins(fetchedCoins);
      } else {
        console.warn("Failed to fetch coins:", coinsData.reason);
        // Set default APT coin if fetch fails
        setCoins([{
          name: "APT",
          assetType: "0x1::aptos_coin::AptosCoin",
          asset: "APT",
          verified: true,
          amount: "0.0000",
          usdValue: "N/A",
        }]);
      }

    } catch (err) {
      console.error("Error fetching account details:", err);
      setError(`Failed to load account details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to fetch with retry logic
  const fetchWithRetry = async (url, retries = 3, backoff = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        
        if (response.status === 429) {
          // Rate limited - wait and retry
          const waitTime = backoff * Math.pow(2, i);
          console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}`);
          await delay(waitTime);
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (err) {
        console.warn(`Attempt ${i + 1} failed:`, err);
        if (i === retries - 1) throw err;
        await delay(backoff * Math.pow(2, i));
      }
    }
  };

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Function to truncate long text
  const truncateText = (text, startChars = 6, endChars = 4) => {
    if (!text || text === "N/A") return "N/A";
    if (text.length <= startChars + endChars) return text;
    return `${text.slice(0, startChars)}...${text.slice(-endChars)}`;
  };

  // Function to format asset type for display
  const formatAssetType = (assetType) => {
    if (!assetType || assetType === "N/A") return "N/A";
    const parts = assetType.split("::");
    if (parts.length < 3) return assetType;
    return `${truncateText(parts[0])}::${parts[1]}::${parts[2]}`;
  };

  return (
    <>
      <Head>
        <title>x402 Arcade — My Account</title>
        <meta name="description" content="View your Aptos account details, transactions, and coins." />
      </Head>

      <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 to-purple-800 p-6">
        <Player
          src="/lottie-game.json"
          loop
          autoplay
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        <div className="relative z-10 max-w-6xl mx-auto pt-20">
          <h1 className="text-4xl font-bold text-center text-[#ffd54a] mb-12">My Account</h1>

          {error ? (
            <div className="text-center">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <p className="text-white/70 text-sm">This might be due to rate limiting. Please try again in a moment.</p>
            </div>
          ) : !connected ? (
            <p className="text-center text-white/70 text-lg">Please connect your wallet to view account details.</p>
          ) : isLoading ? (
            <div className="text-center">
              <p className="text-white/70 text-lg mb-2">Loading account details...</p>
              <p className="text-white/50 text-sm">This may take a moment due to API rate limits</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Account Info: Full Address & Copy */}
              <div className="bg-white/5 p-4 rounded-lg flex items-center justify-between mb-8">
                <p className="text-white/80 font-mono text-lg break-all">
                  {account?.address?.toString()}
                </p>
                <button
                  onClick={copyAddress}
                  className="ml-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-base transition"
                >
                  {copied ? "Copied!" : "Copy Address"}
                </button>
              </div>

              {/* Tabs for Transactions / Coins / Info with grey separators */}
              <div className="flex justify-center mb-8 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={clsx(
                    "px-8 py-3 rounded-lg font-semibold transition-colors flex-1 text-center mx-1",
                    activeTab === "transactions" 
                      ? "bg-[#ffd54a] text-black shadow-lg" 
                      : "bg-transparent text-white/70 hover:bg-white/10 border-r border-gray-500/50"
                  )}
                >
                  Transactions
                </button>
                <button
                  onClick={() => setActiveTab("coins")}
                  className={clsx(
                    "px-8 py-3 rounded-lg font-semibold transition-colors flex-1 text-center mx-1",
                    activeTab === "coins" 
                      ? "bg-[#ffd54a] text-black shadow-lg" 
                      : "bg-transparent text-white/70 hover:bg-white/10 border-r border-gray-500/50"
                  )}
                >
                  Coins
                </button>
                <button
                  onClick={() => setActiveTab("info")}
                  className={clsx(
                    "px-8 py-3 rounded-lg font-semibold transition-colors flex-1 text-center mx-1",
                    activeTab === "info" 
                      ? "bg-[#ffd54a] text-black shadow-lg" 
                      : "bg-transparent text-white/70 hover:bg-white/10"
                  )}
                >
                  Info
                </button>
              </div>

              {/* Content based on active tab */}
              <>
                {activeTab === "transactions" && (
                  <div className="bg-white/5 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-[#ffd54a] mb-6">Transactions ({transactions.length})</h3>
                    {transactions.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                          <thead>
                            <tr className="border-b border-gray-500/50">
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">Version</th>
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">Type</th>
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">Timestamp</th>
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">Sender</th>
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">Sent To</th>
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">Function</th>
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-500/30">
                            {transactions.map((tx, index) => (
                              <tr key={index} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-2 text-white text-sm font-mono">{tx.version}</td>
                                <td className="py-3 px-2 text-white text-sm">{truncateText(tx.type, 10, 4)}</td>
                                <td className="py-3 px-2 text-white text-sm">{tx.timestamp}</td>
                                <td className="py-3 px-2 text-white text-sm font-mono">{truncateText(tx.sender)}</td>
                                <td className="py-3 px-2 text-white text-sm font-mono">{truncateText(tx.sentTo)}</td>
                                <td className="py-3 px-2 text-white text-sm font-mono">{truncateText(tx.func, 15, 8)}</td>
                                <td className="py-3 px-2 text-white text-sm">{tx.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-white/70 py-8">No transactions found.</p>
                    )}
                  </div>
                )}

                {activeTab === "coins" && (
                  <div className="bg-white/5 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-[#ffd54a] mb-6">Coins ({coins.length})</h3>
                    {coins.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                          <thead>
                            <tr className="border-b border-gray-500/50">
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">Name</th>
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">Asset Type</th>
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">Asset</th>
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">Verified</th>
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">Amount</th>
                              <th className="text-left py-3 px-2 text-white/70 font-semibold text-sm">USD Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-500/30">
                            {coins.map((coin, index) => (
                              <tr key={index} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-2 text-white text-sm font-semibold">{coin.name}</td>
                                <td className="py-3 px-2 text-white text-sm font-mono">
                                  {formatAssetType(coin.assetType)}
                                </td>
                                <td className="py-3 px-2 text-white text-sm">{coin.asset}</td>
                                <td className="py-3 px-2 text-white text-sm">
                                  <span className={coin.verified ? "text-green-400" : "text-red-400"}>
                                    {coin.verified ? "Yes" : "No"}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-white text-sm font-mono">{coin.amount}</td>
                                <td className="py-3 px-2 text-white text-sm">{coin.usdValue}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-white/70 py-8">No coins found.</p>
                    )}
                  </div>
                )}

                {activeTab === "info" && (
                  <div className="bg-white/5 p-6 rounded-lg text-white/80">
                    <h3 className="text-xl font-bold text-[#ffd54a] mb-4">Account Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="font-semibold text-[#ffd54a] mb-2">Network</h4>
                          <p className="text-sm">{network?.name || "Unknown"}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="font-semibold text-[#ffd54a] mb-2">Total Coins</h4>
                          <p className="text-sm">{coins.length}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="font-semibold text-[#ffd54a] mb-2">Total Transactions</h4>
                          <p className="text-sm">{transactions.length}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="font-semibold text-[#ffd54a] mb-2">Status</h4>
                          <p className="text-sm text-green-400">Active</p>
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="font-semibold text-[#ffd54a] mb-2">Additional Details</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Total APT Balance: {coins.find(coin => coin.name === "APT")?.amount || "0.0000"} APT</li>
                          <li>Last Activity: {transactions[0]?.timestamp || "N/A"}</li>
                          <li>Account Created: {transactions[transactions.length - 1]?.timestamp || "N/A"}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}