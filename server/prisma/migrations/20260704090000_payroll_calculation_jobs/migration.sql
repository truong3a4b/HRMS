CREATE TYPE "PayrollCalculationJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

CREATE TABLE "payroll_calculation_jobs" (
  "id" TEXT NOT NULL,
  "periodId" TEXT NOT NULL,
  "requestedById" TEXT,
  "status" "PayrollCalculationJobStatus" NOT NULL DEFAULT 'PENDING',
  "targetDepartmentIds" JSONB NOT NULL,
  "targetPositionIds" JSONB NOT NULL,
  "skipExisting" BOOLEAN NOT NULL DEFAULT false,
  "totalEmployees" INTEGER NOT NULL DEFAULT 0,
  "processedCount" INTEGER NOT NULL DEFAULT 0,
  "failedCount" INTEGER NOT NULL DEFAULT 0,
  "createdCount" INTEGER NOT NULL DEFAULT 0,
  "updatedCount" INTEGER NOT NULL DEFAULT 0,
  "skippedCount" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "errors" JSONB,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payroll_calculation_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payroll_calculation_jobs_periodId_idx" ON "payroll_calculation_jobs"("periodId");
CREATE INDEX "payroll_calculation_jobs_requestedById_idx" ON "payroll_calculation_jobs"("requestedById");
CREATE INDEX "payroll_calculation_jobs_status_createdAt_idx" ON "payroll_calculation_jobs"("status", "createdAt");

ALTER TABLE "payroll_calculation_jobs"
ADD CONSTRAINT "payroll_calculation_jobs_periodId_fkey"
FOREIGN KEY ("periodId") REFERENCES "payroll_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payroll_calculation_jobs"
ADD CONSTRAINT "payroll_calculation_jobs_requestedById_fkey"
FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
