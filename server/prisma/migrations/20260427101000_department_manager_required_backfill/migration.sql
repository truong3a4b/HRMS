-- Backfill missing managerId with an existing department employee, or create one when department has no employees.
WITH department_candidates AS (
  SELECT
    d."id" AS department_id,
    COALESCE(
      (
        SELECT e."id"
        FROM "employees" e
        WHERE e."departmentId" = d."id" AND e."status" <> 'RESIGNED'
        ORDER BY e."createdAt" ASC
        LIMIT 1
      ),
      (
        SELECT e."id"
        FROM "employees" e
        WHERE e."departmentId" = d."id"
        ORDER BY e."createdAt" ASC
        LIMIT 1
      )
    ) AS manager_id
  FROM "departments" d
  WHERE d."managerId" IS NULL
),
inserted_managers AS (
  INSERT INTO "employees" (
    "employeeId",
    "name",
    "email",
    "status",
    "departmentId"
  )
  SELECT
    'AUTO_MGR_' || UPPER(SUBSTRING(REPLACE(dc.department_id, '-', '') FROM 1 FOR 10)),
    'Auto Manager ' || SUBSTRING(dc.department_id FROM 1 FOR 8),
    'auto-manager+' || REPLACE(dc.department_id, '-', '') || '@hrms.local',
    'WORKING'::"EmployeeStatus",
    dc.department_id
  FROM department_candidates dc
  WHERE dc.manager_id IS NULL
  RETURNING "id", "departmentId"
),
resolved_managers AS (
  SELECT
    dc.department_id,
    COALESCE(dc.manager_id, im."id") AS manager_id
  FROM department_candidates dc
  LEFT JOIN inserted_managers im
    ON im."departmentId" = dc.department_id
)
UPDATE "departments" d
SET "managerId" = rm.manager_id
FROM resolved_managers rm
WHERE d."id" = rm.department_id;

-- Switch FK behavior to RESTRICT and enforce NOT NULL.
ALTER TABLE "departments" DROP CONSTRAINT IF EXISTS "departments_managerId_fkey";
ALTER TABLE "departments" ALTER COLUMN "managerId" SET NOT NULL;
ALTER TABLE "departments"
ADD CONSTRAINT "departments_managerId_fkey"
FOREIGN KEY ("managerId") REFERENCES "employees"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
