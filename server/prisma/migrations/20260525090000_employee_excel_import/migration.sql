CREATE TYPE "EmployeeImportStatus" AS ENUM ('PREVIEWED', 'CONFIRMED', 'EXPIRED');

CREATE TABLE "employee_import_batches" (
  "id" TEXT NOT NULL,
  "uploadedByUserId" TEXT,
  "status" "EmployeeImportStatus" NOT NULL DEFAULT 'PREVIEWED',
  "totalRows" INTEGER NOT NULL,
  "errorRows" INTEGER NOT NULL,
  "warningRows" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "confirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "employee_import_batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "employee_import_rows" (
  "id" TEXT NOT NULL,
  "batchId" TEXT NOT NULL,
  "rowNumber" INTEGER NOT NULL,
  "rawData" JSONB NOT NULL,
  "normalizedData" JSONB,
  "errors" JSONB NOT NULL,
  "warnings" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "employee_import_rows_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "employee_import_batches_uploadedByUserId_idx" ON "employee_import_batches"("uploadedByUserId");
CREATE INDEX "employee_import_batches_status_expiresAt_idx" ON "employee_import_batches"("status", "expiresAt");
CREATE UNIQUE INDEX "employee_import_rows_batchId_rowNumber_key" ON "employee_import_rows"("batchId", "rowNumber");
CREATE INDEX "employee_import_rows_batchId_idx" ON "employee_import_rows"("batchId");

ALTER TABLE "employee_import_batches"
  ADD CONSTRAINT "employee_import_batches_uploadedByUserId_fkey"
  FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "employee_import_rows"
  ADD CONSTRAINT "employee_import_rows_batchId_fkey"
  FOREIGN KEY ("batchId") REFERENCES "employee_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
