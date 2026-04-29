-- CreateEnum
CREATE TYPE "RecruitmentJobStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "recruitment_jobs" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "salaryMin" DECIMAL(15,2),
    "salaryMax" DECIMAL(15,2),
    "quantity" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3),
    "status" "RecruitmentJobStatus" NOT NULL DEFAULT 'OPEN',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_jobs_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN "recruitmentJobId" TEXT;

-- CreateIndex
CREATE INDEX "recruitment_jobs_status_deadline_idx" ON "recruitment_jobs"("status", "deadline");

CREATE INDEX "recruitment_jobs_positionId_departmentId_idx" ON "recruitment_jobs"("positionId", "departmentId");

CREATE INDEX "recruitment_jobs_createdById_idx" ON "recruitment_jobs"("createdById");

CREATE INDEX "job_applications_candidateId_recruitmentJobId_idx" ON "job_applications"("candidateId", "recruitmentJobId");

CREATE INDEX "job_applications_recruitmentJobId_idx" ON "job_applications"("recruitmentJobId");

-- AddForeignKey
ALTER TABLE "recruitment_jobs" ADD CONSTRAINT "recruitment_jobs_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recruitment_jobs" ADD CONSTRAINT "recruitment_jobs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recruitment_jobs" ADD CONSTRAINT "recruitment_jobs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_recruitmentJobId_fkey" FOREIGN KEY ("recruitmentJobId") REFERENCES "recruitment_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
