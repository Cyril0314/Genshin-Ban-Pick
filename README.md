## Prisma

### 本地建立新的 migration
#### Schema 有變動時
-   npx prisma migrate dev --name init
#### 需要資料庫資料回填：
-   手動新增 SQL Migration 檔案！
-   npx prisma migrate dev
-   
#### 有刪除資料的 migration 要分兩次部署

### 遠端套用 migration

-   npx prisma generate 產生 Prisma Client
-   npx prisma migrate deploy 套用已存在的 migration 到資料庫
-   
-   npx tsx prisma/scripts/importGenshinVersions.ts 匯入版本靜態資料
-   npx tsx prisma/scripts/importCharacters.ts 匯入角色靜態資料
<!-- -   npx prisma db seed 執行種子資料程式 -->

## Clean Architecture

-   Component: UI 渲染、觸發行為
-   Store: 狀態保存、快取、提供給 UI 使用
-   Use Case / Sync: (流程 & I/O orchestration) 協調 Service/Socket/Store/Flow
-   Domain: Model: (純邏輯) 定義、資料轉換、業務規則

| 模組特性                                                  | 推薦 Store 型式      |
| --------------------------------------------------------- | -------------------- |
| **短週期資料 (即時訊息 / socket / draggable state)**      | **Setup Store** ✅   |
| **長週期資料 (一次載入 / 大量快取 / Dictionary / Index)** | **Options Store** ✅ |

## 複製 Server DB

### Connect EC2 and build 5433 db tunnel

ssh -i "C:\Users\asdfg\ec2_keys\aws-discord-bot-farmer-licence-key.pem" -L 5433:localhost:5432 ec2-user@54.224.88.154

ssh -i "/Users/wangxiaoyu/Desktop/ec2_keys/aws-discord-bot-farmer-licence-key.pem" -L 5433:localhost:5432 ec2-user@54.224.88.154


### Connect EC2 PSQL in local powershell

psql -h localhost -p 5433 -U postgres -d genshin_banpick

### PGAdmin 左側 Servers → 右鍵 → Register → Server…

| Field | Value                        |
| ----- | ---------------------------- |
| Name  | genshin-ec2 (或任何你想叫的) |

| Field                | Value                                |
| -------------------- | ------------------------------------ |
| Host name / address  | **localhost** ← 很重要               |
| Port                 | **5433** ← 我們 Tunnel 用的本機 port |
| Maintenance database | genshin_banpick                      |
| Username             | postgres                             |
| Password             | 你自己設定的 DB 密碼                 |


### 匯出正式資料（EC2 → 本機）
pg_dump -h localhost -p 5433 -U postgres -d genshin_banpick -F c -f prod_dump.backup

### 清空本機資料庫
psql -h localhost -p 5432 -U postgres -d postgres -c "DROP DATABASE genshin_banpick;"
psql -h localhost -p 5432 -U wangxiaoyu -d postgres -c "DROP DATABASE genshin_banpick;"

psql -h localhost -p 5432 -U postgres -d postgres -c "CREATE DATABASE genshin_banpick;"
psql -h localhost -p 5432 -U wangxiaoyu -d postgres -c "CREATE DATABASE genshin_banpick;"

### 匯入正式資料 → 本機
pg_restore -h localhost -p 5432 -U postgres -d genshin_banpick -F c prod_dump.backup
pg_restore -h localhost -p 5432 -U wangxiaoyu -d genshin_banpick -F c /Users/wangxiaoyu/Desktop/prod_dump.backup 

### 檢查備份檔案

dir prod_dump.backup

## 下載 npm ipv4 優先

NODE_OPTIONS=--dns-result-order=ipv4first npm install

## pm2

pm2 ls 列出所有 pm2 的程序
pm2 status 當前狀態
pm2 start "npx tsx src/index.ts" --name genshin-ban-pick 啟動服務
pm2 stop --name 暫停服務
pm2 restart --name 重啟服務

1. 基本原則
✔ 一致性優先

全專案保持 同一種檔名格式（建議：kebab-case）。

