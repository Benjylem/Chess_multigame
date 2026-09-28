// Salle d'attente d'une partie qui n'a pas encore démarré : le créateur y invite son adversaire
// par email puis démarre la partie (les couleurs sont alors tirées au sort).
// L'autre joueur, lui, attend que le créateur lance la partie.

import { useState, type FormEvent } from "react";
import { inviteToGame, startGame } from "../api/games";
import { creerContexteDeDepart, creerPlateauDeDepart } from "../game-logic/board";
import type { EtatPartie } from "../game-logic/partie";
import type { Couleur } from "../game-logic/types";
import type { Game, User } from "../types";

interface ProprietesSalleDAttente {
  partie: Game;
  token: string;
  user: User;
  // Appelée avec la partie à jour après une invitation ou le démarrage.
  onPartieMiseAJour: (partie: Game) => void;
}

// Tire au hasard qui joue les blancs et qui joue les noirs.
function tirerCouleursAuHasard(idJoueur1: number, idJoueur2: number): Record<number, Couleur> {
  if (Math.random() < 0.5) {
    return { [idJoueur1]: "blanc", [idJoueur2]: "noir" };
  }
  return { [idJoueur1]: "noir", [idJoueur2]: "blanc" };
}

// Affiche les joueurs présents, le formulaire d'invitation et le bouton pour démarrer.
export function SalleDAttente({ partie, token, user, onPartieMiseAJour }: ProprietesSalleDAttente) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  const estCreateur = partie.creatorId === user.id;
  const partieComplete = partie.players.length === 2;

  // Invite un joueur par son email (il doit déjà avoir un compte) : il est ajouté tout de suite à la partie.
  async function inviter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErreur("");

    if (!email.trim()) {
      setErreur("Entre une adresse email.");
      return;
    }

    try {
      setEnCours(true);
      const partieMiseAJour = await inviteToGame(token, partie.id, email.trim());
      onPartieMiseAJour(partieMiseAJour);
      setMessage(`${email.trim()} a été ajouté à la partie.`);
      setEmail("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible d'inviter ce joueur.");
    } finally {
      setEnCours(false);
    }
  }

  // Démarre la partie : tire les couleurs au sort, prépare le plateau de départ,
  // et donne le premier tour au joueur qui a les blancs (aux échecs, les blancs commencent).
  async function demarrer() {
    setMessage("");
    setErreur("");

    const [joueur1, joueur2] = partie.players;
    const couleurs = tirerCouleursAuHasard(joueur1.id, joueur2.id);
    let idBlanc = joueur2.id;
    if (couleurs[joueur1.id] === "blanc") {
      idBlanc = joueur1.id;
    }

    const etatDeDepart: EtatPartie = {
      ...creerContexteDeDepart(),
      plateau: creerPlateauDeDepart(),
      couleurs,
      dernierCoupLe: Date.now(),
    };

    try {
      setEnCours(true);
      const partieMiseAJour = await startGame(token, partie.id, {
        state: JSON.stringify(etatDeDepart),
        currentTurnUserId: idBlanc,
      });
      onPartieMiseAJour(partieMiseAJour);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible de démarrer la partie.");
      setEnCours(false);
    }
  }

  return (
    <main>
      <h1>Partie #{partie.id}</h1>
      <p>
        Les échecs se jouent à deux : chacun son tour, on déplace ses pièces pour essayer de mettre le roi
        adverse en échec et mat. La couleur (blanc ou noir) est tirée au sort au démarrage de la partie.
      </p>

      <h2>Joueurs</h2>
      <ul>
        {partie.players.map((joueur) => (
          <li key={joueur.id}>{joueur.email}</li>
        ))}
      </ul>

      {message && <p className="message-info">{message}</p>}
      {erreur && <p className="message-erreur">{erreur}</p>}

      {estCreateur && !partieComplete && (
        <section>
          <h2>Inviter ton adversaire</h2>
          <p>Il doit déjà avoir un compte : entre l'email qu'il a utilisé pour s'inscrire.</p>
          <form className="formulaire" onSubmit={inviter}>
            <label htmlFor="email">Email de l'adversaire</label>
            <input
              id="email"
              type="email"
              placeholder="joueur@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button className="bouton" type="submit" disabled={enCours}>
              {enCours ? "Envoi..." : "Inviter"}
            </button>
          </form>
        </section>
      )}

      {estCreateur && partieComplete && (
        <button className="bouton" onClick={demarrer} disabled={enCours}>
          {enCours ? "Démarrage..." : "Démarrer la partie"}
        </button>
      )}

      {!estCreateur && <p>En attente que le créateur de la partie la démarre...</p>}
    </main>
  );
}
