// Affichage d'une pièce d'échecs sous forme de symbole (♜ ♞ ♚...).
// Les deux couleurs utilisent les mêmes symboles pleins : c'est la couleur du texte
// (voir App.css, classes piece-blanc et piece-noir) qui distingue les blancs des noirs.

import type { Piece, TypePiece } from "../../game-logic/types";

// Le symbole unicode de chaque type de pièce.
// (Le ︎ après le pion demande un affichage en texte et non en émoji.)
const SYMBOLES: Record<TypePiece, string> = {
  pion: "♟︎",
  tour: "♜",
  cavalier: "♞",
  fou: "♝",
  dame: "♛",
  roi: "♚",
};

interface ProprietesPieceView {
  piece: Piece;
}

// Affiche une pièce sous forme de symbole (♟, ♞...) selon son type, coloré selon sa couleur.
export function PieceView({ piece }: ProprietesPieceView) {
  return <span className={`piece piece-${piece.couleur}`}>{SYMBOLES[piece.type]}</span>;
}
