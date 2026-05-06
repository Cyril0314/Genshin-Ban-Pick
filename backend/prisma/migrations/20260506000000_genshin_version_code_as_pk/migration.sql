-- 1. 砍掉 Character → GenshinVersion 的舊 FK（後面才能 drop GenshinVersion.id）
ALTER TABLE "public"."Character" DROP CONSTRAINT "Character_genshinVersionId_fkey";

-- 2. 砍舊欄位的 index
DROP INDEX "public"."Character_genshinVersionId_idx";

-- 3. Character 加新欄位（先空著）
ALTER TABLE "public"."Character" ADD COLUMN "genshinVersionCode" TEXT;

-- 4. ★ 從舊 FK 回填新欄位（保住資料）
UPDATE "public"."Character" c
SET "genshinVersionCode" = v.code
FROM "public"."GenshinVersion" v
WHERE c."genshinVersionId" = v.id;

-- 5. 砍掉 Character 的舊 FK 欄位
ALTER TABLE "public"."Character" DROP COLUMN "genshinVersionId";

-- 6. GenshinVersion 換 PK：砍 id PK + id 欄位 + code 的 unique index
--    (原 migration 用 CREATE UNIQUE INDEX 而非 ADD CONSTRAINT，所以是 INDEX 不是 CONSTRAINT)
ALTER TABLE "public"."GenshinVersion" DROP CONSTRAINT "GenshinVersion_pkey";
ALTER TABLE "public"."GenshinVersion" DROP COLUMN "id";
DROP INDEX "public"."GenshinVersion_code_key";

-- 7. code 升 PK
ALTER TABLE "public"."GenshinVersion" ADD CONSTRAINT "GenshinVersion_pkey" PRIMARY KEY ("code");

-- 8. Character 新欄位的 index
CREATE INDEX "Character_genshinVersionCode_idx" ON "public"."Character"("genshinVersionCode");

-- 9. 重建 FK，options 對齊原本 (ON UPDATE CASCADE ON DELETE SET NULL)
ALTER TABLE "public"."Character"
    ADD CONSTRAINT "Character_genshinVersionCode_fkey"
    FOREIGN KEY ("genshinVersionCode") REFERENCES "public"."GenshinVersion"("code")
    ON UPDATE CASCADE ON DELETE SET NULL;
