// Appels au backend pour les parties : créer, inviter, démarrer, lire, jouer un coup, historique.
// Chaque fonction correspond à une route décrite dans server/routes.md.

import { apiFetch } from "./client";
import type { Game } from "../types";

// Crée une partie (le créateur en fait automatiquement partie) avec un nombre min/max de joueurs.
export function createGame(token: string, minPlayers: number, maxPlayers: number) {
  return apiFetch<Game>("/games", {
    method: "POST",
    token,
    body: { minPlayers, maxPlayers },
  });
}

// Invite un joueur (par son email) dans une partie qui n'a pas encore démarré.
export function inviteToGame(token: string, gameId: number, email: string) {
  return apiFetch<Game>(`/games/${gameId}/invite`, {
    method: "POST",
    token,
    body: { email },
  });
}

// Ce qu'on peut envoyer pour demarrer une partie : un etat de depart optionnel,
// et qui commence a jouer (le createur par defaut si non precise)
interface OptionsDemarrage {
  state?: string;
  currentTurnUserId?: number;
}

// Démarre la partie (réservé au créateur). On peut envoyer l'état de départ et dire qui joue en premier.
export function startGame(token: string, gameId: number, options?: OptionsDemarrage) {
  return apiFetch<Game>(`/games/${gameId}/start`, {
    method: "POST",
    token,
    body: options ?? {},
  });
}

// Liste les parties du joueur connecté : en attente, en cours, et terminées pas encore vues.
export function getMyGames(token: string) {
  return apiFetch<Game[]>("/games/mine", { token });
}

// Retire une partie terminée de la liste "Mes parties" (elle reste dans l'historique).
export function markGameSeen(token: string, gameId: number) {
  return apiFetch<void>(`/games/${gameId}/seen`, { method: "POST", token });
}

// Récupère l'état complet d'une partie (joueurs, à qui le tour, plateau, statut...).
export function getGame(token: string, gameId: number) {
  return apiFetch<Game>(`/games/${gameId}`, { token });
}

// Deux facons de mettre a jour une partie : soit on continue (on precise qui
// joue le prochain tour), soit on la termine (avec le resultat dans endData)
type CorpsMiseAJourEtat =
  | { state: string; currentTurnUserId: number }
  | { state: string; ended: true; endData: string };

// Enregistre un coup : seul le joueur dont c'est le tour peut l'appeler.
// Soit on continue la partie, soit on la termine avec un résultat.
export function updateGameState(token: string, gameId: number, body: CorpsMiseAJourEtat) {
  return apiFetch<Game>(`/games/${gameId}/state`, {
    method: "PUT",
    token,
    body,
  });
}

// Liste les parties terminées du joueur connecté, les plus récentes en premier.
export function getGameHistory(token: string) {
  return apiFetch<Game[]>("/games/history", { token });
}
