// Tests de la logique des échecs (déplacements, échec, mat, pat, roque, prise en passant, promotion).
// Lancer avec : npm test
// Chaque test construit une position (avec un petit dessin du plateau en texte : majuscule = blanc,
// minuscule = noir, point = case vide), joue un coup, et vérifie le résultat attendu.

import { creerPlateauDeDepart, creerContexteDeDepart } from "../src/game-logic/board";
import {
  estEchecEtMat,
  estPat,
  estEnEchec,
  estPromotion,
  estMaterielInsuffisant,
  getMouvementsLegaux,
  jouerCoup,
} from "../src/game-logic/regles";
import type { ContexteDePartie, Plateau, Piece, TypePiece } from "../src/game-logic/types";

const resultats: string[] = [];
let echecs = 0;
function verifier(nom: string, condition: boolean) {
  resultats.push(`${condition ? "OK " : "KO "} ${nom}`);
  if (!condition) echecs++;
}

const TYPES: Record<string, TypePiece> = { k: "roi", q: "dame", r: "tour", b: "fou", n: "cavalier", p: "pion" };
// Construit un plateau depuis 8 lignes de texte : majuscule = blanc, minuscule = noir, "." = vide
function plateauDepuis(lignes: string[]): Plateau {
  return lignes.map((texte) =>
    texte.split("").map((c): Piece | null => {
      if (c === ".") return null;
      const type = TYPES[c.toLowerCase()];
      return { type, couleur: c === c.toUpperCase() ? "blanc" : "noir" };
    }),
  );
}
const a = (l: number, c: number) => ({ ligne: l, colonne: c });
const contexteVide = (): ContexteDePartie => ({ droitsDeRoque: { blancPetit: false, blancGrand: false, noirPetit: false, noirGrand: false }, casePriseEnPassant: null });
const contexteRoque = (): ContexteDePartie => creerContexteDeDepart();
const aMouvement = (m: { ligne: number; colonne: number }[], l: number, c: number) => m.some((x) => x.ligne === l && x.colonne === c);

// ---- Position de depart ----
{
  const p = creerPlateauDeDepart(), ctx = creerContexteDeDepart();
  verifier("Depart : pion e2 a 2 coups", getMouvementsLegaux(p, a(6, 4), ctx).length === 2);
  verifier("Depart : cavalier b1 a 2 coups", getMouvementsLegaux(p, a(7, 1), ctx).length === 2);
  verifier("Depart : roi e1 sans coup (pas de roque possible)", getMouvementsLegaux(p, a(7, 4), ctx).length === 0);
  verifier("Depart : pas d'echec, pas de mat, pas de pat", !estEnEchec(p, "blanc") && !estEchecEtMat(p, "blanc", ctx) && !estPat(p, "blanc", ctx));
}

// ---- Roque ----
const positionRoque = ["k.......", "........", "........", "........", "........", "........", "........", "R...K..R"];
{
  const p = plateauDepuis(positionRoque), ctx = contexteRoque();
  const m = getMouvementsLegaux(p, a(7, 4), ctx);
  verifier("Roque : petit roque blanc propose (g1)", aMouvement(m, 7, 6));
  verifier("Roque : grand roque blanc propose (c1)", aMouvement(m, 7, 2));
  const r = jouerCoup(p, ctx, { depart: a(7, 4), arrivee: a(7, 6) });
  verifier("Roque : apres petit roque le roi est en g1 et la tour en f1", r.plateau[7][6]?.type === "roi" && r.plateau[7][5]?.type === "tour" && r.plateau[7][7] === null && r.plateau[7][4] === null);
  verifier("Roque : les droits blancs sont perdus apres le roque", !r.contexte.droitsDeRoque.blancPetit && !r.contexte.droitsDeRoque.blancGrand);
  const g = jouerCoup(p, ctx, { depart: a(7, 4), arrivee: a(7, 2) });
  verifier("Roque : apres grand roque le roi est en c1 et la tour en d1", g.plateau[7][2]?.type === "roi" && g.plateau[7][3]?.type === "tour" && g.plateau[7][0] === null);
  const tourBouge = jouerCoup(p, ctx, { depart: a(7, 7), arrivee: a(6, 7) });
  verifier("Roque : la tour h1 qui bouge fait perdre le petit roque seulement", !tourBouge.contexte.droitsDeRoque.blancPetit && tourBouge.contexte.droitsDeRoque.blancGrand);
}
{
  const p = plateauDepuis(["k....r..", "........", "........", "........", "........", "........", "........", "R...K..R"]);
  const m = getMouvementsLegaux(p, a(7, 4), contexteRoque());
  verifier("Roque : interdit si le roi traverse une case attaquee (f1)", !aMouvement(m, 7, 6));
  verifier("Roque : grand roque reste possible quand seul f1 est attaque", aMouvement(m, 7, 2));
}
{
  const p = plateauDepuis(["k...r...", "........", "........", "........", "........", "........", "........", "R...K..R"]);
  const m = getMouvementsLegaux(p, a(7, 4), contexteRoque());
  verifier("Roque : interdit quand le roi est en echec", !aMouvement(m, 7, 6) && !aMouvement(m, 7, 2));
}
{
  const p = plateauDepuis(["kr......", "........", "........", "........", "........", "........", "........", "R...K..R"]);
  const m = getMouvementsLegaux(p, a(7, 4), contexteRoque());
  verifier("Roque : grand roque permis meme si b1 est attaque (le roi ne passe pas par b1)", aMouvement(m, 7, 2));
}
{
  const p = plateauDepuis(["k.......", "........", "........", "........", "........", "........", "........", "R...K.NR"]);
  const m = getMouvementsLegaux(p, a(7, 4), contexteRoque());
  verifier("Roque : interdit si une piece est entre le roi et la tour", !aMouvement(m, 7, 6));
}
{
  const p = plateauDepuis(positionRoque);
  const ctx = contexteRoque();
  ctx.droitsDeRoque.blancPetit = false;
  const m = getMouvementsLegaux(p, a(7, 4), ctx);
  verifier("Roque : interdit quand le droit est perdu", !aMouvement(m, 7, 6) && aMouvement(m, 7, 2));
}
{
  const p = plateauDepuis(["r...k..r", "........", "........", "........", "........", "........", "........", "....K..."]);
  const ctx = contexteRoque();
  const m = getMouvementsLegaux(p, a(0, 4), ctx);
  verifier("Roque : les noirs aussi (petit et grand)", aMouvement(m, 0, 6) && aMouvement(m, 0, 2));
  const r = jouerCoup(p, ctx, { depart: a(0, 4), arrivee: a(0, 6) });
  verifier("Roque noir : roi en g8, tour en f8", r.plateau[0][6]?.type === "roi" && r.plateau[0][5]?.type === "tour" && r.plateau[0][7] === null);
}
{
  // une tour dans son coin capturee fait perdre le droit
  const p = plateauDepuis(["k.......", "........", "........", "........", "........", "........", "......r.", "R...K..R"]);
  const r = jouerCoup(p, contexteRoque(), { depart: a(6, 6), arrivee: a(7, 7) });
  verifier("Roque : tour capturee dans son coin => petit roque perdu", !r.contexte.droitsDeRoque.blancPetit);
}

