-- Migration: partial unique index on work_shifts(code) for active shifts
-- Run via `npx prisma migrate deploy` (if using Prisma migrations) or apply directly with psql.

-- Safe drops if any existing unique index names differ
DROP INDEX IF EXISTS work_shifts_code_key;
DROP INDEX IF EXISTS work_shifts_code_unique;

-- Create partial unique index to enforce uniqueness only for active shifts
CREATE UNIQUE INDEX IF NOT EXISTS work_shifts_active_code_unique ON work_shifts (code) WHERE "isActive";
