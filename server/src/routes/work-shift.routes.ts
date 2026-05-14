import { Router } from "express";
import { z } from "zod";
import { UserRole } from "../../generated/prisma/client";
import { workShiftController } from "../controllers/work-shift.controller";
import { PERMISSIONS } from "../constants/permissions";
import {
  authMiddleware,
  permissionMiddleware,
} from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();
const MAX_SHIFT_FLEXIBILITY_MINUTES = 240;

const createShiftSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
  lateGracePeriod: z.number().int().optional(),
  earlyLeaveGracePeriod: z.number().int().optional(),
  checkInFlexibilityMinutes: z
    .number()
    .int()
    .min(0)
    .max(MAX_SHIFT_FLEXIBILITY_MINUTES)
    .optional(),
  checkOutFlexibilityMinutes: z
    .number()
    .int()
    .min(0)
    .max(MAX_SHIFT_FLEXIBILITY_MINUTES)
    .optional(),
  isOvertime: z.boolean().optional(),
  workUnits: z.number().min(0).optional(), // Required
  overtimeMultiplier: z.number().optional(),
});

const updateShiftSchema = z
  .object({
    code: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    startTime: z.string().min(1).optional(),
    endTime: z.string().min(1).optional(),
    breakStartTime: z.string().optional(),
    breakEndTime: z.string().optional(),
    lateGracePeriod: z.number().int().optional(),
    earlyLeaveGracePeriod: z.number().int().optional(),
    checkInFlexibilityMinutes: z
      .number()
      .int()
      .min(0)
      .max(MAX_SHIFT_FLEXIBILITY_MINUTES)
      .optional(),
    checkOutFlexibilityMinutes: z
      .number()
      .int()
      .min(0)
      .max(MAX_SHIFT_FLEXIBILITY_MINUTES)
      .optional(),
    isOvertime: z.boolean().optional(),
    workUnits: z.number().optional(),
    overtimeMultiplier: z.number().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

router.get(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.WORK_SCHEDULE_VIEW),
  workShiftController.getAll,
);

router.get(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.WORK_SCHEDULE_VIEW),
  workShiftController.getById,
);

router.post(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.WORK_SCHEDULE_MANAGE),
  validate(createShiftSchema),
  workShiftController.create,
);

router.patch(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.WORK_SCHEDULE_MANAGE),
  validate(updateShiftSchema),
  workShiftController.update,
);

router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.WORK_SCHEDULE_MANAGE),
  workShiftController.remove,
);

export default router;
