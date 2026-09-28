// Page de création de partie : un clic crée une partie à 2 joueurs et envoie
// directement le joueur dessus (c'est là qu'il invitera son adversaire et démarrera la partie).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createGame } from "../api/games";

// Les échecs se jouent toujours à deux joueurs.
const NOMBRE_DE_JOUEURS = 2;

// Affiche le bouton qui crée la partie.
export function CreateGame() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Crée la partie sur le backend, puis ouvre sa page (/games/:id).
  async function handleCreateGame() {
    setError("");

    if (!token) {
      setError("Tu dois être connecté.");
      return;
    }

    try {
      setLoading(true);
      const game = await createGame(token, NOMBRE_DE_JOUEURS, NOMBRE_DE_JOUEURS);
      navigate(`/games/${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer la partie.");
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Créer une partie</h1>
      <p>
        Une partie d'échecs se joue à deux. Après la création, tu arrives sur la page de la partie : tu y
        invites ton adversaire par email, puis tu la démarres.
      </p>

      {error && <p>{error}</p>}

      <button onClick={handleCreateGame} disabled={loading}>
        {loading ? "Création..." : "Créer la partie"}
      </button>
    </main>
  );
}
