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
  "/:id/complete",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  requestController.completeRequest,
);
router.post(
  "/:id/cancel",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  requestController.cancelRequest,
);

export default router;
