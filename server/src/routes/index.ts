import { Router } from "express";
import authRoutes from "./auth.routes";
import candidateRoutes from "./candidate.routes";
import departmentRoutes from "./department.routes";
import employeeRoutes from "./employee.routes";
import notificationRoutes from "./notification.routes";
import requestRoutes from "./request.routes";
import recruitmentRoutes from "./recruitment.routes";
import positionRoutes from "./position.routes";
import workShiftRoutes from "./work-shift.routes";
import scheduleAssignmentRoutes from "./schedule-assignment.routes";
import attendanceDeviceRoutes from "./attendanceDevice.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/positions", positionRoutes);
router.use("/recruitment", recruitmentRoutes);
router.use("/requests", requestRoutes);
router.use("/candidates", candidateRoutes);
router.use("/employees", employeeRoutes);
router.use("/notifications", notificationRoutes);
router.use("/work-shifts", workShiftRoutes);
router.use("/schedule-assignments", scheduleAssignmentRoutes);
router.use("/attendance-devices", attendanceDeviceRoutes);

export default router;
