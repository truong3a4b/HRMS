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
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.POSITION_VIEW_LIST),
  positionController.getAll,
);
router.get(
  "/permissions",
  authMiddleware(UserRole.ADMIN),
  positionController.getPermissionCatalog,
);
router.get(
  "/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.POSITION_VIEW_LIST),
  positionController.getById,
);
router.put(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  permissionMiddleware(PERMISSIONS.POSITION_CREATE),
  validate(updatePositionSchema),
  positionController.update,
);
router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  permissionMiddleware(PERMISSIONS.POSITION_DELETE),
  positionController.delete,
);
router.post(
  "/",
  authMiddleware(UserRole.ADMIN),
  permissionMiddleware(PERMISSIONS.POSITION_CREATE),
  validate(createPositionSchema),
  positionController.create,
);

export default router;
