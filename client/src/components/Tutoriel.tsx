// Fenêtre d'explications "Comment jouer" : quelques étapes avec des boutons Précédent / Suivant.
// Elle s'ouvre toute seule après la création d'un compte, et le bouton "Comment jouer"
// de la barre du haut permet de la rouvrir. On peut la fermer à tout moment
// (bouton ✕, touche Échap, ou clic à côté de la fenêtre).

import { useEffect, useState } from "react";

interface EtapeDuTutoriel {
  titre: string;
  texte: string;
}

// Les étapes affichées les unes après les autres.
const ETAPES: EtapeDuTutoriel[] = [
  {
    titre: "Bienvenue !",
    texte:
      "Ce site te permet de jouer aux échecs en ligne contre un ami, chacun sur son ordinateur. " +
      "Les coups sont enregistrés sur un serveur : tu peux fermer la page et revenir plus tard, la partie sera toujours là.",
  },
  {
    titre: "1. Créer une partie",
    texte:
      "Clique sur « Créer une partie » dans la barre du haut, puis sur le bouton « Créer la partie ». " +
      "Tu arrives directement sur la page de ta partie.",
  },
  {
    titre: "2. Inviter ton adversaire",
    texte:
      "Sur la page de la partie, entre l'email de ton adversaire et clique sur « Inviter ». " +
      "Attention : il doit déjà avoir créé son compte avec cet email. Il est ajouté tout de suite à la partie.",
  },
  {
    titre: "3. Démarrer la partie",
    texte:
      "Quand vous êtes deux, le créateur de la partie clique sur « Démarrer la partie ». " +
      "Les couleurs sont tirées au sort et ce sont toujours les blancs qui jouent en premier.",
  },
  {
    titre: "4. Jouer",
    texte:
      "Clique sur une de tes pièces : les cases où elle peut aller s'affichent avec un point. " +
      "Clique sur l'une d'elles pour jouer. Ton adversaire voit ton coup au bout d'une seconde. " +
      "Tu ne peux jouer que pendant ton tour, et tu peux abandonner avec le bouton « Abandonner ».",
  },
  {
    titre: "5. Rejoindre une partie",
    texte:
      "Si quelqu'un t'invite, sa partie apparaît dans « Parties en cours » : clique sur « Rejoindre la partie ». " +
      "Une partie se termine par un échec et mat, un pat (match nul) ou un abandon. " +
      "Retrouve tous tes résultats dans « Historique ».",
  },
];

interface ProprietesTutoriel {
  // Appelée quand le joueur ferme la fenêtre.
  onFermer: () => void;
}

// Affiche la fenêtre d'explications au milieu de l'écran, par-dessus la page.
export function Tutoriel({ onFermer }: ProprietesTutoriel) {
  const [numeroEtape, setNumeroEtape] = useState(0);

  // Permet de fermer la fenêtre avec la touche Échap.
  useEffect(() => {
    // Ferme la fenêtre quand on appuie sur Échap.
    function surToucheAppuyee(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onFermer();
      }
    }
    window.addEventListener("keydown", surToucheAppuyee);
    return () => window.removeEventListener("keydown", surToucheAppuyee);
  }, [onFermer]);

  const etape = ETAPES[numeroEtape];
  const estPremiere = numeroEtape === 0;
  const estDerniere = numeroEtape === ETAPES.length - 1;

  return (
    <div className="tutoriel-fond" onClick={onFermer}>
      <div
        className="tutoriel-fenetre"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutoriel-titre"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="tutoriel-fermer" onClick={onFermer} aria-label="Fermer les explications">
          ✕
        </button>

        <p className="tutoriel-etape">
          Étape {numeroEtape + 1} sur {ETAPES.length}
        </p>
        <h2 id="tutoriel-titre">{etape.titre}</h2>
        <p className="tutoriel-texte">{etape.texte}</p>

        <div className="tutoriel-boutons">
          <button onClick={() => setNumeroEtape(numeroEtape - 1)} disabled={estPremiere}>
            Précédent
          </button>
          {!estDerniere && <button onClick={() => setNumeroEtape(numeroEtape + 1)}>Suivant</button>}
          {estDerniere && <button onClick={onFermer}>Terminer</button>}
        </div>
      </div>
    </div>
  );
}
