/*
  Warnings:

  - Added the required column `teamSlot` to the `MatchTeam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."MatchTeam" ADD COLUMN     "teamSlot" INTEGER NOT NULL;
