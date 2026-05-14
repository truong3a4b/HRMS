DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AttendanceStatus') THEN
        CREATE TYPE "AttendanceStatus" AS ENUM (
            'PRESENT',
            'ABSENT',
            'LATE',
            'EARLY_LEAVE',
            'LATE_AND_EARLY_LEAVE',
            'ON_LEAVE',
            'PAID_LEAVE',
            'UNPAID_LEAVE'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "attendance_devices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "lastHeartbeatAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_devices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_fingerprints" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "fingerId" INTEGER NOT NULL,
    "fingerName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_fingerprints_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "attendance_device_commands" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "payload" JSONB,
    "status" TEXT NOT NULL,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_device_commands_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "attendance_logs" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "fingerId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "attendance_records" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "attendance_record_details" (
    "id" TEXT NOT NULL,
    "attendanceRecordId" TEXT NOT NULL,
    "workShiftId" TEXT NOT NULL,
    "workShiftName" TEXT NOT NULL,
    "shiftStartTime" TIMESTAMP(3) NOT NULL,
    "shiftEndTime" TIMESTAMP(3) NOT NULL,
    "shiftLateGracePeriod" INTEGER,
    "shiftEarlyLeaveGracePeriod" INTEGER,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_record_details_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_leave_balances" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "entitled_leave_days" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "used_paid_leave_days" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_leave_balances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "attendance_correction_requests" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL,
    "workShiftId" TEXT,
    "addedWorkUnits" DECIMAL(5,2) NOT NULL,
    "reason" TEXT,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_correction_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "attendance_devices_code_key" ON "attendance_devices"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "employee_fingerprints_deviceId_fingerId_key" ON "employee_fingerprints"("deviceId", "fingerId");
CREATE INDEX IF NOT EXISTS "employee_fingerprints_employeeId_idx" ON "employee_fingerprints"("employeeId");
CREATE INDEX IF NOT EXISTS "attendance_device_commands_deviceId_status_idx" ON "attendance_device_commands"("deviceId", "status");
CREATE INDEX IF NOT EXISTS "attendance_logs_employeeId_timestamp_idx" ON "attendance_logs"("employeeId", "timestamp");
CREATE INDEX IF NOT EXISTS "attendance_logs_deviceId_timestamp_idx" ON "attendance_logs"("deviceId", "timestamp");
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_records_employeeId_date_key" ON "attendance_records"("employeeId", "date");
CREATE INDEX IF NOT EXISTS "attendance_records_employeeId_date_idx" ON "attendance_records"("employeeId", "date");
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_record_details_attendanceRecordId_workShiftId_key" ON "attendance_record_details"("attendanceRecordId", "workShiftId");
CREATE INDEX IF NOT EXISTS "attendance_record_details_attendanceRecordId_idx" ON "attendance_record_details"("attendanceRecordId");
CREATE INDEX IF NOT EXISTS "attendance_record_details_workShiftId_idx" ON "attendance_record_details"("workShiftId");
CREATE UNIQUE INDEX IF NOT EXISTS "employee_leave_balances_employee_id_year_key" ON "employee_leave_balances"("employee_id", "year");
CREATE INDEX IF NOT EXISTS "employee_leave_balances_year_idx" ON "employee_leave_balances"("year");
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_correction_requests_requestId_key" ON "attendance_correction_requests"("requestId");
CREATE INDEX IF NOT EXISTS "attendance_correction_requests_employeeId_attendanceDate_idx" ON "attendance_correction_requests"("employeeId", "attendanceDate");
CREATE INDEX IF NOT EXISTS "attendance_correction_requests_workShiftId_idx" ON "attendance_correction_requests"("workShiftId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employee_fingerprints_employeeId_fkey') THEN
        ALTER TABLE "employee_fingerprints" ADD CONSTRAINT "employee_fingerprints_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employee_fingerprints_deviceId_fkey') THEN
        ALTER TABLE "employee_fingerprints" ADD CONSTRAINT "employee_fingerprints_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "attendance_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_device_commands_deviceId_fkey') THEN
        ALTER TABLE "attendance_device_commands" ADD CONSTRAINT "attendance_device_commands_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "attendance_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_logs_employeeId_fkey') THEN
        ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_logs_deviceId_fkey') THEN
        ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "attendance_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_records_employeeId_fkey') THEN
        ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_record_details_attendanceRecordId_fkey') THEN
        ALTER TABLE "attendance_record_details" ADD CONSTRAINT "attendance_record_details_attendanceRecordId_fkey" FOREIGN KEY ("attendanceRecordId") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_record_details_workShiftId_fkey') THEN
        ALTER TABLE "attendance_record_details" ADD CONSTRAINT "attendance_record_details_workShiftId_fkey" FOREIGN KEY ("workShiftId") REFERENCES "work_shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employee_leave_balances_employee_id_fkey') THEN
        ALTER TABLE "employee_leave_balances" ADD CONSTRAINT "employee_leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_correction_requests_requestId_fkey') THEN
        ALTER TABLE "attendance_correction_requests" ADD CONSTRAINT "attendance_correction_requests_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_correction_requests_employeeId_fkey') THEN
        ALTER TABLE "attendance_correction_requests" ADD CONSTRAINT "attendance_correction_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_correction_requests_workShiftId_fkey') THEN
        ALTER TABLE "attendance_correction_requests" ADD CONSTRAINT "attendance_correction_requests_workShiftId_fkey" FOREIGN KEY ("workShiftId") REFERENCES "work_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
