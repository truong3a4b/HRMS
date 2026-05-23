ALTER TYPE "RequestType" ADD VALUE IF NOT EXISTS 'LATE_EARLY';

CREATE TYPE "LateEarlyType" AS ENUM (
  'LATE_ARRIVAL',
  'EARLY_LEAVE'
);

CREATE TABLE "late_early_requests" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "requestType" "LateEarlyType" NOT NULL,
  "workShiftId" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "appliedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "late_early_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "late_early_requests_requestId_key" ON "late_early_requests"("requestId");
CREATE INDEX "late_early_requests_employeeId_date_idx" ON "late_early_requests"("employeeId", "date");
CREATE INDEX "late_early_requests_workShiftId_idx" ON "late_early_requests"("workShiftId");

ALTER TABLE "late_early_requests"
ADD CONSTRAINT "late_early_requests_requestId_fkey"
FOREIGN KEY ("requestId") REFERENCES "requests"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "late_early_requests"
ADD CONSTRAINT "late_early_requests_employeeId_fkey"
FOREIGN KEY ("employeeId") REFERENCES "employees"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "late_early_requests"
ADD CONSTRAINT "late_early_requests_workShiftId_fkey"
FOREIGN KEY ("workShiftId") REFERENCES "work_shifts"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
