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