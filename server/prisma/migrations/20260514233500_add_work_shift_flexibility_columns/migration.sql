ALTER TABLE "work_shifts"
ADD COLUMN IF NOT EXISTS "checkInFlexibilityMinutes" INTEGER,
ADD COLUMN IF NOT EXISTS "checkOutFlexibilityMinutes" INTEGER;
