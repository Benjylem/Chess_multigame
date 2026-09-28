// Appels au backend pour l'authentification : création de compte et connexion.
// Les deux renvoient un token (à garder pour les autres appels) et l'utilisateur.

import { apiFetch } from "./client";
import type { User } from "../types";

export interface AuthResponse {
  token: string;
  user: User;
}

// Crée un compte avec un email et un mot de passe, et connecte directement l'utilisateur.
export function signup(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/signup", {
    method: "POST",
    body: { email, password },
  });
}

// Connecte un utilisateur qui a déjà un compte.
export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}
