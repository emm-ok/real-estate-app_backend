/*
  Warnings:

  - You are about to drop the `ListingApplication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ListingApplicationHistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ListingAction" AS ENUM ('DRAFTED', 'UPDATED', 'SUBMITTED', 'UPLOADED_MEDIA', 'DELETED_MEDIA', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ListingMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- DropForeignKey
ALTER TABLE "ListingApplication" DROP CONSTRAINT "ListingApplication_agentId_fkey";

-- DropForeignKey
ALTER TABLE "ListingApplication" DROP CONSTRAINT "ListingApplication_companyId_fkey";

-- DropForeignKey
ALTER TABLE "ListingApplication" DROP CONSTRAINT "ListingApplication_listingId_fkey";

-- DropForeignKey
ALTER TABLE "ListingApplicationHistory" DROP CONSTRAINT "ListingApplicationHistory_listingApplicationId_fkey";

-- DropForeignKey
ALTER TABLE "ListingApplicationHistory" DROP CONSTRAINT "ListingApplicationHistory_performedById_fkey";

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "uploadedAt" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "type" "ListingMediaType" NOT NULL;

-- DropTable
DROP TABLE "ListingApplication";

-- DropTable
DROP TABLE "ListingApplicationHistory";

-- CreateTable
CREATE TABLE "ListingHistory" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "action" "ListingAction" NOT NULL,
    "performedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingHistory_listingId_idx" ON "ListingHistory"("listingId");

-- CreateIndex
CREATE INDEX "ListingHistory_performedById_idx" ON "ListingHistory"("performedById");

-- AddForeignKey
ALTER TABLE "ListingHistory" ADD CONSTRAINT "ListingHistory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingHistory" ADD CONSTRAINT "ListingHistory_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
