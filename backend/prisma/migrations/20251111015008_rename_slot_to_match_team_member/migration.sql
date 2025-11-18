/*
  Warnings:

  - You are about to drop the column `memberSlot` on the `MatchTeamMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."MatchTeamMember" DROP COLUMN "memberSlot",
ADD COLUMN     "slot" INTEGER;
