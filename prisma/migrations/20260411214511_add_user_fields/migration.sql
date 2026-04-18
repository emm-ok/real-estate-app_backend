/*
  Warnings:

  - Added the required column `emailVerificationExpiresAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emailVerificationToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastLoginAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordChangedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordResetExpiresAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordResetToken` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('LOCAL', 'GOOGLE', 'APPLE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationExpiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "emailVerificationToken" TEXT NOT NULL,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "passwordResetExpiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "passwordResetToken" TEXT NOT NULL,
ADD COLUMN     "provider" "Provider" NOT NULL DEFAULT 'LOCAL';
