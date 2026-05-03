import { Router } from "express";
import { z } from "zod";
import { UserRole } from "../../generated/prisma/client";
import { positionController } from "../controllers/position.controller";
import { PERMISSIONS } from "../constants/permissions";
import {
  authMiddleware,
  permissionMiddleware,
} from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const createPositionSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).optional(),
  description: z.string().optional(),
  permissionKeys: z.array(z.nativeEnum(PERMISSIONS)).min(1),
});

const updatePositionSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  description: z.string().optional(),
  permissionKeys: z.array(z.nativeEnum(PERMISSIONS)).optional(),
});

router.get(
  //lấy danh sách vị trí
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.POSITION_VIEW),
  positionController.getAll,
);
router.get(
  //lấy danh sách tat ca quyen
  "/permissions",
  authMiddleware(UserRole.ADMIN),
  positionController.getPermissionCatalog,
);
router.get(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.POSITION_VIEW, PERMISSIONS.POSITION_SETUP),
  positionController.getById,
);
router.put(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.POSITION_SETUP),
  validate(updatePositionSchema),
  positionController.update,
);
router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.POSITION_SETUP),
  positionController.delete,
);
router.post(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.POSITION_SETUP),
  validate(createPositionSchema),
  positionController.create,
);

export default router;
