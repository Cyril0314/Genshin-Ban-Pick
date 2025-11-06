
## Prisma

### 本地建立新的 migration
- npx prisma migrate dev --name init

### 遠端套用 migration
- npx prisma generate 產生 Prisma Client
- npx prisma migrate deploy 套用已存在的 migration 到資料庫
- npx prisma db seed 執行種子資料程式

