UPDATE "work_shifts"
SET
  "checkInStartTime" = COALESCE(
    "checkInStartTime",
    CASE
      WHEN "startTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN TO_CHAR(
        TIME '00:00'
        + (
          (
            (
              EXTRACT(HOUR FROM "startTime"::time)::int * 60
              + EXTRACT(MINUTE FROM "startTime"::time)::int
              - 90
            ) % 1440 + 1440
          ) % 1440
        ) * INTERVAL '1 minute',
        'HH24:MI'
      )
      ELSE '00:00'
    END
  ),
  "checkInEndTime" = COALESCE(
    "checkInEndTime",
    CASE
      WHEN "startTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN TO_CHAR(
        TIME '00:00'
        + (
          (
            (
              EXTRACT(HOUR FROM "startTime"::time)::int * 60
              + EXTRACT(MINUTE FROM "startTime"::time)::int
              + 90
            ) % 1440 + 1440
          ) % 1440
        ) * INTERVAL '1 minute',
        'HH24:MI'
      )
      ELSE '23:59'
    END
  ),
  "checkOutStartTime" = COALESCE(
    "checkOutStartTime",
    CASE
      WHEN "endTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN TO_CHAR(
        TIME '00:00'
        + (
          (
            (
              EXTRACT(HOUR FROM "endTime"::time)::int * 60
              + EXTRACT(MINUTE FROM "endTime"::time)::int
              - 120
            ) % 1440 + 1440
          ) % 1440
        ) * INTERVAL '1 minute',
        'HH24:MI'
      )
      ELSE '00:00'
    END
  ),
  "checkOutEndTime" = COALESCE(
    "checkOutEndTime",
    CASE
      WHEN "endTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN TO_CHAR(
        TIME '00:00'
        + (
          (
            (
              EXTRACT(HOUR FROM "endTime"::time)::int * 60
              + EXTRACT(MINUTE FROM "endTime"::time)::int
              + 120
            ) % 1440 + 1440
          ) % 1440
        ) * INTERVAL '1 minute',
        'HH24:MI'
      )
      ELSE '23:59'
    END
  );

ALTER TABLE "work_shifts"
ALTER COLUMN "checkInStartTime" SET NOT NULL,
ALTER COLUMN "checkInEndTime" SET NOT NULL,
ALTER COLUMN "checkOutStartTime" SET NOT NULL,
ALTER COLUMN "checkOutEndTime" SET NOT NULL;
