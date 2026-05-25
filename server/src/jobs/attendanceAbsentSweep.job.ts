import cron from "node-cron";
import { createAbsentDetailsForExpiredSchedules } from "../services/attendanceMqtt.service";

let isRunning = false;

export const initAttendanceAbsentSweepCron = () => {
  // Chạy vào phút thứ 0 của mỗi giờ (1 tiếng 1 lần)
  // Nếu muốn đổi lịch, sửa chuỗi "0 * * * *"
  cron.schedule("0 * * * *", async () => {
    if (isRunning) {
      console.log(
        "[Job] Absent sweep is already running, skipping this interval.",
      );
      return;
    }

    isRunning = true;
    try {
      await createAbsentDetailsForExpiredSchedules();
    } catch (error) {
      console.error("[Job] Error in absent sweep job:", error);
    } finally {
      isRunning = false;
    }
  });

  console.log(
    "[Job] Initialized attendance absent sweep cronjob (runs hourly).",
  );
};
