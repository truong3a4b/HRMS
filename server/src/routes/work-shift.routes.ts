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
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "time must be in HH:mm format");

const createShiftSchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  startTime: timeSchema,
  endTime: timeSchema,
  breakStartTime: timeSchema.optional(),
  breakEndTime: timeSchema.optional(),
  lateGracePeriod: z.number().int().min(0).optional(),
  earlyLeaveGracePeriod: z.number().int().min(0).optional(),
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
  workUnits: z.number().positive(),
  overtimeMultiplier: z.number().positive().optional(),
});

const updateShiftSchema = z
  .object({
    code: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    breakStartTime: timeSchema.optional(),
    breakEndTime: timeSchema.optional(),
    lateGracePeriod: z.number().int().min(0).optional(),
    earlyLeaveGracePeriod: z.number().int().min(0).optional(),
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
    workUnits: z.number().positive().optional(),
    overtimeMultiplier: z.number().positive().optional(),
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
