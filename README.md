
## Prisma

### 本地建立新的 migration
- npx prisma migrate dev --name init

### 遠端套用 migration
- npx prisma generate 產生 Prisma Client
- npx prisma migrate deploy 套用已存在的 migration 到資料庫
- npx prisma db seed 執行種子資料程式

## Clean Architecture

- Component: UI 渲染、觸發行為
- Store: 狀態保存、快取、提供給 UI 使用
- Use Case / Sync: (流程 & I/O orchestration) 協調 Service/Socket/Store/Flow
- Domain: Model: (純邏輯) 定義、資料轉換、業務規則

| 模組特性                                         | 推薦 Store 型式         |
| -------------------------------------------- | ------------------- |
| **短週期資料 (即時訊息 / socket / draggable state)**  | **Setup Store** ✅   |
| **長週期資料 (一次載入 / 大量快取 / Dictionary / Index)** | **Options Store** ✅ |
