import { Router } from "express";
import { z } from "zod";
import { ApprovalMode, UserRole } from "../../generated/prisma/client";
import { scheduleAssignmentController } from "../controllers/schedule-assignment.controller";
import { PERMISSIONS } from "../constants/permissions";
import {
  authMiddleware,
  permissionMiddleware,
} from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const scheduleDetailSchema = z
  .object({
    date: z.string(),
    workShiftId: z.string().uuid().optional(),
    workShiftIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) =>
      Boolean(data.workShiftId) ||
      Boolean(data.workShiftIds && data.workShiftIds.length > 0),
    { message: "workShiftId or workShiftIds is required" },
  )
  .transform((data) => ({
    date: data.date,
    workShiftIds: data.workShiftIds ?? [data.workShiftId as string],
  }));

const createSetupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  applicableDepartments: z.array(z.string().uuid()).optional(),
  applicablePositions: z.array(z.string().uuid()).optional(),
  scheduleDetails: z.array(scheduleDetailSchema).min(1),
});

const registerScheduleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  approvalMode: z
    .nativeEnum(ApprovalMode)
    .optional()
    .default(ApprovalMode.PARALLEL),
  approverIds: z.array(z.string()).min(1, "At least one approver is required"),
  watcherIds: z.array(z.string()).optional().default([]),
  scheduleDetails: z.array(scheduleDetailSchema).min(1),
});

router.post(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.WORK_SCHEDULE_MANAGE),
  validate(createSetupSchema),
  scheduleAssignmentController.create,
);

router.post(
  "/register",
  authMiddleware(UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.WORK_SCHEDULE_REGISTER),
  validate(registerScheduleSchema),
  scheduleAssignmentController.register,
);

router.get(
  "/employee/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.WORK_SCHEDULE_VIEW),
  scheduleAssignmentController.getEmployeeByMonth,
);

export default router;
