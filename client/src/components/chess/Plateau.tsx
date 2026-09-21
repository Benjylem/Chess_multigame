import { useState } from "react";
import type { Couleur, Piece, Plateau as PlateauDuJeu, Position } from "../../game-logic/types";
import { getPieceA } from "../../game-logic/board";
import { deplacerPiece, getMouvementsLegaux } from "../../game-logic/regles";
import { Case } from "./Case";
import { PieceView } from "./PieceView";

interface ProprietesPlateau {
  plateau: PlateauDuJeu;
  // La couleur qui a le droit de jouer en ce moment. Le Plateau ne selectionne
  // que les pieces de cette couleur : c'est au parent (plus tard GamePage, via
  // isYourTurn/currentTurnUserId venant du backend) de dire qui doit jouer.
  couleurQuiJoue: Couleur;
  // Appelee avec le nouveau plateau, a chaque fois qu'un coup est joue.
  // Ce composant ne sait pas gerer le tour au-dela de bloquer les pieces de la
  // mauvaise couleur : c'est au parent de faire passer le tour au joueur suivant.
  onCoupJoue: (nouveauPlateau: PlateauDuJeu) => void;
}

function estMemeCase(a: Position, b: Position): boolean {
  return a.ligne === b.ligne && a.colonne === b.colonne;
}

// Petite liste de symboles pour les pieces capturees d'une couleur, affichee a
// cote du plateau. Reutilise simplement PieceView, sans case autour.
function PiecesCapturees({ pieces }: { pieces: Piece[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: "60px", gap: "2px" }}>
      {pieces.map((piece, index) => (
        <PieceView key={index} piece={piece} />
      ))}
    </div>
  );
}

export function Plateau({ plateau, couleurQuiJoue, onCoupJoue }: ProprietesPlateau) {
  const [caseSelectionnee, setCaseSelectionnee] = useState<Position | null>(null);
  const [coupsPossibles, setCoupsPossibles] = useState<Position[]>([]);
  const [piecesBlanchesCapturees, setPiecesBlanchesCapturees] = useState<Piece[]>([]);
  const [piecesNoiresCapturees, setPiecesNoiresCapturees] = useState<Piece[]>([]);

  function deselectionner() {
    setCaseSelectionnee(null);
    setCoupsPossibles([]);
  }

  function selectionner(position: Position) {
    setCaseSelectionnee(position);
    setCoupsPossibles(getMouvementsLegaux(plateau, position));
  }

  function surClicCase(position: Position) {
    const piece = getPieceA(plateau, position.ligne, position.colonne);

    if (caseSelectionnee) {
      const estUnCoupPossible = coupsPossibles.some((coup) => estMemeCase(coup, position));
      if (estUnCoupPossible) {
        // La piece qui occupe la case d'arrivee, s'il y en a une, va etre
        // capturee par ce coup : on la garde avant de jouer le coup.
        const pieceCapturee = getPieceA(plateau, position.ligne, position.colonne);
        if (pieceCapturee) {
          if (pieceCapturee.couleur === "blanc") {
            setPiecesBlanchesCapturees([...piecesBlanchesCapturees, pieceCapturee]);
          } else {
            setPiecesNoiresCapturees([...piecesNoiresCapturees, pieceCapturee]);
          }
        }

        const nouveauPlateau = deplacerPiece(plateau, caseSelectionnee, position);
        onCoupJoue(nouveauPlateau);
        deselectionner();
        return;
      }
    }

    // On ne peut selectionner que ses propres pieces, seulement quand c'est son tour
    if (piece && piece.couleur === couleurQuiJoue) {
      selectionner(position);
    } else {
      deselectionner();
    }
  }

  const lignes = [];
  for (let ligne = 0; ligne < 8; ligne++) {
    const cases = [];
    for (let colonne = 0; colonne < 8; colonne++) {
      const position: Position = { ligne, colonne };
      const piece = getPieceA(plateau, ligne, colonne);

      const estClaire = (ligne + colonne) % 2 === 0;

      let estSelectionnee = false;
      if (caseSelectionnee) {
        estSelectionnee = estMemeCase(caseSelectionnee, position);
      }

      const estJouable = coupsPossibles.some((coup) => estMemeCase(coup, position));

      cases.push(
        <Case
          key={`${ligne}-${colonne}`}
          piece={piece}
          estClaire={estClaire}
          estSelectionnee={estSelectionnee}
          estJouable={estJouable}
          onClic={() => surClicCase(position)}
        />,
      );
    }
    lignes.push(
      <div key={ligne} style={{ display: "flex" }}>
        {cases}
      </div>,
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
      <PiecesCapturees pieces={piecesBlanchesCapturees} />
      <div style={{ width: "480px", maxWidth: "100%" }}>{lignes}</div>
      <PiecesCapturees pieces={piecesNoiresCapturees} />
    </div>
  );
}