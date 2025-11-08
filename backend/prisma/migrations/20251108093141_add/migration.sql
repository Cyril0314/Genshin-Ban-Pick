-- CreateEnum
CREATE TYPE "public"."MoveSource" AS ENUM ('Manual', 'Random');

-- AlterTable
ALTER TABLE "public"."MatchMove" ADD COLUMN     "source" "public"."MoveSource" NOT NULL DEFAULT 'Manual';

-- CreateTable
CREATE TABLE "public"."RandomMoveContext" (
    "id" SERIAL NOT NULL,
    "matchMoveId" INTEGER NOT NULL,
    "filters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RandomMoveContext_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RandomMoveContext_matchMoveId_key" ON "public"."RandomMoveContext"("matchMoveId");

-- AddForeignKey
ALTER TABLE "public"."RandomMoveContext" ADD CONSTRAINT "RandomMoveContext_matchMoveId_fkey" FOREIGN KEY ("matchMoveId") REFERENCES "public"."MatchMove"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
