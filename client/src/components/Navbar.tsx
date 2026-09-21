// Lot 0 — barre de navigation commune entre les pages obligatoires du sujet.
// TODO(Lot 1/2): ajuster les liens/styles une fois les pages réelles en place.

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav>
      <Link className="Navbar-link" to="/">
        Parties en cours
      </Link>
      <Link className="Navbar-link" to="/history">
        Historique
      </Link>
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
    </nav>
  );
}
