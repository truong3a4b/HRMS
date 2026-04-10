import { Router } from "express";
import { employeeController } from "../controllers/employee.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  authMiddleware("SUPER_ADMIN", "HR", "MANAGER"),
  employeeController.getAll,
);
router.get("/:id", authMiddleware(), employeeController.getById);

export default router;
