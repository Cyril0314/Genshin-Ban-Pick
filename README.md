## Prisma

### 本地建立新的 migration
#### Schema 有變動時
-   npx prisma migrate dev --name init
#### 需要資料庫資料回填：
-   手動新增 SQL Migration 檔案！
-   npx prisma migrate dev

### 遠端套用 migration

-   npx prisma generate 產生 Prisma Client
-   npx prisma migrate deploy 套用已存在的 migration 到資料庫
-   npx prisma db seed 執行種子資料程式

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

ssh -i "C:\Users\asdfg\ec2_keys\aws-discord-bot-farmer-licence-key.pem" -L 5433:localhost:5432 ec2-user@52.87.171.134

ssh -i "/Users/wangxiaoyu/Desktop/ec2_keys/aws-discord-bot-farmer-licence-key.pem" -L 5433:localhost:5432 ec2-user@52.87.171.134


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

### 匯入正式資料 → 本機
pg_restore -h localhost -p 5432 -U postgres -d genshin_banpick -F c prod_dump.backup
pg_restore -h localhost -p 5432 -U wangxiaoyu -d genshin_banpick -F c /Users/wangxiaoyu/Desktop/prod_dump.backup 

### 檢查備份檔案

dir prod_dump.backup

## 下載 npm ipv4 優先

NODE_OPTIONS=--dns-result-order=ipv4first npm install

## pm2

pm2 ls 列出所有 pm2 的程序
pm2 start --name xxx.js 啟動服務
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
3. 檔案命名規則（架構導向）
✔ 建議使用 kebab-case

專案中大型後端最常見形式，例如：

room.service.ts
room.controller.ts
room.router.ts
room-state.repository.ts
socket-auth.middleware.ts

✔ 各檔案類型的後綴統一
角色	後綴	範例
Service（商業邏輯）	.service.ts	room.service.ts
Controller（連接 router 與 service）	.controller.ts	room.controller.ts
Repository（資料存取）	.repository.ts	room-state.repository.ts
Router（HTTP endpoint）	.router.ts	room.router.ts
Socket module	.socket.ts	chat.socket.ts, board.socket.ts
Middleware	.middleware.ts	socket-auth.middleware.ts
Domain / 型別定義	.ts（不需後綴）	IRoomState.ts、ITeam.ts
4. 資料夾命名（模組化 Monolith）

各功能模組使用 單數名詞 + domain 分層：

modules/
  room/
    application/
    controller/
    domain/
    infra/
    http/
    types/
  socket/
    modules/
    managers/


📌 資料夾也採用 kebab-case 或小寫
例如：application、domain、infra、http。

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

6. Socket Event 命名規則
✔ 使用 kebab-case 或 domain:action

建議格式（專案清晰易搜尋）：

room:joined
room:left
board:image-drop
chat:message
team:update
step:next

7. 環境變數命名規則（.env）
✔ 標準格式：UPPER_SNAKE_CASE

範例：

DATABASE_URL=
JWT_SECRET=
SOCKET_PORT=
NODE_ENV=


參考來源指出環境變數習慣使用大寫並以底線分隔以提高可讀性。

8. 測試命名規則

檔名：*.test.ts 或 *.spec.ts

對應原檔名，例如：

room.service.test.ts
match.controller.spec.ts

📘 TL;DR（快速版）

風格總表：

類型	命名方式
變數、函式	lowerCamelCase
類別、介面、Enum	UpperCamelCase
常數、env	UPPER_SNAKE_CASE
檔名	kebab-case
Service 檔案	*.service.ts
Controller	*.controller.ts
Repository	*.repository.ts
Router	*.router.ts
Socket module	*.socket.ts
REST 資源路徑	複數名詞 /rooms
介面命名	IName（可選但統一）

