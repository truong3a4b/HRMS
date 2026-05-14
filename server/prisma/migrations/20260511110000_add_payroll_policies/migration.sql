-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'WAITING_APPROVAL', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "employeeSocialRate" DECIMAL(65,30) NOT NULL,
    "employeeHealthRate" DECIMAL(65,30) NOT NULL,
    "employeeUnemploymentRate" DECIMAL(65,30) NOT NULL,
    "employerSocialRate" DECIMAL(65,30),
    "employerHealthRate" DECIMAL(65,30),
    "employerUnemploymentRate" DECIMAL(65,30),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "personalDeduction" DECIMAL(65,30) NOT NULL,
    "dependentDeduction" DECIMAL(65,30) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_brackets" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "fromAmount" DECIMAL(65,30) NOT NULL,
    "toAmount" DECIMAL(65,30),
    "rate" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "tax_brackets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_bonus_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "requiredWorkDays" DECIMAL(65,30),
    "maxLateMinutes" INTEGER,
    "maxEarlyMinutes" INTEGER,
    "maxAbsentDays" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_bonus_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allowance_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allowance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_allowances" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "allowancePolicyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_allowances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_payroll_profiles" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "insurancePolicyId" TEXT,
    "taxPolicyId" TEXT,
    "attendanceBonusPolicyId" TEXT,
    "isInsuranceApplicable" BOOLEAN NOT NULL DEFAULT false,
    "isTaxApplicable" BOOLEAN NOT NULL DEFAULT false,
    "isAttendanceBonusApplicable" BOOLEAN NOT NULL DEFAULT false,
    "insuranceSalary" DECIMAL(65,30),
    "dependentCount" INTEGER NOT NULL DEFAULT 0,
    "taxCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_payroll_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_bonus_penalties" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "isBonus" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_bonus_penalties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "baseSalary" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "standardWorkDays" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "actualWorkDays" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "actualSalary" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalOvertimeWorkDays" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalOvertimeHours" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalOvertimePay" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAllowance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalBonus" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalPenalty" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "socialInsurance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "healthInsurance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "unemploymentInsurance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "laborAccidentInsurance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "personalIncomeTax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grossSalary" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalDeduction" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netSalary" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_overtime_lines" (
    "id" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "workShiftId" TEXT,
    "workShiftCode" TEXT,
    "workShiftName" TEXT NOT NULL,
    "workDays" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "baseHourlyRate" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "multiplier" DECIMAL(6,2) NOT NULL DEFAULT 1,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_overtime_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_allowance_lines" (
    "id" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "allowancePolicyId" TEXT,
    "allowanceName" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_allowance_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_bonus_penalty_lines" (
    "id" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "payrollBonusPenaltyId" TEXT,
    "isBonus" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_bonus_penalty_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "insurance_policies_isActive_effectiveFrom_idx" ON "insurance_policies"("isActive", "effectiveFrom");

-- CreateIndex
CREATE INDEX "tax_policies_isActive_effectiveFrom_idx" ON "tax_policies"("isActive", "effectiveFrom");

-- CreateIndex
CREATE INDEX "tax_brackets_policyId_idx" ON "tax_brackets"("policyId");

-- CreateIndex
CREATE INDEX "attendance_bonus_policies_isActive_effectiveFrom_idx" ON "attendance_bonus_policies"("isActive", "effectiveFrom");

-- CreateIndex
CREATE INDEX "allowance_policies_isActive_effectiveFrom_idx" ON "allowance_policies"("isActive", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "employee_allowances_employeeId_allowancePolicyId_key" ON "employee_allowances"("employeeId", "allowancePolicyId");

-- CreateIndex
CREATE INDEX "employee_allowances_employeeId_idx" ON "employee_allowances"("employeeId");

-- CreateIndex
CREATE INDEX "employee_allowances_allowancePolicyId_idx" ON "employee_allowances"("allowancePolicyId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_payroll_profiles_employeeId_key" ON "employee_payroll_profiles"("employeeId");

-- CreateIndex
CREATE INDEX "employee_payroll_profiles_insurancePolicyId_idx" ON "employee_payroll_profiles"("insurancePolicyId");

-- CreateIndex
CREATE INDEX "employee_payroll_profiles_taxPolicyId_idx" ON "employee_payroll_profiles"("taxPolicyId");

-- CreateIndex
CREATE INDEX "employee_payroll_profiles_attendanceBonusPolicyId_idx" ON "employee_payroll_profiles"("attendanceBonusPolicyId");

-- CreateIndex
CREATE INDEX "payroll_bonus_penalties_employeeId_month_idx" ON "payroll_bonus_penalties"("employeeId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_employeeId_month_year_key" ON "payrolls"("employeeId", "month", "year");

-- CreateIndex
CREATE INDEX "payrolls_year_month_idx" ON "payrolls"("year", "month");

-- CreateIndex
CREATE INDEX "payrolls_status_idx" ON "payrolls"("status");

-- CreateIndex
CREATE INDEX "payroll_overtime_lines_payrollId_idx" ON "payroll_overtime_lines"("payrollId");

-- CreateIndex
CREATE INDEX "payroll_overtime_lines_workShiftId_idx" ON "payroll_overtime_lines"("workShiftId");

-- CreateIndex
CREATE INDEX "payroll_allowance_lines_payrollId_idx" ON "payroll_allowance_lines"("payrollId");

-- CreateIndex
CREATE INDEX "payroll_allowance_lines_allowancePolicyId_idx" ON "payroll_allowance_lines"("allowancePolicyId");

-- CreateIndex
CREATE INDEX "payroll_bonus_penalty_lines_payrollId_idx" ON "payroll_bonus_penalty_lines"("payrollId");

-- CreateIndex
CREATE INDEX "payroll_bonus_penalty_lines_payrollBonusPenaltyId_idx" ON "payroll_bonus_penalty_lines"("payrollBonusPenaltyId");

-- AddForeignKey
ALTER TABLE "tax_brackets" ADD CONSTRAINT "tax_brackets_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "tax_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_allowances" ADD CONSTRAINT "employee_allowances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_allowances" ADD CONSTRAINT "employee_allowances_allowancePolicyId_fkey" FOREIGN KEY ("allowancePolicyId") REFERENCES "allowance_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_payroll_profiles" ADD CONSTRAINT "employee_payroll_profiles_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_payroll_profiles" ADD CONSTRAINT "employee_payroll_profiles_insurancePolicyId_fkey" FOREIGN KEY ("insurancePolicyId") REFERENCES "insurance_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_payroll_profiles" ADD CONSTRAINT "employee_payroll_profiles_taxPolicyId_fkey" FOREIGN KEY ("taxPolicyId") REFERENCES "tax_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_payroll_profiles" ADD CONSTRAINT "employee_payroll_profiles_attendanceBonusPolicyId_fkey" FOREIGN KEY ("attendanceBonusPolicyId") REFERENCES "attendance_bonus_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_bonus_penalties" ADD CONSTRAINT "payroll_bonus_penalties_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_overtime_lines" ADD CONSTRAINT "payroll_overtime_lines_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_overtime_lines" ADD CONSTRAINT "payroll_overtime_lines_workShiftId_fkey" FOREIGN KEY ("workShiftId") REFERENCES "work_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_allowance_lines" ADD CONSTRAINT "payroll_allowance_lines_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_allowance_lines" ADD CONSTRAINT "payroll_allowance_lines_allowancePolicyId_fkey" FOREIGN KEY ("allowancePolicyId") REFERENCES "allowance_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_bonus_penalty_lines" ADD CONSTRAINT "payroll_bonus_penalty_lines_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_bonus_penalty_lines" ADD CONSTRAINT "payroll_bonus_penalty_lines_payrollBonusPenaltyId_fkey" FOREIGN KEY ("payrollBonusPenaltyId") REFERENCES "payroll_bonus_penalties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
