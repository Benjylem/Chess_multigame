// Fonction commune pour appeler le backend. Elle ajoute le token dans l'en-tête
// Authorization quand on en donne un, et transforme les erreurs HTTP en exceptions JS.

const BASE_URL = "http://localhost:8000";

// Erreur levée quand le backend répond avec un code d'erreur (ex: 403 "pas ton tour").
// Elle garde le code HTTP et le message renvoyé par le serveur.
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  token?: string | null;
}

// La forme d'une reponse d'erreur envoyee par le backend : { "error": "message" }
interface ReponseErreur {
  error: string;
}

// Envoie une requête au backend et renvoie la réponse déjà convertie depuis le JSON.
// En cas d'erreur HTTP, lève une ApiError avec le message du serveur.
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let corpsEnvoye: string | undefined;
  if (body !== undefined) {
    corpsEnvoye = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: corpsEnvoye,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}`;
    if (data && typeof data === "object" && "error" in data) {
      message = String((data as ReponseErreur).error);
    }
    throw new ApiError(response.status, message);
  }

  return data as T;
}
