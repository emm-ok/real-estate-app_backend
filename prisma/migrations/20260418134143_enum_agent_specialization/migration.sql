/*
  Warnings:

  - The values [SHORLET] on the enum `AgentSpecialization` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AgentSpecialization_new" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'LUXURY', 'STUDENT', 'SHORTLET', 'LAND');
ALTER TABLE "AgentProfessional" ALTER COLUMN "specialization" TYPE "AgentSpecialization_new" USING ("specialization"::text::"AgentSpecialization_new");
ALTER TYPE "AgentSpecialization" RENAME TO "AgentSpecialization_old";
ALTER TYPE "AgentSpecialization_new" RENAME TO "AgentSpecialization";
DROP TYPE "public"."AgentSpecialization_old";
COMMIT;
