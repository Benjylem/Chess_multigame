import type { Piece } from "../../game-logic/types";
import { PieceView } from "./PieceView";

interface ProprietesCase {
  piece: Piece | null;
  estClaire: boolean;
  estSelectionnee: boolean;
  estJouable: boolean;
  onClic: () => void;
}

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
      {estJouable && (
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
    </div>
  );
}