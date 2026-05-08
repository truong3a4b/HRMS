-- CreateTable
CREATE TABLE "work_schedule_shifts" (
    "id" TEXT NOT NULL,
    "workScheduleId" TEXT NOT NULL,
    "workShiftId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_schedule_shifts_pkey" PRIMARY KEY ("id")
);

-- Backfill join rows from the old one-shift-per-schedule shape.
INSERT INTO "work_schedule_shifts" ("id", "workScheduleId", "workShiftId", "createdAt", "updatedAt")
SELECT
    md5("canonical"."scheduleId" || ':' || "ws"."workShiftId") AS "id",
    "canonical"."scheduleId" AS "workScheduleId",
    "ws"."workShiftId",
    MIN("ws"."createdAt") AS "createdAt",
    MAX("ws"."updatedAt") AS "updatedAt"
FROM "work_schedules" AS "ws"
JOIN (
    SELECT "employeeId", "date", MIN("id") AS "scheduleId"
    FROM "work_schedules"
    GROUP BY "employeeId", "date"
) AS "canonical"
    ON "canonical"."employeeId" = "ws"."employeeId"
    AND "canonical"."date" = "ws"."date"
GROUP BY "canonical"."scheduleId", "ws"."workShiftId";

-- Keep one WorkSchedule row per employee/date.
DELETE FROM "work_schedules" AS "ws"
USING (
    SELECT "employeeId", "date", MIN("id") AS "scheduleId"
    FROM "work_schedules"
    GROUP BY "employeeId", "date"
) AS "canonical"
WHERE "canonical"."employeeId" = "ws"."employeeId"
  AND "canonical"."date" = "ws"."date"
  AND "ws"."id" <> "canonical"."scheduleId";

-- DropIndex
DROP INDEX IF EXISTS "work_schedules_employeeId_date_workShiftId_key";

-- DropIndex
DROP INDEX IF EXISTS "work_schedules_workShiftId_idx";

-- AlterTable
ALTER TABLE "work_schedules" DROP COLUMN "workShiftId";

-- CreateIndex
CREATE UNIQUE INDEX "work_schedules_employeeId_date_key" ON "work_schedules"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "work_schedule_shifts_workScheduleId_workShiftId_key" ON "work_schedule_shifts"("workScheduleId", "workShiftId");

-- CreateIndex
CREATE INDEX "work_schedule_shifts_workShiftId_idx" ON "work_schedule_shifts"("workShiftId");

-- AddForeignKey
ALTER TABLE "work_schedule_shifts" ADD CONSTRAINT "work_schedule_shifts_workScheduleId_fkey" FOREIGN KEY ("workScheduleId") REFERENCES "work_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedule_shifts" ADD CONSTRAINT "work_schedule_shifts_workShiftId_fkey" FOREIGN KEY ("workShiftId") REFERENCES "work_shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
