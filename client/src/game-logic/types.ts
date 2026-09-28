// Une couleur : soit les blancs, soit les noirs
export type Couleur = "blanc" | "noir";

// Les 6 types de pieces aux echecs
export type TypePiece = "pion" | "tour" | "cavalier" | "fou" | "dame" | "roi";

// Une piece = juste son type + sa couleur
export interface Piece {
  type: TypePiece;
  couleur: Couleur;
}

// Le plateau est un tableau de 8 lignes, chaque ligne contient 8 colonnes.
// Une case vide vaut `null`, sinon elle contient une Piece.
// plateau[0] = ligne du haut (les noirs au depart), plateau[7] = ligne du bas (les blancs).
export type Plateau = (Piece | null)[][];

// Une case du plateau, reperee par sa ligne (0-7) et sa colonne (0-7)
export interface Position {
  ligne: number;
  colonne: number;
}

// Un deplacement relatif : de combien de lignes et de colonnes on se decale.
// Sert a decrire les directions ou les sauts possibles d'une piece.
export interface Deplacement {
  dLigne: number;
  dColonne: number;
}
// Les pièces en lesquelles un pion peut être transformé quand il arrive au bout du plateau.
export type TypePiecePromotion = "dame" | "tour" | "fou" | "cavalier";

// Les roques encore possibles. Le "petit roque" se fait du côté du roi (avec la tour de droite),
// le "grand roque" du côté de la dame (avec la tour de gauche).
// Un roque n'est plus possible dès que le roi ou la tour concernée a bougé.
export interface DroitsDeRoque {
  blancPetit: boolean;
  blancGrand: boolean;
  noirPetit: boolean;
  noirGrand: boolean;
}

// Ce qu'il faut savoir en plus du plateau pour connaître les coups possibles :
// les roques encore permis, et la case où l'on peut faire une prise en passant
// (la case que vient de traverser un pion qui a avancé de 2 cases, sinon null).
export interface ContexteDePartie {
  droitsDeRoque: DroitsDeRoque;
  casePriseEnPassant: Position | null;
}

// Un coup joué par un joueur : de quelle case à quelle case,
// et en quelle pièce le pion est promu si le coup amène un pion au bout du plateau.
export interface Coup {
  depart: Position;
  arrivee: Position;
  promotion?: TypePiecePromotion;
}
