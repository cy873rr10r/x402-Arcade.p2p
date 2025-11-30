// pages/api/lobbies/[id].js

import { getLobby, joinLobby, cancelLobby } from "../../../lib/lobbyStore";

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Lobby id is required" });
  }

  if (method === "GET") {
    const lobby = getLobby(id);
    if (!lobby) return res.status(404).json({ error: "Lobby not found" });
    return res.status(200).json(lobby);
  }

  if (method === "POST") {
    const { action, playerAddress } = req.body || {};

    if (action === "join") {
      if (!playerAddress) {
        return res.status(400).json({ error: "playerAddress is required to join" });
      }
      const lobby = joinLobby(id, playerAddress);
      if (!lobby) return res.status(404).json({ error: "Lobby not found" });
      return res.status(200).json(lobby);
    }

    if (action === "cancel") {
      const lobby = cancelLobby(id);
      if (!lobby) return res.status(404).json({ error: "Lobby not found" });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
