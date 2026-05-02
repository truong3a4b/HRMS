-- AlterTable
ALTER TABLE "interview_evaluations" ADD COLUMN "title" TEXT;

UPDATE "interview_evaluations"
SET "title" = COALESCE(NULLIF("title", ''), 'Đánh giá phỏng vấn')
WHERE "title" IS NULL OR "title" = '';

ALTER TABLE "interview_evaluations" ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "interview_schedules" ADD COLUMN "title" TEXT;

UPDATE "interview_schedules"
SET "title" = COALESCE(NULLIF("title", ''), 'Thư mời phỏng vấn')
WHERE "title" IS NULL OR "title" = '';

ALTER TABLE "interview_schedules" ALTER COLUMN "title" SET NOT NULL;
