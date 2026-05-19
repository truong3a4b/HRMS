-- CreateEnum
CREATE TYPE "AutoPenaltyType" AS ENUM ('LATE_EARLY', 'UNAUTHORIZED_ABSENCE', 'UNAUTHORIZED_ABSENCE_PROGRESSIVE', 'LATE_EARLY_PROGRESSIVE');

-- CreateTable
CREATE TABLE "auto_penalty_policies" (
    "id" TEXT NOT NULL,
    "type" "AutoPenaltyType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_penalty_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_auto_penalty_policies" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "autoPenaltyPolicyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_auto_penalty_policies_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "payroll_bonus_penalty_lines" ADD COLUMN "autoPenaltyPolicyId" TEXT;

-- Seed fixed system policies
INSERT INTO "auto_penalty_policies" ("id", "type", "name", "description", "amount", "isActive", "updatedAt")
VALUES
    ('auto_penalty_late_early', 'LATE_EARLY', 'Đi muộn/về sớm', 'Phạt cố định theo số lần đi muộn hoặc về sớm trong tháng.', 0, true, CURRENT_TIMESTAMP),
    ('auto_penalty_unauthorized_absence', 'UNAUTHORIZED_ABSENCE', 'Nghỉ không phép', 'Phạt cố định theo số ngày nghỉ không phép trong tháng.', 0, true, CURRENT_TIMESTAMP),
    ('auto_penalty_unauthorized_absence_progressive', 'UNAUTHORIZED_ABSENCE_PROGRESSIVE', 'Nghỉ không phép lũy tiến', 'Phạt tăng dần theo thứ tự ngày nghỉ không phép trong tháng.', 0, true, CURRENT_TIMESTAMP),
    ('auto_penalty_late_early_progressive', 'LATE_EARLY_PROGRESSIVE', 'Đi muộn/về sớm lũy tiến', 'Phạt tăng dần theo thứ tự lần đi muộn hoặc về sớm trong tháng.', 0, true, CURRENT_TIMESTAMP);

-- CreateIndex
CREATE UNIQUE INDEX "auto_penalty_policies_type_key" ON "auto_penalty_policies"("type");

-- CreateIndex
CREATE INDEX "auto_penalty_policies_isActive_idx" ON "auto_penalty_policies"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "employee_auto_penalty_policies_employeeId_autoPenaltyPolicyId_key" ON "employee_auto_penalty_policies"("employeeId", "autoPenaltyPolicyId");

-- CreateIndex
CREATE INDEX "employee_auto_penalty_policies_employeeId_idx" ON "employee_auto_penalty_policies"("employeeId");

-- CreateIndex
CREATE INDEX "employee_auto_penalty_policies_autoPenaltyPolicyId_idx" ON "employee_auto_penalty_policies"("autoPenaltyPolicyId");

-- CreateIndex
CREATE INDEX "payroll_bonus_penalty_lines_autoPenaltyPolicyId_idx" ON "payroll_bonus_penalty_lines"("autoPenaltyPolicyId");

-- AddForeignKey
ALTER TABLE "employee_auto_penalty_policies" ADD CONSTRAINT "employee_auto_penalty_policies_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_auto_penalty_policies" ADD CONSTRAINT "employee_auto_penalty_policies_autoPenaltyPolicyId_fkey" FOREIGN KEY ("autoPenaltyPolicyId") REFERENCES "auto_penalty_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_bonus_penalty_lines" ADD CONSTRAINT "payroll_bonus_penalty_lines_autoPenaltyPolicyId_fkey" FOREIGN KEY ("autoPenaltyPolicyId") REFERENCES "auto_penalty_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
