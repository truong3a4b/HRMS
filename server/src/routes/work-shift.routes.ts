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

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format");

const optionalTimeSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  timeSchema.nullable().optional(),
);

const optionalRequiredTimeSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  timeSchema.optional(),
);

const optionalNonNegativeIntSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.number().int("Value must be an integer").min(0).optional(),
);

const optionalPositiveNumberSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.number().positive("Value must be greater than 0").optional(),
);

const parseClockToMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return hours * 60 + minutes;
};

const isValidNonOvernightRange = (data: {
  startTime?: string;
  endTime?: string;
  isOvernight?: boolean;
}) => {
  if (!data.startTime || !data.endTime || data.isOvernight) {
    return true;
  }

  return parseClockToMinutes(data.endTime) > parseClockToMinutes(data.startTime);
};

const shiftTimeRangeMessage =
  "End time must be after start time when isOvernight is false";

const createShiftSchema = z
  .object({
    code: z.string().trim().min(1, "Code is required"),
    name: z.string().trim().min(1, "Name is required"),
    startTime: timeSchema,
    endTime: timeSchema,
    breakStartTime: optionalTimeSchema,
    breakEndTime: optionalTimeSchema,
    lateGracePeriod: optionalNonNegativeIntSchema,
    earlyLeaveGracePeriod: optionalNonNegativeIntSchema,
    checkInStartTime: timeSchema,
    checkInEndTime: timeSchema,
    checkOutStartTime: timeSchema,
    checkOutEndTime: timeSchema,
    isOvernight: z.boolean().optional(),
    isOvertime: z.boolean().optional(),
    workUnits: z.number().positive("Work units must be greater than 0"),
    overtimeMultiplier: optionalPositiveNumberSchema,
  })
  .refine(isValidNonOvernightRange, {
    message: shiftTimeRangeMessage,
    path: ["endTime"],
  });

const updateShiftSchema = z
  .object({
    code: z.string().trim().min(1, "Code is required").optional(),
    name: z.string().trim().min(1, "Name is required").optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    breakStartTime: optionalTimeSchema,
    breakEndTime: optionalTimeSchema,
    lateGracePeriod: optionalNonNegativeIntSchema,
    earlyLeaveGracePeriod: optionalNonNegativeIntSchema,
    checkInStartTime: optionalRequiredTimeSchema,
    checkInEndTime: optionalRequiredTimeSchema,
    checkOutStartTime: optionalRequiredTimeSchema,
    checkOutEndTime: optionalRequiredTimeSchema,
    isOvernight: z.boolean().optional(),
    isOvertime: z.boolean().optional(),
    workUnits: optionalPositiveNumberSchema,
    overtimeMultiplier: optionalPositiveNumberSchema,
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })
  .refine(isValidNonOvernightRange, {
    message: shiftTimeRangeMessage,
    path: ["endTime"],
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
