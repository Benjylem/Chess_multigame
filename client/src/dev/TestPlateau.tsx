import { useState } from "react";
import { creerPlateauDeDepart } from "../game-logic/board";
import type { Couleur, Plateau as PlateauDuJeu } from "../game-logic/types";
import { Plateau } from "../components/chess/Plateau";

// Page de test temporaire (dev uniquement) : sert juste a verifier visuellement
// le plateau et les deplacements pendant le developpement du Lot 3. Pas reliee
// au backend, pas une des pages officielles du projet. A retirer une fois
// GamePage pret et branche sur l'API.
export function TestPlateau() {
  const [plateau, setPlateau] = useState<PlateauDuJeu>(creerPlateauDeDepart());
  const [tourActuel, setTourActuel] = useState<Couleur>("blanc");

  function surCoupJoue(nouveauPlateau: PlateauDuJeu) {
    setPlateau(nouveauPlateau);

    // On passe le tour a l'autre couleur
    if (tourActuel === "blanc") {
      setTourActuel("noir");
    } else {
      setTourActuel("blanc");
    }
  }

  let nomDuTour = "noirs";
  if (tourActuel === "blanc") {
    nomDuTour = "blancs";
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Test local du plateau (dev uniquement)</h1>
      <p>
        Clique sur une de tes pieces pour voir ses coups possibles (points gris), puis clique
        sur une case en surbrillance pour jouer le coup. Tu joues les deux couleurs toi-meme,
        chacun son tour.
      </p>
      <p>
        <strong>C'est aux {nomDuTour} de jouer</strong>
      </p>
      <Plateau plateau={plateau} couleurQuiJoue={tourActuel} onCoupJoue={surCoupJoue} />
    </div>
  );
}