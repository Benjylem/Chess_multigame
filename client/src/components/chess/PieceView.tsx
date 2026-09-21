import type { Piece, TypePiece } from "../../game-logic/types";

// Un symbole unicode different pour chaque piece, selon sa couleur
const SYMBOLES_BLANC: Record<TypePiece, string> = {
  pion: "♙",
  tour: "♖",
  cavalier: "♘",
  fou: "♗",
  dame: "♕",
  roi: "♔",
};

const SYMBOLES_NOIR: Record<TypePiece, string> = {
  pion: "♟",
  tour: "♜",
  cavalier: "♞",
  fou: "♝",
  dame: "♛",
  roi: "♚",
};

interface ProprietesPieceView {
  piece: Piece;
}

export function PieceView({ piece }: ProprietesPieceView) {
  let symbole = SYMBOLES_NOIR[piece.type];
  if (piece.couleur === "blanc") {
    symbole = SYMBOLES_BLANC[piece.type];
  }

  return <span style={{ fontSize: "2.2rem", lineHeight: 1, userSelect: "none" }}>{symbole}</span>;
}