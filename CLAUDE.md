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

Both backend and frontend organize features under `src/modules/<feature>/` with the same four layers (this describes **domain modules** under `src/modules/`; cross-domain **composition views** live separately under `src/views/` — see "Two layers" below). **Don't cross layers backwards** — UI/controller depends on application, application depends on domain, infrastructure implements interfaces declared in domain.

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

### Two layers: domain modules (`modules/`) vs composition views (`views/`)

Code splits into **two physically separate top-level layers**. Conflating them is what makes "which module does this page belong to?" feel unanswerable — a page is *composition*, not a domain, so it naturally spans several. `modules/` holds only domain capability; `views/` holds the cross-domain screens that orchestrate them. A composition view is a *consumer* of modules, never another domain.

| Layer | Lives in | Owns | Structure | Named after |
| --- | --- | --- | --- | --- |
| **Domain module** | `src/modules/<domain>/` | A slice of domain capability (data access + rules) | Full four layers (`domain`/`application`/`infra`+`ui`…). Exposes a `UseCase` via DI. | The **domain** (`match`, `analysis`, `player`, `room`, `auth`, `board`) |
| **Composition view** | `src/views/<screen>/` | One cross-domain feature surface — a route view, and/or the same feature's embedded modal/drawer | Flat — `<Screen>View.vue` at the root + `components/` + `composables/` (facades). **No** `domain`/`application`/`infra`, no `register*Dependencies`. Consumes domain modules via `inject`. | The **screen function** (`banPick`, `playerProfile`) |

**Derived ≠ composition.** A module that *computes from another domain's data* is still a **domain module**, not a composition layer — the derivation is cohesive domain knowledge, and a downstream data dependency is normal between domains (`analysis` derives cooccurrence/cluster from `match` data; `player` reads `match` rows). What makes something a composition view is the **absence of a capability layer**, not whether its data is second-hand: has its own compute/rules (`application`/`infra`/`domain`) → domain module, however derived; only injects others' UseCases to assemble a screen → composition view. So `analysis` (full capability layer + derived charts that `banPick` *embeds*) stays a domain module.

**The sharp line — orchestration, not nesting.** "Cross-domain" comes in two flavors that look alike but place differently:

| Flavor | What it does | Where it lives |
| --- | --- | --- |
| **UI-block nesting** | `template` embeds another domain's *public* component, or reads another domain's store, just to display. Data core is still one domain; it's a controlled component fed by props. | **Stays** in its own domain module `ui/` |
| **Capability orchestration** | Injects ≥2 domains' UseCases / runs multiple `sync`s / owns the screen's fetch + lifecycle + data flow. | **Composition view** (`views/`) |

Deciding question: *does it coordinate multiple domains' capabilities (inject several UseCases, drive the data flow), or does it just arrange other domains' UI blocks?* Only the **orchestrator** moves out. This is why `BanPickBoard.vue` (embeds `character`'s selector + `team`'s info, but is a props-fed presentational component) **stays in `board`**, while `BanPickView.vue` (orchestrates board+match+analysis+player+room+user) **is** the composition view `views/banPick/`.

**Single-domain route views stay home.** A route view that pulls from **one** domain (`LoginView`, `RoomListView`) lives in that domain module's `ui/views/` — no composition view needed. Only promote to a composition view when the view orchestrates ≥2 domains.

**Don't decide a domain module's existence by where its page goes.** `player` (capability: per-player queries) is worth being its own module based on *capability cohesion* — independent of the fact that `PlayerProfileView` lives in `views/playerProfile/`. The page injecting both `player` and `analysis` UseCases is normal composition, not a smell.

**A feature's surfaces live together; consumers import them.** The same feature's route view and embedded modal/drawer (`PlayerProfileView` + `PlayerProfileModal`) belong in **one** composition view, even when the modal's only caller is a *different* composition view (`banPick` opens `PlayerProfileModal`). Import the surface from where the feature lives — don't push the modal into the caller, that leaks the feature's cross-domain assembly into it.

**Inside a composition view the same UI conventions apply** — facades (`use<Screen>View`), chart composables, presentational components — just rooted at `views/<screen>/composables/` and `views/<screen>/components/` instead of `modules/*/ui/*`. The "Frontend composable convention" table below describes the shapes; only the path prefix differs. Logger scope for a composition view is `<screen>.<detail>` (e.g. `banPick.view`, `playerProfile.modal`) — no layer segment, since the view is flat.

