// lib/lobbyStore.js
// Simple in-memory lobby store for development/demo purposes.
// NOTE: This is NOT persistent and will reset when the server restarts.

const lobbies = new Map();

function generateLobbyId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function createLobby({ hostAddress, numPlayers, gameConfig }) {
  const id = generateLobbyId();
  const now = new Date().toISOString();

  const lobby = {
    id,
    hostAddress,
    numPlayers,
    players: hostAddress ? [hostAddress] : [],
    gameConfig,
    status: "waiting", // "waiting" | "ready"
    createdAt: now,
    updatedAt: now,
  };

  lobbies.set(id, lobby);
  return lobby;
}

export function getLobby(id) {
  return lobbies.get(id) || null;
}

export function joinLobby(id, playerAddress) {
  const lobby = lobbies.get(id);
  if (!lobby) return null;

  const now = new Date().toISOString();

  if (!lobby.players.includes(playerAddress)) {
    lobby.players = [...lobby.players, playerAddress];
  }

  if (lobby.players.length >= (lobby.numPlayers || 2)) {
    lobby.status = "ready";
  }

  lobby.updatedAt = now;
  lobbies.set(id, lobby);
  return lobby;
}

export function cancelLobby(id) {
  const lobby = lobbies.get(id);
  if (!lobby) return null;
  lobbies.delete(id);
  return lobby;
}
