# Chess Multigame

Jeu d'échecs en ligne à deux joueurs, tour par tour, dans le navigateur. Chaque joueur est sur son propre
ordinateur : on crée une partie, on invite son adversaire par email, et on joue. Toutes les règles sont gérées :
déplacements, échec, échec et mat, pat, roque, prise en passant et promotion.

Projet fil rouge de B2 (Ynov) réalisé en équipe de 3 : un jeu multijoueur au tour par tour en **React + TypeScript**,
au-dessus d'un serveur de jeu générique fourni par le professeur.

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Technologies](#technologies)
3. [Installation et lancement](#installation-et-lancement)
4. [Comment jouer](#comment-jouer)
5. [Tests](#tests)
6. [Structure du projet](#structure-du-projet)
7. [Fonctionnement technique](#fonctionnement-technique)
8. [Équipe et déroulé du projet](#équipe-et-déroulé-du-projet)
9. [Limites connues](#limites-connues)

## Fonctionnalités

- **Comptes** : inscription et connexion avec un email et un mot de passe. La connexion est conservée quand on
  recharge la page.
- **Parties** : création d'une partie, invitation de l'adversaire par email, liste de ses parties en cours, et
  historique des parties terminées avec le résultat (victoire, défaite, nulle).
- **Règles complètes** : tous les déplacements, échec, échec et mat, pat, roque, prise en passant, promotion du pion
  et nulle par matériel insuffisant. Un coup qui laisse son propre roi en échec est impossible.
- **Vrai multijoueur** : les couleurs sont tirées au sort au démarrage, les blancs jouent en premier, le plateau se
  met à jour chez l'adversaire en moins d'une seconde, et on ne peut pas jouer hors de son tour.
- **Fin de partie** : échec et mat, pat, nulle, abandon (bouton « Abandonner »), ou fin automatique si personne n'a
  joué depuis une heure. Un message clair indique à chaque joueur s'il a gagné, perdu ou fait match nul.
- **Aide** : une fenêtre « Comment jouer » en plusieurs étapes s'ouvre après la création d'un compte, et peut être
  rouverte depuis la barre du haut.
- **Confort** : le plateau est retourné pour que chacun joue depuis le bas, les pièces capturées s'affichent à côté
  du plateau, les cases jouables sont indiquées, et l'interface s'adapte au mode clair/sombre et au mobile.

## Technologies

| Partie | Technologie |
|--------|-------------|
| Frontend | React 19, TypeScript, Vite, React Router |
| État | Context API + `useReducer` (connexion), état local des composants (parties) |
| Backend | Serveur Deno fourni par le professeur (dossier `server/`), base SQLite |
| Qualité | Vérification des types (`tsc`), linter (`oxlint`), 84 tests automatiques (règles des échecs et messages d'erreur) |

Le serveur est **générique** : il ne connaît rien aux échecs. Il stocke seulement la partie sous forme de texte JSON
libre et décide qui a le droit d'écrire (uniquement le joueur dont c'est le tour). **Toute la logique des échecs est
donc dans le frontend**, dans `client/src/game-logic/`.

La documentation de l'API du serveur est dans [`server/README.md`](./server/README.md), et une fois le serveur lancé
sur http://localhost:8000/docs.

## Installation et lancement

Prérequis : **Node.js 22 ou plus** et **Deno 2.9 ou plus**.

Il faut lancer deux choses en même temps, dans deux terminaux.

**Terminal 1 : le serveur** (http://localhost:8000)

```bash
cd server
deno task start
```

**Terminal 2 : l'application** (http://localhost:5173)

```bash
cd client
npm install        # seulement la première fois
npm run dev
```

Ouvrir ensuite http://localhost:5173 dans le navigateur.

Attention : les commandes `npm` se lancent **depuis le dossier `client/`**, pas depuis la racine du dépôt (c'est là
que se trouve le `package.json`).

## Comment jouer

1. **Créer un compte** (un petit tutoriel s'ouvre) ou se connecter.
2. Cliquer sur **Créer une partie**, puis sur **Créer la partie**. On arrive sur la page de sa nouvelle partie.
3. **Inviter son adversaire** : taper l'email qu'il a utilisé pour s'inscrire (son compte doit **déjà exister**) et
   cliquer sur **Inviter**. Il est ajouté tout de suite et voit la partie dans **Parties en cours**.
4. Quand les deux joueurs sont là, le créateur clique sur **Démarrer la partie**. Les couleurs sont tirées au sort.
5. **Jouer** : cliquer sur une de ses pièces (des points montrent où elle peut aller), puis sur la case de
   destination. Quand un pion arrive au bout du plateau, une fenêtre permet de choisir sa nouvelle pièce.
6. La partie se termine par un échec et mat, un pat ou une nulle. On peut aussi cliquer sur **Abandonner** pendant
   son tour. Les parties terminées restent consultables dans **Historique**.

**Pour essayer seul une partie complète**, il faut deux sessions séparées : une fenêtre normale et une fenêtre de
navigation privée, avec deux comptes différents (la connexion est enregistrée dans le navigateur, donc deux
onglets normaux partageraient le même compte).

## Tests

### Lancer les tests unitaires

Il y a deux séries de tests, qui n'ont besoin ni du navigateur ni du serveur. Depuis le dossier `client/` :

```bash
cd client
npm install               # seulement la première fois
npm test                  # lance les deux séries (84 tests)
npm run test:regles       # seulement les règles des échecs (45 tests)
npm run test:erreurs      # seulement la traduction des messages d'erreur (39 tests)
```

Résultat attendu : une ligne `OK` par test, puis la conclusion de chaque série :

```
OK  Roque : petit roque blanc propose (g1)
OK  En passant : le pion adverse est retire du plateau
...
TOUS LES 45 TESTS PASSENT
...
OK  Traduit : It is not your turn
...
TOUS LES 39 TESTS PASSENT
```

Si un test échoue, il est affiché avec `KO`, la conclusion indique le nombre de tests en échec, et la commande
se termine avec une erreur.

**Comment ça marche** : chaque commande compile son fichier de test (`client/tests/regles.test.ts` ou
`client/tests/erreurs.test.ts`) dans un dossier temporaire (`client/tests-build/`, ignoré par git) puis l'exécute
avec Node. Aucun outil de test supplémentaire n'est nécessaire.

### Ce que les tests vérifient

| Thème | Exemples de cas testés |
|-------|------------------------|
| Position de départ | Nombre de coups d'un pion et d'un cavalier, pas d'échec ni de mat au départ |
| Roque | Petit et grand roque des blancs et des noirs ; interdit si le roi est en échec, si une case traversée est attaquée, si une pièce gêne, si le droit est perdu (roi ou tour déjà bougé, tour capturée) ; autorisé si seule la case de la tour est attaquée |
| Prise en passant | Possible uniquement au coup suivant ; le pion adverse est retiré ; interdite si elle expose son propre roi ; pas de fausse prise |
| Promotion | Dame, tour, fou ou cavalier ; blancs et noirs ; avec capture ; impossible sur une case occupée |
| Fin de partie | Mat du fou (4 coups), pat classique, matériel insuffisant (roi seul, roi + fou, roi + cavalier) |
| Messages d'erreur | Les erreurs du serveur (écrites en anglais) sont toutes affichées en français : mauvais mot de passe, compte déjà existant, email sans compte, ce n'est pas ton tour... Un test lit le code du serveur et vérifie que **chaque** message a une traduction |

### Ajouter un test

Chaque test dessine une position avec un petit plateau en texte (majuscule = pièce blanche, minuscule = pièce noire,
point = case vide), joue un coup, et vérifie le résultat :

```ts
const plateau = plateauDepuis([
  "k.......",   // ligne 0 (haut) : roi noir en a8
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
  "R...K..R",    // ligne 7 (bas) : tours et roi blancs
]);
const coups = getMouvementsLegaux(plateau, { ligne: 7, colonne: 4 }, creerContexteDeDepart());
verifier("Roque : le petit roque est proposé", coups.some((c) => c.ligne === 7 && c.colonne === 6));
```

### Autres vérifications

Depuis le dossier `client/` :

```bash
npm run lint       # qualité du code (aucun avertissement attendu)
npm run build      # vérification des types TypeScript + construction de l'application
```

### Tester une partie complète à la main

Avec deux sessions (fenêtre normale + navigation privée) et deux comptes, voici des parties courtes pour vérifier
chaque règle. Les coups sont dans la notation habituelle des échecs ; la couleur de chacun est tirée au sort, donc
il faut suivre les coups de la couleur qu'on a.

| Règle à vérifier | Coups à jouer | Résultat attendu |
|------------------|---------------|------------------|
| Échec et mat | 1. f3 e5 2. g4 Dh4 | Les noirs gagnent : message « Échec et mat » des deux côtés, la partie apparaît dans l'historique |
| Prise en passant | 1. e4 a6 2. e5 d5 3. exd6 | Le pion noir d5 disparaît après la prise |
| Petit roque | 1. e4 e5 2. Cf3 Cc6 3. Fc4 Fc5 4. O-O | Le roi va en g1 et la tour en f1 |
| Promotion | 1. h4 g5 2. hxg5 a6 3. g6 a5 4. gxh7 a4 5. hxg8 | Une fenêtre propose dame, tour, fou ou cavalier |
| Abandon | Cliquer sur « Abandonner » pendant son tour | L'adversaire est déclaré vainqueur |

## Structure du projet

```
client/                     Frontend React + TypeScript
  src/
    api/                    Appels au serveur (connexion, parties) et traduction des erreurs en français
    components/             Barre de navigation, fenêtre d'aide, salle d'attente
      chess/                Affichage du plateau, des cases et des pièces
    context/                Connexion partagée dans toute l'application
    game-logic/             Les règles des échecs, indépendantes de React
      types.ts              Pièces, couleurs, plateau, coups
      board.ts              Position de départ
      deplacements.ts       Où peut aller chaque pièce
      regles.ts             Échec, mat, pat, roque, prise en passant, promotion
      partie.ts             Ce qui est enregistré sur le serveur pour une partie
    pages/                  Connexion, inscription, mes parties, création, partie, historique
  tests/                    Tests automatiques (règles des échecs, messages d'erreur)
server/                     Serveur fourni par le professeur (Deno + SQLite)
```

## Fonctionnement technique

- Une partie est enregistrée sur le serveur dans un texte JSON, le `state` : le plateau, la couleur de chaque
  joueur, les roques encore permis, la case de prise en passant éventuelle, et l'heure du dernier coup.
- Quand on joue un coup, la page l'applique avec `jouerCoup`, regarde si l'adversaire est maintenant mat ou pat,
  puis envoie le nouvel état au serveur, qui donne le tour à l'adversaire.
- Chaque page d'une partie en cours redemande la partie au serveur toutes les secondes (ce serveur n'a pas de
  websockets). Une petite protection ignore une réponse arrivée en retard, pour qu'une pièce ne « revienne » jamais
  en arrière à l'écran.
- Le même code décide des cases proposées au joueur et de la légalité d'un coup : depuis l'interface, on ne peut pas
  jouer un coup interdit.

## Équipe et déroulé du projet

Le travail a été découpé en lots verticaux, un par branche, puis fusionnés dans `feature/chess-game`, `Fusion` et
`main`.

| Lot | Contenu | Auteur |
|-----|---------|--------|
| Socle | Création du projet, appels au serveur, connexion, routes protégées, barre de navigation | Benji |
| Authentification | Pages de connexion et d'inscription, premiers styles (barre de navigation, formulaires) | lgabor |
| Gestion des parties | Première version de la création de partie, de la liste des parties et de l'historique | bvanchri |
| Jeu d'échecs | Règles, plateau, page de partie, lien avec le serveur, tests, tutoriel, intégration des trois lots, reprise des pages de parties (liste automatique, résultat dans l'historique, création directe) | Benji |

Le travail est réparti sur plusieurs jours, il n'a pas été fait à la fin : lancement du projet le 10/09, socle le 15/09,
début du moteur d'échecs le 16/09, authentification et pages de parties les 21 et 22/09, intégration des trois lots
les 22 et 23/09, puis coups spéciaux, tests, mise en forme et documentation le 28/09.

## Limites connues

- Le serveur ne vérifie pas les coups : toutes les règles sont vérifiées par le client, donc un client modifié
  pourrait tricher (le serveur fourni est volontairement générique).
- L'abandon n'est possible que pendant son propre tour, car le serveur n'autorise à écrire que le joueur dont c'est
  le tour. Pour la même raison, une partie quittée par les deux joueurs se termine automatiquement au bout d'une
  heure, quand le joueur dont c'est le tour rouvre la page.
- Pas de nulle par triple répétition, pas de règle des 50 coups, pas de pendule, pas de mode spectateur.
- L'adversaire doit déjà avoir un compte pour être invité.
