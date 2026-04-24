-- Add partial unique index to guarantee only one active job per employee
CREATE UNIQUE INDEX IF NOT EXISTS "employee_job_histories_employeeId_active_unique"
ON "employee_job_histories"("employeeId")
WHERE "effectiveTo" IS NULL;

-- Backfill one initial history row for legacy employees missing history
INSERT INTO "employee_job_histories" (
  "id",
  "employeeId",
  "departmentId",
  "positionId",
  "hireDate",
  "salary",
  "status",
  "effectiveFrom",
  "effectiveTo",
  "createdAt"
)
SELECT
  ('hist_' || md5(random()::text || clock_timestamp()::text || e."id")),
  e."id",
  e."departmentId",
  e."positionId",
  e."hireDate",
  e."salary",
  e."status",
  COALESCE(e."hireDate", e."createdAt"),
  NULL,
  CURRENT_TIMESTAMP
FROM "employees" e
WHERE NOT EXISTS (
  SELECT 1
  FROM "employee_job_histories" h
  WHERE h."employeeId" = e."id"
);
