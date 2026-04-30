-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_managerId_fkey";

-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "backIdentityCardImage" TEXT,
ADD COLUMN     "bank" JSONB,
ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "frontIdentityCardImage" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "identityCardIssueDate" TIMESTAMP(3),
ADD COLUMN     "identityCardNumber" TEXT,
ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "province" JSONB,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "ward" JSONB;

-- AlterTable
ALTER TABLE "departments" ALTER COLUMN "managerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
