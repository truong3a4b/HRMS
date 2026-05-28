CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "salary_multiplier" DECIMAL(6,2) NOT NULL DEFAULT 1,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "holidays_date_key" ON "holidays"("date");
CREATE INDEX "holidays_is_active_date_idx" ON "holidays"("is_active", "date");

ALTER TABLE "payrolls"
ADD COLUMN "holidayWorkDays" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN "holidayPay" DECIMAL(15,2) NOT NULL DEFAULT 0;
