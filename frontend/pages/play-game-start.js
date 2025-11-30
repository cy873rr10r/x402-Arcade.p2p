"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Player from "lottie-react";
import WalletConnect from "../components/WalletConnect";
import HideableAddressInput from "../components/HideableAddressInput";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { clsx } from "clsx";

export default function PlayGameStartPage() {
  const router = useRouter();
  const { id, arcadeAddress, joinSession } = router.query;
  const { account, connected } = useWallet();
  const [game, setGame] = useState(null);
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerAddresses, setPlayerAddresses] = useState({});
  const [betAmount, setBetAmount] = useState("");
  const [gameMode, setGameMode] = useState(joinSession ? "join" : "invite");
  const [joinGameAddress, setJoinGameAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isLobbyActive, setIsLobbyActive] = useState(false);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [gameSessionId, setGameSessionId] = useState(joinSession || "");
  const [waitingMessage, setWaitingMessage] = useState("");
  const [isGameStarting, setIsGameStarting] = useState(false);
  const [simulatedAccountBalance, setSimulatedAccountBalance] = useState(10.0);
  const [player2JoinStatus, setPlayer2JoinStatus] = useState("pending");

  const [totalTime, setTotalTime] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [questionType, setQuestionType] = useState("random");
  const [specificQuestionTopic, setSpecificQuestionTopic] = useState("");
  const [inviteModeArcadeAddress, setInviteModeArcadeAddress] = useState("");

  // Player management
  const [player2Address, setPlayer2Address] = useState("");
  const [player2NotificationSent, setPlayer2NotificationSent] = useState(false);
  const [isPlayer1, setIsPlayer1] = useState(true);
  const [lobbyData, setLobbyData] = useState(null);

  // NOTE: Lobby data is now stored on the backend via /api/lobbies.
  // Frontend only keeps minimal local copy.

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const simulateCheckFunds = async (amount) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const hasFunds = simulatedAccountBalance >= amount;
    if (!hasFunds) {
      alert(`Insufficient funds! You need ${amount} APT, but only have ${simulatedAccountBalance} APT.`);
    }
    return hasFunds;
  };

  // Backend lobby functions now live under /api/lobbies.

// Replace the first useEffect with this updated version
useEffect(() => {
  // Wait for router to be ready (query params loaded)
  if (!router.isReady) {
    return;
  }

  const { id, arcadeAddress, joinSession, gameData } = router.query;

  // Only redirect if not connected AND not trying to join a session
  if (!connected && !joinSession) {
    router.push("/");
    alert("Please connect your wallet to play a game.");
    return;
  }

  // If joining via session link with game data in URL
  if (joinSession && gameData) {
    try {
      const decodedGameData = JSON.parse(atob(gameData));

      setIsPlayer1(false);
      setGameMode("join");
      setGameSessionId(joinSession);
      setGame({
        id: decodedGameData.gameId,
        gameName: decodedGameData.gameName,
        arcadeAddress: decodedGameData.inviteModeArcadeAddress,
        defaultBet: decodedGameData.defaultBet,
      });
      setBetAmount(decodedGameData.betAmount?.toString() || "0.5");
      setTotalTime(decodedGameData.totalTime);
      setTotalQuestions(decodedGameData.totalQuestions);
      setQuestionType(decodedGameData.questionType);
      setSpecificQuestionTopic(decodedGameData.specificQuestionTopic);
      setNumPlayers(decodedGameData.numPlayers);
      setInviteModeArcadeAddress(decodedGameData.inviteModeArcadeAddress);
      setIsLoading(false);
      return;
    } catch (error) {
      console.error("Failed to decode game data:", error);
    }
  }

  // If joining via session link (legacy, without gameData), try to load lobby from backend
  if (joinSession && !gameData) {
    setIsPlayer1(false);
    setGameSessionId(joinSession);
    (async () => {
      try {
        const res = await fetch(`/api/lobbies/${joinSession}`);
        if (!res.ok) return;
        const lobby = await res.json();
        setLobbyData(lobby);
        if (lobby.gameConfig) {
          setGame(lobby.gameConfig);
          setBetAmount(lobby.gameConfig.betAmount?.toString() || "0.5");
          setTotalTime(lobby.gameConfig.totalTime || totalTime);
        }
      } catch (e) {
        console.warn("Failed to load lobby for joinSession", e);
      }
    })();
  }

  if (arcadeAddress) {
    setJoinGameAddress(arcadeAddress);
  } else if (connected && account?.address) {
    if (!router.query.arcadeAddress) {
      setJoinGameAddress(account.address.toString());
    }
  }

  if (id) {
    const fetchGameDetails = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const dummyGames = [
        {
          id: "1",
          gameName: "Taboo the AI",
          arcadeAddress: "0x123...abc",
          creatorUsername: "AptosGamer",
          timesPlayed: 150,
          defaultBet: 0.5,
        },
        {
          id: "2",
          gameName: "Quiz Master",
          arcadeAddress: "0x456...def",
          creatorUsername: "CryptoDev",
          timesPlayed: 80,
          defaultBet: 1.0,
        },
      ];
      const foundGame = dummyGames.find((g) => g.id === id);
      if (foundGame) {
        setGame(foundGame);
        if (foundGame.defaultBet && !betAmount) {
          setBetAmount(foundGame.defaultBet.toString());
        }
        if (foundGame.arcadeAddress) {
          setInviteModeArcadeAddress(foundGame.arcadeAddress);
        }
      } else {
        setError("Game not found.");
      }
      setIsLoading(false);
    };
    fetchGameDetails();
  } else if (!joinSession) {
    setError("Game ID or Session ID missing.");
    setIsLoading(false);
  }
}, [router.isReady, connected, account, router.query]);

