ALTER TABLE "attendance_bonus_policies"
ADD COLUMN "useStandardWorkDays" BOOLEAN NOT NULL DEFAULT true;

UPDATE "attendance_bonus_policies"
SET "useStandardWorkDays" = false;
