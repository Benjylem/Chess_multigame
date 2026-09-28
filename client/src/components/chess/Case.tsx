// Une case du plateau d'échecs : elle affiche sa couleur, la pièce qui est dessus,
// et un point quand un coup est possible sur cette case.

import type { Piece } from "../../game-logic/types";
import { PieceView } from "./PieceView";

interface ProprietesCase {
  piece: Piece | null;
  estClaire: boolean;
  estSelectionnee: boolean;
  estJouable: boolean;
  onClic: () => void;
}

// Affiche une case du plateau : sa couleur, la pièce dessus, un point si un coup y est possible
// (ou un anneau si ce coup capture une pièce).
export function Case({ piece, estClaire, estSelectionnee, estJouable, onClic }: ProprietesCase) {
  let couleurDeFond = "#b58863"; // case sombre par defaut
  if (estClaire) {
    couleurDeFond = "#f0d9b5";
  }
  if (estSelectionnee) {
    couleurDeFond = "#f6f669";
  }

  return (
    <div
      onClick={onClic}
      style={{
        backgroundColor: couleurDeFond,
        width: "12.5%",
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "pointer",
      }}
    >
      {piece && <PieceView piece={piece} />}
      {estJouable && !piece && (
        <div
          style={{
            position: "absolute",
            width: "25%",
            height: "25%",
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.35)",
          }}
        />
      )}
      {estJouable && piece && (
        // Une pièce adverse peut être capturée : on l'entoure d'un anneau.
        <div
          style={{
            position: "absolute",
            width: "88%",
            height: "88%",
            borderRadius: "50%",
            border: "5px solid rgba(0, 0, 0, 0.35)",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}