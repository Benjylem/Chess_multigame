// Règles des échecs : échec, échec et mat, pat, coups légaux (un coup est légal s'il ne laisse
// pas son propre roi en échec), et les coups spéciaux (roque, prise en passant, promotion).
// La fonction jouerCoup applique un coup et met à jour ce qu'il faut savoir pour la suite.

import type {
  ContexteDePartie,
  Coup,
  Couleur,
  Plateau,
  Position,
  TypePiecePromotion,
} from "./types";
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
export function couleurAdverse(couleur: Couleur): Couleur {
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

// Dit si ce coup amene un pion sur la derniere rangee : dans ce cas le joueur doit choisir
// en quelle piece le pion est promu (dame, tour, fou ou cavalier).
export function estPromotion(plateau: Plateau, depart: Position, arrivee: Position): boolean {
  const piece = getPieceA(plateau, depart.ligne, depart.colonne);
  if (!piece || piece.type !== "pion") {
    return false;
  }
  return arrivee.ligne === 0 || arrivee.ligne === 7;
}

// Renvoie une copie du plateau avec la piece deplacee de `depart` vers `arrivee`
// (la piece eventuellement presente sur `arrivee` est capturee).
// Gere aussi les coups speciaux :
//   - la prise en passant (le pion capture est a cote, pas sur la case d'arrivee),
//   - le roque (la tour se deplace en meme temps que le roi),
//   - la promotion (le pion devient `promotion`, une dame par defaut).
// Ne verifie pas que le mouvement est valide : c'est fait avant, avec getMouvementsLegaux.
export function deplacerPiece(
  plateau: Plateau,
  depart: Position,
  arrivee: Position,
  promotion: TypePiecePromotion = "dame",
): Plateau {
  const nouveauPlateau = plateau.map((ligne) => [...ligne]);
  const piece = nouveauPlateau[depart.ligne][depart.colonne];
  if (!piece) {
    return nouveauPlateau;
  }

  // Prise en passant : un pion qui va en diagonale sur une case vide capture le pion
  // qui se trouve a cote de lui (sur sa ligne, dans la colonne d'arrivee).
  const caseVideEnDiagonale =
    depart.colonne !== arrivee.colonne && nouveauPlateau[arrivee.ligne][arrivee.colonne] === null;
  if (piece.type === "pion" && caseVideEnDiagonale) {
    nouveauPlateau[depart.ligne][arrivee.colonne] = null;
  }

  // Roque : le roi avance de 2 colonnes, et la tour saute de l'autre cote du roi.
  if (piece.type === "roi" && Math.abs(arrivee.colonne - depart.colonne) === 2) {
    if (arrivee.colonne === 6) {
      nouveauPlateau[depart.ligne][5] = nouveauPlateau[depart.ligne][7];
      nouveauPlateau[depart.ligne][7] = null;
    } else {
      nouveauPlateau[depart.ligne][3] = nouveauPlateau[depart.ligne][0];
      nouveauPlateau[depart.ligne][0] = null;
    }
  }

  nouveauPlateau[arrivee.ligne][arrivee.colonne] = piece;
  nouveauPlateau[depart.ligne][depart.colonne] = null;

  // Promotion : un pion arrive au bout du plateau, il devient une autre piece.
  if (piece.type === "pion" && (arrivee.ligne === 0 || arrivee.ligne === 7)) {
    nouveauPlateau[arrivee.ligne][arrivee.colonne] = { type: promotion, couleur: piece.couleur };
  }

  return nouveauPlateau;
}

// La ligne de fond d'une couleur : la ligne ou se trouvent son roi et ses tours au depart.
function getLigneDeFond(couleur: Couleur): number {
  if (couleur === "blanc") {
    return 7;
  }
  return 0;
}

// Le roi de cette couleur serait-il en securite (pas en echec) s'il se trouvait sur `caseTestee` ?
// Sert a verifier les cases que le roi traverse pendant un roque.
function roiEstEnSecuriteSur(plateau: Plateau, couleur: Couleur, caseTestee: Position): boolean {
  const ligne = getLigneDeFond(couleur);
  const plateauTest = plateau.map((uneLigne) => [...uneLigne]);
  plateauTest[ligne][4] = null;
  plateauTest[caseTestee.ligne][caseTestee.colonne] = { type: "roi", couleur };
  return !estEnEchec(plateauTest, couleur);
}

// Verifie les conditions d'un roque d'un cote :
//   - la tour est bien dans son coin,
//   - toutes les cases entre le roi et la tour sont vides,
//   - le roi ne traverse aucune case (ni n'arrive sur une case) ou il serait en echec.
function roquePossible(
  plateau: Plateau,
  couleur: Couleur,
  colonneDeLaTour: number,
  colonnesQuiDoiventEtreVides: number[],
  colonnesTraverseesParLeRoi: number[],
): boolean {
  const ligne = getLigneDeFond(couleur);

  const tour = getPieceA(plateau, ligne, colonneDeLaTour);
  if (!tour || tour.type !== "tour" || tour.couleur !== couleur) {
    return false;
  }

  for (const colonne of colonnesQuiDoiventEtreVides) {
    if (getPieceA(plateau, ligne, colonne)) {
      return false;
    }
  }

  for (const colonne of colonnesTraverseesParLeRoi) {
    if (!roiEstEnSecuriteSur(plateau, couleur, { ligne, colonne })) {
      return false;
    }
  }

  return true;
}

// Renvoie les cases d'arrivee du roi pour les roques possibles (colonne 6 = petit roque,
// colonne 2 = grand roque). Le roque est interdit si le roi est en echec.
function getMouvementsRoque(plateau: Plateau, depart: Position, contexte: ContexteDePartie): Position[] {
  const roi = getPieceA(plateau, depart.ligne, depart.colonne);
  if (!roi || roi.type !== "roi") {
    return [];
  }

  const ligne = getLigneDeFond(roi.couleur);
  if (depart.ligne !== ligne || depart.colonne !== 4) {
    return [];
  }
  if (estEnEchec(plateau, roi.couleur)) {
    return [];
  }

  let petitRoquePermis = contexte.droitsDeRoque.noirPetit;
  let grandRoquePermis = contexte.droitsDeRoque.noirGrand;
  if (roi.couleur === "blanc") {
    petitRoquePermis = contexte.droitsDeRoque.blancPetit;
    grandRoquePermis = contexte.droitsDeRoque.blancGrand;
  }

  const mouvements: Position[] = [];
  if (petitRoquePermis && roquePossible(plateau, roi.couleur, 7, [5, 6], [5, 6])) {
    mouvements.push({ ligne, colonne: 6 });
  }
  if (grandRoquePermis && roquePossible(plateau, roi.couleur, 0, [1, 2, 3], [3, 2])) {
    mouvements.push({ ligne, colonne: 2 });
  }
  return mouvements;
}

// Les mouvements "legaux" sont les mouvements possibles qui, une fois joues,
// ne laissent pas son propre roi en echec (on ne peut pas jouer un coup qui
// expose son propre roi). Pour un roi, on ajoute aussi les roques permis.
export function getMouvementsLegaux(
  plateau: Plateau,
  depart: Position,
  contexte: ContexteDePartie,
): Position[] {
  const piece = getPieceA(plateau, depart.ligne, depart.colonne);
  if (!piece) {
    return [];
  }

  const mouvementsPossibles = getMouvementsPossibles(plateau, depart, contexte.casePriseEnPassant);

  const mouvementsLegaux = mouvementsPossibles.filter((arrivee) => {
    const plateauApres = deplacerPiece(plateau, depart, arrivee);
    return !estEnEchec(plateauApres, piece.couleur);
  });

  if (piece.type === "roi") {
    mouvementsLegaux.push(...getMouvementsRoque(plateau, depart, contexte));
  }

  return mouvementsLegaux;
}

// Calcule le contexte apres un coup : quels roques restent permis, et s'il y a une prise en passant possible.
// `plateauAvant` est le plateau AVANT que le coup soit joue.
function calculerNouveauContexte(
  plateauAvant: Plateau,
  coup: Coup,
  contexte: ContexteDePartie,
): ContexteDePartie {
  const piece = getPieceA(plateauAvant, coup.depart.ligne, coup.depart.colonne);
  const droits = { ...contexte.droitsDeRoque };

  // Quand le roi bouge, cette couleur ne peut plus jamais roquer.
  if (piece && piece.type === "roi") {
    if (piece.couleur === "blanc") {
      droits.blancPetit = false;
      droits.blancGrand = false;
    } else {
      droits.noirPetit = false;
      droits.noirGrand = false;
    }
  }

  // Quand une tour quitte son coin (ou est capturee dans son coin), le roque de ce cote n'est plus permis.
  for (const caseTouchee of [coup.depart, coup.arrivee]) {
    if (caseTouchee.ligne === 7 && caseTouchee.colonne === 0) {
      droits.blancGrand = false;
    }
    if (caseTouchee.ligne === 7 && caseTouchee.colonne === 7) {
      droits.blancPetit = false;
    }
    if (caseTouchee.ligne === 0 && caseTouchee.colonne === 0) {
      droits.noirGrand = false;
    }
    if (caseTouchee.ligne === 0 && caseTouchee.colonne === 7) {
      droits.noirPetit = false;
    }
  }

  // Un pion qui avance de 2 cases peut etre pris "en passant" au coup suivant,
  // sur la case qu'il vient de traverser.
  let casePriseEnPassant: Position | null = null;
  if (piece && piece.type === "pion" && Math.abs(coup.arrivee.ligne - coup.depart.ligne) === 2) {
    casePriseEnPassant = {
      ligne: (coup.depart.ligne + coup.arrivee.ligne) / 2,
      colonne: coup.depart.colonne,
    };
  }

  return { droitsDeRoque: droits, casePriseEnPassant };
}

// Joue un coup : renvoie le nouveau plateau et le nouveau contexte (roques permis, prise en passant).
// C'est LA fonction a utiliser pour jouer un coup : elle gere le roque, la prise en passant et la promotion.
export function jouerCoup(
  plateau: Plateau,
  contexte: ContexteDePartie,
  coup: Coup,
): { plateau: Plateau; contexte: ContexteDePartie } {
  return {
    plateau: deplacerPiece(plateau, coup.depart, coup.arrivee, coup.promotion),
    contexte: calculerNouveauContexte(plateau, coup, contexte),
  };
}

// Est-ce que cette couleur a au moins un coup legal a jouer, toute piece confondue ?
function aUnMouvementLegal(plateau: Plateau, couleur: Couleur, contexte: ContexteDePartie): boolean {
  for (let ligne = 0; ligne < 8; ligne++) {
    for (let colonne = 0; colonne < 8; colonne++) {
      const piece = getPieceA(plateau, ligne, colonne);
      if (!piece || piece.couleur !== couleur) {
        continue;
      }

      const mouvementsLegaux = getMouvementsLegaux(plateau, { ligne, colonne }, contexte);
      if (mouvementsLegaux.length > 0) {
        return true;
      }
    }
  }
  return false;
}

// Echec et mat : le roi est en echec, et il n'y a aucun coup legal pour s'en sortir.
export function estEchecEtMat(plateau: Plateau, couleur: Couleur, contexte: ContexteDePartie): boolean {
  return estEnEchec(plateau, couleur) && !aUnMouvementLegal(plateau, couleur, contexte);
}

// Pat (match nul) : le roi n'est pas en echec, mais il n'y a aucun coup legal a jouer.
export function estPat(plateau: Plateau, couleur: Couleur, contexte: ContexteDePartie): boolean {
  return !estEnEchec(plateau, couleur) && !aUnMouvementLegal(plateau, couleur, contexte);
}

// Match nul par materiel insuffisant : impossible de faire echec et mat avec ce qui reste
// (roi contre roi, ou roi + un seul fou ou un seul cavalier contre roi).
export function estMaterielInsuffisant(plateau: Plateau): boolean {
  let piecesAutresQueLesRois = 0;

  for (const ligne of plateau) {
    for (const caseDuPlateau of ligne) {
      if (!caseDuPlateau || caseDuPlateau.type === "roi") {
        continue;
      }
      if (caseDuPlateau.type !== "fou" && caseDuPlateau.type !== "cavalier") {
        return false;
      }
      piecesAutresQueLesRois += 1;
    }
  }

  return piecesAutresQueLesRois <= 1;
}
