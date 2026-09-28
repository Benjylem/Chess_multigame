// Page "Mes parties" : liste les parties du joueur (en attente, en cours, terminées pas encore vues)
// avec un lien pour rejoindre chacune. La liste se met à jour toute seule.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyGames } from "../api/games";
import type { Game } from "../types";

// Toutes les 3 secondes, on relit la liste (pour voir arriver une partie où on vient d'être invité).
const INTERVALLE_ACTUALISATION_MS = 3000;

// Le texte affiché pour chaque statut de partie.
const LIBELLES_STATUT: Record<Game["status"], string> = {
  pending: "En attente du début",
  started: "En cours",
  ended: "Terminée",
};

// Affiche la liste des parties du joueur connecté.
export function MyGames() {
  const { token, user } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Charge la liste des parties une première fois, puis la recharge régulièrement.
  useEffect(() => {
    if (!token) {
      return;
    }

    let annule = false;

    // Demande la liste des parties au serveur et met l'écran à jour.
    const chargerParties = async () => {
      try {
        const donnees = await getMyGames(token);
        if (!annule) {
          setGames(donnees);
          setError("");
        }
      } catch (err) {
        if (!annule) {
          setError(err instanceof Error ? err.message : "Impossible de récupérer tes parties.");
        }
      } finally {
        if (!annule) {
          setLoading(false);
        }
      }
    };

    chargerParties();
    const intervalle = setInterval(chargerParties, INTERVALLE_ACTUALISATION_MS);

    return () => {
      annule = true;
      clearInterval(intervalle);
    };
  }, [token]);

  // Le texte du lien : "Voir le résultat" pour une partie terminée, "Rejoindre la partie" sinon.
  function getTexteDuLien(game: Game): string {
    if (game.status === "ended") {
      return "Voir le résultat";
    }
    return "Rejoindre la partie";
  }

  // L'email de l'adversaire (ou "en attente" si personne n'a encore été invité).
  function getNomAdversaire(game: Game): string {
    const adversaire = game.players.find((joueur) => joueur.id !== user?.id);
    if (!adversaire) {
      return "personne pour l'instant";
    }
    return adversaire.email;
  }

  if (loading) {
    return (
      <main>
        <h1>Mes parties</h1>
        <p>Chargement des parties...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Mes parties</h1>

      {error && <p>{error}</p>}

      {games.length === 0 && !error && (
        <p>
          Tu n'as aucune partie pour le moment. <Link to="/create-game">Crée ta première partie</Link>.
        </p>
      )}

      {games.map((game) => (
        <article key={game.id}>
          <h2>Partie #{game.id}</h2>
          <p>
            Statut : <strong>{LIBELLES_STATUT[game.status]}</strong>
          </p>
          <p>Adversaire : {getNomAdversaire(game)}</p>
          {game.isYourTurn && (
            <p>
              <strong>C'est ton tour !</strong>
            </p>
          )}
          <Link to={`/games/${game.id}`}>{getTexteDuLien(game)}</Link>
        </article>
      ))}
    </main>
  );
}
