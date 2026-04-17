/*
  Warnings:

  - A unique constraint covering the columns `[agentApplicationId,type]` on the table `AgentDocument` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `AgentDocument` table without a default value. This is not possible if the table is not empty.
  - Made the column `status` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "AgentApplication_userId_idx";

-- DropIndex
DROP INDEX "AgentDocument_agentApplicationId_idx";

-- AlterTable
ALTER TABLE "AgentDocument" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "status" SET NOT NULL;

-- CreateIndex
CREATE INDEX "AgentApplication_userId_status_idx" ON "AgentApplication"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AgentDocument_agentApplicationId_type_key" ON "AgentDocument"("agentApplicationId", "type");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
