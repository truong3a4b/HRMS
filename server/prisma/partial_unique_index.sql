-- Create a partial unique index on work_shifts(code) for active shifts only
-- Run this once against your Postgres database (for example via psql or a migration runner)

-- Drop any existing unique index on code if present (attempt common names)
DROP INDEX IF EXISTS work_shifts_code_key;
DROP INDEX IF EXISTS work_shifts_code_unique;

-- Create partial unique index for active shifts
CREATE UNIQUE INDEX IF NOT EXISTS work_shifts_active_code_unique ON work_shifts (code) WHERE "isActive";
