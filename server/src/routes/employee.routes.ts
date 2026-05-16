import { Router } from "express";
import { z } from "zod";
import {
  EmployeeStatus,
  Gender,
  UserRole,
} from "../../generated/prisma/client";
import { employeeController } from "../controllers/employee.controller";
import { PERMISSIONS } from "../constants/permissions";
import {
  authMiddleware,
  permissionMiddleware,
  selfOrPermissionMiddleware,
} from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const emptyToUndefined = (value: unknown) => {
  if (value === "" || value === undefined) {
    return undefined;
  }

  return value;
};

const optionalDateSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.date().nullable().optional(),
);
const nullableDateSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.coerce.date().nullable().optional(),
);

const lookupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

const optionalLookupSchema = z.preprocess(
  emptyToUndefined,
  lookupSchema.nullable().optional(),
);
const optionalPhoneSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .min(8, "Số điện thoại phải có ít nhất 8 ký tự")
    .nullable()
    .optional(),
);
const optionalAvatarSchema = z.preprocess(
  emptyToUndefined,
  z.string().url("Avatar phải là URL hợp lệ").nullable().optional(),
);
const optionalAddressSchema = z.preprocess(
  emptyToUndefined,
  z.string().min(3, "Địa chỉ phải có ít nhất 3 ký tự").nullable().optional(),
);
const optionalStringSchema = z.preprocess(
  emptyToUndefined,
  z.string().nullable().optional(),
);
const optionalUrlSchema = z.preprocess(
  emptyToUndefined,
  z.string().url().nullable().optional(),
);
const optionalMin2StringSchema = z.preprocess(
  emptyToUndefined,
  z.string().min(2).optional(),
);
const nullableMin2StringSchema = z.preprocess(
  emptyToUndefined,
  z.string().min(2).nullable().optional(),
);
const optionalMin6StringSchema = z.preprocess(
  emptyToUndefined,
  z.string().min(6).nullable().optional(),
);

const createEmployeeSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: optionalPhoneSchema,
  avatar: optionalAvatarSchema,
  dateOfBirth: optionalDateSchema,
  gender: z.nativeEnum(Gender).optional(),
  address: optionalAddressSchema,
  province: optionalLookupSchema,
  ward: optionalLookupSchema,
  bankAccount: optionalStringSchema,
  bank: optionalLookupSchema,
  departmentId: z.string().uuid("departmentId không hợp lệ"),
  positionId: z.string().uuid("positionId không hợp lệ"),
  hireDate: z.coerce.date(),
  salary: z.number().nonnegative("Lương phải là số không âm"),
});

const updateBasicSchema = z
  .object({
    name: optionalMin2StringSchema,
    phone: optionalPhoneSchema,
    avatar: optionalUrlSchema,
    dateOfBirth: optionalDateSchema,
    gender: z.nativeEnum(Gender).nullable().optional(),
    address: optionalAddressSchema,
    province: optionalLookupSchema,
    ward: optionalLookupSchema,
    bankAccount: optionalStringSchema,
    bank: optionalLookupSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const updateAdditionalSchema = z
  .object({
    maritalStatus: nullableMin2StringSchema,
    nationality: nullableMin2StringSchema,
    religion: nullableMin2StringSchema,
    identityCardNumber: optionalMin6StringSchema,
    identityCardIssueDate: optionalDateSchema,
    frontIdentityCardImage: optionalUrlSchema,
    backIdentityCardImage: optionalUrlSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const updateJobSchema = z
  .object({
    departmentId: z.string().uuid().nullable().optional(),
    positionId: z.string().uuid().nullable().optional(),
    hireDate: nullableDateSchema,
    salary: z.preprocess(
      (value) => (value === "" ? null : value),
      z.coerce.number().nonnegative().nullable().optional(),
    ),
    status: z.nativeEnum(EmployeeStatus).optional(),
    effectiveFrom: z.coerce.date(),
  })
  .refine(
    (data) => {
      if (data.hireDate && data.effectiveFrom) {
        return data.hireDate.getTime() <= data.effectiveFrom.getTime();
      }

      return true;
    },
    {
      message: "hireDate cannot be after effectiveFrom",
    },
  );

router.get(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.EMPLOYEE_VIEW_LIST),
  employeeController.getAll,
);
router.get("/me", authMiddleware(), employeeController.getMe);
router.get(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.EMPLOYEE_VIEW_DETAIL),
  employeeController.getById,
);
router.get(
  "/:id/job-history",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.EMPLOYEE_VIEW_DETAIL),
  employeeController.getJobHistory,
);
router.patch(
  "/me/basic",
  authMiddleware(),
  validate(updateBasicSchema),
  employeeController.updateMyBasic,
);
router.patch(
  "/me/additional",
  authMiddleware(),
  validate(updateAdditionalSchema),
  employeeController.updateMyAdditional,
);
router.post(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.EMPLOYEE_CREATE),
  validate(createEmployeeSchema),
  employeeController.create,
);
router.patch(
  "/:id/basic",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  selfOrPermissionMiddleware(
    PERMISSIONS.EMPLOYEE_UPDATE_BASIC,
    PERMISSIONS.EMPLOYEE_UPDATE_SELF_BASIC,
  ),
  validate(updateBasicSchema),
  employeeController.updateBasic,
);
router.patch(
  "/:id/additional",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  selfOrPermissionMiddleware(
    PERMISSIONS.EMPLOYEE_UPDATE_BASIC,
    PERMISSIONS.EMPLOYEE_UPDATE_SELF_BASIC,
  ),
  validate(updateAdditionalSchema),
  employeeController.updateAdditional,
);
router.patch(
  "/:id/job",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.EMPLOYEE_UPDATE_JOB),
  validate(updateJobSchema),
  employeeController.updateJob,
);

export default router;
