UPDATE "work_shifts"
SET "lateGracePeriod" = 0
WHERE "lateGracePeriod" IS NULL;

UPDATE "work_shifts"
SET "earlyLeaveGracePeriod" = 0
WHERE "earlyLeaveGracePeriod" IS NULL;

UPDATE "work_shifts"
SET "overtimeMultiplier" = 1.0
WHERE "overtimeMultiplier" IS NULL;

ALTER TABLE "work_shifts"
ALTER COLUMN "lateGracePeriod" SET DEFAULT 0,
ALTER COLUMN "lateGracePeriod" SET NOT NULL,
ALTER COLUMN "earlyLeaveGracePeriod" SET DEFAULT 0,
ALTER COLUMN "earlyLeaveGracePeriod" SET NOT NULL,
ALTER COLUMN "overtimeMultiplier" SET DEFAULT 1.0,
ALTER COLUMN "overtimeMultiplier" SET NOT NULL;
