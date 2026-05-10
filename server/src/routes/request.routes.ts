import { Router } from "express";
import { z } from "zod";
import {
  ApprovalMode,
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
  title: z.string().min(2, "Title is required"),
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
  title: z.string().min(2).optional(),
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
  startDate: z.string().min(1, "startDate is required"),
  endDate: z.string().min(1, "endDate is required"),
  leaveType: z.string().min(1, "leaveType is required"),
  reason: z.string().optional(),
});

const createLateEarlyRequestSchema = z.object({
  ...approvalFieldsSchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format"),
  type: z.enum(["LATE_ARRIVAL", "EARLY_LEAVE"]),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "startTime must be in HH:mm format"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "endTime must be in HH:mm format"),
  reason: z.string().min(2, "reason is required"),
});

const decisionSchema = z.object({
  decision: z.nativeEnum(RequestApprovalStatus),
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
