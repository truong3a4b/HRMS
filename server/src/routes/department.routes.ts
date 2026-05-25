import { Router } from "express";
import { z } from "zod";
import { UserRole } from "../../generated/prisma/client";
import { departmentController } from "../controllers/department.controller";
import { PERMISSIONS } from "../constants/permissions";
import {
  authMiddleware,
  permissionMiddleware,
} from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const emptyToUndefined = (value: unknown) => {
  if (value === "" || value === undefined) {
    return undefined;
  }

  return value;
};

const optionalCodeSchema = z.preprocess(
  emptyToUndefined,
  z.string().min(2).nullable().optional(),
);

const createDepartmentSchema = z.object({
  name: z.string().min(2),
  code: optionalCodeSchema,
  description: z.string().optional(),
  managerId: z.string().uuid().nullable().optional(),
});

const updateDepartmentManagerSchema = z.object({
  managerId: z.string().uuid().nullable(),
});

const updateDepartmentBasicSchema = z
  .object({
    name: z.string().min(2).optional(),
    description: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

router.get(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.DEPARTMENT_VIEW),
  departmentController.getAll,
);
router.get(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.DEPARTMENT_VIEW),
  departmentController.getById,
);
router.post(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.DEPARTMENT_SETUP),
  validate(createDepartmentSchema),
  departmentController.create,
);
router.patch(
  "/:id/manager",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.DEPARTMENT_SETUP),
  validate(updateDepartmentManagerSchema),
  departmentController.updateManager,
);
router.patch(
  "/:id/basic",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.DEPARTMENT_SETUP),
  validate(updateDepartmentBasicSchema),
  departmentController.updateBasic,
);
router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.DEPARTMENT_SETUP),
  departmentController.remove,
);

export default router;
