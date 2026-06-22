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
  // Schedule the job to run every hour at the start of the hour (0 minutes past every hour)
  cron.schedule("0 * * * *", runAbsentSweep);

  console.log(
    "[Job] Initialized attendance absent sweep cronjob (runs every hour).",
  );
};
