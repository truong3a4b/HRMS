-- AlterTable
ALTER TABLE "departments"
ADD COLUMN "managerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "departments_managerId_key" ON "departments"("managerId");

-- AddForeignKey
ALTER TABLE "departments"
ADD CONSTRAINT "departments_managerId_fkey"
FOREIGN KEY ("managerId") REFERENCES "employees"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
