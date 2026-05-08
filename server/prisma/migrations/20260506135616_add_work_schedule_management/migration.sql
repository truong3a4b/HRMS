/*
  Warnings:

  - You are about to drop the `work_schedule_assignments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "work_schedule_assignments" DROP CONSTRAINT "work_schedule_assignments_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "work_schedule_assignments" DROP CONSTRAINT "work_schedule_assignments_requestId_fkey";

-- DropForeignKey
ALTER TABLE "work_schedule_assignments" DROP CONSTRAINT "work_schedule_assignments_workShiftId_fkey";

-- DropTable
DROP TABLE "work_schedule_assignments";

-- DropEnum
DROP TYPE "WorkScheduleStatus";

-- CreateTable
CREATE TABLE "work_schedules" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "workShiftId" TEXT NOT NULL,
    "workScheduleSetupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkScheduleSetup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "applicableDepartments" JSONB,
    "applicablePositions" JSONB,
    "scheduleDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkScheduleSetup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_schedules_employeeId_date_idx" ON "work_schedules"("employeeId", "date");

-- CreateIndex
CREATE INDEX "work_schedules_workShiftId_idx" ON "work_schedules"("workShiftId");

-- CreateIndex
CREATE UNIQUE INDEX "work_schedules_employeeId_date_key" ON "work_schedules"("employeeId", "date");

-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_workShiftId_fkey" FOREIGN KEY ("workShiftId") REFERENCES "work_shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_workScheduleSetupId_fkey" FOREIGN KEY ("workScheduleSetupId") REFERENCES "WorkScheduleSetup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
