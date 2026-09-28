// Page de création de compte : formulaire email + mot de passe, puis connexion automatique.

import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { signup } from "../api/auth";
import { useAuth } from "../context/AuthContext";

// Affiche le formulaire d'inscription (redirige vers l'accueil si on est déjà connecté).
export function SignupPage() {
  const { token, login: saveSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (token) return <Navigate to="/" replace />;

  // Envoie le formulaire au backend : en cas de succès on connecte le joueur, sinon on affiche l'erreur.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await signup(email, password);
      saveSession(response.token, response.user, true);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de créer le compte.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="signup-title">
        <h1 id="signup-title">Créer un compte</h1>
        <p className="auth-intro">Inscris-toi stp</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Adresse email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer mon compte"}
          </button>
        </form>
        <p className="auth-switch">
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </section>
    </main>
  );
}