// Le plateau d'échecs : affiche les 64 cases, les pièces capturées sur les côtés,
// et gère les clics du joueur (choisir une pièce, voir ses coups, jouer un coup).
// Quand un pion arrive au bout du plateau, il propose de choisir la pièce de promotion.
// Il ne connaît pas le réseau : c'est la page GamePage qui envoie les coups au serveur.

import { useState } from "react";
import type {
  ContexteDePartie,
  Coup,
  Couleur,
  Piece,
  Plateau as PlateauDuJeu,
  Position,
  TypePiece,
  TypePiecePromotion,
} from "../../game-logic/types";
import { getPieceA } from "../../game-logic/board";
import { estPromotion, getMouvementsLegaux } from "../../game-logic/regles";
import { Case } from "./Case";
import { PieceView } from "./PieceView";

interface ProprietesPlateau {
  plateau: PlateauDuJeu;
  // Ce qu'il faut savoir en plus du plateau pour les coups speciaux
  // (roques encore permis, prise en passant possible).
  contexte: ContexteDePartie;
  // La couleur qui a le droit de jouer en ce moment. Le Plateau ne selectionne
  // que les pieces de cette couleur : c'est au parent (GamePage, via
  // isYourTurn/currentTurnUserId venant du backend) de dire qui doit jouer.
  couleurQuiJoue: Couleur;
  // Si false, le plateau est juste affiche : aucun clic n'est pris en compte.
  // Utilise quand ce n'est pas le tour du joueur qui regarde l'ecran.
  interactif: boolean;
  // De quel cote regarde le joueur : "blanc" affiche les blancs en bas (vue
  // habituelle), "noir" retourne le plateau pour que les noirs soient en bas.
  orientation: Couleur;
  // Appelee avec le coup joue (case de depart, case d'arrivee, et promotion si besoin).
  // Ce composant ne sait pas gerer le tour au-dela de bloquer les pieces de la
  // mauvaise couleur : c'est au parent de jouer le coup et de faire passer le tour.
  onCoupJoue: (coup: Coup) => void;
}

// Les pieces proposees quand un pion est promu.
const CHOIX_DE_PROMOTION: TypePiecePromotion[] = ["dame", "tour", "fou", "cavalier"];

// Dit si deux positions désignent la même case.
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
// Un pion promu n'est pas capture : s'il y a plus de pieces que prevu (ex: 2 dames),
// c'est que des pions ont ete promus, donc on les retire des pions "manquants".
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

  let pionsPromus = 0;
  for (const type of ["tour", "cavalier", "fou", "dame"] as TypePiece[]) {
    if (restantes[type] > COMPOSITION_DEPART[type]) {
      pionsPromus += restantes[type] - COMPOSITION_DEPART[type];
    }
  }

  const capturees: Piece[] = [];
  for (const type of Object.keys(COMPOSITION_DEPART) as TypePiece[]) {
    let nombreCapture = COMPOSITION_DEPART[type] - restantes[type];
    if (type === "pion") {
      nombreCapture -= pionsPromus;
    }
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
    <div className="pieces-capturees">
      {pieces.map((piece, index) => (
        <PieceView key={index} piece={piece} />
      ))}
    </div>
  );
}

// Affiche le plateau et gère les clics : choisir une pièce, voir ses coups possibles, jouer un coup.
export function Plateau({
  plateau,
  contexte,
  couleurQuiJoue,
  interactif,
  orientation,
  onCoupJoue,
}: ProprietesPlateau) {
  const [caseSelectionnee, setCaseSelectionnee] = useState<Position | null>(null);
  const [coupsPossibles, setCoupsPossibles] = useState<Position[]>([]);
  // Un pion vient d'arriver au bout du plateau : on attend que le joueur choisisse sa nouvelle piece.
  const [promotionEnAttente, setPromotionEnAttente] = useState<{ depart: Position; arrivee: Position } | null>(
    null,
  );

  // Annule la sélection en cours (plus de pièce choisie, plus de coups affichés).
  function deselectionner() {
    setCaseSelectionnee(null);
    setCoupsPossibles([]);
  }

  // Choisit la pièce sur cette case et calcule les coups qu'elle a le droit de jouer.
  function selectionner(position: Position) {
    setCaseSelectionnee(position);
    setCoupsPossibles(getMouvementsLegaux(plateau, position, contexte));
  }

  // Le joueur a choisi en quelle piece son pion est promu : on joue le coup.
  function choisirPromotion(promotion: TypePiecePromotion) {
    if (!promotionEnAttente) {
      return;
    }
    onCoupJoue({ depart: promotionEnAttente.depart, arrivee: promotionEnAttente.arrivee, promotion });
    setPromotionEnAttente(null);
  }

  // Réagit à un clic sur une case : joue le coup si c'est une case possible, sinon choisit la pièce cliquée.
  function surClicCase(position: Position) {
    if (!interactif || promotionEnAttente) {
      return;
    }

    const piece = getPieceA(plateau, position.ligne, position.colonne);

    if (caseSelectionnee) {
      const estUnCoupPossible = coupsPossibles.some((coup) => estMemeCase(coup, position));
      if (estUnCoupPossible) {
        if (estPromotion(plateau, caseSelectionnee, position)) {
          setPromotionEnAttente({ depart: caseSelectionnee, arrivee: position });
        } else {
          onCoupJoue({ depart: caseSelectionnee, arrivee: position });
        }
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

  // En vue normale on parcourt les lignes/colonnes de 0 a 7 (blancs en bas).
  // En vue retournee (orientation "noir"), on les parcourt de 7 a 0 : ce qui
  // etait en bas se retrouve en haut et inversement.
  const ordreLignes = [0, 1, 2, 3, 4, 5, 6, 7];
  const ordreColonnes = [0, 1, 2, 3, 4, 5, 6, 7];
  if (orientation === "noir") {
    ordreLignes.reverse();
    ordreColonnes.reverse();
  }

  const lignes = [];
  for (const ligne of ordreLignes) {
    const cases = [];
    for (const colonne of ordreColonnes) {
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
    <div>
      <div className="plateau-zone">
        <PiecesCapturees pieces={getPiecesCapturees(plateau, "blanc")} />
        <div className="plateau-grille">{lignes}</div>
        <PiecesCapturees pieces={getPiecesCapturees(plateau, "noir")} />
      </div>

      {promotionEnAttente && (
        <div className="promotion" role="dialog" aria-label="Choix de la promotion">
          <p>Ton pion arrive au bout du plateau : choisis sa nouvelle pièce.</p>
          <div className="promotion-choix">
            {CHOIX_DE_PROMOTION.map((type) => (
              <button key={type} onClick={() => choisirPromotion(type)} aria-label={`Promouvoir en ${type}`}>
                <PieceView piece={{ type, couleur: couleurQuiJoue }} />
              </button>
            ))}
          </div>
          <button onClick={() => setPromotionEnAttente(null)}>Annuler</button>
        </div>
      )}
    </div>
  );
}
