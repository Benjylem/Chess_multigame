// Lot 0 — appels API de gestion des parties (server/routes.md).
// Utilisés par le Lot 2 (lobby/historique) et le Lot 3 (plateau).

import { apiFetch } from "./client";
import type { Game } from "../types";

export function createGame(token: string, minPlayers: number, maxPlayers: number) {
  return apiFetch<Game>("/games", {
    method: "POST",
    token,
    body: { minPlayers, maxPlayers },
  });
}

export function inviteToGame(token: string, gameId: number, email: string) {
  return apiFetch<Game>(`/games/${gameId}/invite`, {
    method: "POST",
    token,
    body: { email },
  });
}

export function startGame(
  token: string,
  gameId: number,
  options?: { state?: string; currentTurnUserId?: number },
) {
  return apiFetch<Game>(`/games/${gameId}/start`, {
    method: "POST",
    token,
    body: options ?? {},
  });
}

export function getMyGames(token: string) {
  return apiFetch<Game[]>("/games/mine", { token });
}

export function markGameSeen(token: string, gameId: number) {
  return apiFetch<void>(`/games/${gameId}/seen`, { method: "POST", token });
}

export function getGame(token: string, gameId: number) {
  return apiFetch<Game>(`/games/${gameId}`, { token });
}

export function updateGameState(
  token: string,
  gameId: number,
  body:
    | { state: string; currentTurnUserId: number }
    | { state: string; ended: true; endData: string },
) {
  return apiFetch<Game>(`/games/${gameId}/state`, {
    method: "PUT",
    token,
    body,
  });
}

export function getGameHistory(token: string) {
  return apiFetch<Game[]>("/games/history", { token });
}
