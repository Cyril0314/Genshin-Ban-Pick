# Identity Model

The project uses a layered set of discriminated union types to represent users across different contexts. Understanding the hierarchy prevents mixing up which type belongs where.

---

## Type Hierarchy

```
Identity                          – who you are (JWT / socket)
  ├── Principal                   – Identity + auth claims (JWT payload)
  └── User                        – Identity + display profile (DB)

PlayerIdentity                    – Identity ∪ anonymous name (analysis)
  └── TeamMember                  – PlayerIdentity + eager nickname (match records)
```

---

## Identity

**File:** `shared/contracts/identity/Identity.ts`

```ts
export type Identity =
    | { type: 'Member'; id: number }
    | { type: 'Guest'; id: number };
```

The narrowest possible representation — just enough to identify someone. Used wherever the system needs to look a user up but does not need display data.

**Used in:**
- `socket.data.identity` (set by socket auth middleware)
- `IRoomUser`, `IChatMessage` (who is present / who sent)
- Service method parameters that trigger a DB fetch for the rest

**Utility:** `isSameIdentity(a, b)` — compares type + id for equality.

---

## Principal

**File:** `shared/contracts/auth/Principal.ts`

```ts
export type Principal =
    | (Extract<Identity, { type: 'Member' }> & { role: MemberRole })
    | Extract<Identity, { type: 'Guest' }>;
```

The JWT payload. Carries `role` for Members so authorization checks do not require a DB round-trip.

**Used in:**
- `JwtProvider.sign(principal, days)` / `JwtProvider.verify(token)`
- `requireAuth` middleware sets `req.user: Principal`
- `authStore.principal` (frontend)
- `socket.data.identity` (socket auth verifies the JWT and stores the result here — note: same slot as `Identity` but typed as `Principal` at runtime)

**Token lifetimes:**
- Member: 7 days
- Guest: 180 days

---

## User

**File:** `shared/contracts/user/User.ts`

```ts
export type User =
    | (Extract<Identity, { type: 'Member' }> & { nickname: string; account: string })
    | (Extract<Identity, { type: 'Guest' }> & { nickname: string });
```

The full profile fetched from the database. Contains the display name used everywhere in the UI.

**Used in:**
- `UserService.fetchUser(identity): Promise<User>`
- `GET /api/users/me` response body
- `userStore.user` (frontend)
- `RoomUserService.join` — fetches User to get nickname for the room presence list

**Never stored in the JWT** — profile data can change, token would go stale.

---

## PlayerIdentity

**File:** `shared/contracts/identity/PlayerIdentity.ts`

```ts
export type PlayerIdentity =
    | Identity                          // Member | Guest
    | { type: 'Name'; name: string };   // anonymous / historical
```

Extends `Identity` with a third variant for players who participated in a match without a system account (recorded by name only).

**Used in:** `analysis` module — `fetchPlayerRecord`, `fetchCharacterAttributeDistributions`.

**Serialization helpers:** `stringifyPlayerIdentity` / `parsePlayerIdentity` — encode to/from `Member:42`, `Guest:7`, `Name:Alice` strings for use in URL query parameters.

---

## TeamMember

**File:** `shared/contracts/team/TeamMember.ts`

```ts
export type TeamMember =
    | (Extract<PlayerIdentity, { type: 'Member' }> & { nickname: string })
    | (Extract<PlayerIdentity, { type: 'Guest' }> & { nickname: string })
    | Extract<PlayerIdentity, { type: 'Name' }>;
```

A `PlayerIdentity` with an eagerly-resolved nickname for `Member` and `Guest` variants. Used in team composition payloads and match records where the nickname must be stored at creation time (the user might change their nickname later).

**Used in:** `ITeam`, `IMatchTeamMember`, team socket events, `MatchTeamMemberCreator`.

---

## Decision Table — Which Type to Use

| Situation | Use |
|---|---|
| JWT payload, socket auth data | `Principal` |
| Authorize (check role) | `Principal` |
| Look up a user in the DB | `Identity` |
| Render nickname / account | `User` |
| Match record / team slot | `TeamMember` |
| Analysis query parameter | `PlayerIdentity` |
| Compare two users for equality | `Identity` + `isSameIdentity` |

---

## Frontend Store Split

The frontend maintains two separate stores to mirror this distinction:

| Store | Holds | Populated by |
|---|---|---|
| `authStore` | `Principal \| undefined` | `AuthUseCase` (on login / auto-login) |
| `userStore` | `User \| undefined` | `UserUseCase.fetchProfile()` (after login) |

Components that need the display name read from `userStore.nickname`. Components that need to check login state or role read from `authStore.isLoggedIn` / `authStore.isAdmin`. The two stores are intentionally separate so the auth token can be validated without a DB call.
