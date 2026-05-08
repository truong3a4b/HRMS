-- CreateTable
CREATE TABLE "WorkScheduleRequest" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "scheduleDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkScheduleRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkScheduleRequest_requestId_key" ON "WorkScheduleRequest"("requestId");

-- AddForeignKey
ALTER TABLE "WorkScheduleRequest" ADD CONSTRAINT "WorkScheduleRequest_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
