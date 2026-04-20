/*
  Warnings:

  - The values [OWNER] on the enum `CompanyRole` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[companyApplicationId,type]` on the table `CompanyDocument` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `CompanyDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CompanyRole_new" AS ENUM ('ADMIN', 'MEMBER');
ALTER TABLE "CompanyMember" ALTER COLUMN "role" TYPE "CompanyRole_new" USING ("role"::text::"CompanyRole_new");
ALTER TABLE "Invite" ALTER COLUMN "role" TYPE "CompanyRole_new" USING ("role"::text::"CompanyRole_new");
ALTER TYPE "CompanyRole" RENAME TO "CompanyRole_old";
ALTER TYPE "CompanyRole_new" RENAME TO "CompanyRole";
DROP TYPE "public"."CompanyRole_old";
COMMIT;

-- DropIndex
DROP INDEX "CompanyDocument_companyApplicationId_idx";

-- AlterTable
ALTER TABLE "CompanyApplication" ALTER COLUMN "currentStep" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "CompanyDocument" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CompanyDocument_companyApplicationId_type_key" ON "CompanyDocument"("companyApplicationId", "type");
