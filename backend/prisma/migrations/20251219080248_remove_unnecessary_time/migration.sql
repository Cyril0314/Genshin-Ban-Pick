/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `GenshinVersion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Character" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "version";

-- AlterTable
ALTER TABLE "public"."GenshinVersion" DROP COLUMN "createdAt";
