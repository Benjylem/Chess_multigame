# Chess_multigame

Projet fil rouge B2 : jeu d'échecs multijoueur en tour par tour, développé en équipe de 3.

- **Deadline** : 27/09/2026
- **Stack** : frontend React + TypeScript (Vite), backend Deno (fourni par le professeur,
  générique — ne connaît pas les échecs, stocke juste l'état de partie en JSON libre)
- **Structure** : monorepo, tout dans ce dépôt (`client/` pour le frontend, `server/` pour le
  backend)

## Fonctionnalités

- Création de compte / connexion (email + mot de passe)
- Création de partie et invitation d'un adversaire par email
- Jeu d'échecs complet : tous les déplacements, détection d'échec / échec et mat / pat
- Couleur (blanc/noir) tirée au sort au démarrage de la partie
- Partie jouée en tour par tour, synchronisée entre les deux navigateurs (polling, pas de
  websocket sur ce backend)
- Message de fin de partie (gagné / perdu / nul)

### Pas encore fait

- Roque, prise en passant, promotion du pion
- Page "Parties en cours" (liste des parties) et page "Historique" — pages créées mais pas
  encore branchées sur l'API
- CSS général de l'application (au-delà du plateau et de la page de connexion)

## Répartition du travail

Le projet a été découpé en 3 lots verticaux, chacun sur sa propre branche :

| Lot | Contenu | Qui | Branche |
|-----|---------|-----|---------|
| Lot 0 — Socle commun | Scaffold Vite/React/TS, routing, authentification (contexte global), wrapper d'appel à l'API, navbar | Benji | `setup/init-project` → `Fusion` |
| Lot 1 — Auth | Pages de connexion et création de compte, CSS de la navbar | lgabor | `Auth` |
| Lot 2 — Gestion des parties | Création de partie, invitation d'un joueur, composants d'affichage d'une partie | bvanchri | `feature/game-management` |
| Lot 3 — Jeu d'échecs | Logique complète des règles, plateau interactif, page de jeu, branchement au backend (démarrage, tour, fin de partie) | Benji | `feature/chess-game` |

Le Lot 3 dépendait des Lots 0 et 2 pour être testé en conditions réelles (il faut un vrai
token et une vraie partie créée pour tester le branchement à l'API). Pour ne pas bloquer le
travail en parallèle, la logique d'échecs pure a été développée et testée de façon isolée
(page de test locale, sans backend), puis le vrai branchement à l'API a été fait une fois
les Lots 0 et 2 disponibles, avec intégration régulière du travail des autres membres au fur
et à mesure (plutôt qu'une seule grosse fusion en fin de projet).

## Lancer le projet en local

Deux serveurs à lancer en parallèle :

```bash
# Backend (nécessite Deno >= 2.9)
cd server
deno task dev

# Frontend
cd client
npm install
npm run dev
```

Le backend tourne sur `http://127.0.0.1:8000` (doc Swagger sur `/docs`), le frontend sur
`http://localhost:5173`.

## Structure du dépôt

```
client/               Frontend React + TypeScript
  src/
    api/               Appels à l'API du backend
    components/        Composants réutilisables (navbar, plateau d'échecs...)
    context/           État global (authentification)
    game-logic/         Logique des échecs, indépendante de React (types, règles, déplacements)
    pages/             Les pages de l'application
server/                Backend Deno fourni par le professeur (générique, ne connaît pas les échecs)
```
