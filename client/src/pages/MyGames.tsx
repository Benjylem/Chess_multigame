import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyGames } from "../api/games";
import type { Game } from "../types";

export function MyGames() {
  const { token } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadGames() {
    if (!token) {
      setError("Tu dois être connecté.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getMyGames(token);

      setGames(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de récupérer tes parties.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
  }, [token]);

  function getStatusLabel(status: Game["status"]) {
    switch (status) {
      case "pending":
        return "En attente";

      case "started":
        return "En cours";

      case "ended":
        return "Terminée";

      default:
        return status;
    }
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

      <button onClick={loadGames}>
        Actualiser
      </button>

      {games.length === 0 && !error && (
        <p>
          Tu n'as aucune partie pour le moment.
        </p>
      )}

      {games.length > 0 && (
        <section>
          {games.map((game) => (
            <article key={game.id}>
              <h2>Partie #{game.id}</h2>

              <p>
                Statut :{" "}
                <strong>
                  {getStatusLabel(game.status)}
                </strong>
              </p>

              <p>
                Joueurs : {game.players.length} /{" "}
                {game.maxPlayers}
              </p>

              <p>
                Minimum : {game.minPlayers} joueur(s)
              </p>

              <p>
                Maximum : {game.maxPlayers} joueur(s)
              </p>

              <h3>Joueurs</h3>

              <ul>
                {game.players.map((player) => (
                  <li key={player.id}>
                    {player.email}
                  </li>
                ))}
              </ul>

              {game.isYourTurn && (
                <p>
                  <strong>C'est ton tour !</strong>
                </p>
              )}

              <Link to={`/games/${game.id}`}>Rejoindre la partie</Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}