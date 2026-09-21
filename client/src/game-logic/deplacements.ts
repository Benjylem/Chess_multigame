import type { Deplacement, Piece, Plateau, Position } from "./types";
import { getPieceA } from "./board";

// Verifie qu'une case existe bien sur un plateau de 8x8
function estSurLePlateau(ligne: number, colonne: number): boolean {
  return ligne >= 0 && ligne <= 7 && colonne >= 0 && colonne <= 7;
}

// Les 4 directions "droites" (utilisees par la tour, et la dame)
const DIRECTIONS_TOUR: Deplacement[] = [
  { dLigne: -1, dColonne: 0 }, // vers le haut
  { dLigne: 1, dColonne: 0 }, // vers le bas
  { dLigne: 0, dColonne: -1 }, // vers la gauche
  { dLigne: 0, dColonne: 1 }, // vers la droite
];

// Les 4 directions "diagonales" (utilisees par le fou, et la dame)
const DIRECTIONS_FOU: Deplacement[] = [
  { dLigne: -1, dColonne: -1 },
  { dLigne: -1, dColonne: 1 },
  { dLigne: 1, dColonne: -1 },
  { dLigne: 1, dColonne: 1 },
];

// Les 8 sauts possibles du cavalier (en "L")
const SAUTS_CAVALIER: Deplacement[] = [
  { dLigne: -2, dColonne: -1 },
  { dLigne: -2, dColonne: 1 },
  { dLigne: -1, dColonne: -2 },
  { dLigne: -1, dColonne: 2 },
  { dLigne: 1, dColonne: -2 },
  { dLigne: 1, dColonne: 2 },
  { dLigne: 2, dColonne: -1 },
  { dLigne: 2, dColonne: 1 },
];

// Pour les pieces qui "glissent" sur le plateau (tour, fou, dame) : on avance
// case par case dans une direction, jusqu'a sortir du plateau, tomber sur une
// piece alliee (on s'arrete avant), ou tomber sur une piece adverse (on peut la
// prendre, mais on s'arrete apres).
function getMouvementsGlissants(
  plateau: Plateau,
  depart: Position,
  piece: Piece,
  directions: Deplacement[],
): Position[] {
  const mouvements: Position[] = [];

  for (const direction of directions) {
    let ligne = depart.ligne + direction.dLigne;
    let colonne = depart.colonne + direction.dColonne;

    while (estSurLePlateau(ligne, colonne)) {
      const pieceRencontree = getPieceA(plateau, ligne, colonne);

      if (!pieceRencontree) {
        // case vide : on peut y aller, et continuer plus loin dans la direction
        mouvements.push({ ligne, colonne });
      } else {
        // case occupee : si c'est l'adversaire on peut le capturer, sinon non.
        // Dans les deux cas, on ne peut pas aller plus loin dans cette direction.
        if (pieceRencontree.couleur !== piece.couleur) {
          mouvements.push({ ligne, colonne });
        }
        break;
      }

      ligne += direction.dLigne;
      colonne += direction.dColonne;
    }
  }

  return mouvements;
}

// Pour les pieces qui font un seul pas fixe (cavalier, roi) : on regarde juste
// chaque destination possible, sans se soucier de ce qu'il y a entre les deux.
function getMouvementsFixes(
  plateau: Plateau,
  depart: Position,
  piece: Piece,
  deplacements: Deplacement[],
): Position[] {
  const mouvements: Position[] = [];

  for (const deplacement of deplacements) {
    const ligne = depart.ligne + deplacement.dLigne;
    const colonne = depart.colonne + deplacement.dColonne;

    if (!estSurLePlateau(ligne, colonne)) {
      continue;
    }

    const pieceRencontree = getPieceA(plateau, ligne, colonne);
    // on peut aller sur une case vide, ou prendre une piece adverse
    if (!pieceRencontree || pieceRencontree.couleur !== piece.couleur) {
      mouvements.push({ ligne, colonne });
    }
  }

  return mouvements;
}

// Le pion est le cas particulier : il avance tout droit (sans capturer), et
// capture uniquement en diagonale. Il avance de 2 cases seulement depuis sa
// case de depart. (La prise en passant et la promotion seront geres a part.)
function getMouvementsPion(plateau: Plateau, depart: Position, piece: Piece): Position[] {
  const mouvements: Position[] = [];

  // Les blancs avancent vers le haut du plateau (ligne qui diminue),
  // les noirs avancent vers le bas (ligne qui augmente).
  let direction: number;
  let ligneDeDepart: number;
  if (piece.couleur === "blanc") {
    direction = -1;
    ligneDeDepart = 6;
  } else {
    direction = 1;
    ligneDeDepart = 1;
  }

  const uneCaseDevant = depart.ligne + direction;

  // avancer d'une case, seulement si elle est vide
  if (estSurLePlateau(uneCaseDevant, depart.colonne) && !getPieceA(plateau, uneCaseDevant, depart.colonne)) {
    mouvements.push({ ligne: uneCaseDevant, colonne: depart.colonne });

    // avancer de 2 cases depuis la ligne de depart, si les 2 cases sont vides
    const deuxCasesDevant = depart.ligne + direction * 2;
    if (
      depart.ligne === ligneDeDepart &&
      estSurLePlateau(deuxCasesDevant, depart.colonne) &&
      !getPieceA(plateau, deuxCasesDevant, depart.colonne)
    ) {
      mouvements.push({ ligne: deuxCasesDevant, colonne: depart.colonne });
    }
  }

  // captures en diagonale, seulement si une piece adverse s'y trouve
  for (const dColonne of [-1, 1]) {
    const colonneCapture = depart.colonne + dColonne;
    if (!estSurLePlateau(uneCaseDevant, colonneCapture)) {
      continue;
    }

    const pieceAdverse = getPieceA(plateau, uneCaseDevant, colonneCapture);
    if (pieceAdverse && pieceAdverse.couleur !== piece.couleur) {
      mouvements.push({ ligne: uneCaseDevant, colonne: colonneCapture });
    }
  }

  return mouvements;
}

// Fonction principale : renvoie toutes les cases ou peut se deplacer la piece
// situee a `depart`. Ne verifie pas encore si ce mouvement mettrait son propre
// roi en echec (ce sera fait dans regles.ts).
export function getMouvementsPossibles(plateau: Plateau, depart: Position): Position[] {
  const piece = getPieceA(plateau, depart.ligne, depart.colonne);
  if (!piece) {
    return [];
  }

  switch (piece.type) {
    case "pion":
      return getMouvementsPion(plateau, depart, piece);
    case "tour":
      return getMouvementsGlissants(plateau, depart, piece, DIRECTIONS_TOUR);
    case "fou":
      return getMouvementsGlissants(plateau, depart, piece, DIRECTIONS_FOU);
    case "dame":
      return getMouvementsGlissants(plateau, depart, piece, [...DIRECTIONS_TOUR, ...DIRECTIONS_FOU]);
    case "cavalier":
      return getMouvementsFixes(plateau, depart, piece, SAUTS_CAVALIER);
    case "roi":
      return getMouvementsFixes(plateau, depart, piece, [...DIRECTIONS_TOUR, ...DIRECTIONS_FOU]);
  }
}
