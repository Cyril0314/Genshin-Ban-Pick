# Data Flows

Step-by-step traces for the most important runtime flows.

---

## 1. Member Login

```
Client
  │
  ├─ POST /api/auth/login/member  { account, password }
  │     AuthController → AuthService.loginMember
  │       UserService.fetchMemberByAccount(account)
  │         MemberRepository.findByAccount(account) → Prisma → Member row
  │       bcrypt.compare(password, member.passwordHash)
  │       JwtProvider.sign({ type: 'Member', id, role }, 7 days)
  │     Response: { type, id, role, token }
  │
  ├─ authStore.setPrincipal({ type, id, role })
  ├─ authStore.setToken(token)              // persisted to localStorage
  │
  ├─ socketStore.connect(token)
  │     Socket.IO handshake { auth: { token } }
  │       socketAuth middleware
  │         JwtProvider.verify(token) → Principal
  │         socket.data.identity = Principal
  │       setupSocketIO → register handlers
  │
  └─ UserUseCase.fetchProfile()
        GET /api/users/me  (Authorization: Bearer token)
          requireAuth middleware → JwtProvider.verify → req.user = Principal
          UserController → UserService.fetchUser(req.user)
            MemberRepository.findById(id) → Prisma → Member row
          Response: { type, id, nickname, account }
        userStore.setUser(User)
```

**Guest login** is the same except `POST /api/auth/login/guest { nickname }` creates a new Guest row on every call and issues a 180-day token. Guest `Principal` has no `role` field.

---

## 2. Auto-Login (Page Refresh)

```
main.ts
  │
  ├─ tokenStorage.get() → token (from localStorage)
  │
  ├─ AuthUseCase.autoLogin()
  │     GET /api/auth/session  (Authorization: Bearer token)
  │       AuthController → AuthService.fetchSession(token)
  │         JwtProvider.verify(token) → Principal   ← no DB call
  │       Response: Principal
  │     authStore.setPrincipal(Principal)
  │
  ├─ socketStore.connect(token)         (same as step 1)
  │
  └─ UserUseCase.fetchProfile()         (same as step 1)
```

If the token is expired or invalid, `JwtProvider.verify` throws `ExpiredTokenError` / `InvalidTokenError`. `autoLogin` catches it, clears the stored token and principal, and the user proceeds as a visitor.

---

## 3. Socket Room Join

```
Client emits RoomEvent.UserJoinRequest(roomId)
  │
  │  roomSocket.ts handler
  │    socket.join(roomId)                  // join Socket.IO room
  │    (socket as any).roomId = roomId      // remember for disconnect cleanup
  │    identity = socket.data.identity      // Principal set by socketAuth
  │
  ├─ RoomUserService.join(roomId, identity, socket.id)
  │     UserService.fetchUser(identity)
  │       MemberRepository / GuestRepository → Prisma → nickname
  │     joinRoomUser(prevUsers, identity, nickname, socketId)
  │       pure domain fn: deduplicates, returns { joinedUser, roomUsers }
  │     RoomStateRepository.updateRoomUsersById(roomId, roomUsers)
  │
  ├─ socket.to(roomId).emit(UserJoinBroadcast, joinedUser)   // → others
  ├─ socket.emit(UserJoinResponse, joinedUser)                // → self
  └─ io.to(roomId).emit(UsersStateSyncAll, roomUsers)         // → everyone
```

On the frontend, `useRoomUserSync` listens for `UsersStateSyncAll` and replaces `roomUserStore.users`.

---

## 4. Ban/Pick Board Event (example: Ban a character)

```
Client emits BoardEvent.BanRequest { slot, characterKey }
  │
  │  boardSocket.ts handler
  │    BoardService.ban(roomId, slot, characterKey, identity)
  │      pure domain logic → update board state
  │      RoomStateRepository.updateBoard(roomId, board)
  │
  ├─ socket.to(roomId).emit(BoardEvent.BanBroadcast, { slot, characterKey })
  └─ io.to(roomId).emit(BoardEvent.BoardStateSync, boardState)
```

Frontend `useBoardSync` applies the broadcast to `boardStore`.

---

## 5. Real-time Emit Reference

| Call | Self receives | Others in room receive |
|---|---|---|
| `socket.emit(event, data)` | ✅ | ❌ |
| `socket.to(roomId).emit(event, data)` | ❌ | ✅ |
| `io.to(roomId).emit(event, data)` | ✅ | ✅ |

Convention used in this codebase:
- **Request/Response** (self-only acknowledge) → `socket.emit(XResponse, ...)`
- **Broadcast** (tell others something happened) → `socket.to(roomId).emit(XBroadcast, ...)`
- **Full state sync** (everyone gets the authoritative snapshot) → `io.to(roomId).emit(XStateSyncAll, ...)`

---

## 6. Logout

```
UserProfile.vue: handleLogout()
  │
  ├─ socketStore.disconnect()     // socket.disconnect()
  ├─ UserUseCase.clearProfile()   // userStore.setUser(undefined)
  ├─ AuthUseCase.logout()
  │     authStore.setPrincipal(undefined)
  │     authStore.setToken(undefined)   // removes from localStorage
  └─ router.push('/login')
```

There is no server-side session invalidation. JWTs remain valid until expiry. A logged-out user's token cannot be used to connect a socket because the client no longer holds it, but a captured token would still pass `JwtProvider.verify` for its remaining lifetime.

---

## 7. Error Handling

**HTTP errors** bubble up through `asyncHandler` (a wrapper around each controller method) and are caught by the global `createErrorHandler()` Express middleware:

- `AppError` subclasses (e.g., `UserNotFoundError`, `InvalidPasswordError`) → structured `{ code, message }` JSON + matching HTTP status.
- Unknown errors → `500 { code: "INTERNAL_ERROR", message: "伺服器錯誤" }`.

**Socket errors** are passed to the `next(err)` callback in middleware (e.g., `socketAuth`). Socket.IO forwards them to the client as an error event on the handshake.

**Frontend** HTTP errors propagate as rejected Promises from Axios. Each UseCase or composable that calls a repository is responsible for catching and displaying errors.
