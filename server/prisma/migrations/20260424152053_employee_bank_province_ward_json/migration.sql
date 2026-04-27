/*
  Warnings:

  - You are about to drop the column `bankCode` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `provinceCode` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `wardCode` on the `employees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "employees" DROP COLUMN "bankCode",
DROP COLUMN "provinceCode",
DROP COLUMN "wardCode",
ADD COLUMN     "bank" JSONB,
ADD COLUMN     "province" JSONB,
ADD COLUMN     "ward" JSONB;
