/*
  Warnings:

  - You are about to drop the column `workScheduleSetupId` on the `work_schedules` table. All the data in the column will be lost.
  - Made the column `workUnits` on table `work_shifts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "work_schedules" DROP CONSTRAINT "work_schedules_workScheduleSetupId_fkey";

-- AlterTable
ALTER TABLE "work_schedules" DROP COLUMN "workScheduleSetupId";

-- AlterTable
ALTER TABLE "work_shifts" ALTER COLUMN "workUnits" SET NOT NULL;
