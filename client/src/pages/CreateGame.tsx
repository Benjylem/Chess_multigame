import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createGame, inviteToGame } from "../api/games";

export function CreateGame() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(4);

  const [gameId, setGameId] = useState<number | null>(null);
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleCreateGame(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Tu dois être connecté.");
      return;
    }

    if (minPlayers < 1) {
      setError("Le minimum doit être au moins 1.");
      return;
    }

    if (maxPlayers < minPlayers) {
      setError(
        "Le maximum doit être supérieur ou égal au minimum.",
      );
      return;
    }

    try {
      setLoading(true);

      const game = await createGame(
        token,
        minPlayers,
        maxPlayers,
      );

      setGameId(game.id);
      setMessage(`Partie #${game.id} créée !`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer la partie.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token || gameId === null) {
      setError("Crée d'abord une partie.");
      return;
    }

    if (!email.trim()) {
      setError("Entre une adresse email.");
      return;
    }

    try {
      setLoading(true);

      await inviteToGame(
        token,
        gameId,
        email.trim(),
      );

      setMessage(`Invitation envoyée à ${email}.`);
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'envoyer l'invitation.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Créer une partie</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleCreateGame}>
        <div>
          <label htmlFor="minPlayers">
            Nombre minimum de joueurs
          </label>

          <input
            id="minPlayers"
            type="number"
            min="1"
            value={minPlayers}
            onChange={(event) =>
              setMinPlayers(Number(event.target.value))
            }
          />
        </div>

        <div>
          <label htmlFor="maxPlayers">
            Nombre maximum de joueurs
          </label>

          <input
            id="maxPlayers"
            type="number"
            min="1"
            value={maxPlayers}
            onChange={(event) =>
              setMaxPlayers(Number(event.target.value))
            }
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer la partie"}
        </button>
      </form>

      {gameId !== null && (
        <section>
          <h2>Inviter un joueur</h2>

          <form onSubmit={handleInvite}>
            <label htmlFor="email">
              Email du joueur
            </label>

            <input
              id="email"
              type="email"
              placeholder="joueur@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />

            <button type="submit" disabled={loading}>
              {loading ? "Envoi..." : "Inviter"}
            </button>
          </form>

          <button onClick={() => navigate(`/games/${gameId}`)}>
            Rejoindre la partie
          </button>
        </section>
      )}
    </main>
  );
}