避免縮寫，例如 usr, cfg，除非為業界慣用（如 id, api）。

✔ 可讀性 > 簡短

名稱需要看得懂、可以推測角色用途。

避免無意義命名，如 data, info, obj, utils2。

2. JavaScript / TypeScript 命名規則
類型	命名規則	範例
變數 / 函式 / 屬性	lowerCamelCase	stepIndex, getUserTeam
類別 / 型別 / Enum	UpperCamelCase (PascalCase)	RoomService, MatchFlow, MoveType
常數	UPPER_SNAKE_CASE	MAX_STEP_COUNT, DEFAULT_ROOM_SIZE
介面 (Interface)	首字母加 I（可選，但要一致）	IRoomState, IChatMessageDTO
泛型參數	單字母大寫	T, K, V

5. REST API 路由命名

參考 RESTful 標準：

✔ 使用 複數名詞 表示「集合資源」
/rooms
/matches
/characters

✔ 單一資源用 ID 指定
/rooms/:roomId
/matches/:matchId

✔ 子資源（階層式）
/rooms/:roomId/users
/rooms/:roomId/messages


| **Scope**    | **Intent / Purpose**                                                                | **Expected Output (Data)**                                                                    | **SQL Analogy**                                                         |
| ------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Minimal**  | Data strictly limited to what is essential for identification or existence checks   | Only key identifiers and a few critical fields, heavily filtered                              | `SELECT id, name FROM table WHERE active = true LIMIT 1;`               |
| **Core**     | Default working dataset for routine application operations                          | Essential fields + frequently used relationships (typically via foreign keys or one relation) | `SELECT * FROM table WHERE user_id = 123 AND status='active';`          |
| **Light**    | Lightweight enrichment beyond the default dataset                                   | Core fields + one small related metric or column (e.g., a count or timestamp)                 | `SELECT t.*, COUNT(c.id) FROM table t LEFT JOIN child c GROUP BY t.id;` |
| **Expanded** | Dataset prepared for standard UI views requiring joined context                     | Core fields + 2–3 commonly required relationships (joined data for display or sync)           | `SELECT * FROM table t JOIN rel1 r1 JOIN rel2 r2 WHERE t.room_id = 7;`  |
| **Summary**  | Aggregated or analytical result set, not raw row data                               | Computed statistics such as totals, averages, max/min, grouped values                         | `SELECT AVG(score), COUNT(id) FROM table GROUP BY category;`            |
| **Detailed** | Most complete dataset needed for focused inspection of a single record or small set | All available columns + most related entities, fully joined for depth                         | `SELECT * FROM table t JOIN rel1 JOIN rel2 ... WHERE t.id = 42;`        |
| **Full**     | Near-unrestricted operational dataset                                               | All fields + all standard filters but without pagination or strict limits                     | `SELECT * FROM table WHERE deleted IN (true,false);`                    |
| **Full**     | Absolute unrestricted fetch (truly "no filter")                                     | All rows, including inactive, soft-deleted, archived, or orphaned records                     | `SELECT * FROM table;`                                                  |


# Genshin Ban Pick

一個基於 **Clean Architecture** 與 **Modular Monolith** 架構設計的原神 (Genshin Impact) Ban/Pick 模擬應用程式。

## 專案簡介

本專案旨在提供一個多人即時協作的 Ban/Pick 系統，支援：

-   **即時同步**：透過 Socket.IO 實現多端狀態同步 (Ban/Pick 狀態、聊天室)。
-   **角色管理**：完整的原神角色資料庫。
-   **戰術白板**：可拖曳的角色與標記功能。

## 系統架構 (Architecture)

本專案採用 **Modular Monolith** 搭配 **Clean Architecture**，前後端架構高度一致，確保可維護性與擴充性。

### 分層設計 (Layered Architecture)

無論是前端或後端，每個模組 (Module) 皆遵循以下分層：

1.  **Domain Layer (核心層)**

    -   **職責**：定義業務規則、實體 (Entities) 與純邏輯運算。
    -   **特性**：不依賴任何外部框架或 UI，純 TypeScript 函式。
    -   **路徑**：`src/modules/*/domain`

