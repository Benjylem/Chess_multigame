import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getGameHistory } from "../api/games";
import type { Game } from "../types";

export function History() {
  const { token } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    if (!token) {
      setError("Tu dois être connecté.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getGameHistory(token);

      setGames(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de récupérer l'historique.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [token]);

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

      <button onClick={loadHistory}>
        Actualiser
      </button>

      {games.length === 0 && !error && (
        <p>
          Tu n'as aucune partie terminée.
        </p>
      )}

      {games.length > 0 && (
        <section>
          {games.map((game) => (
            <article key={game.id}>
              <h2>Partie #{game.id}</h2>

              <p>
                Statut : <strong>Terminée</strong>
              </p>

              <p>
                Joueurs : {game.players.length} /{" "}
                {game.maxPlayers}
              </p>

              <h3>Joueurs</h3>

              <ul>
                {game.players.map((player) => (
                  <li key={player.id}>
                    {player.email}
                  </li>
                ))}
              </ul>

              {game.startedAt && (
                <p>
                  Début :{" "}
                  {new Date(game.startedAt).toLocaleString()}
                </p>
              )}

              {game.endedAt && (
                <p>
                  Fin :{" "}
                  {new Date(game.endedAt).toLocaleString()}
                </p>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}