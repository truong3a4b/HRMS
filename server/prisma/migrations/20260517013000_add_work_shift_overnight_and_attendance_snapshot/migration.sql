ALTER TABLE "work_shifts"
ADD COLUMN IF NOT EXISTS "isOvernight" BOOLEAN NOT NULL DEFAULT false;

UPDATE "work_shifts"
SET "isOvernight" = true
WHERE "startTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
  AND "endTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
  AND "endTime" <= "startTime";

ALTER TABLE "work_shifts"
DROP CONSTRAINT IF EXISTS "work_shifts_non_overnight_time_order";

ALTER TABLE "work_shifts"
ADD CONSTRAINT "work_shifts_non_overnight_time_order"
CHECK ("isOvernight" OR "endTime" > "startTime");

ALTER TABLE "attendance_record_details"
ADD COLUMN IF NOT EXISTS "workShiftCode" TEXT,
ADD COLUMN IF NOT EXISTS "shiftStartClock" TEXT,
ADD COLUMN IF NOT EXISTS "shiftEndClock" TEXT,
ADD COLUMN IF NOT EXISTS "shiftBreakStartTime" TEXT,
ADD COLUMN IF NOT EXISTS "shiftBreakEndTime" TEXT,
ADD COLUMN IF NOT EXISTS "shiftCheckInStartTime" TEXT,
ADD COLUMN IF NOT EXISTS "shiftCheckInEndTime" TEXT,
ADD COLUMN IF NOT EXISTS "shiftCheckOutStartTime" TEXT,
ADD COLUMN IF NOT EXISTS "shiftCheckOutEndTime" TEXT,
ADD COLUMN IF NOT EXISTS "shiftIsOvernight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "shiftIsOvertime" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "shiftWorkUnits" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "shiftOvertimeMultiplier" DECIMAL(5,2);

UPDATE "attendance_record_details" AS "ard"
SET
  "workShiftCode" = COALESCE("ard"."workShiftCode", "ws"."code"),
  "shiftStartClock" = COALESCE("ard"."shiftStartClock", "ws"."startTime"),
  "shiftEndClock" = COALESCE("ard"."shiftEndClock", "ws"."endTime"),
  "shiftBreakStartTime" = COALESCE("ard"."shiftBreakStartTime", "ws"."breakStartTime"),
  "shiftBreakEndTime" = COALESCE("ard"."shiftBreakEndTime", "ws"."breakEndTime"),
  "shiftCheckInStartTime" = COALESCE("ard"."shiftCheckInStartTime", "ws"."checkInStartTime"),
  "shiftCheckInEndTime" = COALESCE("ard"."shiftCheckInEndTime", "ws"."checkInEndTime"),
  "shiftCheckOutStartTime" = COALESCE("ard"."shiftCheckOutStartTime", "ws"."checkOutStartTime"),
  "shiftCheckOutEndTime" = COALESCE("ard"."shiftCheckOutEndTime", "ws"."checkOutEndTime"),
  "shiftIsOvernight" = "ws"."isOvernight",
  "shiftIsOvertime" = "ws"."isOvertime",
  "shiftWorkUnits" = COALESCE("ard"."shiftWorkUnits", "ws"."workUnits"),
  "shiftOvertimeMultiplier" = COALESCE("ard"."shiftOvertimeMultiplier", "ws"."overtimeMultiplier")
FROM "work_shifts" AS "ws"
WHERE "ard"."workShiftId" = "ws"."id";
