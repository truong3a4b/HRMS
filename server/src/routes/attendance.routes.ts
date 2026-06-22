import { Router } from "express";
import { z } from "zod";
import { ApprovalMode, UserRole } from "../../generated/prisma/client";
import { attendanceController } from "../controllers/attendance.controller";
import { PERMISSIONS } from "../constants/permissions";
import {
  authMiddleware,
  permissionMiddleware,
} from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const createCompensationSchema = z.object({
  employeeId: z.string().min(1).optional(),
  attendanceDate: z.string().min(1, "attendanceDate is required"),
  workShiftId: z.string().min(1, "workShiftId is required"),
  reason: z.string().min(2, "reason is required"),
  addedWorkUnits: z.number().positive().optional(),
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  approvalMode: z.nativeEnum(ApprovalMode).optional(),
  approverIds: z.array(z.string().min(1)).min(1),
  watcherIds: z.array(z.string().min(1)).optional().default([]),
});

router.get(
  "/history/me",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  attendanceController.getMyHistory,
);
router.get(
  "/history/employees/:employeeId",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.ATTENDANCE_HISTORY_VIEW),
  attendanceController.getEmployeeHistory,
);
router.get(
  "/timesheet/me",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  attendanceController.getMyTimesheet,
);
router.get(
  "/timesheet/employees/:employeeId",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.ATTENDANCE_TIMESHEET_VIEW),
  attendanceController.getEmployeeTimesheet,
);
router.get(
  "/summary/daily",
  authMiddleware(UserRole.ADMIN),
  attendanceController.getDailySummary,
);
router.post(
  "/compensation-requests",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  validate(createCompensationSchema),
  attendanceController.createCompensationRequest,
);

export default router;
