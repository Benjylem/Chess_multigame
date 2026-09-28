// Protège les pages qui demandent d'être connecté : sans token, on renvoie vers /login.

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Affiche la page demandée si l'utilisateur est connecté, sinon redirige vers la connexion.
export function ProtectedRoute() {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
