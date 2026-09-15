// Types partagés côté front, calqués sur l'API du backend (voir server/routes.md)

export interface User {
  id: number;
  email: string;
  profilePicture?: string;
}

export type GameStatus = "pending" | "started" | "ended";

export interface Game {
  id: number;
  creatorId: number;
  minPlayers: number;
  maxPlayers: number;
  status: GameStatus;
  players: User[];
  currentTurnUserId: number | null;
  isYourTurn: boolean;
  // Le backend stocke `state`/`endData` comme des chaînes JSON opaques.
  // Le front est responsable de les sérialiser/désérialiser (JSON.stringify/parse).
  state: string | null;
  endData: string | null;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
}
