import { Router } from "express";
import authRoutes from "./auth.routes";
import candidateRoutes from "./candidate.routes";
import departmentRoutes from "./department.routes";
import employeeRoutes from "./employee.routes";
import recruitmentRoutes from "./recruitment.routes";
import positionRoutes from "./position.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/positions", positionRoutes);
router.use("/recruitment", recruitmentRoutes);
router.use("/candidates", candidateRoutes);
router.use("/employees", employeeRoutes);

export default router;
