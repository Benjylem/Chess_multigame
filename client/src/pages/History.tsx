// Page "Historique" : liste les parties terminées du joueur, avec l'adversaire, le résultat et les dates.

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getGameHistory } from "../api/games";
import { getLibelleResultat, lireDonneesDeFin } from "../game-logic/partie";
import type { Game } from "../types";

// Affiche l'historique des parties terminées du joueur connecté.
export function History() {
  const { token, user } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Charge l'historique une fois, quand la page s'ouvre.
  useEffect(() => {
    if (!token) {
      return;
    }

    let annule = false;

    getGameHistory(token)
      .then((donnees) => {
        if (!annule) {
          setGames(donnees);
        }
      })
      .catch((err) => {
        if (!annule) {
          setError(err instanceof Error ? err.message : "Impossible de récupérer l'historique.");
        }
      })
      .finally(() => {
        if (!annule) {
          setLoading(false);
        }
      });

    return () => {
      annule = true;
    };
  }, [token]);

  // L'email de l'adversaire dans une partie.
  function getNomAdversaire(game: Game): string {
    const adversaire = game.players.find((joueur) => joueur.id !== user?.id);
    if (!adversaire) {
      return "inconnu";
    }
    return adversaire.email;
  }

  // Le résultat de la partie du point de vue du joueur : Victoire, Défaite ou Nulle.
  function getResultat(game: Game): string {
    if (!user) {
      return "";
    }
    return getLibelleResultat(lireDonneesDeFin(game.endData), user.id);
  }

  // Met une date renvoyée par le backend au format lisible (ex: 28/09/2026 14:30).
  // Le backend donne une date UTC comme "2026-09-28 12:30:00" : on la transforme en date ISO.
  function formaterDate(date: string | null): string {
    if (!date) {
      return "";
    }
    return new Date(date.replace(" ", "T") + "Z").toLocaleString("fr-FR");
  }

  if (loading) {
    return (
      <main>
        <h1>Historique</h1>
        <p>Chargement de l'historique...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Historique</h1>

      {error && <p>{error}</p>}

      {games.length === 0 && !error && <p>Tu n'as aucune partie terminée pour le moment.</p>}

      {games.map((game) => (
        <article key={game.id}>
          <h2>Partie #{game.id}</h2>
          <p>
            Résultat : <strong>{getResultat(game)}</strong>
          </p>
          <p>Adversaire : {getNomAdversaire(game)}</p>
          <p>Terminée le : {formaterDate(game.endedAt)}</p>
        </article>
      ))}
    </main>
  );
}
