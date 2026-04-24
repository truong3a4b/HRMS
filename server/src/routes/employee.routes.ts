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
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
};

const optionalDateSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.date().optional(),
);
const nullableDateSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.date().nullable().optional(),
);

const createEmployeeSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(8, "Số điện thoại phải có ít nhất 8 ký tự").optional(),
  avatar: z.string().url("Avatar phải là URL hợp lệ").optional(),
  dateOfBirth: optionalDateSchema,
  gender: z.nativeEnum(Gender).optional(),
  address: z.string().min(3, "Địa chỉ phải có ít nhất 3 ký tự").optional(),
  provinceCode: z.string().optional(),
  wardCode: z.string().optional(),
  bankAccount: z.string().optional(),
  bankCode: z.string().optional(),
  departmentId: z.string().uuid("departmentId không hợp lệ"),
  positionId: z.string().uuid("positionId không hợp lệ"),
  hireDate: z.coerce.date(),
  salary: z.number().nullable(),
});

const updateBasicSchema = z
  .object({
    name: z.string().min(2).optional(),
    phone: z.string().min(8).optional(),
    avatar: z.string().url().optional(),
    dateOfBirth: optionalDateSchema,
    gender: z.nativeEnum(Gender).optional(),
    address: z.string().min(3).optional(),
    provinceCode: z.string().optional(),
    wardCode: z.string().optional(),
    bankAccount: z.string().optional(),
    bankCode: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const updateAdditionalSchema = z
  .object({
    maritalStatus: z.string().min(2).optional(),
    nationality: z.string().min(2).optional(),
    religion: z.string().min(2).optional(),
    identityCardNumber: z.string().min(6).optional(),
    identityCardIssueDate: optionalDateSchema,
    frontIdentityCardImage: z.string().url().optional(),
    backIdentityCardImage: z.string().url().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const updateJobSchema = z
  .object({
    departmentId: z.string().uuid().nullable().optional(),
    positionId: z.string().uuid().nullable().optional(),
    hireDate: nullableDateSchema,
    salary: z
      .preprocess(
        (value) => (value === "" || value === undefined ? null : value),
        z.coerce.number().nonnegative().nullable().optional(),
      )
      .optional(),
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
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(
    PERMISSIONS.EMPLOYEE_UPDATE_BASIC,
    PERMISSIONS.EMPLOYEE_UPDATE_SELF_BASIC,
  ),
  validate(updateBasicSchema),
  employeeController.updateMyBasic,
);
router.patch(
  "/me/additional",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(
    PERMISSIONS.EMPLOYEE_UPDATE_ADDITIONAL,
    PERMISSIONS.EMPLOYEE_UPDATE_SELF_ADDITIONAL,
  ),
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
    PERMISSIONS.EMPLOYEE_UPDATE_ADDITIONAL,
    PERMISSIONS.EMPLOYEE_UPDATE_SELF_ADDITIONAL,
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
