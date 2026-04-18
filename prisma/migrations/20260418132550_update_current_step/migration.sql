/*
  Warnings:

  - Changed the type of `specialization` on the `AgentProfessional` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AgentSpecialization" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'LUXURY', 'STUDENT', 'SHORLET', 'LAND');

-- AlterTable
ALTER TABLE "AgentApplication" ALTER COLUMN "currentStep" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "AgentProfessional" DROP COLUMN "specialization",
ADD COLUMN     "specialization" "AgentSpecialization" NOT NULL;
