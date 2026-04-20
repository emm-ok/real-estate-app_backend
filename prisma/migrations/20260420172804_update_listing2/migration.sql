/*
  Warnings:

  - Added the required column `publicId` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "publicId" TEXT NOT NULL;
