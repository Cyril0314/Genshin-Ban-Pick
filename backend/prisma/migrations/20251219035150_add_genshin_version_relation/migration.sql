-- AlterTable
ALTER TABLE "public"."Character" ADD COLUMN     "genshinVersionId" INTEGER;

-- CreateTable
CREATE TABLE "public"."GenshinVersion" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),

    CONSTRAINT "GenshinVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GenshinVersion_order_key" ON "public"."GenshinVersion"("order");

-- CreateIndex
CREATE UNIQUE INDEX "GenshinVersion_code_key" ON "public"."GenshinVersion"("code");

-- CreateIndex
CREATE INDEX "Character_genshinVersionId_idx" ON "public"."Character"("genshinVersionId");

-- AddForeignKey
ALTER TABLE "public"."Character" ADD CONSTRAINT "Character_genshinVersionId_fkey" FOREIGN KEY ("genshinVersionId") REFERENCES "public"."GenshinVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
