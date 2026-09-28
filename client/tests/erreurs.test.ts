// Tests de la traduction des messages d'erreur du serveur (voir src/api/messagesErreur.ts).
// Lancer avec : npm run test:erreurs (ou npm test, qui lance aussi les tests des règles).
// Un test lit tous les messages écrits dans le code du serveur et vérifie que chacun a une traduction :
// si le serveur ajoute un jour un nouveau message, ce test le signale.

import { readFileSync } from "node:fs";
import { traduireErreur } from "../src/api/messagesErreur";

const resultats: string[] = [];
let echecs = 0;
// Vérifie qu'une condition est vraie et note le résultat.
function verifier(nom: string, condition: boolean) {
  resultats.push(`${condition ? "OK " : "KO "} ${nom}`);
  if (!condition) echecs++;
}

// Le message général affiché quand un message est inconnu et que le code HTTP n'a rien de particulier.
const MESSAGE_GENERAL = traduireErreur("message inconnu", 418);

// ---- Les cas les plus visibles pour l'utilisateur ----
verifier("Connexion refusée en français", traduireErreur("Invalid email or password", 401) === "Email ou mot de passe incorrect.");
verifier("Compte déjà existant en français", traduireErreur("An account with this email already exists", 409) === "Un compte existe déjà avec cet email.");
verifier("Invitation d'un email sans compte en français", traduireErreur("No user with this email exists", 404).includes("Aucun compte"));
verifier("Jouer hors de son tour en français", traduireErreur("It is not your turn", 403) === "Ce n'est pas ton tour.");
verifier("Session expirée en français", traduireErreur("Invalid or expired session token", 401).includes("session a expiré"));

// ---- Messages avec une partie variable ----
verifier("Champ obligatoire : email", traduireErreur('Field "email" is required and must be a non-empty string', 400) === "Le champ « email » est obligatoire.");
verifier("Champ obligatoire : mot de passe", traduireErreur('Field "password" is required and must be a non-empty string', 400) === "Le champ « mot de passe » est obligatoire.");
verifier("Pas assez de joueurs pour démarrer", traduireErreur("At least 2 players are required to start this game (currently 1)", 400) === "Il faut au moins 2 joueurs pour démarrer la partie (il y en a 1 pour l'instant).");

// ---- Messages inconnus : phrase générale selon le code HTTP, jamais d'anglais ----
verifier("Message inconnu (401)", traduireErreur("Something new", 401).includes("Reconnecte-toi"));
verifier("Message inconnu (403)", traduireErreur("Something new", 403).includes("pas le droit"));
verifier("Message inconnu (404)", traduireErreur("Something new", 404) === "Élément introuvable.");
verifier("Message inconnu (500)", traduireErreur("Something new", 500).includes("Erreur interne"));
verifier("Message vide (erreur sans texte)", traduireErreur("", 400) === MESSAGE_GENERAL);

// ---- Tous les messages du serveur sont traduits ----
const fichiersDuServeur = ["auth.ts", "games.ts", "http.ts", "main.ts"];
const messagesDuServeur: string[] = [];
for (const fichier of fichiersDuServeur) {
  const code = readFileSync(new URL(`../../server/${fichier}`, import.meta.url), "utf-8");
  // Les messages écrits entre guillemets dans new HttpError(code, "message")
  for (const correspondance of code.matchAll(/HttpError\(\s*\d+,\s*"([^"]+)"/g)) {
    messagesDuServeur.push(correspondance[1]);
  }
}
verifier(`Le serveur contient des messages à traduire (${messagesDuServeur.length} trouvés)`, messagesDuServeur.length >= 20);
for (const message of messagesDuServeur) {
  const traduction = traduireErreur(message, 418);
  verifier(`Traduit : ${message}`, traduction !== message && traduction !== MESSAGE_GENERAL);
}

console.log(resultats.join("\n"));
console.log(echecs === 0 ? `\nTOUS LES ${resultats.length} TESTS PASSENT` : `\n${echecs} TEST(S) EN ECHEC sur ${resultats.length}`);
process.exit(echecs === 0 ? 0 : 1);