2.  **Application Layer (應用層)**

    -   **職責**：Use Cases (使用案例)。協調 Domain、Store 與 Infrastructure。
    -   **特性**：定義系統能「做什麼」(User Actions)。
    -   **路徑**：`src/modules/*/application`

3.  **Interface Adapter Layer (介面適配層)**

    -   **Frontend**：UI Components (`.vue`), Composables (Controllers), Stores (Pinia).
    -   **Backend**：Controllers, Socket Handlers.
    -   **路徑**：`src/modules/*/ui`, `src/modules/*/store`, `src/modules/*/controller`

4.  **Infrastructure Layer (基礎設施層)**
    -   **職責**：實作具體的技術細節 (API Client, Database Repository, Socket Client)。
    -   **路徑**：`src/modules/*/infrastructure`

### 目錄結構

```
src/
├── app/                 # 全域應用設定 (Bootstrap, Global Stores, Errors)
├── modules/             # 功能模組 (Feature Modules)
│   ├── auth/            # 認證模組
│   ├── board/           # 戰術白板與 Ban/Pick 核心
│   ├── character/       # 角色資料
│   ├── chat/            # 聊天室
│   ├── match/           # 對局流程
│   ├── room/            # 房間管理
│   └── ...
└── shared/              # 前後端共用合約 (Contracts/Types)
```

## 技術堆疊 (Tech Stack)

### Frontend

-   **Framework**: Vue 3 (Composition API)
-   **Language**: TypeScript
-   **State Management**: Pinia
-   **UI Library**: Naive UI
-   **Build Tool**: Vite
-   **Communication**: Socket.IO Client, Axios

### Backend

-   **Runtime**: Node.js
-   **Framework**: Express
-   **Language**: TypeScript
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Real-time**: Socket.IO

## 快速開始 (Getting Started)

### 前置需求

-   Node.js (v18+)
-   PostgreSQL

### 安裝與執行

1.  **安裝依賴**

    ```bash
    # 下載 npm ipv4 優先 (解決某些網路問題)
    NODE_OPTIONS=--dns-result-order=ipv4first npm install
    ```

2.  **資料庫設定 (Backend)**

    ```bash
    # 產生 Prisma Client
    npx prisma generate

    # 執行 Migration
    npx prisma migrate dev
    ```

-   **變數 / 函式**: `lowerCamelCase` (e.g., `getUserTeam`)
-   **類別 / 型別**: `UpperCamelCase` (e.g., `RoomService`, `IRoomState`)
-   **常數**: `UPPER_SNAKE_CASE` (e.g., `MAX_STEP_COUNT`)
-   **檔案命名**: `kebab-case` (e.g., `room-user.service.ts`)

### 檔案後綴

| 類型          | 後綴             | 範例                 |
| ------------- | ---------------- | -------------------- |
| Service       | `.service.ts`    | `room.service.ts`    |
| UseCase       | `UseCase.ts`     | `authUseCase.ts`     |
| Repository    | `Repository.ts`  | `AuthRepository.ts`  |
| Controller    | `.controller.ts` | `room.controller.ts` |
| Socket        | `.socket.ts`     | `chat.socket.ts`     |
| Vue Component | `.vue`           | `ChatRoom.vue`       |

### Git 規範

-   確保檔案名稱大小寫一致 (避免 macOS/Windows 大小寫不敏感導致的問題)。
-   Commit Message 建議遵循 Conventional Commits (e.g., `feat: add chat drawer`, `fix: resolve dependency injection error`).

## 架構審查總結 (Architecture Review)

本專案架構完整度極高，具備以下優點：

1.  **關注點分離 (SoC)**：業務邏輯與 UI 完全解耦，測試容易。
2.  **模組化**：功能模組獨立，降低耦合度。
3.  **型別安全**：前後端共用 `shared/contracts`，減少整合錯誤。
4.  **依賴注入 (DI)**：透過 Vue `provide/inject` 與後端 DI 容器，實現鬆散耦合。

建議持續保持此架構規範，並注意 UseCase 與 Store 之間的職責邊界。
