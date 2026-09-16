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