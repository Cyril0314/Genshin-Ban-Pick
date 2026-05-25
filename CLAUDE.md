# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is a **modular monolith** split into three top-level workspaces (no root `package.json` orchestrator — install/run scripts inside each):

- `backend/` — Node.js + Express + Socket.IO + Prisma (PostgreSQL). Entry: `src/index.ts`.
- `genshin-ban-pick/` — Vue 3 + Vite + Pinia + Naive UI frontend. Entry: `src/main.ts`.
- `shared/contracts/` — TypeScript-only contracts (DTOs, value types, interfaces) shared across the boundary. Imported via the alias `@shared/*` from both sides (backend `tsconfig.json` `paths`, frontend `vite.config.ts` `resolve.alias`).

There is also a near-empty `packages/shared/` left over from earlier scaffolding — the live shared code is `shared/contracts/`.

## Common Commands

### Backend (`cd backend`)

```bash
npm run dev          # tsx src/index.ts — server on http://localhost:3000
npm run build        # tsup → dist/ (esm; bundles graphology-metrics)
npm start            # node dist/index.js

npx prisma generate                                         # regenerate Prisma Client
npx prisma migrate dev --name <name>                        # local schema migration
npx prisma migrate deploy                                   # apply existing migrations (prod)
npx tsx prisma/scripts/importGenshinVersions.ts             # seed static version data
npx tsx prisma/scripts/importCharacters.ts                  # seed static character data
```

Backend has no test runner wired up (`npm test` is a placeholder). There is no lint script in `package.json`; run ESLint manually if needed (`npx eslint .`).

### Frontend (`cd genshin-ban-pick`)

```bash
npm run dev          # vite dev server on http://localhost:5173 (proxies /api → 127.0.0.1:3000)
npm run build        # parallel: vue-tsc --build  +  vite build
npm run type-check   # vue-tsc --build  (use this to verify TS without producing a bundle)
npm run lint         # run-s lint:oxlint lint:eslint  (oxlint first, then eslint --fix)
npm run format       # prettier --write src/
```

### Shared

`shared/` has no build step — it is pure `.ts` consumed via path aliases. Do not add a build pipeline to it unless you also wire it into both consumers.

## Architecture

### Clean Architecture per module

Both backend and frontend organize features under `src/modules/<feature>/` with the same four layers. **Don't cross layers backwards** — UI/controller depends on application, application depends on domain, infrastructure implements interfaces declared in domain.

| Layer              | Backend path                  | Frontend path                                   | Responsibility                                                   |
| ------------------ | ----------------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| Domain             | `modules/*/domain`            | `modules/*/domain`                              | Business rules (pure fns) + behavioral interface contracts (`I*Repository`, `I*Provider`) |
| Application        | `modules/*/application`       | `modules/*/application`                         | Services / UseCases — orchestrate domain + infra + store         |
| Interface adapters | `modules/*/controller`, `http`| `modules/*/ui` (`.vue`), `store` (Pinia), `sync`| HTTP/Socket handlers on backend; components/stores on frontend   |
| Infrastructure     | `modules/*/infra`             | `modules/*/infrastructure`, `app/infrastructure`| Prisma repos, socket clients, axios client                       |

**`domain/` vs `types/`** — both hold `I*`-prefixed declarations, split by nature, not by name:

- `domain/` — declarations that describe **behavior**: repository/provider interfaces (methods), and pure domain functions/business rules.
- `types/` — plain **data shapes** with no behavior: entity rows returned by repositories, DTOs, query results (e.g. `IMemberData`, `IGuestData`, `IMatchStatisticsOverview`).

Rule of thumb: if it has methods or encodes a rule it belongs in `domain/`; if it is just fields it belongs in `types/`. (Cross-boundary data shapes go in `shared/contracts/` instead — `types/` is for module-internal shapes.)

### Module composition (DI)

