/*
  Warnings:

  - The values [INTERVIEW_COMPLETED,APPROVED,OFFER_ACCEPTED] on the enum `JobApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('SENT', 'ACCEPTED', 'DECLINED');

-- AlterEnum
BEGIN;
UPDATE "job_applications"
SET "status" = 'INTERVIEW_CONFIRMED'
WHERE "status" IN ('APPROVED', 'INTERVIEW_COMPLETED');

UPDATE "job_applications"
SET "status" = 'ONBOARDED'
WHERE "status" = 'OFFER_ACCEPTED';

CREATE TYPE "JobApplicationStatus_new" AS ENUM ('NOT_APPLIED', 'APPLIED', 'INTERVIEW_INVITED', 'INTERVIEW_CONFIRMED', 'INTERVIEW_DECLINED', 'OFFER_SENT', 'OFFER_DECLINED', 'ONBOARDED', 'CANCELLED', 'REJECTED');
ALTER TABLE "public"."job_applications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "job_applications" ALTER COLUMN "status" TYPE "JobApplicationStatus_new" USING ("status"::text::"JobApplicationStatus_new");
ALTER TYPE "JobApplicationStatus" RENAME TO "JobApplicationStatus_old";
ALTER TYPE "JobApplicationStatus_new" RENAME TO "JobApplicationStatus";
DROP TYPE "public"."JobApplicationStatus_old";
ALTER TABLE "job_applications" ALTER COLUMN "status" SET DEFAULT 'APPLIED';
COMMIT;

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "proposedSalary" DECIMAL(15,2),
    "proposedHireDate" TIMESTAMP(3),
    "notes" TEXT,
    "candidateNote" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "offers_jobApplicationId_idx" ON "offers"("jobApplicationId");

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
