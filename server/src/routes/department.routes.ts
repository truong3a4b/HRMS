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

const createDepartmentSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

router.get(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.DEPARTMENT_VIEW_LIST),
  departmentController.getAll,
);
router.post(
  "/",
  authMiddleware(UserRole.ADMIN),
  validate(createDepartmentSchema),
  departmentController.create,
);

export default router;
