// Ce que l'on enregistre dans le backend pour une partie d'échecs.
// Le serveur ne comprend pas les échecs : il garde juste deux textes (state et endData).
// On y range du JSON, et ce fichier sert à l'écrire et à le relire proprement.

import type { Couleur, Plateau } from "./types";

// Contenu du champ `state` : le plateau, qui joue quelle couleur, et l'heure du dernier coup.
export interface EtatPartie {
  plateau: Plateau;
  // Pour chaque id de joueur, la couleur qu'il joue.
  couleurs: Record<number, Couleur>;
  // Heure du dernier coup (en millisecondes), pour repérer une partie abandonnée.
  dernierCoupLe: number;
}

// Comment une partie peut se terminer.
export type Resultat = "echecEtMat" | "pat" | "abandon" | "inactivite";

// Contenu du champ `endData` : comment la partie s'est terminée, et qui a gagné (null si match nul).
export interface DonneesDeFin {
  resultat: Resultat;
  gagnantId: number | null;
}

// Renvoie le nouvel état de la partie après un coup : même partie, nouveau plateau, heure du coup mise à jour.
export function creerEtatApresCoup(etat: EtatPartie, nouveauPlateau: Plateau): EtatPartie {
  return { ...etat, plateau: nouveauPlateau, dernierCoupLe: Date.now() };
}

// Relit le champ `state` du backend. Renvoie null s'il est vide ou illisible.
export function lireEtat(state: string | null): EtatPartie | null {
  if (!state) {
    return null;
  }
  try {
    return JSON.parse(state) as EtatPartie;
  } catch {
    return null;
  }
}

// Relit le champ `endData` du backend. Renvoie null s'il est vide ou illisible.
export function lireDonneesDeFin(endData: string | null): DonneesDeFin | null {
  if (!endData) {
    return null;
  }
  try {
    return JSON.parse(endData) as DonneesDeFin;
  } catch {
    return null;
  }
}

// Le résultat en un mot, du point de vue du joueur : "Victoire", "Défaite" ou "Nulle".
export function getLibelleResultat(donnees: DonneesDeFin | null, monId: number): string {
  if (!donnees || donnees.gagnantId === null) {
    return "Nulle";
  }
  if (donnees.gagnantId === monId) {
    return "Victoire";
  }
  return "Défaite";
}

// Le message de fin de partie affiché au joueur, selon comment elle s'est terminée.
export function getMessageDeFin(donnees: DonneesDeFin | null, monId: number): string {
  if (!donnees) {
    return "Partie terminée.";
  }
  if (donnees.resultat === "pat") {
    return "Partie nulle : pat (le roi n'est pas en échec mais aucun coup n'est possible).";
  }
  if (donnees.resultat === "inactivite") {
    return "Partie terminée : plus personne n'a joué depuis trop longtemps.";
  }

  const aGagne = donnees.gagnantId === monId;
  if (donnees.resultat === "abandon") {
    if (aGagne) {
      return "Ton adversaire a abandonné : tu as gagné !";
    }
    return "Tu as abandonné : tu as perdu.";
  }

  if (aGagne) {
    return "Échec et mat : tu as gagné !";
  }
  return "Échec et mat : tu as perdu.";
}
