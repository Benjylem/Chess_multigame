# Chess Multigame

Online two-player chess, played turn by turn in the browser. Each player uses their own computer: create a game,
invite your opponent by email, and play. The game is complete: every move rule, check, checkmate, stalemate,
castling, en passant and promotion are implemented.

This is a school project (Ynov, B2 "fil rouge"): a multiplayer turn-based game built with **React + TypeScript**
on top of a generic game backend provided by the teacher.

## Features

- **Accounts**: sign up and log in with an email and a password. The session survives a page reload.
- **Games**: create a game, invite your opponent by email, see all your games in progress, and browse your history
  of finished games with the result (victory, defeat, draw).
- **Complete chess rules**: all piece moves, check, checkmate, stalemate, castling, en passant, pawn promotion,
  and draw by insufficient material. A move that leaves your own king in check is never allowed.
- **Real multiplayer**: colors are drawn at random when the game starts, white plays first, the board updates on
  the opponent's screen within one second, and you cannot play out of turn.
- **End of game**: checkmate, stalemate, draw, resignation ("Abandonner"), or automatic end if nobody has played
  for one hour. A clear message tells each player if they won, lost or drew.
- **Help**: a step-by-step "Comment jouer" window opens after sign-up and can be reopened from the top bar.
- **Comfort**: the board is flipped so you always play from the bottom, captured pieces are shown next to the
  board, playable squares are highlighted, and the interface works in light and dark mode and on mobile.

## Tech stack

| Part | Technology |
|------|------------|
| Frontend | React 19, TypeScript, Vite, React Router |
| State | React Context + `useReducer` (login), local component state (games) |
| Backend | Deno server provided by the teacher (`server/`), SQLite database |
| Quality | Type checking (`tsc`), linter (`oxlint`), 45 unit tests on the chess rules |

The backend is generic: it knows nothing about chess. It only stores the game as a free JSON text and decides who is
allowed to write (only the player whose turn it is). **All the chess logic lives in the frontend**, in
`client/src/game-logic/`.

## Getting started

Prerequisites: Node.js 22+ and Deno 2.9+.

```bash
# 1. Backend (http://localhost:8000, API documentation on /docs)
cd server
deno task start

# 2. Frontend, in another terminal (http://localhost:5173)
cd client
npm install
npm run dev
```

Open http://localhost:5173. To try a full game alone, use two browser sessions (a normal window and a private
window) with two different accounts.

## How to play

1. **Sign up** (a short tutorial opens) or log in.
2. Click **Créer une partie**, then **Créer la partie**. You land on the page of your new game.
3. **Invite your opponent**: type the email he or she used to sign up (the account must already exist) and click
   **Inviter**. The opponent is added immediately and sees the game in **Parties en cours**.
4. When both players are in, the creator clicks **Démarrer la partie**. Colors are drawn at random.
5. **Play**: click one of your pieces (dots show where it can go), then click a destination square. When a pawn
   reaches the last row, choose the new piece in the window that opens.
6. The game ends on checkmate, stalemate or draw. You can also click **Abandonner** during your turn. Finished games
   are kept in **Historique**.

## Project structure

```
client/                     React + TypeScript frontend
  src/
    api/                    Calls to the backend (auth, games)
    components/             Navbar, tutorial window, waiting room
      chess/                Board, square and piece display
    context/                Login state shared by the whole application
    game-logic/             The chess rules, independent from React
      types.ts              Pieces, colors, board, moves
      board.ts              Starting position
      deplacements.ts       Where each piece can go
      regles.ts             Check, checkmate, stalemate, castling, en passant, promotion
      partie.ts             What is saved in the backend for a game
    pages/                  Login, sign-up, my games, create game, game, history
  tests/                    Unit tests of the chess rules
server/                     Backend provided by the teacher (Deno + SQLite)
```

## How it works

- A game is saved in the backend as a JSON text `state`: the board, which player has which color, whether each
  castling is still allowed, the possible en passant square, and the time of the last move.
- When you play a move, the page applies it with `jouerCoup`, checks whether the opponent is now checkmated or in
  stalemate, and sends the new state to the server, which passes the turn to the opponent.
- Each page of a running game asks the server for the game every second (there are no websockets on this
  backend), and a small protection ignores a late answer so that a piece never jumps back on screen.
- The same code decides which squares are proposed to the player and whether a move is legal, so an illegal move
  cannot be played from the interface.

## Tests

```bash
cd client
npm test          # 45 unit tests on the chess rules (castling, en passant, promotion, checkmate...)
npm run lint      # code style, no warning
npm run build     # type checking + production build
```

The full game flow (sign-up, invitation, a game played to checkmate, castling, en passant, promotion, resignation,
history) was also checked by hand-written browser scripts against the real backend with two accounts.

## Team and work timeline

The work was split in vertical slices, one branch each, then merged into `feature/chess-game`, `Fusion` and `main`.

| Slice | Content | Author |
|-------|---------|--------|
| Foundation | Project setup, API wrapper, login context, protected routes, navigation bar | Benji |
| Authentication | Login and sign-up pages, first styles (navigation bar, forms) | lgabor |
| Games management | First version of the game creation, games list and history pages | bvanchri |
| Chess game | Chess rules, board, game page, backend connection, tests, tutorial, integration of the three slices, and rework of the games pages (automatic list, results in the history, direct creation) | Benji |

Work was spread over several days, not done at the end: project start on 10/09, foundation on 15/09, chess engine
started on 16/09, authentication and games pages on 21-22/09, integration of the three slices on 22-23/09, and
special rules, tests, styling and documentation on 28/09.

## Known limits and ideas

- The server does not check moves: all rules are checked by the client, so a modified client could cheat.
- Resignation is only possible during your own turn, because the server only lets the player whose turn it is write.
  For the same reason, a game abandoned by both players ends automatically after one hour, when the player whose turn
  it is opens the page again.
- No threefold repetition, fifty-move rule, clock or spectator mode.
- The opponent must already have an account to be invited.
