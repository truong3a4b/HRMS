-- AlterTable
ALTER TABLE "job_applications"
DROP COLUMN IF EXISTS "offerSentAt",
DROP COLUMN IF EXISTS "offerRespondedAt",
ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);
