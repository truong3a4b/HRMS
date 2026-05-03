/*
  Warnings:

  - The values [INTERVIEW_INVITED,INTERVIEW_CONFIRMED,INTERVIEW_DECLINED] on the enum `JobApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JobApplicationStatus_new" AS ENUM ('NOT_APPLIED', 'APPLIED', 'INTERVIEWING', 'OFFER_SENT', 'OFFER_DECLINED', 'ONBOARDED', 'CANCELLED', 'REJECTED');
ALTER TABLE "public"."job_applications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "job_applications" ALTER COLUMN "status" TYPE "JobApplicationStatus_new" USING ("status"::text::"JobApplicationStatus_new");
ALTER TYPE "JobApplicationStatus" RENAME TO "JobApplicationStatus_old";
ALTER TYPE "JobApplicationStatus_new" RENAME TO "JobApplicationStatus";
DROP TYPE "public"."JobApplicationStatus_old";
ALTER TABLE "job_applications" ALTER COLUMN "status" SET DEFAULT 'APPLIED';
COMMIT;
