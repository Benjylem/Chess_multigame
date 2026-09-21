import type { Couleur, Plateau, Position } from "./types";
import { getPieceA } from "./board";
import { getMouvementsPossibles } from "./deplacements";

// Cherche sur le plateau la position du roi d'une couleur donnee.
// Renvoie null si jamais il n'y a pas de roi (ne devrait pas arriver en vrai jeu).
function trouverRoi(plateau: Plateau, couleur: Couleur): Position | null {
  for (let ligne = 0; ligne < 8; ligne++) {
    for (let colonne = 0; colonne < 8; colonne++) {
      const piece = getPieceA(plateau, ligne, colonne);
      if (piece && piece.type === "roi" && piece.couleur === couleur) {
        return { ligne, colonne };
      }
    }
  }
  return null;
}

// Renvoie la couleur adverse d'une couleur donnee
function couleurAdverse(couleur: Couleur): Couleur {
  if (couleur === "blanc") {
    return "noir";
  }
  return "blanc";
}

// Le roi d'une couleur est en echec si au moins une piece adverse peut
// atteindre sa case.
export function estEnEchec(plateau: Plateau, couleur: Couleur): boolean {
  const roi = trouverRoi(plateau, couleur);
  if (!roi) {
    return false;
  }

  const adverse = couleurAdverse(couleur);

  for (let ligne = 0; ligne < 8; ligne++) {
    for (let colonne = 0; colonne < 8; colonne++) {
      const piece = getPieceA(plateau, ligne, colonne);
      if (!piece || piece.couleur !== adverse) {
        continue;
      }

      const mouvements = getMouvementsPossibles(plateau, { ligne, colonne });
      const peutPrendreLeRoi = mouvements.some(
        (mouvement) => mouvement.ligne === roi.ligne && mouvement.colonne === roi.colonne,
      );
      if (peutPrendreLeRoi) {
        return true;
      }
    }
  }

  return false;
}

// Renvoie une copie du plateau avec la piece deplacee de `depart` vers
// `arrivee` (la piece eventuellement presente sur `arrivee` est capturee).
// Ne verifie pas que le mouvement est valide : c'est fait avant, avec
// getMouvementsPossibles.
export function deplacerPiece(plateau: Plateau, depart: Position, arrivee: Position): Plateau {
  const nouveauPlateau = plateau.map((ligne) => [...ligne]);
  const piece = nouveauPlateau[depart.ligne][depart.colonne];

  nouveauPlateau[arrivee.ligne][arrivee.colonne] = piece;
  nouveauPlateau[depart.ligne][depart.colonne] = null;

  return nouveauPlateau;
}

// Les mouvements "legaux" sont les mouvements possibles qui, une fois joues,
// ne laissent pas son propre roi en echec (on ne peut pas jouer un coup qui
// expose son propre roi).
export function getMouvementsLegaux(plateau: Plateau, depart: Position): Position[] {
  const piece = getPieceA(plateau, depart.ligne, depart.colonne);
  if (!piece) {
    return [];
  }

  const mouvementsPossibles = getMouvementsPossibles(plateau, depart);

  return mouvementsPossibles.filter((arrivee) => {
    const plateauApres = deplacerPiece(plateau, depart, arrivee);
    return !estEnEchec(plateauApres, piece.couleur);
  });
}

// Est-ce que cette couleur a au moins un coup legal a jouer, toute piece confondue ?
function aUnMouvementLegal(plateau: Plateau, couleur: Couleur): boolean {
  for (let ligne = 0; ligne < 8; ligne++) {
    for (let colonne = 0; colonne < 8; colonne++) {
      const piece = getPieceA(plateau, ligne, colonne);
      if (!piece || piece.couleur !== couleur) {
        continue;
      }

      const mouvementsLegaux = getMouvementsLegaux(plateau, { ligne, colonne });
      if (mouvementsLegaux.length > 0) {
        return true;
      }
    }
  }
  return false;
}

// Echec et mat : le roi est en echec, et il n'y a aucun coup legal pour s'en sortir.
export function estEchecEtMat(plateau: Plateau, couleur: Couleur): boolean {
  return estEnEchec(plateau, couleur) && !aUnMouvementLegal(plateau, couleur);
}

// Pat (match nul) : le roi n'est pas en echec, mais il n'y a aucun coup legal a jouer.
export function estPat(plateau: Plateau, couleur: Couleur): boolean {
  return !estEnEchec(plateau, couleur) && !aUnMouvementLegal(plateau, couleur);
}
