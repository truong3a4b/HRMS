import { Router } from "express";
import { z } from "zod";
import {
  ApprovalMode,
  LeaveType,
  RequestApprovalStatus,
  RequestType,
  UserRole,
} from "../../generated/prisma/client";
import { requestController } from "../controllers/request.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const createRequestSchema = z.object({
  type: z.nativeEnum(RequestType),
  title: z.string().trim().min(2, "Title is required"),
  description: z.string().optional(),
  approvalMode: z
    .nativeEnum(ApprovalMode)
    .optional()
    .default(ApprovalMode.PARALLEL),
  approverIds: z
    .array(z.string().min(1))
    .min(1, "At least one approver is required"),
  watcherIds: z.array(z.string().min(1)).optional().default([]),
});

const approvalFieldsSchema = {
  title: z.string().trim().min(2, "Title is required"),
  description: z.string().optional(),
  approvalMode: z
    .nativeEnum(ApprovalMode)
    .optional()
    .default(ApprovalMode.PARALLEL),
  approverIds: z
    .array(z.string().min(1))
    .min(1, "At least one approver is required"),
  watcherIds: z.array(z.string().min(1)).optional().default([]),
};

const createLeaveRequestSchema = z.object({
  ...approvalFieldsSchema,
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be in YYYY-MM-DD format"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be in YYYY-MM-DD format"),
  leaveType: z.nativeEnum(LeaveType),
  workShiftId: z.string().min(1).optional(),
  reason: z.string().trim().min(2, "reason is required"),
});

const createLateEarlyRequestSchema = z.object({
  ...approvalFieldsSchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format"),
  type: z.enum(["LATE_ARRIVAL", "EARLY_LEAVE"]),
  workShiftId: z.string().min(1, "workShiftId is required"),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "startTime must be in HH:mm format"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "endTime must be in HH:mm format"),
  reason: z.string().min(2, "reason is required"),
});

const createAttendanceCorrectionRequestSchema = z.object({
  ...approvalFieldsSchema,
  attendanceDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "attendanceDate must be in YYYY-MM-DD format",
    ),
  workShiftId: z.string().min(1, "workShiftId is required"),
  reason: z.string().min(2, "reason is required"),
});

const createBonusPenaltyRequestSchema = z.object({
  ...approvalFieldsSchema,
  employeeId: z.string().min(1, "employeeId is required"),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "month must be in YYYY-MM format"),
  amount: z.coerce.number().positive("amount must be greater than 0"),
  isBonus: z.boolean(),
  reason: z.string().trim().min(2, "reason is required"),
});

const decisionSchema = z.object({
  decision: z.enum([
    RequestApprovalStatus.APPROVED,
    RequestApprovalStatus.REJECTED,
  ]),
  note: z.string().optional(),
});

router.get(
  "/me",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  requestController.getMyRequests,
);
router.get(
  "/me/watching",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  requestController.getMyWatchingRequests,
);
router.get(
  "/me/pending-approvals",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  requestController.getMyPendingApprovals,
);
router.get(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  requestController.getRequests,
);
router.get(
  "/leave/shifts",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  requestController.getMyLeaveShiftsByDate,
);
router.get(
  "/schedule-shifts",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  requestController.getMyScheduleShiftsByDate,
);
router.get(
  "/employee-options",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  requestController.getEmployeeOptions,
);
router.post(
  "/leave",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  validate(createLeaveRequestSchema),
  requestController.createLeaveRequest,
);
router.post(
  "/late-early",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  validate(createLateEarlyRequestSchema),
  requestController.createLateEarlyRequest,
);
router.post(
  "/attendance-correction",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  validate(createAttendanceCorrectionRequestSchema),
  requestController.createAttendanceCorrectionRequest,
);
router.post(
  "/bonus-penalty",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  validate(createBonusPenaltyRequestSchema),
  requestController.createBonusPenaltyRequest,
);
router.post(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  validate(createRequestSchema),
  requestController.createRequest,
);
router.get(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  requestController.getRequestById,
);
router.post(
  "/:id/start-review",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  requestController.startReview,
);
router.post(
  "/:id/decision",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  validate(decisionSchema),
  requestController.decideRequest,
);
router.post(
  "/:id/cancel",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  requestController.cancelRequest,
);

export default router;
