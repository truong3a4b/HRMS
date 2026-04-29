-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('NOT_APPLIED', 'APPLIED', 'INTERVIEW_INVITED', 'INTERVIEW_CONFIRMED', 'INTERVIEW_DECLINED', 'INTERVIEW_COMPLETED', 'APPROVED', 'REJECTED', 'OFFER_SENT', 'OFFER_ACCEPTED', 'OFFER_DECLINED', 'ONBOARDED');

-- CreateEnum
CREATE TYPE "InterviewScheduleStatus" AS ENUM ('INVITED', 'CONFIRMED', 'DECLINED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "avatar" TEXT,
    "cvUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "departmentId" TEXT,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "proposedSalary" DECIMAL(15,2),
    "proposedHireDate" TIMESTAMP(3),
    "coverLetter" TEXT,
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rejectedAt" TIMESTAMP(3),
    "offerSentAt" TIMESTAMP(3),
    "offerRespondedAt" TIMESTAMP(3),
    "onboardedAt" TIMESTAMP(3),

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_schedules" (
    "id" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "meetingLink" TEXT,
    "interviewerNotes" TEXT,
    "candidateResponseAt" TIMESTAMP(3),
    "candidateResponseNote" TEXT,
    "status" "InterviewScheduleStatus" NOT NULL DEFAULT 'INVITED',
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_evaluations" (
    "id" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "interviewScheduleId" TEXT,
    "evaluatorUserId" TEXT,
    "score" INTEGER,
    "strengths" TEXT,
    "concerns" TEXT,
    "recommendation" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_evaluations_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "candidateId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "candidates_userId_key" ON "candidates"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_email_key" ON "candidates"("email");

-- CreateIndex
CREATE INDEX "candidates_email_idx" ON "candidates"("email");

-- CreateIndex
CREATE INDEX "job_applications_candidateId_status_idx" ON "job_applications"("candidateId", "status");

-- CreateIndex
CREATE INDEX "job_applications_positionId_status_idx" ON "job_applications"("positionId", "status");

-- CreateIndex
CREATE INDEX "job_applications_departmentId_idx" ON "job_applications"("departmentId");

-- CreateIndex
CREATE INDEX "interview_schedules_jobApplicationId_status_idx" ON "interview_schedules"("jobApplicationId", "status");

-- CreateIndex
CREATE INDEX "interview_evaluations_jobApplicationId_createdAt_idx" ON "interview_evaluations"("jobApplicationId", "createdAt");

-- CreateIndex
CREATE INDEX "interview_evaluations_interviewScheduleId_idx" ON "interview_evaluations"("interviewScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_candidateId_key" ON "employees"("candidateId");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_schedules" ADD CONSTRAINT "interview_schedules_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_schedules" ADD CONSTRAINT "interview_schedules_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_evaluations" ADD CONSTRAINT "interview_evaluations_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_evaluations" ADD CONSTRAINT "interview_evaluations_interviewScheduleId_fkey" FOREIGN KEY ("interviewScheduleId") REFERENCES "interview_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_evaluations" ADD CONSTRAINT "interview_evaluations_evaluatorUserId_fkey" FOREIGN KEY ("evaluatorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
