// Traduction en français des messages d'erreur envoyés par le serveur (qui les écrit en anglais).
// Le serveur est fourni par le professeur et n'est pas modifié : la traduction se fait ici, à un seul
// endroit, donc toutes les pages affichent des erreurs en français.

// Message affiché quand le serveur ne répond pas du tout (éteint, mauvaise adresse, coupure réseau).
export const MESSAGE_SERVEUR_INJOIGNABLE =
  "Impossible de joindre le serveur. Vérifie qu'il est bien lancé (deno task start dans le dossier server).";

// Les messages exacts du serveur et leur traduction.
const TRADUCTIONS: Record<string, string> = {
  // Connexion et inscription
  "Invalid email or password": "Email ou mot de passe incorrect.",
  "An account with this email already exists": "Un compte existe déjà avec cet email.",
  "Missing or malformed Authorization header": "Tu n'es pas connecté. Connecte-toi pour continuer.",
  "Invalid or expired session token": "Ta session a expiré. Reconnecte-toi.",

  // Création, invitation et démarrage d'une partie
  "Game not found": "Cette partie n'existe pas.",
  "minPlayers must be at least 1": "Le nombre minimum de joueurs doit être d'au moins 1.",
  "maxPlayers must be greater than or equal to minPlayers":
    "Le nombre maximum de joueurs doit être supérieur ou égal au minimum.",
  "Players can only be invited before the game has started":
    "On ne peut inviter un joueur qu'avant le début de la partie.",
  "Only the game creator can invite players": "Seul le créateur de la partie peut inviter un joueur.",
  "No user with this email exists":
    "Aucun compte n'existe avec cet email : ton adversaire doit d'abord créer son compte.",
  "This player is already in the game": "Ce joueur est déjà dans la partie.",
  "This game already has the maximum number of players": "Cette partie est déjà complète.",
  "Only the game creator can start the game": "Seul le créateur de la partie peut la démarrer.",
  "Game has already started": "La partie a déjà démarré.",

  // Pendant la partie
  "You are not a player in this game": "Tu ne fais pas partie de cette partie.",
  "Game has not ended yet": "La partie n'est pas encore terminée.",
  "Game is not currently in progress": "La partie n'est pas en cours.",
  "It is not your turn": "Ce n'est pas ton tour.",
  "currentTurnUserId must be one of the game's players":
    "Le joueur suivant doit faire partie de la partie.",

  // Erreurs générales
  "Request body must be a JSON object": "Les données envoyées au serveur sont invalides.",
  "Request body must be valid JSON": "Les données envoyées au serveur sont invalides.",
  "Internal server error": "Erreur interne du serveur. Réessaie dans un instant.",
};

// Le nom d'un champ tel que le serveur le connaît, et comment l'appeler en français.
const NOMS_DES_CHAMPS: Record<string, string> = {
  email: "email",
  password: "mot de passe",
  state: "état de la partie",
  minPlayers: "nombre minimum de joueurs",
  maxPlayers: "nombre maximum de joueurs",
};

// Traduit un message d'erreur du serveur en français.
// Si le message n'est pas connu, on affiche une phrase générale selon le code HTTP.
export function traduireErreur(message: string, statutHttp: number): string {
  const traductionExacte = TRADUCTIONS[message];
  if (traductionExacte) {
    return traductionExacte;
  }

  // Un champ obligatoire manquant : Field "email" is required and must be a non-empty string
  const champManquant = message.match(/^Field "(.+)" is required/);
  if (champManquant) {
    const nom = NOMS_DES_CHAMPS[champManquant[1]] ?? champManquant[1];
    return `Le champ « ${nom} » est obligatoire.`;
  }

  // Pas assez de joueurs : At least 2 players are required to start this game (currently 1)
  const pasAssezDeJoueurs = message.match(/^At least (\d+) players are required to start this game \(currently (\d+)\)/);
  if (pasAssezDeJoueurs) {
    return `Il faut au moins ${pasAssezDeJoueurs[1]} joueurs pour démarrer la partie (il y en a ${pasAssezDeJoueurs[2]} pour l'instant).`;
  }

  // Message inconnu : phrase générale selon le code HTTP
  if (statutHttp === 401) {
    return "Tu n'es pas connecté ou ta session a expiré. Reconnecte-toi.";
  }
  if (statutHttp === 403) {
    return "Tu n'as pas le droit de faire cette action.";
  }
  if (statutHttp === 404) {
    return "Élément introuvable.";
  }
  if (statutHttp === 409) {
    return "Cette action est impossible dans l'état actuel.";
  }
  if (statutHttp >= 500) {
    return "Erreur interne du serveur. Réessaie dans un instant.";
  }
  return "Une erreur est survenue. Réessaie.";
}
