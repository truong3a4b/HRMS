CREATE TYPE "PayrollBonusPenaltyStatus" AS ENUM ('ACTIVE', 'CANCELLED');
CREATE TYPE "PayrollBonusPenaltySource" AS ENUM ('MANUAL', 'AUTO');

ALTER TABLE "payroll_bonus_penalties"
  ADD COLUMN "autoPenaltyPolicyId" TEXT,
  ADD COLUMN "source" "PayrollBonusPenaltySource" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "status" "PayrollBonusPenaltyStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "violationCount" INTEGER,
  ADD COLUMN "cancelledAt" TIMESTAMP(3);

CREATE INDEX "payroll_bonus_penalties_autoPenaltyPolicyId_idx" ON "payroll_bonus_penalties"("autoPenaltyPolicyId");
CREATE INDEX "payroll_bonus_penalties_status_idx" ON "payroll_bonus_penalties"("status");

ALTER TABLE "payroll_bonus_penalties"
  ADD CONSTRAINT "payroll_bonus_penalties_autoPenaltyPolicyId_fkey"
  FOREIGN KEY ("autoPenaltyPolicyId") REFERENCES "auto_penalty_policies"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
