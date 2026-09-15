// Lot 0 — appels API d'authentification (server/routes.md : POST /auth/signup, /auth/login)

import { apiFetch } from "./client";
import type { User } from "../types";

export interface AuthResponse {
  token: string;
  user: User;
}

export function signup(email: string, password: string, profilePicture?: string) {
  return apiFetch<AuthResponse>("/auth/signup", {
    method: "POST",
    body: { email, password, profilePicture },
  });
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}
