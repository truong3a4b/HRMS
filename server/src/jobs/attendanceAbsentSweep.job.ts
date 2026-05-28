import cron from "node-cron";
import { createAbsentDetailsForExpiredSchedules } from "../services/attendanceMqtt.service";

let isRunning = false;

const runAbsentSweep = async () => {
  if (isRunning) {
    console.log(
      "[Job] Absent sweep is already running, skipping this interval.",
    );
    return;
  }

  isRunning = true;
  try {
    const result = await createAbsentDetailsForExpiredSchedules();
    if (result.createdCount > 0) {
      console.log(`[Job] Created ${result.createdCount} absent shift(s).`);
    }
  } catch (error) {
    console.error("[Job] Error in absent sweep job:", error);
  } finally {
    isRunning = false;
  }
};

export const initAttendanceAbsentSweepCron = () => {
  void runAbsentSweep();
  cron.schedule("* * * * *", runAbsentSweep);

  console.log(
    "[Job] Initialized attendance absent sweep cronjob (runs every minute).",
  );
};
