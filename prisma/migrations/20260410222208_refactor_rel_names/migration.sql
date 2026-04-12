/*
  Warnings:

  - You are about to drop the column `verified` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `AgentApplicationVerification` table. All the data in the column will be lost.
  - You are about to drop the column `read` on the `Message` table. All the data in the column will be lost.
  - Changed the type of `action` on the `AgentApplicationHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `action` on the `CompanyApplicationHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `action` on the `ListingApplicationHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ApplicationAction" AS ENUM ('CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'UPDATED');

-- DropIndex
DROP INDEX "Bookmark_listingId_idx";

-- DropIndex
DROP INDEX "Bookmark_userId_idx";

-- DropIndex
DROP INDEX "Review_listingId_idx";

-- DropIndex
DROP INDEX "Review_userId_idx";

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "verified",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "AgentApplicationHistory" DROP COLUMN "action",
ADD COLUMN     "action" "ApplicationAction" NOT NULL;

-- AlterTable
ALTER TABLE "AgentApplicationVerification" DROP COLUMN "verified",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CompanyApplicationHistory" DROP COLUMN "action",
ADD COLUMN     "action" "ApplicationAction" NOT NULL;

-- AlterTable
ALTER TABLE "ListingApplicationHistory" DROP COLUMN "action",
ADD COLUMN     "action" "ApplicationAction" NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "read",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
