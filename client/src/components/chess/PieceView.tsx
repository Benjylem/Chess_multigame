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

  const estBlanche = piece.couleur === "blanc";

  return (
    <span
      style={{
        fontSize: "2.2rem",
        lineHeight: 1,
        userSelect: "none",
        color: estBlanche ? "#ffffff" : "#1a1a1a",
        textShadow: estBlanche
          ? "0 1px 2px rgba(156, 154, 154, 0.8)"
          : "0 1px 1px rgba(255, 255, 255, 0.35)",
      }}
    >
      {symbole}
    </span>
  );
}