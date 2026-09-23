// Lot 3 — page de jeu reelle (/games/:id), branchee sur le backend.
// Remplace la page de test locale (src/dev/TestPlateau.tsx) une fois qu'on a
// un vrai token + un vrai id de partie.

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getGame, startGame, updateGameState } from "../api/games";
import type { Game, User } from "../types";
import type { Couleur, Plateau as PlateauDuJeu } from "../game-logic/types";
import { creerPlateauDeDepart } from "../game-logic/board";
import { couleurAdverse, estEchecEtMat, estPat } from "../game-logic/regles";
import { Plateau } from "../components/chess/Plateau";

// Pas de websocket sur ce backend : on reinterroge le serveur regulierement
// pour voir le coup joue par l'adversaire.
const INTERVALLE_POLLING_MS = 3000;

// Ce qui est stocke dans le champ `state` (chaine JSON libre) d'une partie
// d'echecs : le plateau, et qui joue quelle couleur.
interface EtatPartie {
  plateau: PlateauDuJeu;
  couleurs: Record<number, Couleur>;
}

// Ce qui est stocke dans `endData` a la fin d'une partie.
interface DonneesDeFin {
  resultat: "echecEtMat" | "pat";
  gagnantId: number | null;
}

// Tire au hasard qui joue les blancs et qui joue les noirs.
function tirerCouleursAuHasard(idJoueur1: number, idJoueur2: number): Record<number, Couleur> {
  if (Math.random() < 0.5) {
    return { [idJoueur1]: "blanc", [idJoueur2]: "noir" };
  }
  return { [idJoueur1]: "noir", [idJoueur2]: "blanc" };
}

// Renvoie l'autre joueur de la partie (celui qui n'a pas l'id donne).
function getAdversaire(partie: Game, monId: number): User | undefined {
  return partie.players.find((joueur) => joueur.id !== monId);
}

export function GamePage() {
  const { id } = useParams();
  const gameId = Number(id);
  const { token, user } = useAuth();

  const [partie, setPartie] = useState<Game | null>(null);
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let annule = false;

    async function chargerPartie() {
      try {
        const donnees = await getGame(token!, gameId);
        if (!annule) {
          setPartie(donnees);
        }
      } catch (err) {
        if (!annule) {
          setErreur(err instanceof Error ? err.message : "Impossible de charger la partie.");
        }
      }
    }

    chargerPartie();
    const intervalle = setInterval(chargerPartie, INTERVALLE_POLLING_MS);

    return () => {
      annule = true;
      clearInterval(intervalle);
    };
  }, [token, gameId]);

  if (!user || !token) {
    return <p>Chargement...</p>;
  }

  if (erreur) {
    return <p>{erreur}</p>;
  }

  if (!partie) {
    return <p>Chargement de la partie...</p>;
  }

  async function demarrerLaPartie() {
    if (!token || !partie) {
      return;
    }

    const [joueur1, joueur2] = partie.players;
    const couleurs = tirerCouleursAuHasard(joueur1.id, joueur2.id);
    const idBlanc = couleurs[joueur1.id] === "blanc" ? joueur1.id : joueur2.id;

    const etatDepart: EtatPartie = { plateau: creerPlateauDeDepart(), couleurs };

    setEnCours(true);
    try {
      const partieMiseAJour = await startGame(token, partie.id, {
        state: JSON.stringify(etatDepart),
        currentTurnUserId: idBlanc,
      });
      setPartie(partieMiseAJour);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible de démarrer la partie.");
    } finally {
      setEnCours(false);
    }
  }

  async function surCoupJoue(nouveauPlateau: PlateauDuJeu) {
    if (!token || !partie) {
      return;
    }

    const etat: EtatPartie = JSON.parse(partie.state ?? "{}");
    const maCouleur = etat.couleurs[user!.id];
    const couleurDeLAdversaire = couleurAdverse(maCouleur);
    const nouvelEtat: EtatPartie = { plateau: nouveauPlateau, couleurs: etat.couleurs };
    const adversaire = getAdversaire(partie, user!.id);

    setEnCours(true);
    try {
      let partieMiseAJour: Game;

      if (estEchecEtMat(nouveauPlateau, couleurDeLAdversaire)) {
        const donneesDeFin: DonneesDeFin = { resultat: "echecEtMat", gagnantId: user!.id };
        partieMiseAJour = await updateGameState(token, partie.id, {
          state: JSON.stringify(nouvelEtat),
          ended: true,
          endData: JSON.stringify(donneesDeFin),
        });
      } else if (estPat(nouveauPlateau, couleurDeLAdversaire)) {
        const donneesDeFin: DonneesDeFin = { resultat: "pat", gagnantId: null };
        partieMiseAJour = await updateGameState(token, partie.id, {
          state: JSON.stringify(nouvelEtat),
          ended: true,
          endData: JSON.stringify(donneesDeFin),
        });
      } else if (adversaire) {
        partieMiseAJour = await updateGameState(token, partie.id, {
          state: JSON.stringify(nouvelEtat),
          currentTurnUserId: adversaire.id,
        });
      } else {
        return;
      }

      setPartie(partieMiseAJour);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible de jouer ce coup.");
    } finally {
      setEnCours(false);
    }
  }

  if (partie.status === "pending") {
    const estCreateur = partie.creatorId === user.id;
    const assezDeJoueurs = partie.players.length === 2;

    return (
      <div style={{ padding: "1rem" }}>
        <h1>Partie #{partie.id}</h1>
        <p>
          Les échecs se jouent à deux : chacun son tour, on déplace ses pièces pour essayer de
          mettre le roi adverse en échec et mat. La couleur (blanc ou noir) sera tirée au sort
          au démarrage de la partie.
        </p>
        <p>Joueurs inscrits : {partie.players.map((joueur) => joueur.email).join(", ")}</p>
        {estCreateur && assezDeJoueurs && (
          <button onClick={demarrerLaPartie} disabled={enCours}>
            {enCours ? "Démarrage..." : "Démarrer la partie"}
          </button>
        )}
        {estCreateur && !assezDeJoueurs && (
          <p>Il faut exactement 2 joueurs pour démarrer une partie d'échecs.</p>
        )}
        {!estCreateur && <p>En attente que le créateur de la partie démarre la partie.</p>}
      </div>
    );
  }

  if (partie.status === "ended") {
    const donneesDeFin: DonneesDeFin | null = partie.endData ? JSON.parse(partie.endData) : null;

    let message = "Partie terminée.";
    if (donneesDeFin?.resultat === "pat") {
      message = "Partie nulle (pat) !";
    } else if (donneesDeFin?.gagnantId === user.id) {
      message = "Tu as gagné, échec et mat !";
    } else if (donneesDeFin?.gagnantId !== undefined) {
      message = "Tu as perdu, échec et mat.";
    }

    return (
      <div style={{ padding: "1rem" }}>
        <h1>Partie #{partie.id}</h1>
        <p>{message}</p>
      </div>
    );
  }

  // partie.status === "started"
  const etat: EtatPartie = JSON.parse(partie.state ?? "{}");
  const maCouleur = etat.couleurs[user.id];

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Partie #{partie.id}</h1>
      <p>Tu joues les {maCouleur === "blanc" ? "blancs" : "noirs"}.</p>
      <p>
        <strong>{partie.isYourTurn ? "C'est ton tour de jouer" : "En attente de l'adversaire"}</strong>
      </p>
      <Plateau
        plateau={etat.plateau}
        couleurQuiJoue={maCouleur}
        interactif={partie.isYourTurn && !enCours}
        orientation={maCouleur}
        onCoupJoue={surCoupJoue}
      />
    </div>
  );
}
