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
│  │  │  ├─ match.ts
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
│  │  │  ├─ match
│  │  │  │  └─ MatchService.ts
│  │  │  └─ room
│  │  │     └─ RoomService.ts
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
│  │  │  └─ stores
│  │  │     └─ socketStore.ts
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
│  │  │  │  │  ├─ IGuest.ts
│  │  │  │  │  ├─ IMember.ts
│  │  │  │  │  └─ Identity.ts
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
│  │  │  │     ├─ composables
│  │  │  │     │  └─ useBoardZonesLayout.ts
│  │  │  │     └─ views
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
│  │  │  │     └─ components
│  │  │  │        ├─ ChatFloating.vue
│  │  │  │        ├─ ChatRoom.vue
│  │  │  │        └─ ChatRoomDrawer.vue
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
│  │  │  │  │  ├─ fetchRoomSettingDomain.ts
│  │  │  │  │  └─ fetchRoomsDomain.ts
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
└─ packages
   └─ shared
      └─ src
         └─ types

```