import type { Plateau, Couleur, Piece, TypePiece } from "./types";

// Petit raccourci pour creer une piece sans repeter "{ type: ..., couleur: ... }" partout
function piece(type: TypePiece, couleur: Couleur): Piece {
  return { type, couleur };
}

// Une ligne de 8 cases vides
function ligneVide(): (Piece | null)[] {
  return [null, null, null, null, null, null, null, null];
}

// La ligne de pieces "nobles" (tour, cavalier, fou, dame, roi, fou, cavalier, tour)
function lignePieces(couleur: Couleur): (Piece | null)[] {
  return [
    piece("tour", couleur),
    piece("cavalier", couleur),
    piece("fou", couleur),
    piece("dame", couleur),
    piece("roi", couleur),
    piece("fou", couleur),
    piece("cavalier", couleur),
    piece("tour", couleur),
  ];
}

// Une ligne remplie de 8 pions de la meme couleur
function lignePions(couleur: Couleur): (Piece | null)[] {
  return ligneVide().map(() => piece("pion", couleur));
}

// Cree le plateau de depart d'une partie d'echecs.
// Ligne 0 = noirs en haut, ligne 7 = blancs en bas (comme un echiquier vu du cote blanc).
export function creerPlateauDeDepart(): Plateau {
  return [
    lignePieces("noir"),
    lignePions("noir"),
    ligneVide(),
    ligneVide(),
    ligneVide(),
    ligneVide(),
    lignePions("blanc"),
    lignePieces("blanc"),
  ];
}

// Renvoie la piece a une position donnee (ou null si la case est vide)
export function getPieceA(plateau: Plateau, ligne: number, colonne: number): Piece | null {
  return plateau[ligne][colonne];
}