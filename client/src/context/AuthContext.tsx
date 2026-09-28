// Garde en mémoire qui est connecté (token + utilisateur) et le partage à toute l'application.
// Le token est aussi sauvegardé dans le localStorage pour rester connecté après un rechargement.

import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
}

type AuthAction =
  | { type: "LOGIN"; token: string; user: User }
  | { type: "LOGOUT" };

// Calcule le nouvel état de connexion : LOGIN enregistre le compte, LOGOUT l'efface.
function authReducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return { token: action.token, user: action.user };

    case "LOGOUT":
      return { token: null, user: null };
  }
}

interface AuthContextValue extends AuthState {
  // Connecte le joueur. Le 3e paramètre vaut true juste après la création d'un compte
  // (pour afficher le tutoriel de bienvenue).
  login: (token: string, user: User, nouveauCompte?: boolean) => void;
  logout: () => void;
  // Vrai quand le tutoriel de bienvenue doit s'afficher tout seul.
  tutorielAAfficher: boolean;
  // À appeler quand le joueur ferme le tutoriel de bienvenue.
  fermerTutoriel: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "chess-multigame-auth";

// Au démarrage, relit la connexion sauvegardée dans le localStorage (ou déconnecté s'il n'y a rien).
function loadInitialState(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { token: null, user: null };
  }
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return { token: null, user: null };
  }
}

// Entoure l'application : fournit le compte connecté et les fonctions login / logout
// à tous les composants, et sauvegarde la connexion dans le localStorage à chaque changement.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, loadInitialState);
  const [tutorielAAfficher, setTutorielAAfficher] = useState(false);

  useEffect(() => {
    if (state.token && state.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  // Enregistre le compte connecté (et demande le tutoriel si le compte vient d'être créé).
  const login = (token: string, user: User, nouveauCompte = false) => {
    dispatch({ type: "LOGIN", token, user });
    setTutorielAAfficher(nouveauCompte);
  };
  // Déconnecte le joueur.
  const logout = () => {
    dispatch({ type: "LOGOUT" });
    setTutorielAAfficher(false);
  };
  // Cache le tutoriel de bienvenue.
  const fermerTutoriel = () => setTutorielAAfficher(false);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, tutorielAAfficher, fermerTutoriel }}>
      {children}
    </AuthContext.Provider>
  );
}

// Permet à un composant de lire le compte connecté (token, user) et d'appeler login / logout.
// (Ce fichier exporte un composant ET ce hook : c'est courant, on désactive juste l'avertissement de rechargement à chaud.)
// oxlint-disable-next-line react/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  }
  return ctx;
}
