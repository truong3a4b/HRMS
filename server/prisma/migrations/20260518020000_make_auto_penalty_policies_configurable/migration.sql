-- DropIndex
DROP INDEX IF EXISTS "auto_penalty_policies_type_key";

-- CreateTable
CREATE TABLE "auto_penalty_tiers" (
    "id" TEXT NOT NULL,
    "autoPenaltyPolicyId" TEXT NOT NULL,
    "fromOccurrence" INTEGER NOT NULL,
    "toOccurrence" INTEGER,
    "amount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_penalty_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auto_penalty_policies_type_idx" ON "auto_penalty_policies"("type");

-- CreateIndex
CREATE INDEX "auto_penalty_tiers_autoPenaltyPolicyId_fromOccurrence_idx" ON "auto_penalty_tiers"("autoPenaltyPolicyId", "fromOccurrence");

-- AddForeignKey
ALTER TABLE "auto_penalty_tiers" ADD CONSTRAINT "auto_penalty_tiers_autoPenaltyPolicyId_fkey" FOREIGN KEY ("autoPenaltyPolicyId") REFERENCES "auto_penalty_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
