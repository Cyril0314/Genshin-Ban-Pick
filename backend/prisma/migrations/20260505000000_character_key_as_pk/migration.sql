-- DropForeignKey: 暫卸 FK，否則 Character_key_key unique index 無法被 drop
ALTER TABLE "public"."MatchMove" DROP CONSTRAINT "MatchMove_characterKey_fkey";
ALTER TABLE "public"."MatchTacticalUsage" DROP CONSTRAINT "MatchTacticalUsage_characterKey_fkey";

-- DropIndex
DROP INDEX "public"."Character_key_key";

-- AlterTable: 砍舊 PK + 砍 id 欄位 + 將 key 升格為 PK
ALTER TABLE "public"."Character" DROP CONSTRAINT "Character_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Character_pkey" PRIMARY KEY ("key");

-- AddForeignKey: 重建 FK，options 跟原本一致 (ON UPDATE CASCADE ON DELETE RESTRICT)
ALTER TABLE "public"."MatchMove"
    ADD CONSTRAINT "MatchMove_characterKey_fkey"
    FOREIGN KEY ("characterKey") REFERENCES "public"."Character"("key")
    ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "public"."MatchTacticalUsage"
    ADD CONSTRAINT "MatchTacticalUsage_characterKey_fkey"
    FOREIGN KEY ("characterKey") REFERENCES "public"."Character"("key")
    ON UPDATE CASCADE ON DELETE RESTRICT;
