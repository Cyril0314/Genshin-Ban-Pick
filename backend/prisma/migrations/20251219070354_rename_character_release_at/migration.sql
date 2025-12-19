/*
  Warnings:

  - You are about to drop the column `releaseDate` on the `Character` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Character" DROP COLUMN "releaseDate",
ADD COLUMN     "releaseAt" TIMESTAMP(3);
