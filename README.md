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

```
Genshin-Ban-Pick
├─ .DS_Store
├─ .prettierrc.json
├─ README.md
├─ backend
│  ├─ .env
│  ├─ dist
│  │  ├─ constants
│  │  └─ routes
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
│  │  ├─ constants
│  │  │  └─ constants.ts
│  │  ├─ errors
│  │  │  └─ AppError.ts
│  │  ├─ factories
│  │  │  └─ roomSettingFactory.ts
│  │  ├─ index.ts
│  │  ├─ middlewares
│  │  │  └─ errorHandler.ts
│  │  ├─ prisma.ts
│  │  ├─ routes
│  │  │  ├─ analysis.ts
│  │  │  ├─ auth.ts
│  │  │  ├─ characters.ts
│  │  │  └─ room.ts
│  │  ├─ services
│  │  │  ├─ CharacterService.ts
│  │  │  ├─ analysis
│  │  │  │  ├─ AnalysisService.ts
│  │  │  │  ├─ clustering
│  │  │  │  │  ├─ ClusteringService.ts
│  │  │  │  │  └─ types
│  │  │  │  │     ├─ IBridgeScoreResult.ts
│  │  │  │  │     └─ ICommunityScanResult.ts
│  │  │  │  ├─ projection
│  │  │  │  │  └─ ProjectionService.ts
│  │  │  │  ├─ synergy
│  │  │  │  │  ├─ SynergyNormalizationService.ts
│  │  │  │  │  ├─ SynergyService.ts
│  │  │  │  │  └─ types
│  │  │  │  │     ├─ IRawTacticalUsage.ts
│  │  │  │  │     ├─ ISynergyMatrix.ts
│  │  │  │  │     └─ SynergyMode.ts
│  │  │  │  └─ tactical
│  │  │  │     ├─ calculateTacticalWeight.ts
│  │  │  │     ├─ computeTacticalUsages.ts
│  │  │  │     ├─ getWeightContext.ts
│  │  │  │     └─ types
│  │  │  │        ├─ IMoveContext.ts
│  │  │  │        ├─ ITacticalCoefficients.ts
│  │  │  │        └─ IWeightContext.ts
│  │  │  ├─ auth
│  │  │  │  ├─ AuthPayload.ts
│  │  │  │  ├─ GuestService.ts
│  │  │  │  ├─ MemberService.ts
│  │  │  │  └─ jwt.ts
│  │  │  └─ room
│  │  │     ├─ RoomService.ts
│  │  │     └─ RoomStatePersistenceService.ts
│  │  ├─ socket
│  │  │  ├─ index.ts
│  │  │  ├─ managers
│  │  │  │  ├─ IRoomStateManager.ts
│  │  │  │  └─ RoomStateManager.ts
│  │  │  ├─ modules
│  │  │  │  ├─ boardSocket.ts
│  │  │  │  ├─ chatSocket.ts
│  │  │  │  ├─ roomSocket.ts
│  │  │  │  ├─ stepSocket.ts
│  │  │  │  ├─ tacticalSocket.ts
│  │  │  │  └─ teamSocket.ts
│  │  │  ├─ socketAuth.ts
│  │  │  └─ socketController.ts
│  │  ├─ test
│  │  │  └─ saveTest.ts
│  │  ├─ types
│  │  │  ├─ CharacterFilterKey.ts
│  │  │  ├─ ICharacterRandomContext.ts
│  │  │  ├─ IChatMessageDTO.ts
│  │  │  ├─ IMatchFlow.ts
│  │  │  ├─ IRoomSetting.ts
│  │  │  ├─ IRoomState.ts
│  │  │  ├─ IRoomUser.ts
│  │  │  ├─ ITeam.ts
│  │  │  ├─ IZone.ts
│  │  │  └─ TeamMember.ts
│  │  └─ utils
│  │     ├─ asyncHandler.ts
│  │     ├─ logger.ts
│  │     ├─ matchFlow.ts
│  │     └─ zoneMetaTable.ts
│  ├─ tsconfig.json
│  ├─ types
│  │  ├─ ml-kmeans.d.ts
│  │  ├─ ml-pca.d.ts
│  │  └─ src
│  └─ upload-node-modules.sh
├─ genshin-ban-pick
│  ├─ .editorconfig
│  ├─ .env.development
│  ├─ .env.production
│  ├─ README.md
│  ├─ deploy-dist-to-ec2.sh
│  ├─ env.d.ts
│  ├─ eslint.config.ts
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.ico
│  │  └─ wish.png
│  ├─ src
│  │  ├─ App.vue
│  │  ├─ application
│  │  │  └─ useAuthUseCase.ts
│  │  ├─ composables
│  │  │  ├─ useAnalysisDomain.ts
│  │  │  ├─ useAppInitializer.ts
│  │  │  ├─ useCharacterDomain.ts
│  │  │  ├─ useDesignTokens.ts
│  │  │  ├─ useEchartTheme.ts
│  │  │  ├─ useRoomDomain.ts
│  │  │  ├─ useScopedCssVar.ts
│  │  │  └─ useTeamTheme.ts
│  │  ├─ constants
│  │  │  ├─ characterNameMap.ts
│  │  │  ├─ customMIMETypes.ts
│  │  │  └─ useElementColor.ts
│  │  ├─ domain
│  │  │  └─ useAuthDomain.ts
│  │  ├─ errors
│  │  │  └─ AppError.ts
│  │  ├─ features
│  │  │  ├─ Analysis
│  │  │  │  ├─ Analysis.vue
│  │  │  │  ├─ AnalysisDrawer.vue
│  │  │  │  ├─ components
│  │  │  │  │  ├─ CharacterClustersChart.vue
│  │  │  │  │  ├─ CharacterMetaChart.vue
│  │  │  │  │  ├─ CharacterSynergyChart.vue
│  │  │  │  │  ├─ CharacterTacticalUsageCompositionChart.vue
│  │  │  │  │  ├─ CharacterTacticalUsagesChart.vue
│  │  │  │  │  ├─ PlayerCharacterChart.vue
│  │  │  │  │  └─ composables
│  │  │  │  │     ├─ useCharacterClustersChart.ts
│  │  │  │  │     ├─ useCharacterSynergyChart.ts
│  │  │  │  │     ├─ useCharacterTacticalUsageCompositionChart.ts
│  │  │  │  │     ├─ useCharacterTacticalUsagesChart.ts
│  │  │  │  │     └─ usePlayerCharacterChart.ts
│  │  │  │  ├─ composables
│  │  │  │  │  └─ useAnalysis.ts
│  │  │  │  └─ types
│  │  │  │     ├─ ICharacterClusters.ts
│  │  │  │     ├─ ITacticalUsages.ts
│  │  │  │     └─ IWeightContext.ts
│  │  │  ├─ BanPick
│  │  │  │  ├─ BanPickBoard.vue
│  │  │  │  ├─ CharacterSelector
│  │  │  │  │  ├─ CharacterSelector.vue
│  │  │  │  │  └─ composables
│  │  │  │  │     ├─ useFilteredCharacters.ts
│  │  │  │  │     └─ useSelectorOptions.ts
│  │  │  │  ├─ ImageOptions
│  │  │  │  │  └─ ImageOptions.vue
│  │  │  │  ├─ components
│  │  │  │  │  ├─ BanZones.vue
│  │  │  │  │  ├─ DropZone.vue
│  │  │  │  │  ├─ PickZones.vue
│  │  │  │  │  └─ UtilityZones.vue
│  │  │  │  ├─ composables
│  │  │  │  │  ├─ useBoardSync.ts
│  │  │  │  │  ├─ useBoardZonesLayout.ts
│  │  │  │  │  └─ useRandomPull.ts
│  │  │  │  └─ types
│  │  │  │     ├─ CharacterFilterKey.ts
│  │  │  │     ├─ ICharacterRandomContext.ts
│  │  │  │     └─ IZone.ts
│  │  │  ├─ ChatRoom
│  │  │  │  ├─ ChatRoom.vue
│  │  │  │  ├─ ChatRoomDrawer.vue
│  │  │  │  ├─ composables
│  │  │  │  │  └─ useChatSync.ts
│  │  │  │  └─ types
│  │  │  │     ├─ IChatMessage.ts
│  │  │  │     └─ IChatMessageDTO.ts
│  │  │  ├─ RoomUserPool
│  │  │  │  ├─ RoomUserPool.vue
│  │  │  │  └─ composables
│  │  │  │     └─ useRoomUserSync.ts
│  │  │  ├─ StepIndicator
│  │  │  │  ├─ StepIndicator.vue
│  │  │  │  └─ composables
│  │  │  │     └─ useMatchStepSync.ts
│  │  │  ├─ Tactical
│  │  │  │  ├─ TacticalBoard.vue
│  │  │  │  ├─ TacticalBoardPanel.vue
│  │  │  │  ├─ TacticalBoardPanelDrawer.vue
│  │  │  │  ├─ TacticalCell.vue
│  │  │  │  ├─ TacticalPool.vue
│  │  │  │  └─ composables
│  │  │  │     └─ useTacticalBoardSync.ts
│  │  │  ├─ Team
│  │  │  │  ├─ TeamInfo.vue
│  │  │  │  └─ composables
│  │  │  │     └─ useTeamInfoSync.ts
│  │  │  └─ Toolbar
│  │  │     └─ ToolBar.vue
│  │  ├─ infrastructure
│  │  │  └─ storage
│  │  │     └─ tokenStorage.ts
│  │  ├─ main.ts
│  │  ├─ network
│  │  │  ├─ analysisService.ts
│  │  │  ├─ authService.ts
│  │  │  ├─ characterService.ts
│  │  │  ├─ httpClient.ts
│  │  │  ├─ registerAllSyncModules.ts
│  │  │  └─ roomService.ts
│  │  ├─ playground
│  │  │  ├─ components
│  │  │  │  ├─ HelloWorld.vue
│  │  │  │  ├─ TheWelcome.vue
│  │  │  │  ├─ WelcomeItem.vue
│  │  │  │  └─ icons
│  │  │  │     └─ IconTooling.vue
│  │  │  ├─ stores
│  │  │  │  └─ counter.ts
│  │  │  └─ views
│  │  │     └─ AboutView.vue
│  │  ├─ router
│  │  │  └─ index.ts
│  │  ├─ stores
│  │  │  ├─ authStore.ts
│  │  │  ├─ boardImageStore.ts
│  │  │  ├─ characterStore.ts
│  │  │  ├─ chatStore.ts
│  │  │  ├─ matchStepStore.ts
│  │  │  ├─ roomUserStore.ts
│  │  │  ├─ socketStore.ts
│  │  │  ├─ tacticalBoardStore.ts
│  │  │  └─ teamInfoStore.ts
│  │  ├─ types
│  │  │  ├─ ICharacter.ts
│  │  │  ├─ IGuest.ts
│  │  │  ├─ IMatchFlow.ts
│  │  │  ├─ IMember.ts
│  │  │  ├─ IRoomSetting.ts
│  │  │  ├─ IRoomState.ts
│  │  │  ├─ IRoomUser.ts
│  │  │  ├─ ITeam.ts
│  │  │  └─ TeamMember.ts
│  │  ├─ utils
│  │  │  └─ imageRegistry.ts
│  │  └─ views
│  │     ├─ BanPickView.vue
│  │     ├─ LoginView.vue
│  │     ├─ RegisterView.vue
│  │     ├─ RoomListView.vue
│  │     └─ RoomSettingView.vue
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  ├─ upload-node-modules.sh
│  └─ vite.config.ts
├─ package-lock.json
└─ packages
   └─ shared
      └─ src
         └─ types

```