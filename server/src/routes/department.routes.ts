import { Router } from "express";
import { z } from "zod";
import { departmentController } from "../controllers/department.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const createDepartmentSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

router.get("/", authMiddleware(), departmentController.getAll);
router.post(
  "/",
  authMiddleware("SUPER_ADMIN", "HR"),
  validate(createDepartmentSchema),
  departmentController.create,
);

export default router;
