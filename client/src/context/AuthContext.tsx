// Lot 0 — état global d'authentification via Context API + reducer.
// Le token est persisté dans localStorage pour survivre à un refresh de page.

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { User } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
}

type AuthAction =
  | { type: "LOGIN"; token: string; user: User }
  | { type: "LOGOUT" };

function authReducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return { token: action.token, user: action.user };
    case "LOGOUT":
      return { token: null, user: null };
  }
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "chess-multigame-auth";

function loadInitialState(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null, user: null };
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, loadInitialState);

  useEffect(() => {
    if (state.token && state.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  const login = (token: string, user: User) => dispatch({ type: "LOGIN", token, user });
  const logout = () => dispatch({ type: "LOGOUT" });

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  return ctx;
}
