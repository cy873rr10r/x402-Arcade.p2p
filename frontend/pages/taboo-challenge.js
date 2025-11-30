"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Player from "lottie-react";
import WalletConnect from "../components/WalletConnect";

export default function TabooChallengePage() {
  const router = useRouter();
  const {
    gameName: queryGameName,
    totalTime: queryTotalTime,
    totalQuestions: queryTotalQuestions,
    questionType: queryQuestionType,
    specificQuestionTopic: querySpecificQuestionTopic,
    betAmount: queryBetAmount,
    gameSessionId: queryGameSessionId,
    inviteModeArcadeAddress: queryInviteModeArcadeAddress,
    lobbyPlayers: queryLobbyPlayers,
    numPlayers: queryNumPlayers,
    currentUserInitialBalance: queryCurrentUserInitialBalance,
    player1Address: queryPlayer1Address,
    player2Address: queryPlayer2Address,
  } = router.query;

  const [gameDataState, setGameDataState] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;

    let initialLobbyPlayers = [];
    if (Array.isArray(queryLobbyPlayers)) {
      // Next.js may give multiple query params as an array already
      initialLobbyPlayers = queryLobbyPlayers;
    } else if (typeof queryLobbyPlayers === "string" && queryLobbyPlayers.trim() !== "") {
      const raw = queryLobbyPlayers.trim();
      try {
        if (raw.startsWith("[")) {
          // Already a JSON array string
          initialLobbyPlayers = JSON.parse(raw);
        } else if (raw.includes(",")) {
          // Comma-separated addresses
          initialLobbyPlayers = raw.split(",").map(s => s.trim()).filter(Boolean);
        } else {
          // Single address string
          initialLobbyPlayers = [raw];
        }
      } catch (e) {
        console.warn("Failed to parse queryLobbyPlayers, falling back to raw string:", e);
        initialLobbyPlayers = [raw];
      }
    }

    const defaultGameData = {
      mainWord: "OCEAN",
      question: "A vast body of saltwater that covers most of the Earth's surface.",
      prohibitedWords: ["SEA", "WATER", "BLUE", "FISH", "BOAT"],
    };

    setGameDataState({
      ...defaultGameData,
      gameName: queryGameName || "Taboo the AI",
      totalTime: (queryTotalTime && !isNaN(parseInt(queryTotalTime))) ? parseInt(queryTotalTime) : 5,
      totalQuestions: (queryTotalQuestions && !isNaN(parseInt(queryTotalQuestions))) ? parseInt(queryTotalQuestions) : 10,
      questionType: queryQuestionType || "random",
      specificQuestionTopic: querySpecificQuestionTopic || "",
      betAmount: queryBetAmount ? parseFloat(queryBetAmount) : 0.5,
      gameSessionId: queryGameSessionId || "",
      inviteModeArcadeAddress: queryInviteModeArcadeAddress || "",
      lobbyPlayers: initialLobbyPlayers,
      numPlayers: queryNumPlayers ? parseInt(queryNumPlayers) : 2,
      currentUserInitialBalance: queryCurrentUserInitialBalance ? parseFloat(queryCurrentUserInitialBalance) : 10.0,
      player1Address: queryPlayer1Address || "",
      player2Address: queryPlayer2Address || "",
    });
  }, [
    router.isReady,
    queryGameName,
    queryTotalTime,
    queryTotalQuestions,
    queryQuestionType,
    querySpecificQuestionTopic,
    queryBetAmount,
    queryGameSessionId,
    queryInviteModeArcadeAddress,
    queryLobbyPlayers,
    queryNumPlayers,
    queryCurrentUserInitialBalance,
    queryPlayer1Address,
    queryPlayer2Address,
  ]);

  const questionPacks = [
    {
      mainWord: "OCEAN",
      question: "A vast body of saltwater that covers most of the Earth's surface.",
      prohibitedWords: ["SEA", "WATER", "BLUE", "FISH", "BOAT"],
      topic: "Nature",
    },
    {
      mainWord: "KEYBOARD",
      question: "An input device used to enter characters and functions into a computer system.",
      prohibitedWords: ["COMPUTER", "TYPING", "BUTTONS", "LETTERS", "MOUSE"],
      topic: "Technology",
    },
    {
      mainWord: "GUITAR",
      question: "A stringed musical instrument with a fretted fingerboard, typically plucked or strummed.",
      prohibitedWords: ["MUSIC", "STRINGS", "PLAY", "INSTRUMENT", "SONG"],
      topic: "Music",
    },
    {
      mainWord: "COFFEE",
      question: "A popular brewed drink prepared from roasted coffee beans.",
      prohibitedWords: ["DRINK", "BEAN", "CUP", "CAFFEINE", "HOT"],
      topic: "Food & Drink",
    },
    {
      mainWord: "BICYCLE",
      question: "A vehicle with two wheels, propelled by pedals and steered with handlebars.",
      prohibitedWords: ["WHEELS", "RIDE", "PEDALS", "BIKE", "TRANSPORT"],
      topic: "Sport & Leisure",
    },
  ];

  const [playerInput, setPlayerInput] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [gameStatus, setGameStatus] = useState("playing");
  const [usedTabooWords, setUsedTabooWords] = useState([]);
  const [winner, setWinner] = useState(null);
  const [simulatedPayoutAmount, setSimulatedPayoutAmount] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [currentUserSimulatedBalance, setCurrentUserSimulatedBalance] = useState(0);
  const [aiGameHistory, setAiGameHistory] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [activeGameQuestions, setActiveGameQuestions] = useState([]);
  const [isTransferring, setIsTransferring] = useState(false);

  const simulateAiTurn = (question, totalQuestions, currentQuestionIndex) => {
    const decision = Math.random();
    let aiInput = "";
    let aiOutcome = "";
    let aiUsedTabooWords = [];

    if (decision < 0.7) {
      aiInput = question.mainWord;
      aiOutcome = "correct";
    } else if (decision < 0.9) {
      const randomTabooIndex = Math.floor(Math.random() * question.prohibitedWords.length);
      aiInput = `hint using ${question.prohibitedWords[randomTabooIndex]}`;
      aiUsedTabooWords.push(question.prohibitedWords[randomTabooIndex]);
      aiOutcome = "taboo_used";
    } else {
      aiInput = "(skipped)";
      aiOutcome = "skipped";
    }

    return {
      question: question.question,
      mainWord: question.mainWord,
      playerInput: aiInput,
      outcome: aiOutcome,
      usedTabooWords: aiUsedTabooWords,
    };
  };

  useEffect(() => {
    if (!router.isReady || !gameDataState) return;

    const selectQuestions = () => {
      let selected = [];
      if (gameDataState.questionType === "specific" && gameDataState.specificQuestionTopic) {
        const filtered = questionPacks.filter(q => q.topic.toLowerCase() === gameDataState.specificQuestionTopic.toLowerCase());
        selected = filtered.slice(0, gameDataState.totalQuestions);
        if (selected.length === 0) {
          alert(`No questions found for topic: ${gameDataState.specificQuestionTopic}. Using random questions.`);
          selected = questionPacks.sort(() => 0.5 - Math.random()).slice(0, gameDataState.totalQuestions);
        }
      } else {
        selected = questionPacks.sort(() => 0.5 - Math.random()).slice(0, gameDataState.totalQuestions);
      }
      setActiveGameQuestions(selected);

      const simulatedAiHistory = selected.map((q, idx) => simulateAiTurn(q, gameDataState.totalQuestions, idx));
      setAiGameHistory(simulatedAiHistory);
    };

    selectQuestions();
    setTimer(gameDataState.totalTime * 60);
    setIsTimerActive(true);

    setPlayerInput("");
    setAiFeedback("");
    setGameStatus("playing");
    setUsedTabooWords([]);
    setWinner(null);
    setSimulatedPayoutAmount(0);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCurrentUserSimulatedBalance(gameDataState.currentUserInitialBalance);
    setGameHistory([]);
  }, [router.isReady, gameDataState]);

  useEffect(() => {
    let interval;
    if (isTimerActive && gameStatus === "playing" && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (isTimerActive && timer === 0 && gameStatus === "playing") {
      if (!gameDataState) return;

      setGameStatus("time_up");
      setIsTimerActive(false);
      setAiFeedback("Time's up! Game over.");
      setWinner("ai");
      setSimulatedPayoutAmount(0);
      setCurrentUserSimulatedBalance(prev => prev - gameDataState.betAmount);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer, gameStatus, gameDataState]);

  // Helper function to send coins to winner
  const sendCoinToWinner = async (winnerAddress, loserAddress, amount, arcadeAddress) => {
    setIsTransferring(true);
    try {
      // Call backend API to process the actual blockchain transaction
      const response = await fetch("/api/transfer-coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAddress: loserAddress,
          toAddress: winnerAddress,
          amount: amount,
          arcadeAddress: arcadeAddress,
          gameSessionId: gameDataState?.gameSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Transfer failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Coin transfer successful:", data);
      return data;
    } catch (error) {
      console.error("Error transferring coins:", error);
      // Simulate the transfer for demo purposes
      console.log(`[SIMULATED] Transferred ${amount} APT from ${loserAddress} to ${winnerAddress}`);
      return { success: true, simulated: true };
    } finally {
      setIsTransferring(false);
    }
  };

  const handleSubmitGuess = () => {
    const currentQuestion = activeGameQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    const inputLower = playerInput.toLowerCase();
    let tabooUsed = false;
    let currentUsedTaboo = [];

    for (const tabooWord of currentQuestion.prohibitedWords) {
      if (inputLower.includes(tabooWord.toLowerCase())) {
        tabooUsed = true;
        currentUsedTaboo.push(tabooWord);
      }
    }

    let outcome = "incorrect";

    if (tabooUsed) {
      setUsedTabooWords(prev => [...new Set([...prev, ...currentUsedTaboo])]);
      setAiFeedback(`Oops! You used a prohibited word: ${currentUsedTaboo.join(', ')}. `);
      setGameStatus("lost");
      setWinner("ai");
      setSimulatedPayoutAmount(0);
      setIsTimerActive(false);
      outcome = "taboo_used";
      setCurrentUserSimulatedBalance(prev => prev - gameDataState.betAmount);
    } else if (inputLower.includes(currentQuestion.mainWord.toLowerCase())) {
      setAiFeedback("Amazing! You got it! Correct word!");
      setScore(prev => prev + 1);
      outcome = "correct";

      if (currentQuestionIndex < gameDataState.totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setPlayerInput("");
        setAiFeedback("");
        setUsedTabooWords([]);
      } else {
        setGameStatus("all_questions_answered");
        setIsTimerActive(false);
        setWinner("player");
        const payout = 2 * gameDataState.betAmount;
        setSimulatedPayoutAmount(payout);
        setCurrentUserSimulatedBalance(prev => prev + gameDataState.betAmount);
      }
    } else {
      setAiFeedback("Hmm, not quite. Try another hint!");
    }

    setGameHistory(prevHistory => [
      ...prevHistory,
      {
        question: currentQuestion.question,
        mainWord: currentQuestion.mainWord,
        playerInput: playerInput,
        outcome: outcome,
        usedTabooWords: currentUsedTaboo,
      },
    ]);

    setPlayerInput("");
  };

  const handleResetGame = () => {
    setPlayerInput("");
    setAiFeedback("");
    setGameStatus("playing");
    setUsedTabooWords([]);
    setWinner(null);
    setSimulatedPayoutAmount(0);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameHistory([]);
    setAiGameHistory([]);
    setTimer(gameDataState.totalTime * 60);
    setIsTimerActive(true);
    setCurrentUserSimulatedBalance(gameDataState.currentUserInitialBalance);
  };

  const handleSkipQuestion = () => {
    setAiFeedback("Question skipped. Moving to the next one!");
    setUsedTabooWords([]);

    const currentQuestion = activeGameQuestions[currentQuestionIndex];
    if (currentQuestion) {
      setGameHistory(prevHistory => [
        ...prevHistory,
        {
          question: currentQuestion.question,
          mainWord: currentQuestion.mainWord,
          playerInput: "",
          outcome: "skipped",
          usedTabooWords: [],
        },
      ]);
    }

    if (currentQuestionIndex < gameDataState.totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setPlayerInput("");
    } else {
      setGameStatus("all_questions_answered");
      setIsTimerActive(false);
      setWinner("ai");
      setSimulatedPayoutAmount(0);
      setAiFeedback("All questions skipped. Game over.");
      setCurrentUserSimulatedBalance(prev => prev - gameDataState.betAmount);
    }
    setPlayerInput("");
  };

  const handleCancelGame = () => {
    if (window.confirm("Are you sure you want to cancel the quiz? Your bet will be lost.")) {
      setIsTimerActive(false);
      setGameStatus("cancelled");
      setWinner("ai");
      setSimulatedPayoutAmount(0);
      setAiFeedback("Quiz cancelled. Your bet has been forfeited.");
      setCurrentUserSimulatedBalance(prev => prev - gameDataState.betAmount);
      setGameHistory(prevHistory => [
        ...prevHistory,
        {
          question: "Quiz Cancelled",
          mainWord: "N/A",
          playerInput: "",
          outcome: "cancelled",
          usedTabooWords: [],
        },
      ]);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const GameSummary = ({
    gameStatus,
    score,
    gameDataState,
    winner,
    simulatedPayoutAmount,
    usedTabooWords,
    currentQuestion,
    currentUserSimulatedBalance,
    gameHistory,
    aiGameHistory,
    activeGameQuestions,
    onPlayAgain,
    router,
    onSendCoins,
    isTransferring,
  }) => {
    return (
      <div className="text-center space-y-4">
        {gameStatus === "won" || (gameStatus === "all_questions_answered" && winner === "player") ? (
          <h2 className="text-3xl font-bold text-green-400">🎉 Congratulations! You won! 🎉</h2>
        ) : gameStatus === "time_up" ? (
          <h2 className="text-3xl font-bold text-red-400">Time's Up! Game Over.</h2>
        ) : gameStatus === "cancelled" ? (
          <h2 className="text-3xl font-bold text-gray-400">Quiz Cancelled. Your bet has been forfeited.</h2>
        ) : (
          <h2 className="text-3xl font-bold text-red-400">Game Over! You used a taboo word.</h2>
        )}

        <p className="text-white/80 text-xl">Final Score: <span className="font-bold text-[#ffd54a]">{score} / {gameDataState.totalQuestions}</span></p>

        {winner && (
          <p className="text-white/80 text-xl">
            Winner: <span className="font-bold text-[#ffd54a]">{winner === "player" ? "You" : "AI"}</span>
          </p>
        )}
        {simulatedPayoutAmount > 0 && winner === "player" && (
          <p className="text-white/80 text-xl">
            Payout: <span className="font-bold text-green-400">{simulatedPayoutAmount} APT</span> received!
          </p>
        )}
        {simulatedPayoutAmount === 0 && winner === "ai" && (
          <p className="text-white/80 text-xl">
            Bet: <span className="font-bold text-red-400">{gameDataState.betAmount} APT</span> lost.
          </p>
        )}
        {usedTabooWords.length > 0 && (
          <p className="text-white/70 text-lg">You used: <span className="font-bold text-red-300">{usedTabooWords.join(', ')}</span></p>
        )}
        {currentQuestion && <p className="text-white/80 text-xl">The last word was: <span className="font-bold text-[#ffd54a]">{currentQuestion.mainWord}</span></p>}

        {/* Coin Transfer Section */}
        {(gameStatus === "all_questions_answered" && winner === "player") && gameDataState.betAmount > 0 && (
          <div className="mt-6 border-t border-white/20 pt-4">
            <h3 className="text-xl font-bold text-green-400 mb-4">Winner's Reward</h3>
            <button
              onClick={() => onSendCoins(
                gameDataState.player2Address || "0x" + Math.random().toString(16).slice(2),
                gameDataState.player1Address || "0x" + Math.random().toString(16).slice(2),
                simulatedPayoutAmount,
                gameDataState.inviteModeArcadeAddress
              )}
              disabled={isTransferring}
              className="px-6 py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white shadow-md transition-colors disabled:bg-gray-500"
            >
              {isTransferring ? "Transferring..." : "Send Coins to Winner"}
            </button>
            <p className="text-white/80 text-sm mt-2">Amount: <span className="font-bold text-green-400">{simulatedPayoutAmount} APT</span></p>
          </div>
        )}

        {/* Transaction Summary */}
        {(gameStatus === "lost" || gameStatus === "time_up" || gameStatus === "cancelled" || (gameStatus === "all_questions_answered" && winner === "ai")) && gameDataState.betAmount > 0 && (
          <div className="mt-4 border-t border-white/20 pt-4">
            <h3 className="text-xl font-bold text-red-400">Simulated Transaction:</h3>
            <p className="text-white/80"><strong>{gameDataState.betAmount} APT</strong> sent from <span className="font-bold text-red-300">Your Wallet</span> to <span className="font-bold text-green-300">AI Wallet</span>.</p>
            <p className="text-white/80">Your new simulated balance: <span className="font-bold text-[#ffd54a]">{currentUserSimulatedBalance.toFixed(2)} APT</span></p>
          </div>
        )}
        {(gameStatus === "all_questions_answered" && winner === "player") && gameDataState.betAmount > 0 && !isTransferring && (
          <div className="mt-4 border-t border-white/20 pt-4">
            <h3 className="text-xl font-bold text-green-400">Simulated Transaction:</h3>
            <p className="text-white/80"><strong>{gameDataState.betAmount} APT</strong> sent from <span className="font-bold text-red-300">Opponent Wallet</span> to <span className="font-bold text-green-300">Your Wallet</span>.</p>
            <p className="text-white/80">Your new simulated balance: <span className="font-bold text-[#ffd54a]">{currentUserSimulatedBalance.toFixed(2)} APT</span></p>
          </div>
        )}

        {/* Q&A History Display */}
        {(gameHistory.length > 0 || aiGameHistory.length > 0) && (
          <div className="mt-8 text-left border-t border-white/20 pt-6">
            <h3 className="text-2xl font-bold text-[#ffd54a] mb-4 text-center">Game Summary</h3>
            {activeGameQuestions.map((question, index) => {
              const playerEntry = gameHistory[index];
              const aiEntry = aiGameHistory[index];

              return (
                <div key={index} className="bg-white/10 p-4 rounded-lg mb-4 last:mb-0">
                  <p className="text-white text-lg font-semibold">Question {index + 1}:</p>
                  <p className="text-white/90 text-md italic mb-2">"{question.question}"</p>
                  <p className="text-white/80"><strong>Correct Word:</strong> <span className="font-bold text-green-400">{question.mainWord}</span></p>

                  {playerEntry && (
                    <div className="mt-4 pt-2 border-t border-white/10">
                      <p className="text-white text-md font-semibold">Your Performance:</p>
                      <p className="text-white/80"><strong>Your Hint:</strong> {playerEntry.playerInput || "(Skipped)"}</p>
                      <p className="text-white/80"><strong>Outcome:</strong>
                        {playerEntry.outcome === "correct" && <span className="text-green-400 font-bold">Correct!</span>}
                        {playerEntry.outcome === "skipped" && <span className="text-gray-400 font-bold">Skipped!</span>}
                        {playerEntry.outcome === "taboo_used" && <span className="text-red-400 font-bold">Used Taboo Word!</span>}
                        {playerEntry.outcome === "incorrect" && !playerEntry.usedTabooWords.length && <span className="text-red-400 font-bold">Incorrect Guess.</span>}
                        {playerEntry.outcome === "cancelled" && <span className="text-gray-400 font-bold">Quiz Cancelled.</span>}
                      </p>
                      {playerEntry.outcome === "taboo_used" && playerEntry.usedTabooWords.length > 0 && (
                        <p className="text-red-300 text-sm mt-1">Prohibited: {playerEntry.usedTabooWords.join(', ')}</p>
                      )}
                    </div>
                  )}

                  {aiEntry && (
                    <div className="mt-4 pt-2 border-t border-white/10">
                      <p className="text-white text-md font-semibold">AI Performance:</p>
                      <p className="text-white/80"><strong>AI's Hint:</strong> {aiEntry.playerInput || "(Skipped)"}</p>
                      <p className="text-white/80"><strong>Outcome:</strong>
                        {aiEntry.outcome === "correct" && <span className="text-green-400 font-bold">Correct!</span>}
                        {aiEntry.outcome === "skipped" && <span className="text-gray-400 font-bold">Skipped!</span>}
                        {aiEntry.outcome === "taboo_used" && <span className="text-red-400 font-bold">Used Taboo Word!</span>}
                        {aiEntry.outcome === "incorrect" && !aiEntry.usedTabooWords.length && <span className="text-red-400 font-bold">Incorrect Guess.</span>}
                      </p>
                      {aiEntry.outcome === "taboo_used" && aiEntry.usedTabooWords.length > 0 && (
                        <p className="text-red-300 text-sm mt-1">Prohibited: {aiEntry.usedTabooWords.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onPlayAgain}
          className="mt-6 px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors"
        >
          Play Again
        </button>

        <button
          onClick={() => router.push("/explore")}
          className="mt-4 px-6 py-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-colors"
        >
          Explore More Games
        </button>
      </div>
    );
  };

  const currentQuestion = activeGameQuestions[currentQuestionIndex];

  if (!router.isReady || !gameDataState) {
    return <p className="text-center text-white/70 text-lg mt-20">Loading game settings...</p>;
  }

  if (!currentQuestion && gameStatus === "playing") {
    return <p className="text-center text-red-400 text-lg mt-20">Error: No questions loaded for this game.</p>;
  }

  return (
    <>
      <Head>
        <title>{gameDataState.gameName} – x402 Arcade</title>
        <meta name="description" content={`Prepare to play ${gameDataState.gameName} on x402 Arcade.`} />
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

        <div className="relative z-10 max-w-3xl mx-auto pt-20 text-white">
          <h1 className="text-4xl font-bold text-center text-[#ffd54a] mb-10">{gameDataState.gameName}</h1>

          <div className="bg-white/10 p-4 rounded-lg mb-6 text-center text-white/80">
            <p><strong>Session ID:</strong> {gameDataState.gameSessionId || "N/A"}</p>
            <p><strong>Players:</strong> {gameDataState.lobbyPlayers.length}/{gameDataState.numPlayers}</p>
            <p><strong>Time:</strong> {formatTime(timer)} / {gameDataState.totalTime} mins</p>
            <p><strong>Questions:</strong> {currentQuestionIndex + 1}/{gameDataState.totalQuestions} ({gameDataState.questionType})</p>
            {gameDataState.questionType === "specific" && (
              <p><strong>Topic:</strong> {gameDataState.specificQuestionTopic}</p>
            )}
            <p><strong>Arcade Address:</strong> {gameDataState.inviteModeArcadeAddress || "N/A"}</p>
            <p><strong>Bet Amount:</strong> {gameDataState.betAmount} APT</p>
            <p><strong>Your Score:</strong> {score}</p>
            <p><strong>Your Simulated Balance:</strong> {currentUserSimulatedBalance.toFixed(2)} APT</p>
          </div>

          <div className="bg-white/5 p-8 rounded-lg shadow-xl space-y-6">
            {gameStatus === "playing" ? (
              <>
                <p className="text-white/80 text-lg mb-4 text-center">Your challenge: Make the AI guess the word below without using any of the prohibited words!</p>

                <div className="bg-white/10 p-5 rounded-lg">
                  <p className="text-white text-xl font-semibold mb-2">Question:</p>
                  <p className="text-white/90 text-xl font-bold italic">"{currentQuestion?.question}"</p>
                </div>

                <div className="bg-white/10 p-5 rounded-lg">
                  <p className="text-white text-xl font-semibold mb-2">Prohibited Words:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion?.prohibitedWords.map((word, index) => (
                      <span key={index} className="px-4 py-1 rounded-full bg-red-600/70 text-white font-medium text-sm">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="playerInput" className="block text-white/70 text-lg font-semibold mb-3">Your Hint / Guess:</label>
                  <input
                    type="text"
                    id="playerInput"
                    value={playerInput}
                    onChange={(e) => setPlayerInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSubmitGuess(); }}
                    placeholder="Type your hint here..."
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-[#ffd54a]"
                    disabled={gameStatus !== "playing"}
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleSubmitGuess}
                    className="flex-grow px-6 py-3 rounded-lg font-semibold bg-[#ffd54a] text-black hover:bg-[#ffb86b] shadow-md transition-colors disabled:bg-gray-500"
                    disabled={gameStatus !== "playing" || playerInput.trim() === ""}
                  >
                    Submit Hint
                  </button>
                  <button
                    onClick={handleSkipQuestion}
                    className="px-6 py-3 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white shadow-md transition-colors"
                    disabled={gameStatus !== "playing"}
                  >
                    Skip Question
                  </button>
                  <button
                    onClick={handleCancelGame}
                    className="px-6 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors"
                    disabled={gameStatus !== "playing"}
                  >
                    Cancel Quiz
                  </button>
                </div>
              </>
            ) : (
              <GameSummary
                gameStatus={gameStatus}
                score={score}
                gameDataState={gameDataState}
                winner={winner}
                simulatedPayoutAmount={simulatedPayoutAmount}
                usedTabooWords={usedTabooWords}
                currentQuestion={currentQuestion}
                currentUserSimulatedBalance={currentUserSimulatedBalance}
                gameHistory={gameHistory}
                aiGameHistory={aiGameHistory}
                activeGameQuestions={activeGameQuestions}
                onPlayAgain={handleResetGame}
                router={router}
                onSendCoins={sendCoinToWinner}
                isTransferring={isTransferring}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}