CREATE TYPE "LeaveType" AS ENUM (
  'ANNUAL_LEAVE',
  'SICK_LEAVE',
  'UNPAID_LEAVE',
  'MATERNITY_LEAVE',
  'BEREAVEMENT_LEAVE',
  'MARRIAGE_LEAVE',
  'COMPENSATORY_LEAVE',
  'OTHER',
  'LATE_ARRIVAL',
  'EARLY_LEAVE'
);

ALTER TABLE "leave_requests" ADD COLUMN "workShiftId" TEXT;
ALTER TABLE "leave_requests" ADD COLUMN "leaveTypeNew" "LeaveType" NOT NULL DEFAULT 'OTHER';

UPDATE "leave_requests"
SET "leaveTypeNew" = CASE
  WHEN "leaveType" IN (
    'ANNUAL_LEAVE',
    'SICK_LEAVE',
    'UNPAID_LEAVE',
    'MATERNITY_LEAVE',
    'BEREAVEMENT_LEAVE',
    'MARRIAGE_LEAVE',
    'COMPENSATORY_LEAVE',
    'OTHER',
    'LATE_ARRIVAL',
    'EARLY_LEAVE'
  ) THEN "leaveType"::"LeaveType"
  ELSE 'OTHER'::"LeaveType"
END;

ALTER TABLE "leave_requests" DROP COLUMN "leaveType";
ALTER TABLE "leave_requests" RENAME COLUMN "leaveTypeNew" TO "leaveType";
ALTER TABLE "leave_requests" ALTER COLUMN "leaveType" DROP DEFAULT;

CREATE INDEX "leave_requests_workShiftId_idx" ON "leave_requests"("workShiftId");

ALTER TABLE "leave_requests"
ADD CONSTRAINT "leave_requests_workShiftId_fkey"
FOREIGN KEY ("workShiftId") REFERENCES "work_shifts"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
