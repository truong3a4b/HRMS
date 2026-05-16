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
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Thời gian phải có định dạng HH:mm");
const optionalTimeSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  timeSchema.nullable().optional(),
);
const optionalNonNegativeIntSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z
    .number()
    .int("Giá trị phải là số nguyên")
    .min(0, "Giá trị không được âm")
    .optional(),
);
const optionalPositiveNumberSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.number().positive("Giá trị phải lớn hơn 0").optional(),
);

const createShiftSchema = z.object({
  code: z.string().trim().min(1, "Vui lòng nhập mã ca"),
  name: z.string().trim().min(1, "Vui lòng nhập tên ca"),
  startTime: timeSchema,
  endTime: timeSchema,
  breakStartTime: optionalTimeSchema,
  breakEndTime: optionalTimeSchema,
  lateGracePeriod: optionalNonNegativeIntSchema,
  earlyLeaveGracePeriod: optionalNonNegativeIntSchema,
  checkInStartTime: optionalTimeSchema,
  checkInEndTime: optionalTimeSchema,
  checkOutStartTime: optionalTimeSchema,
  checkOutEndTime: optionalTimeSchema,
  isOvertime: z.boolean().optional(),
  workUnits: z.number().positive("Đơn vị công phải lớn hơn 0"),
  overtimeMultiplier: optionalPositiveNumberSchema,
});

const updateShiftSchema = z
  .object({
    code: z.string().trim().min(1, "Vui lòng nhập mã ca").optional(),
    name: z.string().trim().min(1, "Vui lòng nhập tên ca").optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    breakStartTime: optionalTimeSchema,
    breakEndTime: optionalTimeSchema,
    lateGracePeriod: optionalNonNegativeIntSchema,
    earlyLeaveGracePeriod: optionalNonNegativeIntSchema,
    checkInStartTime: optionalTimeSchema,
    checkInEndTime: optionalTimeSchema,
    checkOutStartTime: optionalTimeSchema,
    checkOutEndTime: optionalTimeSchema,
    isOvertime: z.boolean().optional(),
    workUnits: optionalPositiveNumberSchema,
    overtimeMultiplier: optionalPositiveNumberSchema,
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Vui lòng nhập ít nhất một thông tin cần cập nhật",
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
