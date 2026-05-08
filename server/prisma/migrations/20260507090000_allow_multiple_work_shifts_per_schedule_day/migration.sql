-- DropIndex
DROP INDEX "work_schedules_employeeId_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "work_schedules_employeeId_date_workShiftId_key" ON "work_schedules"("employeeId", "date", "workShiftId");