// ---- Prise en passant ----
{
  const p = plateauDepuis(["....k...", "...p....", "........", "....P...", "........", "........", "........", "....K..."]);
  const ctx0 = contexteVide();
  const apresD5 = jouerCoup(p, ctx0, { depart: a(1, 3), arrivee: a(3, 3) });
  verifier("En passant : un pion qui avance de 2 cases ouvre la prise sur la case traversee", apresD5.contexte.casePriseEnPassant?.ligne === 2 && apresD5.contexte.casePriseEnPassant?.colonne === 3);
  const m = getMouvementsLegaux(apresD5.plateau, a(3, 4), apresD5.contexte);
  verifier("En passant : le pion blanc peut prendre en diagonale sur la case vide", aMouvement(m, 2, 3));
  verifier("En passant : il peut toujours avancer tout droit", aMouvement(m, 2, 4));
  const pris = jouerCoup(apresD5.plateau, apresD5.contexte, { depart: a(3, 4), arrivee: a(2, 3) });
  verifier("En passant : le pion adverse est retire du plateau", pris.plateau[3][3] === null && pris.plateau[2][3]?.type === "pion" && pris.plateau[2][3]?.couleur === "blanc" && pris.plateau[3][4] === null);
  const apresAutreCoup = jouerCoup(apresD5.plateau, apresD5.contexte, { depart: a(7, 4), arrivee: a(7, 3) });
  verifier("En passant : la prise n'est possible qu'au coup suivant", apresAutreCoup.contexte.casePriseEnPassant === null && !aMouvement(getMouvementsLegaux(apresAutreCoup.plateau, a(3, 4), apresAutreCoup.contexte), 2, 3));
  const simple = jouerCoup(p, ctx0, { depart: a(1, 3), arrivee: a(2, 3) });
  verifier("En passant : un pion qui avance d'une case n'ouvre rien", simple.contexte.casePriseEnPassant === null);
}
{
  // pion clouee : la prise en passant retirerait les 2 pions de la rangee et exposerait le roi
  const p = plateauDepuis(["k.......", "........", "........", "K..pP..r", "........", "........", "........", "........"]);
  const ctx: ContexteDePartie = { droitsDeRoque: contexteVide().droitsDeRoque, casePriseEnPassant: a(2, 3) };
  const m = getMouvementsLegaux(p, a(3, 4), ctx);
  verifier("En passant : interdite si elle expose son propre roi", !aMouvement(m, 2, 3) && aMouvement(m, 2, 4));
}
{
  // un pion blanc ne doit jamais "prendre en passant" une case creee par un pion blanc
  const p = plateauDepuis(["k.......", "........", "........", "........", "........", "........", "...P....", "K......."]);
  const ctx: ContexteDePartie = { droitsDeRoque: contexteVide().droitsDeRoque, casePriseEnPassant: a(5, 2) };
  verifier("En passant : pas de fausse prise depuis la 2e rangee", !aMouvement(getMouvementsLegaux(p, a(6, 3), ctx), 5, 2));
}

