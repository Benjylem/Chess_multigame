// Page d'une partie (/games/:id). Selon l'état de la partie, elle affiche :
//   - la salle d'attente (la partie n'a pas encore démarré),
//   - le plateau (partie en cours), avec le bouton Abandonner,
//   - le résultat (partie terminée).
// Elle interroge le serveur chaque seconde pour voir le coup joué par l'adversaire.

import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getGame, markGameSeen, updateGameState } from "../api/games";
import type { Game } from "../types";
import type { Coup } from "../game-logic/types";
import { creerEtatApresCoup, getMessageDeFin, lireDonneesDeFin, lireEtat } from "../game-logic/partie";
import type { DonneesDeFin, EtatPartie, Resultat } from "../game-logic/partie";
import {
  couleurAdverse,
  estEchecEtMat,
  estEnEchec,
  estMaterielInsuffisant,
  estPat,
  jouerCoup,
} from "../game-logic/regles";
import { Plateau } from "../components/chess/Plateau";
import { SalleDAttente } from "../components/SalleDAttente";

// Pas de websocket sur ce backend : on redemande la partie au serveur toutes les secondes.
const INTERVALLE_POLLING_MS = 1000;

// Si personne n'a joué depuis 1 heure, la partie est considérée comme abandonnée
// et se termine automatiquement (dès que le joueur dont c'est le tour ouvre la page).
const INACTIVITE_MAX_MS = 60 * 60 * 1000;

