-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "emailVerificationExpiresAt" DROP NOT NULL,
ALTER COLUMN "emailVerificationToken" DROP NOT NULL,
ALTER COLUMN "lastLoginAt" DROP NOT NULL,
ALTER COLUMN "passwordChangedAt" DROP NOT NULL,
ALTER COLUMN "passwordResetExpiresAt" DROP NOT NULL,
ALTER COLUMN "passwordResetToken" DROP NOT NULL;