// ---- Promotion ----
{
  const p = plateauDepuis(["....k...", "P.......", "........", "........", "........", "........", "........", "....K..."]);
  const ctx = contexteVide();
  verifier("Promotion : le pion a7 peut avancer en a8", aMouvement(getMouvementsLegaux(p, a(1, 0), ctx), 0, 0));
  verifier("Promotion : le coup a7-a8 est bien detecte comme promotion", estPromotion(p, a(1, 0), a(0, 0)));
  verifier("Promotion : un coup normal n'est pas une promotion", !estPromotion(creerPlateauDeDepart(), a(6, 4), a(5, 4)));
  const dame = jouerCoup(p, ctx, { depart: a(1, 0), arrivee: a(0, 0) });
  verifier("Promotion : par defaut le pion devient une dame", dame.plateau[0][0]?.type === "dame" && dame.plateau[0][0]?.couleur === "blanc");
  const cav = jouerCoup(p, ctx, { depart: a(1, 0), arrivee: a(0, 0), promotion: "cavalier" });
  verifier("Promotion : on peut choisir un cavalier", cav.plateau[0][0]?.type === "cavalier");
  const tour = jouerCoup(p, ctx, { depart: a(1, 0), arrivee: a(0, 0), promotion: "tour" });
  const fou = jouerCoup(p, ctx, { depart: a(1, 0), arrivee: a(0, 0), promotion: "fou" });
  verifier("Promotion : tour et fou possibles", tour.plateau[0][0]?.type === "tour" && fou.plateau[0][0]?.type === "fou");
  const noir = plateauDepuis(["....k...", "........", "........", "........", "........", "........", "p.......", "....K..."]);
  const pn = jouerCoup(noir, ctx, { depart: a(6, 0), arrivee: a(7, 0), promotion: "dame" });
  verifier("Promotion : les noirs se promeuvent sur la ligne 7", pn.plateau[7][0]?.type === "dame" && pn.plateau[7][0]?.couleur === "noir");
  // promotion avec capture
  const cap = plateauDepuis(["r...k...", "P.......", "........", "........", "........", "........", "........", "....K..."]);
  verifier("Promotion : le pion a7 ne peut pas avancer sur a8 occupe", !aMouvement(getMouvementsLegaux(cap, a(1, 0), ctx), 0, 0));
  const cap2 = plateauDepuis(["rr..k...", "P.......", "........", "........", "........", "........", "........", "....K..."]);
  verifier("Promotion : capture en diagonale possible (axb8)", aMouvement(getMouvementsLegaux(cap2, a(1, 0), ctx), 0, 1));
}

// ---- Fins de partie (non regression) ----
{
  let p = creerPlateauDeDepart();
  let ctx = creerContexteDeDepart();
  const jouer = (de: [number, number], vers: [number, number]) => {
    const r = jouerCoup(p, ctx, { depart: a(de[0], de[1]), arrivee: a(vers[0], vers[1]) });
    p = r.plateau; ctx = r.contexte;
  };
  jouer([6, 5], [5, 5]); jouer([1, 4], [3, 4]); jouer([6, 6], [4, 6]);
  verifier("Mat du fou : pas encore mat avant le dernier coup", !estEchecEtMat(p, "blanc", ctx));
  jouer([0, 3], [4, 7]);
  verifier("Mat du fou : echec et mat des blancs detecte", estEnEchec(p, "blanc") && estEchecEtMat(p, "blanc", ctx));
  verifier("Mat du fou : les noirs ne sont pas mat", !estEchecEtMat(p, "noir", ctx));
}
{
  const p = plateauDepuis(["k.......", "..K.....", ".Q......", "........", "........", "........", "........", "........"]);
  const ctx = contexteVide();
  verifier("Pat classique detecte", estPat(p, "noir", ctx) && !estEchecEtMat(p, "noir", ctx));
}
{
  verifier("Materiel insuffisant : roi contre roi", estMaterielInsuffisant(plateauDepuis(["k.......", "........", "........", "........", "........", "........", "........", "....K..."])));
  verifier("Materiel insuffisant : roi + fou contre roi", estMaterielInsuffisant(plateauDepuis(["k.......", "........", "........", "........", "........", "........", "........", "...BK..."])));
  verifier("Materiel insuffisant : roi + cavalier contre roi", estMaterielInsuffisant(plateauDepuis(["k.......", "........", "........", "........", "........", "........", "........", "...NK..."])));
  verifier("Materiel suffisant : roi + tour contre roi", !estMaterielInsuffisant(plateauDepuis(["k.......", "........", "........", "........", "........", "........", "........", "...RK..."])));
  verifier("Materiel suffisant : position de depart", !estMaterielInsuffisant(creerPlateauDeDepart()));
}

console.log(resultats.join("\n"));
console.log(echecs === 0 ? `\nTOUS LES ${resultats.length} TESTS PASSENT` : `\n${echecs} TEST(S) EN ECHEC sur ${resultats.length}`);
process.exit(echecs === 0 ? 0 : 1);
