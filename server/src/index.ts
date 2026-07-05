import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { initializeSocket } from "./config/socket";
import { attendanceMqttService } from "./services/attendanceMqtt.service";
import routes from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { initEmployeeJobHistoryCron } from "./jobs/employeeJobHistory.job";
import { initAttendanceAbsentSweepCron } from "./jobs/attendanceAbsentSweep.job";
import { resumePendingPayrollCalculationJobs } from "./services/payroll.service";

const app = express();
const allowedOrigins = new Set(
  [env.WEB_ORIGIN, "http://127.0.0.1:5173", "http://localhost:5173"].flatMap(
    (origin) =>
      origin
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
  ),
);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      if (env.NODE_ENV !== "production") {
        callback(null, true);
        return;
      }

      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "HRMS server is running",
  });
});

app.use("/api", routes);
app.use(errorMiddleware);

const server = http.createServer(app);
initializeSocket(server);

const startServer = async () => {
  try {
    await prisma.$connect();
    await attendanceMqttService.initialize();
    initEmployeeJobHistoryCron();
    initAttendanceAbsentSweepCron();
    await resumePendingPayrollCalculationJobs();

    server.listen(env.PORT, () => {
      console.log(`Server running at http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
