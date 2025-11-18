/*
  Warnings:

  - You are about to drop the column `teamSlot` on the `MatchTeam` table. All the data in the column will be lost.
  - Made the column `slot` on table `MatchTeam` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."MatchTeam" DROP COLUMN "teamSlot",
ALTER COLUMN "slot" SET NOT NULL;
