CREATE TABLE IF NOT EXISTS "employee_standard_work_days" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "standardWorkDays" DECIMAL(6,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_standard_work_days_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "employee_standard_work_days_employeeId_month_year_key" ON "employee_standard_work_days"("employeeId", "month", "year");
CREATE INDEX IF NOT EXISTS "employee_standard_work_days_year_month_idx" ON "employee_standard_work_days"("year", "month");
CREATE INDEX IF NOT EXISTS "employee_standard_work_days_employeeId_idx" ON "employee_standard_work_days"("employeeId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employee_standard_work_days_employeeId_fkey') THEN
    ALTER TABLE "employee_standard_work_days" ADD CONSTRAINT "employee_standard_work_days_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