### Backend persistence: Repository vs ReadModel

A module's `infra/` persistence comes in **two kinds**, split on *write-vs-read* and *canonical-entity-vs-projection*:

| Kind | Named | Owns | Returns | Examples |
| --- | --- | --- | --- | --- |
| **Repository** | `<Entity>Repository` | The entity: writes (`create`/`update`/`delete`) **and** canonical reads | An entity's **canonical** domain/contract value | `MatchRepository` (`create`/`findById`/`delete` + `findMatchTeamMembers`/`findMatchTimestamps`/`findMatchMoves` → `IMatch`/`TeamMember`/`IMatchTimestamp`), `MemberRepository`, `CharacterRepository` |
| **ReadModel** | `<Source>ReadModel`, or `<Perspective><Source>ReadModel` | Nothing — read-only projections shaped for downstream compute | A **projection / aggregate row**, not a canonical entity | `MatchReadModel` (`findMatchStatistics`/`findMatchLineupSlotPlacements`/`findMatchLineupSlotsWithCharacter`), `PlayerMatchReadModel` (`findPlayerMatchLineupSlots`/`findPlayerMatchPlacements`) |

Deciding question: **is the return value an entity's canonical shape, or a row shaped for one compute function?** Canonical → Repository (even when a caller derives from it — `findMatchTeamMembers` returns canonical `TeamMember[]`, so it lives on `MatchRepository` though `player.service` counts teammates from it). Compute-input projection (`I*Raw`, `I*Placement`, `I*WithCharacter`) → ReadModel.

- **Any write → Repository.** Pure read returning a canonical entity → still Repository (`GenshinVersionRepository` is read-only `findAll`). Pure read returning a projection → ReadModel. (Persistence may be Prisma or in-memory — `RoomStateRepository`, `MatchSnapshotRepository` — the split is unchanged.)
- **ReadModel perspective.** Global/source-perspective projections → `<Source>ReadModel` (`MatchReadModel`, methods `findMatch*`). Projections filtered to and shaped for a subject → `<Perspective><Source>ReadModel` (`PlayerMatchReadModel`, methods `findPlayerMatch*`). Only split out a perspective when its projections form a cohesive set; otherwise keep them on the source ReadModel behind an optional param (`findMatchLineupSlotsWithCharacter(playerIdentity?)`).
- **Derived modules own no persistence.** `analysis` and `player` have **no `*Repository`** (the old `AnalysisRepository` was removed) — their data is `match`'s projections/canonical reads, obtained by injecting `IMatchReadModel` / `IPlayerMatchReadModel` / `IMatchRepository`. A derived module is a *consumer* of the source's persistence, never an owner (the backend mirror of composition views in "Module kinds").
- **Method naming.** Projections: `find<Source><Entity><Projection>` (`findMatchLineupSlotPlacements`, `findPlayerMatchPlacements`). Canonical collections: `find<Entity>s` (`findMatchTimestamps`, `findMatchMoves`, `findAll`). Optional filters are optional params where absent = all (`timeWindow?`, `playerIdentity?`) — matching the frontend optional-filter pattern.
- **Interfaces live in `domain/`** (`I<Name>Repository` / `I<Name>ReadModel`); `infra/` implements. Cross-module access depends on the interface, never the other module's `infra/`.

### Persistence → domain mappers

Functions that turn a DB row into a domain/contract value follow one split. **The prefix states the action (`map` = row→domain); the variant is shown by suffix + folder, never by changing the prefix:**

- `mapX` — single row → single domain value. Takes a **structural input type** (no `@prisma/client` import), lives in `domain/`, may be imported across modules. Examples: `mapCharacter`, `mapTeamMember`, `mapPlayerIdentity`. The structural input is what keeps it ORM-agnostic, so it stays a pure domain fn and is safe to share.
- `*FromPrisma` — aggregate deserialization (a whole entity tree → DTO). Takes **Prisma types**, lives in `infra/`, used only by its own module's repository. Example: `mapMatchFromPrisma`.

