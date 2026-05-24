ALTER TABLE "payroll_bonus_penalties"
  ADD COLUMN "occurrenceKey" TEXT,
  ADD COLUMN "occurredAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "payroll_bonus_penalties_employeeId_autoPenaltyPolicyId_occurrenceKey_key"
  ON "payroll_bonus_penalties"("employeeId", "autoPenaltyPolicyId", "occurrenceKey");
