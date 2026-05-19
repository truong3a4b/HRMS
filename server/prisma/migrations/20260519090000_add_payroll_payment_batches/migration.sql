-- AlterEnum
ALTER TYPE "PayrollStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_PAID';

-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PayrollPaymentMode') THEN
    CREATE TYPE "PayrollPaymentMode" AS ENUM ('AMOUNT', 'PERCENT', 'REMAINING');
  END IF;
END $$;

-- AlterTable
ALTER TABLE "payrolls"
ADD COLUMN IF NOT EXISTS "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "payroll_payment_batches" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "mode" "PayrollPaymentMode" NOT NULL,
    "amount" DECIMAL(15,2),
    "percent" DECIMAL(6,2),
    "totalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_payment_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "payroll_payments" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "mode" "PayrollPaymentMode" NOT NULL,
    "requestedAmount" DECIMAL(15,2),
    "requestedPercent" DECIMAL(6,2),
    "amount" DECIMAL(15,2) NOT NULL,
    "remainingBefore" DECIMAL(15,2) NOT NULL,
    "remainingAfter" DECIMAL(15,2) NOT NULL,
    "payrollNetSalary" DECIMAL(15,2) NOT NULL,
    "payrollPaidBefore" DECIMAL(15,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "payroll_payment_batches_year_month_idx" ON "payroll_payment_batches"("year", "month");
CREATE INDEX IF NOT EXISTS "payroll_payment_batches_createdById_idx" ON "payroll_payment_batches"("createdById");
CREATE INDEX IF NOT EXISTS "payroll_payments_batchId_idx" ON "payroll_payments"("batchId");
CREATE INDEX IF NOT EXISTS "payroll_payments_payrollId_idx" ON "payroll_payments"("payrollId");
CREATE INDEX IF NOT EXISTS "payroll_payments_employeeId_paymentDate_idx" ON "payroll_payments"("employeeId", "paymentDate");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payroll_payment_batches_createdById_fkey') THEN
    ALTER TABLE "payroll_payment_batches" ADD CONSTRAINT "payroll_payment_batches_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payroll_payments_batchId_fkey') THEN
    ALTER TABLE "payroll_payments" ADD CONSTRAINT "payroll_payments_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "payroll_payment_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payroll_payments_payrollId_fkey') THEN
    ALTER TABLE "payroll_payments" ADD CONSTRAINT "payroll_payments_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payroll_payments_employeeId_fkey') THEN
    ALTER TABLE "payroll_payments" ADD CONSTRAINT "payroll_payments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