Deciding question: **will it be shared across modules?** Yes → it must be Prisma-agnostic (structural input) and live in `domain/`. No, and it imports Prisma → it's an adapter, put it in `infra/`. Never import another module's `infra/`; when a module needs another's aggregate, depend on that module's repository/service interface (returns a contract DTO), not its mapper. Don't decouple a `*FromPrisma` mapper into structural types just for uniformity — own-module + Prisma means `infra/` is already correct, and the parallel type tree buys nothing.

Mapper vs converter prefix: use `map*` only when the input carries a **DB shape** (Prisma types, `*Ref` columns, groupBy rows). To turn an already-clean domain value into another representation (query DTO, view model, primitive) use `to*` instead — e.g. `toPlayerIdentityQuery`, `toTimeWindowQuery`.

### Module composition (DI)

- **Backend**: each module exposes `createXModule(prisma, ...)` from `modules/<x>/index.ts` returning `{ router, controller, service, repository? }`. `src/app/appRouter.ts` wires modules together and mounts routers under `/api/<resource>`. The socket layer (`modules/socket/`) builds its own services from `RoomStateRepository` + `RoomStateManager` (in-memory room state) and registers per-feature socket handlers in `socketController.ts`.
- **Frontend**: each module exposes `registerXDependencies(app, httpClient, store?)` which constructs a `UseCase` and `app.provide(DIKeys.X, useCase)`. `src/main.ts` is the composition root: it creates Pinia stores, then calls every `register*Dependencies` in dependency order. Inject UseCases inside components/composables via `inject(DIKeys.X)`.

`DIKeys` lives at `genshin-ban-pick/src/app/constants/diKeys.ts` — add a new symbol there when introducing a new UseCase.

### State management convention (Pinia)

The README codifies this and code follows it:

- **Setup Store** — short-lived / real-time data driven by sockets or user interaction (Ban/Pick state, chat messages, draggable pieces).
- **Options Store** — long-lived dictionaries / caches loaded once (character index, version index).

Pick the right form when adding a new store; mixing them tends to produce stale-cache bugs.

### Frontend composable convention

Six categories with different rules — using the wrong one is a common source of churn:

| Category | Path | Purpose | Rule |
| --- | --- | --- | --- |
| `useX*UseCase` | `modules/*/ui/composables/` | `inject(DIKeys.X)` gateway | One file, one inject. Even single-caller views go through this. |
| `useX*Sync` | `modules/*/sync/` | Socket ↔ store bridge | Subscribe in `onMounted`, unsubscribe in `onUnmounted`. Never holds UI state. |
| `useX*Chart` | `modules/*/ui/composables/` | Reactive echart option builder | Inputs reactive → outputs reactive options. |
| Shared UI helper | `modules/shared/ui/composables/` | Cross-module reactive helper (display names, theming, relative time…) | Extract when ≥ 2 consumers; before that, leave inline. |
| Feature composable / facade | `modules/*/ui/composables/use<X>{View,Modal,HoverCard}.ts` | View-model for a single non-trivial view | See facade rule below. |
| Cross-cut context (provide/inject pair) | `modules/shared/ui/context/<name>Context.ts` | Ancestor-owned channel a descendant subtree consumes (open-a-modal command, wrapper component injection) | See context rule below. |

**Facade rule (view-model per view).** Any view whose `<script setup>` exceeds ~50 lines, fetches data, or composes 3+ stores/UseCases gets a dedicated facade composable. When it exists:

- The `.vue` calls **one** composable and does nothing else in script besides `defineProps` / `defineEmits` and template wiring.
- All view dependencies (data fetch, derived computed, view-shape transforms, formatters, theming, presentation helpers — including shared helpers like `useCharacterDisplayName`) are wired inside the facade and re-exported. The view never imports a second composable just to grab a helper.
- Performance hacks (`Map` caches, debouncers) live inside the facade, not in `.vue`.
- Pure data transforms used only by this view stay inside the facade; promote to `modules/*/domain/` only when a second caller appears.

**Thin-component exception.** Views without a facade — small modals, hover cards, dumb presentational components — wire shared helpers directly in `.vue`. The "all-deps-from-facade" rule only kicks in once a facade exists.

