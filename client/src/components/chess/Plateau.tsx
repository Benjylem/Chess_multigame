import { useState } from "react";
import type { Couleur, Piece, Plateau as PlateauDuJeu, Position, TypePiece } from "../../game-logic/types";
import { getPieceA } from "../../game-logic/board";
import { deplacerPiece, getMouvementsLegaux } from "../../game-logic/regles";
import { Case } from "./Case";
import { PieceView } from "./PieceView";

interface ProprietesPlateau {
  plateau: PlateauDuJeu;
  // La couleur qui a le droit de jouer en ce moment. Le Plateau ne selectionne
  // que les pieces de cette couleur : c'est au parent (GamePage, via
  // isYourTurn/currentTurnUserId venant du backend) de dire qui doit jouer.
  couleurQuiJoue: Couleur;
  // Si false, le plateau est juste affiche : aucun clic n'est pris en compte.
  // Utilise quand ce n'est pas le tour du joueur qui regarde l'ecran.
  interactif: boolean;
  // Appelee avec le nouveau plateau, a chaque fois qu'un coup est joue.
  // Ce composant ne sait pas gerer le tour au-dela de bloquer les pieces de la
  // mauvaise couleur : c'est au parent de faire passer le tour au joueur suivant.
  onCoupJoue: (nouveauPlateau: PlateauDuJeu) => void;
}

function estMemeCase(a: Position, b: Position): boolean {
  return a.ligne === b.ligne && a.colonne === b.colonne;
}

// Nombre de chaque piece present dans le camp de depart d'un joueur.
const COMPOSITION_DEPART: Record<TypePiece, number> = {
  pion: 8,
  tour: 2,
  cavalier: 2,
  fou: 2,
  dame: 1,
  roi: 1,
};

// Les pieces d'une couleur qui ne sont plus sur le plateau : la difference
// entre la composition de depart et ce qui reste. Calcule directement depuis
// le plateau actuel (pas d'etat separe a tenir a jour), donc ca marche aussi
// bien pour nos propres coups que pour ceux recuperes du serveur.
function getPiecesCapturees(plateau: PlateauDuJeu, couleur: Couleur): Piece[] {
  const restantes: Record<TypePiece, number> = {
    pion: 0,
    tour: 0,
    cavalier: 0,
    fou: 0,
    dame: 0,
    roi: 0,
  };

  for (const ligne of plateau) {
    for (const caseDuPlateau of ligne) {
      if (caseDuPlateau && caseDuPlateau.couleur === couleur) {
        restantes[caseDuPlateau.type] += 1;
      }
    }
  }

  const capturees: Piece[] = [];
  for (const type of Object.keys(COMPOSITION_DEPART) as TypePiece[]) {
    const nombreCapture = COMPOSITION_DEPART[type] - restantes[type];
    for (let i = 0; i < nombreCapture; i++) {
      capturees.push({ type, couleur });
    }
  }
  return capturees;
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

export function Plateau({ plateau, couleurQuiJoue, interactif, onCoupJoue }: ProprietesPlateau) {
  const [caseSelectionnee, setCaseSelectionnee] = useState<Position | null>(null);
  const [coupsPossibles, setCoupsPossibles] = useState<Position[]>([]);

  function deselectionner() {
    setCaseSelectionnee(null);
    setCoupsPossibles([]);
  }

  function selectionner(position: Position) {
    setCaseSelectionnee(position);
    setCoupsPossibles(getMouvementsLegaux(plateau, position));
  }

  function surClicCase(position: Position) {
    if (!interactif) {
      return;
    }

    const piece = getPieceA(plateau, position.ligne, position.colonne);

    if (caseSelectionnee) {
      const estUnCoupPossible = coupsPossibles.some((coup) => estMemeCase(coup, position));
      if (estUnCoupPossible) {
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
      <PiecesCapturees pieces={getPiecesCapturees(plateau, "blanc")} />
      <div style={{ width: "480px", maxWidth: "100%" }}>{lignes}</div>
      <PiecesCapturees pieces={getPiecesCapturees(plateau, "noir")} />
    </div>
  );
}
