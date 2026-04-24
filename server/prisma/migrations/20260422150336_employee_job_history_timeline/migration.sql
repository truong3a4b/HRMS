-- CreateTable
CREATE TABLE "employee_job_histories" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "departmentId" TEXT,
    "positionId" TEXT,
    "hireDate" TIMESTAMP(3),
    "salary" DECIMAL(15,2),
    "status" "EmployeeStatus" NOT NULL DEFAULT 'WORKING',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_job_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_job_histories_employeeId_effectiveFrom_idx" ON "employee_job_histories"("employeeId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "employee_job_histories_employeeId_effectiveTo_idx" ON "employee_job_histories"("employeeId", "effectiveTo");

-- CreateIndex
CREATE INDEX "employee_job_histories_departmentId_idx" ON "employee_job_histories"("departmentId");

-- CreateIndex
CREATE INDEX "employee_job_histories_positionId_idx" ON "employee_job_histories"("positionId");

-- AddForeignKey
ALTER TABLE "employee_job_histories" ADD CONSTRAINT "employee_job_histories_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_job_histories" ADD CONSTRAINT "employee_job_histories_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_job_histories" ADD CONSTRAINT "employee_job_histories_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
