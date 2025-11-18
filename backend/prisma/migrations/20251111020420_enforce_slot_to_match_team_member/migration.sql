/*
  Warnings:

  - Made the column `slot` on table `MatchTeamMember` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."MatchTeamMember" ALTER COLUMN "slot" SET NOT NULL;