// Keep gameMode in sync with the URL: if a joinSession param exists,
// force the UI into "join" mode so Player 2 sees the join flow, not the host flow.
useEffect(() => {
  if (!router.isReady) return;
  if (router.query.joinSession) {
    setGameMode("join");
  }
}, [router.isReady, router.query.joinSession]);

  // Effect to auto-populate bet amount when joining via session link
  useEffect(() => {
    if (connected && joinSession && gameMode === "join" && !isPlayer1 && !isLobbyActive) {
      // Auto-populate bet amount from lobby data if available
      if (lobbyData && lobbyData.gameData) {
        setBetAmount(lobbyData.gameData.defaultBet?.toString() || "0.5");
      }
    }
  }, [connected, joinSession, gameMode, isPlayer1, isLobbyActive, lobbyData]);

  // Poll backend lobby state and start game for both players when ready
  useEffect(() => {
    // Only require a lobby id and active lobby flag; game details come from backend
    if (!gameSessionId || !isLobbyActive) return;

    let cancelled = false;
    let intervalId;

    const pollLobby = async () => {
      try {
        const res = await fetch(`/api/lobbies/${gameSessionId}`);
        if (!res.ok) {
          if (!cancelled) {
            console.warn("Lobby poll failed", await res.text());
          }
          return;
        }
        const lobby = await res.json();
        if (cancelled) return;

        setLobbyData(lobby);
        setLobbyPlayers(lobby.players || []);

        if (lobby.status === "ready" && lobby.players.length >= (lobby.numPlayers || 2) && !isGameStarting) {
          setIsGameStarting(true);

          const gameData = {
            id: lobby.gameConfig.id,
            gameName: lobby.gameConfig.gameName,
            totalTime: lobby.gameConfig.totalTime,
            totalQuestions: lobby.gameConfig.totalQuestions,
            questionType: lobby.gameConfig.questionType,
            specificQuestionTopic: lobby.gameConfig.specificQuestionTopic,
            betAmount: lobby.gameConfig.betAmount,
            gameSessionId: lobby.id,
            inviteModeArcadeAddress: lobby.gameConfig.inviteModeArcadeAddress,
            lobbyPlayers: lobby.players,
            numPlayers: lobby.numPlayers,
            player1Address: lobby.players[0],
            player2Address: lobby.players[1] || "",
            currentUserInitialBalance: simulatedAccountBalance,
          };

          alert(`All ${lobby.numPlayers} players joined! Starting ${lobby.gameConfig.gameName} now!`);

          router.push({
            pathname: "/taboo-challenge",
            query: gameData,
          });
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Error polling lobby:", e);
        }
      }
    };

    // Initial immediate poll then interval
    pollLobby();
    intervalId = setInterval(pollLobby, 2000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [gameSessionId, isLobbyActive, isGameStarting, router, simulatedAccountBalance]);



const handleCancelGame = async () => {
  setIsLobbyActive(false);
  setLobbyPlayers([]);
  setWaitingMessage("");
  setIsGameStarting(false);
  setPlayer2JoinStatus("pending");
  setPlayer2Address("");
  setPlayer2NotificationSent(false);

  if (gameSessionId) {
    try {
      await fetch(`/api/lobbies/${gameSessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
    } catch (e) {
      console.error("Error cancelling lobby:", e);
    }
  }

  setGameSessionId(""); // Clear session ID
  
  alert("Game lobby cancelled.");
};

  // Add this function to replace your existing generateInviteLink
  const generateInviteLink = () => {
    const baseUrl = window.location.origin;

    // Create a compact game data object
    const gameData = {
      gameName: game.gameName,
      gameId: game.id,
      betAmount: parseFloat(betAmount),
      totalTime,
      totalQuestions,
      questionType,
      specificQuestionTopic,
      numPlayers,
      inviteModeArcadeAddress,
      defaultBet: game.defaultBet,
    };

    // Encode it as base64 to make URL shorter and cleaner
    const encoded = btoa(JSON.stringify(gameData));

    return `${baseUrl}/play-game-start?joinSession=${gameSessionId}&gameData=${encoded}`;
  };

  const handleSendInvite = () => {
    if (!player2Address.trim()) {
      alert("Please enter Player 2's wallet address.");
      return;
    }

    if (player2Address === account?.address.toString()) {
      alert("Player 2 address must be different from your address.");
      return;
    }

    const inviteLink = generateInviteLink();
    
    alert(
      `Invitation sent to Player 2!\n` +
      `Address: ${player2Address}\n` +
      `Game: ${game.gameName}\n` +
      `Session ID: ${gameSessionId}\n` +
      `Invite Link: ${inviteLink}\n` +
      `Bet: ${betAmount} APT\n\n` +
      `Share this link with Player 2 to join the game.`
    );

    setPlayer2NotificationSent(true);
  };

  // Join as Player 2 via backend lobby
  const handleJoinAsPlayer2 = async () => {
    if (!gameSessionId) {
      alert("Please enter a valid Session ID.");
      return;
    }

    if (!account?.address) {
      alert("Please connect your wallet to join the game.");
      return;
    }

    const amount = parseFloat(betAmount || "0");
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    const hasFunds = await simulateCheckFunds(amount);
    if (!hasFunds) {
      return;
    }

    try {
      const res = await fetch(`/api/lobbies/${gameSessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", playerAddress: account.address.toString() }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Join lobby failed:", text);
        alert("Failed to join lobby. It may have expired or been cancelled.");
        return;
      }
      const lobby = await res.json();

      setIsPlayer1(false);
      setIsLobbyActive(true);
      setLobbyData(lobby);
      setGame(lobby.gameConfig || game);
      setNumPlayers(lobby.numPlayers || numPlayers);
      if (lobby.gameConfig?.betAmount) {
        setBetAmount(lobby.gameConfig.betAmount.toString());
      }
      if (lobby.gameConfig?.inviteModeArcadeAddress) {
        setInviteModeArcadeAddress(lobby.gameConfig.inviteModeArcadeAddress);
      }

      alert(`Successfully joined the lobby! Waiting for game to start...`);
    } catch (e) {
      console.error("Error joining lobby:", e);
      alert("Unexpected error while joining lobby.");
    }
  };

  const handleStartGame = async () => {
    if (gameMode === "join") {
      await handleJoinAsPlayer2();
      return;
    }

      if (game) {
      if (!betAmount || parseFloat(betAmount) <= 0) {
        alert("Please enter a valid bet amount.");
        return;
      }

      if (gameMode === "invite") {
        if (!connected || !account?.address) {
          alert("Please connect your wallet to host a game.");
          return;
        }
        if (numPlayers < 2) {
          alert("Invite mode requires at least 2 players.");
          return;
        }
        if (totalTime <= 0 || isNaN(totalTime)) {
          alert("Please enter a valid total time (minutes).");
          return;
        }
        if (totalQuestions <= 0 || isNaN(totalQuestions)) {
          alert("Please enter a valid number of questions.");
          return;
        }
        if (questionType === "specific" && !specificQuestionTopic.trim()) {
          alert("Please enter a topic for specific questions.");
          return;
        }
        if (!inviteModeArcadeAddress.trim()) {
          alert("Please enter the Game Arcade Address for players to join.");
          return;
        }
        if (!player2Address.trim()) {
          alert("Please enter Player 2's wallet address.");
          return;
        }

        const hasFunds = await simulateCheckFunds(parseFloat(betAmount));
        if (!hasFunds) {
          return;
        }

        // Create lobby on backend
        try {
          const res = await fetch("/api/lobbies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              hostAddress: account.address.toString(),
              numPlayers,
              gameConfig: {
                id: game.id,
                gameName: game.gameName,
                totalTime,
                totalQuestions,
                questionType,
                specificQuestionTopic,
                betAmount: parseFloat(betAmount),
                inviteModeArcadeAddress,
                defaultBet: parseFloat(betAmount),
              },
            }),
          });
          if (!res.ok) {
            const text = await res.text();
            console.error("Create lobby failed:", text);
            alert("Failed to create lobby.");
            return;
          }
          const lobby = await res.json();

          setGameSessionId(lobby.id);
          setIsLobbyActive(true);
          setLobbyData(lobby);
          setLobbyPlayers(lobby.players || []);
          setWaitingMessage(`Waiting for Player 2 to join...`);

          alert(
            `Lobby created for ${game.gameName}!\\n` +
            `Session ID: ${lobby.id}\\n` +
            `Share this Session ID with Player 2 or use the invite link.\\n` +
            `Waiting for Player 2 to join...`
          );
        } catch (e) {
          console.error("Error creating lobby:", e);
          alert("Unexpected error while creating lobby.");
        }
      }
    }
  };

  if (isLoading) {
    return <p className="text-center text-white/70 text-lg mt-20">Loading game details...</p>;
  }

  if (error) {
    return <p className="text-center text-red-400 text-lg mt-20">Error: {error}</p>;
  }

  return (
    <>
      <Head>
        <title>x402 Arcade – Start {game?.gameName}</title>
        <meta name="description" content={`Prepare to play ${game?.gameName} on x402 Arcade.`} />
      </Head>

      <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 to-purple-800 p-6">
        <Player
          src="/lottie-game.json"
          loop
          autoplay
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        <div className="absolute top-6 right-6 z-50">
          <WalletConnect />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto pt-20 text-white">
          <h1 className="text-4xl font-bold text-center text-[#ffd54a] mb-10">
            {isPlayer1 ? `Host ${game?.gameName}` : `Join ${game?.gameName}`}
          </h1>

          {!isLobbyActive ? (
            <div className="bg-white/5 p-8 rounded-lg shadow-xl space-y-6">
              {gameMode === "join" ? (
                <>
                  <p className="text-white/80 text-center mb-6">
                    {joinSession ? (
                      <>You're joining Session: <span className="font-mono text-purple-300 font-bold">{joinSession}</span></>
                    ) : (
                      "Enter the Session ID shared by the host"
                    )}
                  </p>

                  {!joinSession && (
                    <div>
                      <label htmlFor="sessionId" className="block text-white/70 text-lg font-semibold mb-3">
                        Session ID to Join:
                      </label>
                      <input
                        type="text"
                        id="sessionId"
                        value={gameSessionId}
                        onChange={(e) => setGameSessionId(e.target.value)}
                        placeholder="Enter Session ID from host"
                        className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#ffd54a]"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="joinBetAmount" className="block text-white/70 text-lg font-semibold mb-3">
                      Bet Amount (APT):
                    </label>
                    <input
                      type="number"
                      id="joinBetAmount"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      placeholder="Enter bet amount in APT"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#ffd54a]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="numPlayers" className="block text-white/70 text-lg font-semibold mb-3">
                      How many players?
                    </label>
                    <select
                      id="numPlayers"
                      value={numPlayers}
                      onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#ffd54a]"
                    >
                      <option value={2} className="text-black">2 Players</option>
                      <option value={3} className="text-black">3 Players</option>
                      <option value={4} className="text-black">4 Players</option>
                    </select>
                  </div>

                  {/* ... other game settings inputs ... */}

                  <div>
                    <label htmlFor="player2Address" className="block text-white/70 text-lg font-semibold mb-3">
                      Player 2 Wallet Address:
                    </label>
                    <input
                      type="text"
                      id="player2Address"
                      value={player2Address}
                      onChange={(e) => setPlayer2Address(e.target.value)}
                      placeholder="Enter Player 2's wallet address"
                      className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#ffd54a]"
                    />
                    <button
                      onClick={handleSendInvite}
                      className="mt-2 w-full px-4 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      disabled={player2NotificationSent}
                    >
                      {player2NotificationSent ? "✓ Invite Sent" : "Generate Invite Link"}
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={handleStartGame}
                className="w-full px-6 py-3 rounded-lg font-semibold bg-[#ffd54a] text-black hover:bg-[#ffb86b] shadow-md transition-colors"
              >
                {gameMode === "invite" ? "Create Lobby" : "Join Game"}
              </button>
            </div>
          ) : (
            <div className="bg-white/5 p-8 rounded-lg shadow-xl space-y-6 text-center">
              <h2 className="text-3xl font-bold text-[#ffd54a] mb-4">
                {isPlayer1 ? "Lobby Active!" : "Joined Lobby!"}
              </h2>
              <p className="text-white/70 text-lg">
                Session ID: <span className="font-mono text-purple-300">{gameSessionId}</span>
              </p>
              
              {isPlayer1 && (
                <>
                  <p className="text-white/70 text-lg">
                    Players Joined: {(lobbyPlayers && lobbyPlayers.length) || 1}/{numPlayers}
                  </p>
                  <p className="text-white/70 text-xl font-semibold mt-4">{waitingMessage}</p>
                  
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-white/80 mb-2">Share this with Player 2:</p>
                    <p className="font-mono text-purple-300 text-sm break-all">
                      {generateInviteLink()}
                    </p>
                  </div>
                </>
              )}

              {!isPlayer1 && (
                <p className="text-green-400 text-xl font-semibold mt-4">
                  Successfully joined! Waiting for host to start the game...
                </p>
              )}

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleCancelGame}
                  className="px-6 py-3 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white shadow-md transition-colors"
                >
                  {isPlayer1 ? "Cancel Lobby" : "Leave Lobby"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}