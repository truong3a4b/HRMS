ALTER TYPE "RequestType" ADD VALUE IF NOT EXISTS 'PAYROLL_APPROVAL';

CREATE TABLE "payroll_approval_requests" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "periodId" TEXT NOT NULL,
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payroll_approval_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payroll_approval_requests_requestId_key" ON "payroll_approval_requests"("requestId");
CREATE INDEX "payroll_approval_requests_periodId_idx" ON "payroll_approval_requests"("periodId");
CREATE INDEX "payroll_approval_requests_year_month_idx" ON "payroll_approval_requests"("year", "month");

ALTER TABLE "payroll_approval_requests"
  ADD CONSTRAINT "payroll_approval_requests_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "requests"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payroll_approval_requests"
  ADD CONSTRAINT "payroll_approval_requests_periodId_fkey"
  FOREIGN KEY ("periodId") REFERENCES "payroll_periods"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
