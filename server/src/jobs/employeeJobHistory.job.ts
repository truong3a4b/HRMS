import cron from "node-cron";
import { employeeService } from "../services/employee.service";

export const initEmployeeJobHistoryCron = () => {
  // Chạy vào lúc 0h00 mỗi ngày
  cron.schedule("0 0 * * *", async () => {
    try {
      await employeeService.syncAllJobHistories();
    } catch (error) {
      console.error("[Job] Error synchronizing employee job histories:", error);
    }
  });

  console.log(
    "[Job] Initialized employee job history synchronization cronjob (runs daily at 00:00).",
  );
};