**What stays in `.vue` even when a facade exists.** The facade owns reactive data + view-shape, not view composition. These belong in `.vue`:

- **Side-effect `watch`** (e.g. `watch(matchResult, val => alert(...))`) — the facade can expose the data, but observing it to fire `alert` / DOM work is view-level.
- **`provide()` calls + the refs that close over them** — `provide/inject` scope is "ancestor → descendant", so providers must live in the actual view component (siblings can't see a `<ChildModals>`'s provide). Refs whose only job is to bridge a `provide`'s open handler to the consumer modal's `v-model` are composition glue, not VM state. Putting them in the facade makes the facade a "ref holder + side-effect emitter" with no work in between, which is the wrong abstraction.
- **Component imports** consumed only by the template or fed into `provideXWrapper(Component)` — these are UI primitives the view composes, not data dependencies.

Heuristic: if removing the line from the facade and the .vue would still be 1:1 mirrors of each other (refs ↔ v-model, handler ↔ provide), the code never belonged in the facade.

**Naming rule.** The facade hook mirrors the host component's filename suffix:

- `<X>View.vue` → `use<X>View()`
- `<X>Modal.vue` → `use<X>Modal()`
- `<X>HoverCard.vue` → `use<X>HoverCard()`

Don't name facades after the OO pattern (`*Facade`, `*Adapter`) — the suffix should reflect *what host it serves*, not *what pattern it implements*. A reader looking at `FooModal.vue` should reflexively know its facade is `useFooModal()`.

**Facade templates.** Two shapes by host UX model — controlled (parent owns `:show`) vs uncontrolled (host element self-manages). Pick by host, not personal preference. Page-orchestrator views with no fetch host follow neither — they just compose sub-composables; see `useBanPickView.ts`.

| Host UX | Open state owned by | Template | Shape | Reference |
| --- | --- | --- | --- | --- |
| `<n-modal>`, `<n-drawer>` | Parent (`v-model:show`) | A — watch-driven | `(open, id)` as `MaybeRefOrGetter` → `watch([() => toValue(open), () => toValue(id)])` → fetch on `(open && id !== undefined)` with stale-flag race guard | `useMatchHistoryModal.ts`, `usePlayerHistoryModal.ts` |
| `<n-popover trigger="hover">`, `<n-tooltip>` | Host element internally | B — command-exposed | `(key)` as `MaybeRefOrGetter` → expose `load()`; host invokes on `@update:show` | `useCharacterHoverCard.ts` |

Symptom you picked wrong: needing to mirror the host's internal open state into a parent `ref` just to feed Template A's watcher — switch to B.

**Context rule (cross-cut provide/inject).** Files in `modules/shared/ui/context/<name>Context.ts` export an `InjectionKey` + `provide*()` + `use*()` triple. Two flavors:

| Flavor | Use case | `use*` returns | When provider missing | Reference |
| --- | --- | --- | --- | --- |
| Command channel | Descendant tells ancestor to act (open-a-modal) | `{ open, ... }` object — return object even for single command so future `close()` / `refresh()` don't force renames | **Throws** (no provider = bug) | `playerHistoryContext.ts`, `matchHistoryContext.ts` |
| Value reference | Descendant renders ancestor-injected value; used for cross-module dep inversion | `Component` | **Falls back** to no-op `Passthrough` (graceful degradation) | `characterHoverWrapperContext.ts` |

Naming inside the file: type ends in `Controller` for command channels, `Wrapper` / `Provider` for value references. Never put context files in `composables/` — the folder split is the signal.

### Real-time flow

Socket.IO is the live channel; REST (Express routers) is for static/historical data and auth. Backend socket handlers receive `RoomUserService`, `BoardService`, `ChatService`, `TeamService`, `LineupService` (all sharing a single `RoomStateRepository` over an in-memory `RoomStateManager`). Frontend mirrors this: each feature has a `sync/` folder (e.g. `modules/board/sync/useBoardSync.ts`) that bridges socket events ↔ Pinia store.

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
- **CSS spacing**: prefer `gap` (on flex/grid containers) and `padding` over `margin`. Avoid components self-applying `margin` — margin leaks outside the component boundary and bleeds into the caller's layout. Use `margin` only when the caller controls spacing externally (e.g., a utility class applied at the usage site).

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