- **Backend**: each module exposes `createXModule(prisma, ...)` from `modules/<x>/index.ts` returning `{ router, controller, service, repository? }`. `src/app/appRouter.ts` wires modules together and mounts routers under `/api/<resource>`. The socket layer (`modules/socket/`) builds its own services from `RoomStateRepository` + `RoomStateManager` (in-memory room state) and registers per-feature socket handlers in `socketController.ts`.
- **Frontend**: each module exposes `registerXDependencies(app, httpClient, store?)` which constructs a `UseCase` and `app.provide(DIKeys.X, useCase)`. `src/main.ts` is the composition root: it creates Pinia stores, then calls every `register*Dependencies` in dependency order. Inject UseCases inside components/composables via `inject(DIKeys.X)`.

`DIKeys` lives at `genshin-ban-pick/src/app/constants/diKeys.ts` — add a new symbol there when introducing a new UseCase.

### State management convention (Pinia)

The README codifies this and code follows it:

- **Setup Store** — short-lived / real-time data driven by sockets or user interaction (Ban/Pick state, chat messages, draggable pieces).
- **Options Store** — long-lived dictionaries / caches loaded once (character index, version index).

Pick the right form when adding a new store; mixing them tends to produce stale-cache bugs.

### Real-time flow

Socket.IO is the live channel; REST (Express routers) is for static/historical data and auth. Backend socket handlers receive `RoomUserService`, `BoardService`, `ChatService`, `TeamService`, `TacticalService` (all sharing a single `RoomStateRepository` over an in-memory `RoomStateManager`). Frontend mirrors this: each feature has a `sync/` folder (e.g. `modules/board/sync/useBoardSync.ts`) that bridges socket events ↔ Pinia store.

Auth on sockets goes through `createSocketAuth(jwtProvider)` middleware before `setupSocketIO` registers handlers — it calls `jwtProvider.verify(token)` directly and stores the result in `socket.data.identity` (no DB call).

### Shared contracts

When adding a cross-boundary type, put it under `shared/contracts/<domain>/` and import as `@shared/contracts/...`. Both sides resolve this alias; do not duplicate types per side.

### Identity model

Four types represent users in different contexts. Pick the right one — using the wrong type is a common source of bugs.

| Type | Where it lives | What it carries | When to use |
| --- | --- | --- | --- |
| `Identity` | `shared/contracts/identity/Identity.ts` | `{ type, id }` | DB lookup parameter; socket presence |
| `Principal` | `shared/contracts/auth/Principal.ts` | `Identity` + `role` (Member only) | JWT payload; `req.user`; authorization checks |
| `User` | `shared/contracts/user/User.ts` | `Identity` + `nickname` (+ `account` for Member) | Display name in UI; fetched from DB via `UserService.fetchUser` |
| `PlayerIdentity` | `shared/contracts/identity/PlayerIdentity.ts` | `Identity` ∪ `{ type: 'Name'; name }` | Analysis queries; includes name-only historical players |
| `TeamMember` | `shared/contracts/team/TeamMember.ts` | `PlayerIdentity` + eager `nickname` | Match records; team slot payloads |

**Frontend store split:** `authStore.principal` holds the `Principal` (from JWT, no DB). `userStore.user` holds the `User` (fetched after login). Components read `nickname` from `userStore`, never from `authStore`.

Full hierarchy and decision table: [`docs/identity-model.md`](docs/identity-model.md)

## Conventions (enforced by README + tooling)

- File names: `kebab-case` with role suffixes — `*.service.ts`, `*UseCase.ts`, `*Repository.ts`, `*.controller.ts`, `*.socket.ts`, `*.vue`.
- Identifiers: `lowerCamelCase` for vars/functions, `UpperCamelCase` for types/classes, `UPPER_SNAKE_CASE` for constants, interfaces prefixed `I`.
- REST routes: plural-noun resources under `/api/<resource>`, nested children under `/api/<resource>/:id/<child>`.
- Prettier (root `.prettierrc.json`): 4-space indent, single quotes, semis, 150 print width. Frontend lint runs **oxlint then eslint**; both must pass.
- Import order is enforced by `eslint-plugin-import` on both sides: builtin → external → internal → parent/sibling/index → object → type, with blank lines between groups, alphabetized.
- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, `doc:` are visible in recent history).
- Frontend CSS naming rules (one-block-per-file, `is-*` for state vs `--` for variant, design tokens) live in `genshin-ban-pick/CSS_CONVENTIONS.md`. When editing or creating `.vue` files, follow that style (currently a touch-time migration — old files keep their BEM until naturally touched).

