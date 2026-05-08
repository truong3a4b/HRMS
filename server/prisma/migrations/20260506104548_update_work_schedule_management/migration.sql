-- CreateEnum
CREATE TYPE "WorkScheduleStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "work_shifts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakStartTime" TEXT,
    "breakEndTime" TEXT,
    "lateGracePeriod" INTEGER,
    "earlyLeaveGracePeriod" INTEGER,
    "isOvertime" BOOLEAN NOT NULL DEFAULT false,
    "workUnits" DECIMAL(5,2),
    "overtimeMultiplier" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_schedule_assignments" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workShiftId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "WorkScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "requestId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_schedule_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_shifts_code_key" ON "work_shifts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "work_schedule_assignments_requestId_key" ON "work_schedule_assignments"("requestId");

-- CreateIndex
CREATE INDEX "work_schedule_assignments_employeeId_date_idx" ON "work_schedule_assignments"("employeeId", "date");

-- CreateIndex
CREATE INDEX "work_schedule_assignments_date_idx" ON "work_schedule_assignments"("date");

-- CreateIndex
CREATE INDEX "work_schedule_assignments_status_idx" ON "work_schedule_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "work_schedule_assignments_employeeId_date_key" ON "work_schedule_assignments"("employeeId", "date");

-- AddForeignKey
ALTER TABLE "work_schedule_assignments" ADD CONSTRAINT "work_schedule_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedule_assignments" ADD CONSTRAINT "work_schedule_assignments_workShiftId_fkey" FOREIGN KEY ("workShiftId") REFERENCES "work_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedule_assignments" ADD CONSTRAINT "work_schedule_assignments_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
