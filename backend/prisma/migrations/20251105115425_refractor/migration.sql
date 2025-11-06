/*
  Warnings:

  - The `role` column on the `Member` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."MemberRole" AS ENUM ('User', 'Owner', 'Admin');

-- CreateEnum
CREATE TYPE "public"."MoveType" AS ENUM ('Ban', 'Pick', 'Utility');

-- CreateEnum
CREATE TYPE "public"."Element" AS ENUM ('Anemo', 'Geo', 'Electro', 'Dendro', 'Pyro', 'Hydro', 'Cryo', 'None');

-- CreateEnum
CREATE TYPE "public"."Weapon" AS ENUM ('Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst');

-- CreateEnum
CREATE TYPE "public"."Region" AS ENUM ('Mondstadt', 'Liyue', 'Inazuma', 'Sumeru', 'Fontaine', 'Natlan', 'NodKrai', 'Snezhnaya', 'Khaenriah', 'None');

-- CreateEnum
CREATE TYPE "public"."Rarity" AS ENUM ('FourStar', 'FiveStar');

-- CreateEnum
CREATE TYPE "public"."CharacterRole" AS ENUM ('MainDPS', 'SubDPS', 'Support');

-- CreateEnum
CREATE TYPE "public"."Wish" AS ENUM ('Standard', 'Limited', 'None');

-- CreateEnum
CREATE TYPE "public"."ModelType" AS ENUM ('TallMale', 'TallFemale', 'MediumMale', 'MediumFemale', 'ShortFemale', 'None');

-- AlterTable
ALTER TABLE "public"."Member" DROP COLUMN "role",
ADD COLUMN     "role" "public"."MemberRole" NOT NULL DEFAULT 'User';

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "public"."Match" (
    "id" SERIAL NOT NULL,
    "flowVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchTeam" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "name" TEXT,

    CONSTRAINT "MatchTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchTeamMember" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "memberRef" INTEGER,
    "guestRef" INTEGER,

    CONSTRAINT "MatchTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchTacticalUsage" (
    "id" SERIAL NOT NULL,
    "modelVersion" INTEGER NOT NULL DEFAULT 1,
    "characterKey" TEXT NOT NULL,
    "setupNumber" INTEGER NOT NULL,
    "teamMemberId" INTEGER NOT NULL,

    CONSTRAINT "MatchTacticalUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchMove" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER,
    "characterKey" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "public"."MoveType" NOT NULL,

    CONSTRAINT "MatchMove_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Character" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" "public"."Rarity" NOT NULL,
    "element" "public"."Element" NOT NULL,
    "weapon" "public"."Weapon" NOT NULL,
    "region" "public"."Region" NOT NULL,
    "modelType" "public"."ModelType",
    "releaseDate" TIMESTAMP(3),
    "version" TEXT,
    "role" "public"."CharacterRole",
    "wish" "public"."Wish",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchTeamMember_teamId_memberRef_idx" ON "public"."MatchTeamMember"("teamId", "memberRef");

-- CreateIndex
CREATE INDEX "MatchTeamMember_teamId_guestRef_idx" ON "public"."MatchTeamMember"("teamId", "guestRef");

-- CreateIndex
CREATE INDEX "MatchTacticalUsage_teamMemberId_setupNumber_idx" ON "public"."MatchTacticalUsage"("teamMemberId", "setupNumber");

-- CreateIndex
CREATE INDEX "MatchTacticalUsage_setupNumber_idx" ON "public"."MatchTacticalUsage"("setupNumber");

-- CreateIndex
CREATE INDEX "MatchMove_matchId_order_idx" ON "public"."MatchMove"("matchId", "order");

-- CreateIndex
CREATE INDEX "MatchMove_characterKey_idx" ON "public"."MatchMove"("characterKey");

-- CreateIndex
CREATE INDEX "MatchMove_teamId_characterKey_idx" ON "public"."MatchMove"("teamId", "characterKey");

-- CreateIndex
CREATE UNIQUE INDEX "Character_key_key" ON "public"."Character"("key");

-- AddForeignKey
ALTER TABLE "public"."MatchTeam" ADD CONSTRAINT "MatchTeam_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchTeamMember" ADD CONSTRAINT "MatchTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."MatchTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchTeamMember" ADD CONSTRAINT "MatchTeamMember_memberRef_fkey" FOREIGN KEY ("memberRef") REFERENCES "public"."Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchTeamMember" ADD CONSTRAINT "MatchTeamMember_guestRef_fkey" FOREIGN KEY ("guestRef") REFERENCES "public"."Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchTacticalUsage" ADD CONSTRAINT "MatchTacticalUsage_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "public"."MatchTeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchTacticalUsage" ADD CONSTRAINT "MatchTacticalUsage_characterKey_fkey" FOREIGN KEY ("characterKey") REFERENCES "public"."Character"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchMove" ADD CONSTRAINT "MatchMove_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchMove" ADD CONSTRAINT "MatchMove_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."MatchTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchMove" ADD CONSTRAINT "MatchMove_characterKey_fkey" FOREIGN KEY ("characterKey") REFERENCES "public"."Character"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
