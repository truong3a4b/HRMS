ALTER TYPE "RequestType" ADD VALUE IF NOT EXISTS 'BONUS_PENALTY';

CREATE TABLE "bonus_penalty_requests" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "month" TIMESTAMP(3) NOT NULL,
  "amount" DECIMAL(15, 2) NOT NULL,
  "isBonus" BOOLEAN NOT NULL DEFAULT true,
  "reason" TEXT NOT NULL,
  "bonusPenaltyId" TEXT,
  "appliedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "bonus_penalty_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bonus_penalty_requests_requestId_key" ON "bonus_penalty_requests"("requestId");
CREATE INDEX "bonus_penalty_requests_employeeId_month_idx" ON "bonus_penalty_requests"("employeeId", "month");
CREATE INDEX "bonus_penalty_requests_bonusPenaltyId_idx" ON "bonus_penalty_requests"("bonusPenaltyId");

ALTER TABLE "bonus_penalty_requests"
  ADD CONSTRAINT "bonus_penalty_requests_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "requests"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bonus_penalty_requests"
  ADD CONSTRAINT "bonus_penalty_requests_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "employees"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bonus_penalty_requests"
  ADD CONSTRAINT "bonus_penalty_requests_bonusPenaltyId_fkey"
  FOREIGN KEY ("bonusPenaltyId") REFERENCES "payroll_bonus_penalties"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
