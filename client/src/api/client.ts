// Lot 0 — wrapper fetch commun. Ajoute automatiquement le header Authorization
// quand un token est passé, et transforme les erreurs HTTP en exceptions JS.

const BASE_URL = "http://127.0.0.1:8000";

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