// Affiche la partie et gère les coups, l'abandon et la fin de partie.
export function GamePage() {
  const { id } = useParams();
  const gameId = Number(id);
  const { token, user } = useAuth();

  const [partie, setPartie] = useState<Game | null>(null);
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  // Pendant qu'on envoie un coup, on ignore les réponses de la lecture régulière :
  // sinon une réponse arrivée en retard pourrait remettre l'ancien plateau à l'écran.
  const envoiEnCours = useRef(false);
  const numeroDeMiseAJour = useRef(0);
  const finAutomatiqueTentee = useRef(false);

  const estTerminee = partie?.status === "ended";

  // Lit la partie sur le serveur toutes les secondes (sauf quand elle est terminée).
  useEffect(() => {
    if (!token || estTerminee) {
      return;
    }

    let annule = false;

    // Demande la partie au serveur et met l'écran à jour (sauf si un coup est en cours d'envoi).
    const chargerPartie = async () => {
      const numero = numeroDeMiseAJour.current;
      try {
        const donnees = await getGame(token, gameId);
        if (annule || envoiEnCours.current || numero !== numeroDeMiseAJour.current) {
          return;
        }
        setPartie(donnees);
        setErreur("");
      } catch (err) {
        if (!annule) {
          setErreur(err instanceof Error ? err.message : "Impossible de charger la partie.");
        }
      }
    };

    chargerPartie();
    const intervalle = setInterval(chargerPartie, INTERVALLE_POLLING_MS);

    return () => {
      annule = true;
      clearInterval(intervalle);
    };
  }, [token, gameId, estTerminee]);

  // Quand la partie est terminée, on la retire de "Mes parties" (elle reste dans l'historique).
  useEffect(() => {
    if (token && estTerminee) {
      markGameSeen(token, gameId).catch(() => {});
    }
  }, [token, gameId, estTerminee]);

  // Si la partie n'a pas bougé depuis trop longtemps et que c'est notre tour, on la termine
  // (les deux joueurs sont partis). Seul le joueur dont c'est le tour a le droit d'écrire.
  useEffect(() => {
    if (!token || !partie || partie.status !== "started" || !partie.isYourTurn) {
      return;
    }
    if (finAutomatiqueTentee.current) {
      return;
    }

    const etat = lireEtat(partie.state);
    if (!etat || !etat.dernierCoupLe || Date.now() - etat.dernierCoupLe < INACTIVITE_MAX_MS) {
      return;
    }

    finAutomatiqueTentee.current = true;
    const donneesDeFin: DonneesDeFin = { resultat: "inactivite", gagnantId: null };
    updateGameState(token, partie.id, {
      state: JSON.stringify(etat),
      ended: true,
      endData: JSON.stringify(donneesDeFin),
    })
      .then(setPartie)
      .catch(() => {});
  }, [token, partie]);

  if (!user || !token) {
    return <p>Chargement...</p>;
  }

  if (!partie) {
    return (
      <main>
        <p>{erreur || "Chargement de la partie..."}</p>
        {erreur && <Link to="/">Retour à mes parties</Link>}
      </main>
    );
  }

  if (partie.status === "pending") {
    return <SalleDAttente partie={partie} token={token} user={user} onPartieMiseAJour={setPartie} />;
  }

  const etat = lireEtat(partie.state);
  if (!etat) {
    return (
      <main>
        <p>L'état de cette partie est illisible.</p>
        <Link to="/">Retour à mes parties</Link>
      </main>
    );
  }

  const maCouleur = etat.couleurs[user.id];
  const adversaire = partie.players.find((joueur) => joueur.id !== user.id);

  // Envoie une mise à jour au serveur en bloquant le plateau le temps de la réponse.
  const envoyer = async (action: () => Promise<Game>) => {
    envoiEnCours.current = true;
    setEnCours(true);
    setErreur("");
    try {
      setPartie(await action());
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Le serveur a refusé cette action.");
    } finally {
      numeroDeMiseAJour.current += 1;
      envoiEnCours.current = false;
      setEnCours(false);
    }
  };

  // Termine la partie en enregistrant le résultat (echec et mat, pat, abandon...).
  const terminerPartie = (nouvelEtat: EtatPartie, resultat: Resultat, gagnantId: number | null) => {
    const donneesDeFin: DonneesDeFin = { resultat, gagnantId };
    return updateGameState(token, partie.id, {
      state: JSON.stringify(nouvelEtat),
      ended: true,
      endData: JSON.stringify(donneesDeFin),
    });
  };

  // Appelée par le plateau quand le joueur joue un coup : on applique le coup (roque, prise en passant
  // et promotion compris), puis on regarde si la partie se termine (échec et mat, pat ou match nul
  // par manque de pièces). Sinon le tour passe à l'adversaire.
  const surCoupJoue = (coup: Coup) => {
    const resultatDuCoup = jouerCoup(etat.plateau, etat, coup);
    const nouvelEtat = creerEtatApresCoup(etat, resultatDuCoup);
    const couleurDeLAdversaire = couleurAdverse(maCouleur);

    if (estEchecEtMat(resultatDuCoup.plateau, couleurDeLAdversaire, resultatDuCoup.contexte)) {
      return envoyer(() => terminerPartie(nouvelEtat, "echecEtMat", user.id));
    }
    if (estPat(resultatDuCoup.plateau, couleurDeLAdversaire, resultatDuCoup.contexte)) {
      return envoyer(() => terminerPartie(nouvelEtat, "pat", null));
    }
    if (estMaterielInsuffisant(resultatDuCoup.plateau)) {
      return envoyer(() => terminerPartie(nouvelEtat, "materielInsuffisant", null));
    }
    if (!adversaire) {
      return;
    }
    return envoyer(() =>
      updateGameState(token, partie.id, {
        state: JSON.stringify(nouvelEtat),
        currentTurnUserId: adversaire.id,
      }),
    );
  };

  // Le joueur abandonne : la partie se termine et son adversaire est déclaré vainqueur.
  // (Le serveur n'autorise à écrire que le joueur dont c'est le tour, donc c'est seulement possible à son tour.)
  const abandonner = () => {
    if (!adversaire || !window.confirm("Abandonner la partie ? Ton adversaire sera déclaré vainqueur.")) {
      return;
    }
    return envoyer(() => terminerPartie(etat, "abandon", adversaire.id));
  };

  if (partie.status === "ended") {
    const message = getMessageDeFin(lireDonneesDeFin(partie.endData), user.id);
    return (
      <main>
        <h1>Partie #{partie.id}</h1>
        <p>
          <strong>{message}</strong>
        </p>
        <Plateau
          plateau={etat.plateau}
          contexte={etat}
          couleurQuiJoue={maCouleur}
          interactif={false}
          orientation={maCouleur}
          onCoupJoue={() => {}}
        />
        <p>
          <Link to="/">Retour à mes parties</Link> · <Link to="/history">Voir l'historique</Link>
        </p>
      </main>
    );
  }

  // Ici, la partie est en cours.
  return (
    <main>
      <h1>Partie #{partie.id}</h1>
      <p>
        Tu joues les {maCouleur === "blanc" ? "blancs" : "noirs"}
        {adversaire && <> contre {adversaire.email}</>}.
      </p>
      <p>
        <strong>{partie.isYourTurn ? "C'est ton tour de jouer" : "En attente de l'adversaire..."}</strong>
      </p>
      {partie.isYourTurn && estEnEchec(etat.plateau, maCouleur) && <p>Attention : ton roi est en échec !</p>}
      {erreur && <p>{erreur}</p>}

      <Plateau
        plateau={etat.plateau}
        contexte={etat}
        couleurQuiJoue={maCouleur}
        interactif={partie.isYourTurn && !enCours}
        orientation={maCouleur}
        onCoupJoue={surCoupJoue}
      />

      <p>
        <button onClick={abandonner} disabled={!partie.isYourTurn || enCours}>
          Abandonner
        </button>
      </p>
      {!partie.isYourTurn && <p>Tu pourras abandonner quand ce sera ton tour.</p>}
      <p>
        <Link to="/">Retour à mes parties</Link> (la partie continue)
      </p>
    </main>
  );
}
