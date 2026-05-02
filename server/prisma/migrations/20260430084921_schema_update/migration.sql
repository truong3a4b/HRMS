/*
  Warnings:

  - You are about to drop the column `evaluatorUserId` on the `interview_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `interviewScheduleId` on the `interview_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `createdByUserId` on the `interview_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `meetingLink` on the `interview_schedules` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "interview_evaluations" DROP CONSTRAINT "interview_evaluations_evaluatorUserId_fkey";

-- DropForeignKey
ALTER TABLE "interview_evaluations" DROP CONSTRAINT "interview_evaluations_interviewScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "interview_schedules" DROP CONSTRAINT "interview_schedules_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "recruitment_jobs" DROP CONSTRAINT "recruitment_jobs_createdById_fkey";

-- DropIndex
DROP INDEX "interview_evaluations_interviewScheduleId_idx";

-- AlterTable
ALTER TABLE "interview_evaluations" DROP COLUMN "evaluatorUserId",
DROP COLUMN "interviewScheduleId",
ADD COLUMN     "evaluatorEmployeeId" TEXT;

-- AlterTable
ALTER TABLE "interview_schedules" DROP COLUMN "createdByUserId",
DROP COLUMN "meetingLink",
ADD COLUMN     "createdByEmployeeId" TEXT,
ADD COLUMN     "type" TEXT;

-- AddForeignKey
ALTER TABLE "recruitment_jobs" ADD CONSTRAINT "recruitment_jobs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_schedules" ADD CONSTRAINT "interview_schedules_createdByEmployeeId_fkey" FOREIGN KEY ("createdByEmployeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_evaluations" ADD CONSTRAINT "interview_evaluations_evaluatorEmployeeId_fkey" FOREIGN KEY ("evaluatorEmployeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