### Logger scope (backend)

`createLogger(scope)` in `backend/src/utils/logger.ts` takes a `scope` string that prints as `[LEVEL][scope]`. Use the form **`module.layer[.detail]`** — lowercase, dot-separated, no spaces.

- `module` is the feature folder under `modules/` (`room`, `auth`, `match`, `analysis`, `socket`, …) or a top-level area (`app`, `http`).
- `layer` matches the Clean Architecture folder: `routes`, `service`, `domain`, `infra`, plus `socket.*` for individual socket handlers and `socket.controller` for the dispatcher.
- `detail` is only added when one layer has multiple files in the same module (`room.service.user`, `socket.infra.roomStateManager`). Single-file layers stay at two parts (`auth.service`, `analysis.routes`).

One logger per file. Scope is "where I am," not "what I do" — keep task wording in the log message. Examples in use today: `app.bootstrap`, `http.errorHandler`, `room.routes`, `room.service.user`, `room.domain.matchFlow`, `match.infra.repository`, `socket.board`, `socket.controller`.

## Database / Ops Notes

- Schema lives in `backend/prisma/schema.prisma`. Migrations are in `backend/prisma/migrations/` — when destructive (column drops, etc.), the README requires splitting the change across two deploys.
- For data-backfill migrations, hand-author a SQL file under `migrations/` then run `npx prisma migrate dev` (do not rely on `prisma migrate dev --create-only` automation alone).
- Production runs under PM2 (`pm2 start "npx tsx src/index.ts" --name genshin-ban-pick`). The backend serves the built frontend statically from `backend/public/` and falls back to `index.html` for unknown routes (Vue Router history mode).
- CORS allow-list is hard-coded in `backend/src/index.ts` and `modules/socket/index.ts` (`http://localhost:5173`, `http://98.86.73.53:3000`) — update both if origins change.
- For copying production DB to local, see the `pg_dump` / `pg_restore` recipe in `README.md` (uses an SSH tunnel on port 5433 and the homebrew `postgresql@15` binary to avoid a server-version mismatch).

## Scope vocabulary

The README defines a `Scope` taxonomy used in repository/service signatures (`Minimal`, `Core`, `Light`, `Expanded`, `Summary`, `Detailed`, `Full`). When adding a query method, pick the matching scope rather than inventing a new one — it determines which fields and relations are joined.

## Before adding new code

Default to extending existing code. Before introducing a new type / repo method / composable / store / file, grep the relevant module + `shared/contracts/` for something already doing similar work — most "new" features here are extensions of an existing pattern. If a repo method exists with the same query, extend its projection rather than adding a parallel method. When the role of what you're writing matches an existing component / composable / store, follow that file's structure rather than inventing a new shape.

Self-check after writing: "if I delete this addition and use the existing thing, can I still achieve the goal?" If yes, delete.

## Working style: challenge architecture decisions

When I propose an approach, architecture choice, type shape, module boundary, naming, or non-trivial refactor — treat it as a **draft to be reviewed**, not an instruction to execute. Before agreeing or implementing:

- Actively look for hidden trade-offs, edge cases, over-engineering, and simpler alternatives.
- If you see a problem or a better path, **state it before doing**, with reasoning ("this might break X because Y" / "consider Z because W").
- Don't just go along to be agreeable. Silence = endorsement, and I don't want endorsement by default.
- If after hearing the pushback I confirm my choice, **proceed without further argument** — one round, not nagging.

Scope: this applies to **design decisions**. It does NOT apply to mechanical tasks (rename, fix typo, run command, format adjustment).
