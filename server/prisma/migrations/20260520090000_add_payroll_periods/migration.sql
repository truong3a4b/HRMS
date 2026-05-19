-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PayrollPeriodStatus') THEN
    CREATE TYPE "PayrollPeriodStatus" AS ENUM ('DRAFT', 'WAITING_APPROVAL', 'APPROVED', 'CANCELLED');
  END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "payroll_periods" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "PayrollPeriodStatus" NOT NULL DEFAULT 'DRAFT',
    "requestedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_periods_pkey" PRIMARY KEY ("id")
);

-- Backfill periods from existing payrolls and payment batches.
INSERT INTO "payroll_periods" ("id", "name", "month", "year", "status", "requestedAt", "approvedAt", "cancelledAt")
SELECT
  'period-' || period_source."year" || '-' || period_source."month",
  'Ky luong ' || LPAD(period_source."month"::TEXT, 2, '0') || '/' || period_source."year",
  period_source."month",
  period_source."year",
  CASE
    WHEN BOOL_OR(period_source."status" = 'CANCELLED') THEN 'CANCELLED'::"PayrollPeriodStatus"
    WHEN BOOL_AND(period_source."status" IN ('APPROVED', 'PARTIALLY_PAID', 'PAID')) THEN 'APPROVED'::"PayrollPeriodStatus"
    WHEN BOOL_OR(period_source."status" = 'WAITING_APPROVAL') THEN 'WAITING_APPROVAL'::"PayrollPeriodStatus"
    ELSE 'DRAFT'::"PayrollPeriodStatus"
  END,
  CASE WHEN BOOL_OR(period_source."status" = 'WAITING_APPROVAL') THEN MIN(period_source."updatedAt") ELSE NULL END,
  CASE WHEN BOOL_AND(period_source."status" IN ('APPROVED', 'PARTIALLY_PAID', 'PAID')) THEN MIN(period_source."approvedAt") ELSE NULL END,
  CASE WHEN BOOL_OR(period_source."status" = 'CANCELLED') THEN MIN(period_source."updatedAt") ELSE NULL END
FROM (
  SELECT "month", "year", "status"::TEXT AS "status", "updatedAt", "approvedAt" FROM "payrolls"
  UNION ALL
  SELECT "month", "year", 'DRAFT' AS "status", "updatedAt", NULL::TIMESTAMP(3) AS "approvedAt" FROM "payroll_payment_batches"
) AS period_source
GROUP BY period_source."month", period_source."year"
ON CONFLICT ("id") DO NOTHING;

-- AlterTable payrolls
ALTER TABLE "payrolls" ADD COLUMN IF NOT EXISTS "periodId" TEXT;

UPDATE "payrolls"
SET "periodId" = 'period-' || "year" || '-' || "month"
WHERE "periodId" IS NULL;

ALTER TABLE "payrolls" ALTER COLUMN "periodId" SET NOT NULL;

-- AlterTable payment batches
ALTER TABLE "payroll_payment_batches" ADD COLUMN IF NOT EXISTS "periodId" TEXT;

UPDATE "payroll_payment_batches"
SET "periodId" = 'period-' || "year" || '-' || "month"
WHERE "periodId" IS NULL;

ALTER TABLE "payroll_payment_batches" ALTER COLUMN "periodId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "payroll_periods_month_year_key" ON "payroll_periods"("month", "year");
CREATE INDEX IF NOT EXISTS "payroll_periods_year_month_idx" ON "payroll_periods"("year", "month");
CREATE INDEX IF NOT EXISTS "payroll_periods_status_idx" ON "payroll_periods"("status");
CREATE INDEX IF NOT EXISTS "payroll_periods_createdById_idx" ON "payroll_periods"("createdById");
CREATE UNIQUE INDEX IF NOT EXISTS "payrolls_periodId_employeeId_key" ON "payrolls"("periodId", "employeeId");
CREATE INDEX IF NOT EXISTS "payrolls_periodId_idx" ON "payrolls"("periodId");
CREATE INDEX IF NOT EXISTS "payroll_payment_batches_periodId_idx" ON "payroll_payment_batches"("periodId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payroll_periods_createdById_fkey') THEN
    ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payrolls_periodId_fkey') THEN
    ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "payroll_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payroll_payment_batches_periodId_fkey') THEN
    ALTER TABLE "payroll_payment_batches" ADD CONSTRAINT "payroll_payment_batches_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "payroll_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
