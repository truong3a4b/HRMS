-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_managerId_fkey";

-- AlterTable
ALTER TABLE "departments" ALTER COLUMN "managerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
