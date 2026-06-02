# 資料庫結構圖

> 由 `backend/prisma/schema.prisma` 整理而來。修改 schema 後請同步更新此圖。

## ER 圖

```mermaid
erDiagram
    Member ||--o{ MatchTeamMember : memberRef
    Guest  ||--o{ MatchTeamMember : guestRef

    Match ||--o{ MatchTeam : teams
    Match ||--o{ MatchMove : moves

    MatchTeam ||--o{ MatchTeamMember : teamMembers
    MatchTeam ||--o{ MatchMove       : teamId

    MatchTeamMember ||--o{ MatchLineupSlot : lineupSlots

    MatchMove ||--o| RandomMoveContext : context

    Character ||--o{ MatchMove       : matchMoves
    Character ||--o{ MatchLineupSlot : matchLineupSlots
    GenshinVersion ||--o{ Character  : characters

    Member {
        int        id PK
        datetime   createdAt
        datetime   updatedAt
        string     account UK
        string     nickname
        string     passwordHash
        MemberRole role "User|Owner|Admin"
    }

    Guest {
        int      id PK
        datetime createdAt
        datetime updatedAt
        string   nickname
    }

    Match {
        int      id PK
        datetime createdAt
        datetime updatedAt
        int      flowVersion
    }

    MatchTeam {
        int    id PK
        int    slot
        string name "nullable"
        int    matchId FK
    }

    MatchTeamMember {
        int    id PK
        int    slot
        string name
        int    teamId FK
        int    memberRef FK "nullable"
        int    guestRef FK "nullable"
    }

    MatchLineupSlot {
        int    id PK
        int    modelVersion
        int    setupNumber
        int    teamMemberId FK
        string characterKey FK
    }

    MatchMove {
        int        id PK
        int        order
        MoveType   type "Ban|Pick|Utility"
        MoveSource source "Manual|Random"
        int        matchId FK
        int        teamId FK "nullable"
        string     characterKey FK
    }

    RandomMoveContext {
        int  id PK
        json filters "nullable"
        int  matchMoveId FK "unique"
    }

    Character {
        string        key PK
        string        name
        Rarity        rarity "FourStar|FiveStar"
        Element       element
        Weapon        weapon
        Region        region
        ModelType     modelType
        CharacterRole role "nullable"
        Wish          wish "nullable"
        datetime      releaseAt "nullable"
        string        genshinVersionCode FK "nullable"
    }

    GenshinVersion {
        string   code PK
        int      order UK
        string   name
        datetime startAt
        datetime endAt "nullable"
    }
```

## 結構重點

三個邏輯群組：

1. **使用者** — `Member`（註冊帳號）與 `Guest`（臨時）兩種身份，都透過 `MatchTeamMember` 的可空外鍵 `memberRef` / `guestRef` 接進對局。

2. **對局** — `Match` → `MatchTeam` → `MatchTeamMember` → `MatchLineupSlot` 一條由上往下的 cascade 鏈（刪 `Match` 會連帶刪光）。`MatchMove` 記錄 Ban/Pick 動作，掛在 `Match` 下、可選地關到某個 `MatchTeam`；隨機產生的 move 額外有 1:1 的 `RandomMoveContext` 存 filter。

3. **靜態字典** — `Character` 與 `GenshinVersion`，由 seed script 匯入，被 `MatchMove` / `MatchLineupSlot` 以 `characterKey` 參照（這兩條為純參照，無 `onDelete: Cascade`）。
