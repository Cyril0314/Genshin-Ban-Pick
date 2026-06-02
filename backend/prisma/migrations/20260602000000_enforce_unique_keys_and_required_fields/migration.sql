-- DropIndex
-- MatchMove(matchId, order) 升級為 unique，原本的非唯一 index 由 unique index 取代
DROP INDEX "MatchMove_matchId_order_idx";

-- CreateIndex
CREATE UNIQUE INDEX "MatchMove_matchId_order_key" ON "MatchMove"("matchId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "MatchTeam_matchId_slot_key" ON "MatchTeam"("matchId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "MatchTeamMember_teamId_slot_key" ON "MatchTeamMember"("teamId", "slot");

-- AlterTable
-- role / wish 實際資料皆非 null（seed 一律寫值），對齊 ICharacter 契約的非空宣告
ALTER TABLE "Character" ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "wish" SET NOT NULL;

-- 手動補：Prisma schema 無法表達 CHECK
-- MatchTeamMember 的 memberRef / guestRef 至多一個非空（兩者皆 null = name-only 歷史玩家）
ALTER TABLE "MatchTeamMember"
ADD CONSTRAINT "MatchTeamMember_ref_exclusive"
CHECK (num_nonnulls("memberRef", "guestRef") <= 1);
