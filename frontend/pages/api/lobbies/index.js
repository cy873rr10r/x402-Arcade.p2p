// pages/api/lobbies/index.js

import { createLobby } from "../../../lib/lobbyStore";

export default function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { hostAddress, numPlayers, gameConfig } = req.body || {};

      if (!hostAddress || !gameConfig) {
        return res.status(400).json({ error: "hostAddress and gameConfig are required" });
      }

      const lobby = createLobby({
        hostAddress,
        numPlayers: numPlayers || 2,
        gameConfig,
      });

      return res.status(201).json(lobby);
    } catch (e) {
      console.error("Error creating lobby:", e);
      return res.status(500).json({ error: "Failed to create lobby" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
