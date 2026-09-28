// Barre de navigation affichée en haut de toutes les pages : liens vers les pages principales,
// bouton "Comment jouer", email du joueur connecté et bouton de déconnexion
// (ou liens connexion / inscription quand on n'est pas connecté).

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Tutoriel } from "./Tutoriel";

// Affiche la barre de navigation, différente selon qu'on est connecté ou non.
export function Navbar() {
  const { user, logout, tutorielAAfficher, fermerTutoriel } = useAuth();
  const navigate = useNavigate();
  const [tutorielOuvertParLeJoueur, setTutorielOuvertParLeJoueur] = useState(false);

  // Le tutoriel est visible juste après la création d'un compte, ou quand le joueur clique sur "Comment jouer".
  const tutorielVisible = tutorielAAfficher || tutorielOuvertParLeJoueur;

  // Ferme le tutoriel (qu'il se soit ouvert tout seul ou à la demande du joueur).
  function fermerLeTutoriel() {
    setTutorielOuvertParLeJoueur(false);
    fermerTutoriel();
  }

  // Déconnecte le joueur puis le renvoie sur la page de connexion.
  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      {user && (
        <>
          <Link className="Navbar-link" to="/">
            Parties en cours
          </Link>
          <Link className="Navbar-link" to="/create-game">
            Créer une partie
          </Link>
          <Link className="Navbar-link" to="/history">
            Historique
          </Link>
        </>
      )}
      <button className="Navbar-link" onClick={() => setTutorielOuvertParLeJoueur(true)}>
        Comment jouer
      </button>
      {user ? (
        <>
          <span>{user.email}</span>
          <button className="Navbar-link" onClick={handleLogout}>
            Se déconnecter
          </button>
        </>
      ) : (
        <>
          <Link className="Navbar-link" to="/login">
            Connexion
          </Link>
          <Link className="Navbar-link" to="/signup">
            Créer un compte
          </Link>
        </>
      )}
      {tutorielVisible && <Tutoriel onFermer={fermerLeTutoriel} />}
    </nav>
  );
}