```
Genshin-Ban-Pick
├─ .prettierrc.json
├─ backend
│  ├─ .env
│  ├─ eslint.config.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ prisma
│  │  ├─ characters.json
│  │  ├─ migrations
│  │  │  ├─ 20250513081454_init
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20250514083431_add_user_model
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251102151051_add_role
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251102154054_add_guest
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251102184824_rename_user
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251105115425_refractor
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251105130019_model
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251105162328_add
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251108093141_add
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251108110607_enable_cascade_delete
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251108114629_delete_unused_fileds
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251111014228_add_slot_to_match_team_member
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251111015008_rename_slot_to_match_team_member
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251111020420_enforce_slot_to_match_team_member
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251111022046_rename_team_slot_to_slot
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251111022047_backfill_match_team_slot
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20251111023456_enforce_team_slot
│  │  │  │  └─ migration.sql
│  │  │  └─ migration_lock.toml
│  │  ├─ schema.prisma
│  │  └─ seed.ts
│  ├─ src
│  │  ├─ app
│  │  │  └─ appRouter.ts
│  │  ├─ constants
│  │  │  └─ constants.ts
│  │  ├─ errors
│  │  │  └─ AppError.ts
│  │  ├─ index.ts
│  │  ├─ middlewares
│  │  │  └─ errorHandler.ts
│  │  ├─ modules
│  │  │  ├─ analysis
│  │  │  │  ├─ application
│  │  │  │  │  ├─ analysis.service.ts
│  │  │  │  │  ├─ clustering
│  │  │  │  │  │  ├─ ClusteringService.ts
│  │  │  │  │  │  └─ types
│  │  │  │  │  │     ├─ IBridgeScoreResult.ts
│  │  │  │  │  │     └─ ICommunityScanResult.ts
│  │  │  │  │  ├─ projection
│  │  │  │  │  │  └─ ProjectionService.ts
│  │  │  │  │  ├─ synergy
│  │  │  │  │  │  ├─ SynergyNormalizationService.ts
│  │  │  │  │  │  ├─ SynergyService.ts
│  │  │  │  │  │  └─ types
│  │  │  │  │  │     ├─ IRawTacticalUsage.ts
│  │  │  │  │  │     ├─ ISynergyMatrix.ts
│  │  │  │  │  │     └─ SynergyMode.ts
│  │  │  │  │  └─ tactical
│  │  │  │  │     ├─ calculateTacticalWeight.ts
│  │  │  │  │     ├─ computeTacticalUsages.ts
│  │  │  │  │     ├─ getWeightContext.ts
│  │  │  │  │     └─ types
│  │  │  │  │        ├─ IMoveContext.ts
│  │  │  │  │        ├─ ITacticalCoefficients.ts
│  │  │  │  │        └─ IWeightContext.ts
│  │  │  │  ├─ controller
│  │  │  │  │  └─ analysis.controller.ts
│  │  │  │  ├─ domain
│  │  │  │  │  └─ ICharacterProvider.ts
│  │  │  │  ├─ http
│  │  │  │  │  └─ analyses.routes.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ infra
│  │  │  │  └─ types
│  │  │  ├─ auth
│  │  │  │  ├─ application
│  │  │  │  │  ├─ auth.service.ts
│  │  │  │  │  ├─ guest.service.ts
│  │  │  │  │  └─ member.service.ts
│  │  │  │  ├─ controller
│  │  │  │  │  └─ auth.controller.ts
│  │  │  │  ├─ domain
│  │  │  │  │  ├─ IAuthPayload.ts
│  │  │  │  │  └─ IJwtProvider.ts
│  │  │  │  ├─ http
│  │  │  │  │  └─ auth.routes.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ infra
│  │  │  │  │  └─ JwtProvider.ts
│  │  │  │  └─ types
│  │  │  ├─ character
│  │  │  │  ├─ application
│  │  │  │  │  └─ character.service.ts
│  │  │  │  ├─ controller
│  │  │  │  │  └─ character.controller.ts
│  │  │  │  ├─ domain
│  │  │  │  │  └─ ICharacterRandomContext.ts
│  │  │  │  ├─ http
│  │  │  │  │  └─ characters.routes.ts
│  │  │  │  ├─ index.ts
│  │  │  │  └─ types
│  │  │  │     └─ CharacterFilterKey.ts
│  │  │  ├─ match
│  │  │  │  ├─ application
│  │  │  │  │  ├─ match.service.ts
│  │  │  │  │  ├─ MatchCreator.ts
│  │  │  │  │  ├─ MatchMoveCreator.ts
│  │  │  │  │  ├─ MatchTacticalUsageCreator.ts
│  │  │  │  │  ├─ MatchTeamCreator.ts
│  │  │  │  │  └─ MatchTeamMemberCreator.ts
│  │  │  │  ├─ controller
│  │  │  │  │  └─ match.controller.ts
│  │  │  │  ├─ domain
│  │  │  │  │  ├─ IMatchFlow.ts
│  │  │  │  │  ├─ IMatchSnapshot.ts
│  │  │  │  │  ├─ IMatchSnapshotRepository.ts
│  │  │  │  │  ├─ resolveIdentity.ts
│  │  │  │  │  └─ validateSnapshot.ts
│  │  │  │  ├─ http
│  │  │  │  │  └─ matches.routes.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ infra
│  │  │  │  │  └─ MatchSnapshotRepository.ts
│  │  │  │  └─ types
│  │  │  │     └─ ResolvedIdentity.ts
│  │  │  ├─ room
│  │  │  │  ├─ application
│  │  │  │  │  ├─ room.service.ts
│  │  │  │  │  └─ roomUser.service.ts
│  │  │  │  ├─ controller
│  │  │  │  │  └─ room.controller.ts
│  │  │  │  ├─ domain
│  │  │  │  │  ├─ createDefaultTeams.ts
│  │  │  │  │  ├─ createMatchFlow.ts
│  │  │  │  │  ├─ createRoomSetting.ts
│  │  │  │  │  ├─ createRoomState.ts
│  │  │  │  │  ├─ createZoneMetaTable.ts
│  │  │  │  │  ├─ findUserTeamSlot.ts
│  │  │  │  │  ├─ IRoomSetting.ts
│  │  │  │  │  ├─ IRoomState.ts
│  │  │  │  │  ├─ IRoomStateRepository.ts
│  │  │  │  │  ├─ joinRoomUser.ts
│  │  │  │  │  └─ leaveRoomUser.ts
│  │  │  │  ├─ http
│  │  │  │  │  └─ rooms.routes.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ infra
│  │  │  │  │  └─ RoomStateRepository.ts
│  │  │  │  └─ types
│  │  │  │     └─ IRoomUser.ts
│  │  │  └─ socket
│  │  │     ├─ index.ts
│  │  │     ├─ managers
│  │  │     │  ├─ IRoomStateManager.ts
│  │  │     │  └─ RoomStateManager.ts
│  │  │     ├─ modules
│  │  │     │  ├─ boardSocket.ts
│  │  │     │  ├─ chatSocket.ts
│  │  │     │  ├─ roomSocket.ts
│  │  │     │  ├─ stepSocket.ts
│  │  │     │  ├─ tacticalSocket.ts
│  │  │     │  └─ teamSocket.ts
│  │  │     ├─ socketAuth.ts
│  │  │     └─ socketController.ts
│  │  ├─ prisma.ts
│  │  ├─ test
│  │  │  └─ save.test.ts
│  │  ├─ types
│  │  │  ├─ IChatMessageDTO.ts
│  │  │  ├─ ITeam.ts
│  │  │  ├─ IZone.ts
│  │  │  └─ TeamMember.ts
│  │  └─ utils
│  │     ├─ asyncHandler.ts
│  │     └─ logger.ts
│  ├─ tsconfig.json
│  ├─ types
│  │  ├─ ml-kmeans.d.ts
│  │  └─ ml-pca.d.ts
│  └─ upload-node-modules.sh
├─ Genshin-Ban-Pick
│  ├─ .editorconfig
│  ├─ .env.development
│  ├─ .env.production
│  ├─ deploy-dist-to-ec2.sh
│  ├─ dist
│  ├─ env.d.ts
│  ├─ eslint.config.ts
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.ico
│  │  └─ wish.png
│  ├─ README.md
│  ├─ src
│  │  ├─ app
│  │  │  ├─ bootstrap
│  │  │  │  ├─ registerAllSyncModules.ts
│  │  │  │  ├─ registerHttpClient.ts
│  │  │  │  └─ useAppInitializer.ts
│  │  │  ├─ constants
│  │  │  │  └─ customMIMETypes.ts
│  │  │  ├─ errors
│  │  │  │  └─ AppError.ts
│  │  │  ├─ infrastructure
│  │  │  │  └─ http
│  │  │  │     └─ httpClient.ts
│  │  │  ├─ stores
│  │  │  │  └─ socketStore.ts
│  │  │  └─ ui
│  │  ├─ App.vue
│  │  ├─ assets
│  │  │  ├─ base.css
│  │  │  ├─ images
│  │  │  │  ├─ background
│  │  │  │  │  ├─ 4.7.jpg
│  │  │  │  │  ├─ 4.8.jpg
│  │  │  │  │  ├─ 5.1.png
│  │  │  │  │  ├─ 5.3.jpg
│  │  │  │  │  ├─ 5.5.jpg
│  │  │  │  │  ├─ 5.7.png
│  │  │  │  │  ├─ background.jpg
│  │  │  │  │  ├─ LunaI.webp
│  │  │  │  │  ├─ noise.png
│  │  │  │  │  ├─ Tier.png
│  │  │  │  │  ├─ wallpaper.png
│  │  │  │  │  ├─ wallpaper2.png
│  │  │  │  │  ├─ wallpaper3.png
│  │  │  │  │  └─ wallpaper4.jpg
│  │  │  │  ├─ calendar
│  │  │  │  │  ├─ Calendar_April.png
│  │  │  │  │  ├─ Calendar_August.png
│  │  │  │  │  ├─ Calendar_December.png
│  │  │  │  │  ├─ Calendar_January.png
│  │  │  │  │  ├─ Calendar_July.png
│  │  │  │  │  ├─ Calendar_June.png
│  │  │  │  │  ├─ Calendar_March.png
│  │  │  │  │  ├─ Calendar_May.jpg
│  │  │  │  │  ├─ Calendar_November.png
│  │  │  │  │  ├─ Calendar_October.png
│  │  │  │  │  └─ Calendar_September.png
│  │  │  │  ├─ profile
│  │  │  │  │  ├─ Aino_Profile.webp
│  │  │  │  │  ├─ Albedo_Profile.webp
│  │  │  │  │  ├─ Alhaitham_Profile.webp
│  │  │  │  │  ├─ Amber_Profile.webp
│  │  │  │  │  ├─ AratakiItto_Profile.webp
│  │  │  │  │  ├─ Arlecchino_Profile.webp
│  │  │  │  │  ├─ Baizhu_Profile.webp
│  │  │  │  │  ├─ Barbara_Profile.webp
│  │  │  │  │  ├─ Beidou_Profile.webp
│  │  │  │  │  ├─ Bennett_Profile.webp
│  │  │  │  │  ├─ Candace_Profile.webp
│  │  │  │  │  ├─ Charlotte_Profile.webp
│  │  │  │  │  ├─ Chasca_Profile.webp
│  │  │  │  │  ├─ Chevreuse_Profile.webp
│  │  │  │  │  ├─ Chiori_Profile.webp
│  │  │  │  │  ├─ Chongyun_Profile.webp
│  │  │  │  │  ├─ Citlali_Profile.webp
│  │  │  │  │  ├─ Clorinde_Profile.webp
│  │  │  │  │  ├─ Collei_Profile.webp
│  │  │  │  │  ├─ Cyno_Profile.webp
│  │  │  │  │  ├─ Dahlia_Profile.webp
│  │  │  │  │  ├─ Dehya_Profile.webp
│  │  │  │  │  ├─ Diluc_Profile.webp
│  │  │  │  │  ├─ Diona_Profile.webp
│  │  │  │  │  ├─ Dori_Profile.webp
│  │  │  │  │  ├─ Emilie_Profile.webp
│  │  │  │  │  ├─ Escoffier_Profile.webp
│  │  │  │  │  ├─ Eula_Profile.webp
│  │  │  │  │  ├─ Faruzan_Profile.webp
│  │  │  │  │  ├─ Fischl_Profile.webp
│  │  │  │  │  ├─ Flins_Profile.webp
│  │  │  │  │  ├─ Freminet_Profile.webp
│  │  │  │  │  ├─ Furina_Profile.webp
│  │  │  │  │  ├─ Gaming_Profile.webp
│  │  │  │  │  ├─ Ganyu_Profile.webp
│  │  │  │  │  ├─ Gorou_Profile.webp
│  │  │  │  │  ├─ HuTao_Profile.webp
│  │  │  │  │  ├─ Iansan_Profile.webp
│  │  │  │  │  ├─ Ifa_Profile.webp
│  │  │  │  │  ├─ Ineffa_Profile.webp
│  │  │  │  │  ├─ Jean_Profile.webp
│  │  │  │  │  ├─ Kachina_Profile.webp
│  │  │  │  │  ├─ KaedeharaKazuha_Profile.webp
│  │  │  │  │  ├─ Kaeya_Profile.webp
│  │  │  │  │  ├─ KamisatoAyaka_Profile.webp
│  │  │  │  │  ├─ KamisatoAyato_Profile.webp
│  │  │  │  │  ├─ Kaveh_Profile.webp
│  │  │  │  │  ├─ Keqing_Profile.webp
│  │  │  │  │  ├─ Kinich_Profile.webp
│  │  │  │  │  ├─ Kirara_Profile.webp
│  │  │  │  │  ├─ Klee_Profile.webp
│  │  │  │  │  ├─ KujouSara_Profile.webp
│  │  │  │  │  ├─ KukiShinobu_Profile.webp
│  │  │  │  │  ├─ LanYan_Profile.webp
│  │  │  │  │  ├─ Lauma_Profile.webp
│  │  │  │  │  ├─ Layla_Profile.webp
│  │  │  │  │  ├─ Lisa_Profile.webp
│  │  │  │  │  ├─ Lynette_Profile.webp
│  │  │  │  │  ├─ Lyney_Profile.webp
│  │  │  │  │  ├─ Mavuika_Profile.webp
│  │  │  │  │  ├─ Mika_Profile.webp
│  │  │  │  │  ├─ Mona_Profile.webp
│  │  │  │  │  ├─ Mualani_Profile.webp
│  │  │  │  │  ├─ Nahida_Profile.webp
│  │  │  │  │  ├─ Navia_Profile.webp
│  │  │  │  │  ├─ Nefer_Profile.webp
│  │  │  │  │  ├─ Neuvillette_Profile.webp
│  │  │  │  │  ├─ Nilou_Profile.webp
│  │  │  │  │  ├─ Ningguang_Profile.webp
│  │  │  │  │  ├─ Noelle_Profile.webp
│  │  │  │  │  ├─ Ororon_Profile.webp
│  │  │  │  │  ├─ Qiqi_Profile.webp
│  │  │  │  │  ├─ RaidenShogun_Profile.webp
│  │  │  │  │  ├─ Razor_Profile.webp
│  │  │  │  │  ├─ Rosaria_Profile.webp
│  │  │  │  │  ├─ SangonomiyaKokomi_Profile.webp
│  │  │  │  │  ├─ Sayu_Profile.webp
│  │  │  │  │  ├─ Sethos_Profile.webp
│  │  │  │  │  ├─ Shenhe_Profile.webp
│  │  │  │  │  ├─ ShikanoinHeizou_Profile.webp
│  │  │  │  │  ├─ Sigewinne_Profile.webp
│  │  │  │  │  ├─ Skirk_Profile.webp
│  │  │  │  │  ├─ Sucrose_Profile.webp
│  │  │  │  │  ├─ Tartaglia_Profile.webp
│  │  │  │  │  ├─ Thoma_Profile.webp
│  │  │  │  │  ├─ Tighnari_Profile.webp
│  │  │  │  │  ├─ Traveler_Profile.webp
│  │  │  │  │  ├─ Varesa_Profile.webp
│  │  │  │  │  ├─ Venti_Profile.webp
│  │  │  │  │  ├─ Wanderer_Profile.webp
│  │  │  │  │  ├─ Wriothesley_Profile.webp
│  │  │  │  │  ├─ Xiangling_Profile.webp
│  │  │  │  │  ├─ Xianyun_Profile.webp
│  │  │  │  │  ├─ Xiao_Profile.webp
│  │  │  │  │  ├─ Xilonen_Profile.webp
│  │  │  │  │  ├─ Xingqiu_Profile.webp
│  │  │  │  │  ├─ Xinyan_Profile.webp
│  │  │  │  │  ├─ YaeMiko_Profile.webp
│  │  │  │  │  ├─ Yanfei_Profile.webp
│  │  │  │  │  ├─ Yaoyao_Profile.webp
│  │  │  │  │  ├─ Yelan_Profile.webp
│  │  │  │  │  ├─ Yoimiya_Profile.webp
│  │  │  │  │  ├─ YumemizukiMizuki_Profile.webp
│  │  │  │  │  ├─ YunJin_Profile.webp
│  │  │  │  │  └─ Zhongli_Profile.webp
│  │  │  │  └─ wish
│  │  │  │     ├─ Aino_Wish.png
│  │  │  │     ├─ Albedo_Wish.png
│  │  │  │     ├─ Alhaitham_Wish.png
│  │  │  │     ├─ Amber_Wish.png
│  │  │  │     ├─ AratakiItto_Wish.png
│  │  │  │     ├─ Arlecchino_Wish.png
│  │  │  │     ├─ Baizhu_Wish.png
│  │  │  │     ├─ Barbara_Wish.png
│  │  │  │     ├─ Beidou_Wish.png
│  │  │  │     ├─ Bennett_Wish.png
│  │  │  │     ├─ Candace_Wish.png
│  │  │  │     ├─ Charlotte_Wish.png
│  │  │  │     ├─ Chasca_Wish.png
│  │  │  │     ├─ Chevreuse_Wish.png
│  │  │  │     ├─ Chiori_Wish.png
│  │  │  │     ├─ Chongyun_Wish.png
│  │  │  │     ├─ Citlali_Wish.png
│  │  │  │     ├─ Clorinde_Wish.png
│  │  │  │     ├─ Collei_Wish.png
│  │  │  │     ├─ Cyno_Wish.png
│  │  │  │     ├─ Dahlia_Wish.png
│  │  │  │     ├─ Dehya_Wish.png
│  │  │  │     ├─ Diluc_Wish.png
│  │  │  │     ├─ Diona_Wish.png
│  │  │  │     ├─ Dori_Wish.png
│  │  │  │     ├─ Emilie_Wish.png
│  │  │  │     ├─ Escoffier_Wish.png
│  │  │  │     ├─ Eula_Wish.png
│  │  │  │     ├─ Faruzan_Wish.png
│  │  │  │     ├─ Fischl_Wish.png
│  │  │  │     ├─ Flins_Wish.png
│  │  │  │     ├─ Freminet_Wish.png
│  │  │  │     ├─ Furina_Wish.png
│  │  │  │     ├─ Gaming_Wish.png
│  │  │  │     ├─ Ganyu_Wish.png
│  │  │  │     ├─ Gorou_Wish.png
│  │  │  │     ├─ HuTao_Wish.png
│  │  │  │     ├─ Iansan_Wish.png
│  │  │  │     ├─ Ifa_Wish.png
│  │  │  │     ├─ Ineffa_Wish.png
│  │  │  │     ├─ Jean_Wish.png
│  │  │  │     ├─ Kachina_Wish.png
│  │  │  │     ├─ KaedeharaKazuha_Wish.png
│  │  │  │     ├─ Kaeya_Wish.png
│  │  │  │     ├─ KamisatoAyaka_Wish.png
│  │  │  │     ├─ KamisatoAyato_Wish.png
│  │  │  │     ├─ Kaveh_Wish.png
│  │  │  │     ├─ Keqing_Wish.png
│  │  │  │     ├─ Kinich_Wish.png
│  │  │  │     ├─ Kirara_Wish.png
│  │  │  │     ├─ Klee_Wish.png
│  │  │  │     ├─ KujouSara_Wish.png
│  │  │  │     ├─ KukiShinobu_Wish.png
│  │  │  │     ├─ LanYan_Wish.png
│  │  │  │     ├─ Lauma_Wish.png
│  │  │  │     ├─ Layla_Wish.png
│  │  │  │     ├─ Lisa_Wish.png
│  │  │  │     ├─ Lynette_Wish.png
│  │  │  │     ├─ Lyney_Wish.png
│  │  │  │     ├─ Mavuika_Wish.png
│  │  │  │     ├─ Mika_Wish.png
│  │  │  │     ├─ Mona_Wish.png
│  │  │  │     ├─ Mualani_Wish.png
│  │  │  │     ├─ Nahida_Wish.png
│  │  │  │     ├─ Navia_Wish.png
│  │  │  │     ├─ Nefer_Wish.png
│  │  │  │     ├─ Neuvillette_Wish.png
│  │  │  │     ├─ Nilou_Wish.png
│  │  │  │     ├─ Ningguang_Wish.png
│  │  │  │     ├─ Noelle_Wish.png
│  │  │  │     ├─ Ororon_Wish.png
│  │  │  │     ├─ Qiqi_Wish.png
│  │  │  │     ├─ RaidenShogun_Wish.png
│  │  │  │     ├─ Razor_Wish.png
│  │  │  │     ├─ Rosaria_Wish.png
│  │  │  │     ├─ SangonomiyaKokomi_Wish.png
│  │  │  │     ├─ Sayu_Wish.png
│  │  │  │     ├─ Sethos_Wish.png
│  │  │  │     ├─ Shenhe_Wish.png
│  │  │  │     ├─ ShikanoinHeizou_Wish.png
│  │  │  │     ├─ Sigewinne_Wish.png
│  │  │  │     ├─ Skirk_Wish.png
│  │  │  │     ├─ Sucrose_Wish.png
│  │  │  │     ├─ Tartaglia_Wish.png
│  │  │  │     ├─ Thoma_Wish.png
│  │  │  │     ├─ Tighnari_Wish.png
│  │  │  │     ├─ Traveler_Wish.png
│  │  │  │     ├─ Varesa_Wish.png
│  │  │  │     ├─ Venti_Wish.png
│  │  │  │     ├─ Wanderer_Wish.png
│  │  │  │     ├─ Wriothesley_Wish.png
│  │  │  │     ├─ Xiangling_Wish.png
│  │  │  │     ├─ Xianyun_Wish.png
│  │  │  │     ├─ Xiao_Wish.png
│  │  │  │     ├─ Xilonen_Wish.png
│  │  │  │     ├─ Xingqiu_Wish.png
│  │  │  │     ├─ Xinyan_Wish.png
│  │  │  │     ├─ YaeMiko_Wish.png
│  │  │  │     ├─ Yanfei_Wish.png
│  │  │  │     ├─ Yaoyao_Wish.png
│  │  │  │     ├─ Yelan_Wish.png
│  │  │  │     ├─ Yoimiya_Wish.png
│  │  │  │     ├─ YumemizukiMizuki_Wish.png
│  │  │  │     ├─ YunJin_Wish.png
│  │  │  │     └─ Zhongli_Wish.png
│  │  │  ├─ logo.svg
│  │  │  ├─ main.css
│  │  │  └─ styles
│  │  │     ├─ alpha.css
│  │  │     └─ semantic-colors.css
│  │  ├─ main.ts
│  │  ├─ modules
│  │  │  ├─ analysis
│  │  │  │  ├─ application
│  │  │  │  │  └─ analysisUseCase.ts
│  │  │  │  ├─ domain
│  │  │  │  │  ├─ fetchPreferenceDomain.ts
│  │  │  │  │  ├─ fetchSynergyDomain.ts
│  │  │  │  │  ├─ fetchTacticalUsagesDomain.ts
│  │  │  │  │  └─ useAnalysisDomain.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ infrastructure
│  │  │  │  │  └─ analysisService.ts
│  │  │  │  ├─ types
│  │  │  │  │  ├─ ICharacterClusters.ts
│  │  │  │  │  ├─ IPreference.ts
│  │  │  │  │  ├─ ITacticalUsages.ts
│  │  │  │  │  └─ IWeightContext.ts
│  │  │  │  └─ ui
│  │  │  │     ├─ components
│  │  │  │     │  ├─ Analysis.vue
│  │  │  │     │  ├─ AnalysisDrawer.vue
│  │  │  │     │  ├─ CharacterClustersChart.vue
│  │  │  │     │  ├─ CharacterMetaChart.vue
│  │  │  │     │  ├─ CharacterSynergyChart.vue
│  │  │  │     │  ├─ CharacterTacticalUsageCompositionChart.vue
│  │  │  │     │  ├─ CharacterTacticalUsagesChart.vue
│  │  │  │     │  └─ PlayerCharacterChart.vue
│  │  │  │     └─ composables
│  │  │  │        ├─ useAnalysis.ts
│  │  │  │        ├─ useCharacterClustersChart.ts
│  │  │  │        ├─ useCharacterSynergyChart.ts
│  │  │  │        ├─ useCharacterTacticalUsageCompositionChart.ts
│  │  │  │        ├─ useCharacterTacticalUsagesChart.ts
│  │  │  │        └─ usePlayerCharacterChart.ts
│  │  │  ├─ auth
│  │  │  │  ├─ application
│  │  │  │  │  └─ authUseCase.ts
│  │  │  │  ├─ domain
│  │  │  │  │  ├─ autoLoginDomain.ts
│  │  │  │  │  ├─ loginGuestDomain.ts
│  │  │  │  │  ├─ loginMemberDomain.ts
│  │  │  │  │  └─ registerMemberDomain.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ infrastructure
│  │  │  │  │  ├─ authService.ts
│  │  │  │  │  └─ tokenStorage.ts
│  │  │  │  ├─ store
│  │  │  │  │  └─ authStore.ts
│  │  │  │  ├─ types
│  │  │  │  │  ├─ Identity.ts
│  │  │  │  │  ├─ IGuest.ts
│  │  │  │  │  └─ IMember.ts
│  │  │  │  └─ ui
│  │  │  │     └─ views
│  │  │  │        ├─ LoginView.vue
│  │  │  │        └─ RegisterView.vue
│  │  │  ├─ banPick
│  │  │  │  └─ ui
│  │  │  │     ├─ components
│  │  │  │     │  └─ ToolBar.vue
│  │  │  │     ├─ composables
│  │  │  │     │  ├─ useBanPickFacade.ts
│  │  │  │     │  ├─ useBanPickFilters.ts
│  │  │  │     │  ├─ useBanPickInitializer.ts
│  │  │  │     │  ├─ useBanPickMatchSave.ts
│  │  │  │     │  ├─ useBanPickRandomPull.ts
│  │  │  │     │  └─ useViewportScale.ts
│  │  │  │     └─ views
│  │  │  │        └─ BanPickView.vue
│  │  │  ├─ board
│  │  │  │  ├─ application
│  │  │  │  │  ├─ boardUseCase.ts
│  │  │  │  │  ├─ matchStepUseCase.ts
│  │  │  │  │  └─ randomPullUseCase.ts
│  │  │  │  ├─ domain
│  │  │  │  │  ├─ findNextMatchStepZoneIdDomain.ts
│  │  │  │  │  ├─ findZoneIdByImageIdDomain.ts
│  │  │  │  │  ├─ getAvailableImageIdsDomain.ts
│  │  │  │  │  ├─ handleBoardImageDropDomain.ts
│  │  │  │  │  ├─ handleBoardImageMapResetDomain.ts
│  │  │  │  │  ├─ handleBoardImageRestoreDomain.ts
│  │  │  │  │  ├─ pickRandomImageDomain.ts
│  │  │  │  │  ├─ placeImageDomain.ts
│  │  │  │  │  └─ removeImageDomain.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ store
│  │  │  │  │  ├─ boardImageStore.ts
│  │  │  │  │  └─ matchStepStore.ts
│  │  │  │  ├─ sync
│  │  │  │  │  ├─ useBoardSync.ts
│  │  │  │  │  └─ useMatchStepSync.ts
│  │  │  │  ├─ types
│  │  │  │  │  ├─ BoardImageMap.ts
│  │  │  │  │  ├─ ICharacterRandomContext.ts
│  │  │  │  │  ├─ IMatchFlow.ts
│  │  │  │  │  └─ IZone.ts
│  │  │  │  └─ ui
│  │  │  │     ├─ components
│  │  │  │     │  ├─ BanPickBoard.vue
│  │  │  │     │  ├─ BanZones.vue
│  │  │  │     │  ├─ DropZone.vue
│  │  │  │     │  ├─ ImageOptions.vue
│  │  │  │     │  ├─ PickZones.vue
│  │  │  │     │  ├─ StepIndicator.vue
│  │  │  │     │  └─ UtilityZones.vue
│  │  │  │     └─ composables
│  │  │  │        └─ useBoardZonesLayout.ts
│  │  │  ├─ character
│  │  │  │  ├─ application
│  │  │  │  │  └─ characterUseCase.ts
│  │  │  │  ├─ domain
│  │  │  │  │  └─ fetchCharacterMapDomain.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ infrastructure
│  │  │  │  │  └─ characterService.ts
│  │  │  │  ├─ store
│  │  │  │  │  └─ characterStore.ts
│  │  │  │  ├─ types
│  │  │  │  │  ├─ CharacterFilterKey.ts
│  │  │  │  │  └─ ICharacter.ts
│  │  │  │  └─ ui
│  │  │  │     ├─ components
│  │  │  │     │  └─ CharacterSelector.vue
│  │  │  │     └─ composables
│  │  │  │        ├─ useFilteredCharacters.ts
│  │  │  │        └─ useSelectorOptions.ts
│  │  │  ├─ chat
│  │  │  │  ├─ application
│  │  │  │  │  └─ chatUseCase.ts
│  │  │  │  ├─ domain
│  │  │  │  │  ├─ addMessageDomain.ts
│  │  │  │  │  ├─ buildChatMessageDTODomain.ts
│  │  │  │  │  ├─ sendMessageDomain.ts
│  │  │  │  │  ├─ setMessagesDomain.ts
│  │  │  │  │  └─ transformChatMessageDomain.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ store
│  │  │  │  │  └─ chatStore.ts
│  │  │  │  ├─ sync
│  │  │  │  │  └─ useChatSync.ts
│  │  │  │  ├─ types
│  │  │  │  │  ├─ IChatMessage.ts
│  │  │  │  │  └─ IChatMessageDTO.ts
│  │  │  │  └─ ui
│  │  │  │     ├─ components
│  │  │  │     │  ├─ ChatFloating.vue
│  │  │  │     │  ├─ ChatRoom.vue
│  │  │  │     │  └─ ChatRoomDrawer.vue
│  │  │  │     └─ composables
│  │  │  ├─ match
│  │  │  │  ├─ application
│  │  │  │  │  └─ matchUseCase.ts
│  │  │  │  ├─ domain
│  │  │  │  │  └─ saveMatchDomain.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ infrastructure
│  │  │  │  │  └─ matchService.ts
│  │  │  │  └─ types
│  │  │  │     └─ IMatchResult.ts
│  │  │  ├─ room
│  │  │  │  ├─ application
│  │  │  │  │  └─ roomUseCase.ts
│  │  │  │  ├─ domain
│  │  │  │  │  ├─ buildRoomDomain.ts
│  │  │  │  │  ├─ fetchRoomsDomain.ts
│  │  │  │  │  └─ fetchRoomSettingDomain.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ infrastructure
│  │  │  │  │  └─ roomService.ts
│  │  │  │  ├─ store
│  │  │  │  │  └─ roomUserStore.ts
│  │  │  │  ├─ sync
│  │  │  │  │  └─ useRoomUserSync.ts
│  │  │  │  ├─ types
│  │  │  │  │  ├─ IRoomSetting.ts
│  │  │  │  │  ├─ IRoomState.ts
│  │  │  │  │  └─ IRoomUser.ts
│  │  │  │  └─ ui
│  │  │  │     ├─ components
│  │  │  │     │  └─ RoomUserPool.vue
│  │  │  │     ├─ composables
│  │  │  │     │  ├─ useRoomList.ts
│  │  │  │     │  └─ useRoomSetting.ts
│  │  │  │     └─ views
│  │  │  │        ├─ RoomListView.vue
│  │  │  │        └─ RoomSettingView.vue
│  │  │  ├─ shared
│  │  │  │  ├─ constants
│  │  │  │  │  └─ characterNameMap.ts
│  │  │  │  ├─ domain
│  │  │  │  │  └─ getCharacterDisplayName.ts
│  │  │  │  ├─ infrastructure
│  │  │  │  │  └─ imageRegistry.ts
│  │  │  │  ├─ ui
│  │  │  │  │  └─ composables
│  │  │  │  │     ├─ useDesignTokens.ts
│  │  │  │  │     ├─ useEchartTheme.ts
│  │  │  │  │     ├─ useElementColor.ts
│  │  │  │  │     ├─ useRelativeTime.ts
│  │  │  │  │     ├─ useScopedCssVar.ts
│  │  │  │  │     └─ useTeamTheme.ts
│  │  │  │  └─ utils
│  │  │  │     └─ array.ts
│  │  │  ├─ tactical
│  │  │  │  ├─ application
│  │  │  │  │  └─ tacticalUseCase.ts
│  │  │  │  ├─ domain
│  │  │  │  │  ├─ findCellIdByImageIdDomain.ts
│  │  │  │  │  ├─ handleTacticalCellImageMapResetDomain.ts
│  │  │  │  │  ├─ handleTacticalCellImagePlaceDomain.ts
│  │  │  │  │  ├─ handleTacticalCellImageRemoveDomain.ts
│  │  │  │  │  ├─ placeCellImageDomain.ts
│  │  │  │  │  └─ removeCellImageDomain.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ store
│  │  │  │  │  └─ tacticalBoardStore.ts
│  │  │  │  ├─ sync
│  │  │  │  │  └─ useTacticalBoardSync.ts
│  │  │  │  ├─ types
│  │  │  │  │  └─ TacticalCellImageMap.ts
│  │  │  │  └─ ui
│  │  │  │     ├─ components
│  │  │  │     │  ├─ TacticalBoard.vue
│  │  │  │     │  ├─ TacticalBoardPanel.vue
│  │  │  │     │  ├─ TacticalBoardPanelDrawer.vue
│  │  │  │     │  ├─ TacticalCell.vue
│  │  │  │     │  └─ TacticalPool.vue
│  │  │  │     └─ composables
│  │  │  │        └─ useTacticalPool.ts
│  │  │  └─ team
│  │  │     ├─ application
│  │  │     │  └─ teamUseCase.ts
│  │  │     ├─ domain
│  │  │     │  ├─ addTeamMemberDomain.ts
│  │  │     │  ├─ createManualMemberDomain.ts
│  │  │     │  ├─ createOnlineMemberDomain.ts
│  │  │     │  ├─ handleMemberDropDomain.ts
│  │  │     │  ├─ handleMemberInputDomian.ts
│  │  │     │  ├─ handleMemberRestoreDomain.ts
│  │  │     │  └─ removeTeamMemberDomain.ts
│  │  │     ├─ index.ts
│  │  │     ├─ store
│  │  │     │  └─ teamInfoStore.ts
│  │  │     ├─ sync
│  │  │     │  └─ useTeamInfoSync.ts
│  │  │     ├─ types
│  │  │     │  ├─ ITeam.ts
│  │  │     │  └─ TeamMember.ts
│  │  │     └─ ui
│  │  │        └─ components
│  │  │           └─ TeamInfo.vue
│  │  └─ router
│  │     └─ index.ts
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  ├─ upload-node-modules.sh
│  └─ vite.config.ts
├─ package-lock.json
└─ README.md

```