ALTER TABLE "work_shifts"
ADD COLUMN IF NOT EXISTS "checkInStartTime" TEXT,
ADD COLUMN IF NOT EXISTS "checkInEndTime" TEXT,
ADD COLUMN IF NOT EXISTS "checkOutStartTime" TEXT,
ADD COLUMN IF NOT EXISTS "checkOutEndTime" TEXT;

UPDATE "work_shifts"
SET
  "checkInStartTime" = COALESCE(
    "checkInStartTime",
    TO_CHAR(
      TIME '00:00'
      + (
        (
          (
            EXTRACT(HOUR FROM "startTime"::time)::int * 60
            + EXTRACT(MINUTE FROM "startTime"::time)::int
            - COALESCE("checkInFlexibilityMinutes", 90)
          ) % 1440 + 1440
        ) % 1440
      ) * INTERVAL '1 minute',
      'HH24:MI'
    )
  ),
  "checkInEndTime" = COALESCE(
    "checkInEndTime",
    TO_CHAR(
      TIME '00:00'
      + (
        (
          (
            EXTRACT(HOUR FROM "startTime"::time)::int * 60
            + EXTRACT(MINUTE FROM "startTime"::time)::int
            + COALESCE("checkInFlexibilityMinutes", 90)
          ) % 1440 + 1440
        ) % 1440
      ) * INTERVAL '1 minute',
      'HH24:MI'
    )
  ),
  "checkOutStartTime" = COALESCE(
    "checkOutStartTime",
    TO_CHAR(
      TIME '00:00'
      + (
        (
          (
            EXTRACT(HOUR FROM "endTime"::time)::int * 60
            + EXTRACT(MINUTE FROM "endTime"::time)::int
            - COALESCE("checkOutFlexibilityMinutes", 120)
          ) % 1440 + 1440
        ) % 1440
      ) * INTERVAL '1 minute',
      'HH24:MI'
    )
  ),
  "checkOutEndTime" = COALESCE(
    "checkOutEndTime",
    TO_CHAR(
      TIME '00:00'
      + (
        (
          (
            EXTRACT(HOUR FROM "endTime"::time)::int * 60
            + EXTRACT(MINUTE FROM "endTime"::time)::int
            + COALESCE("checkOutFlexibilityMinutes", 120)
          ) % 1440 + 1440
        ) % 1440
      ) * INTERVAL '1 minute',
      'HH24:MI'
    )
  )
WHERE "startTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
  AND "endTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$';

ALTER TABLE "work_shifts"
DROP COLUMN IF EXISTS "checkInFlexibilityMinutes",
DROP COLUMN IF EXISTS "checkOutFlexibilityMinutes";
