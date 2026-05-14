import { Router } from "express";
import { z } from "zod";
import { UserRole } from "../../generated/prisma/client";
import { payrollController } from "../controllers/payroll.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const nullableEmptyToNull = (value: unknown) => {
  if (value === "") {
    return null;
  }

  return value;
};

const decimalSchema = z.union([
  z.number().finite(),
  z.string().trim().min(1),
]);

const optionalDecimalSchema = decimalSchema.optional();

const overtimeLineSchema = z.object({
  workShiftId: z.preprocess(
    nullableEmptyToNull,
    z.string().uuid().nullable().optional(),
  ),
  workShiftCode: z.preprocess(
    nullableEmptyToNull,
    z.string().trim().min(1).nullable().optional(),
  ),
  workShiftName: z.string().trim().min(1),
  workDays: optionalDecimalSchema,
  hours: optionalDecimalSchema,
  baseHourlyRate: optionalDecimalSchema,
  multiplier: optionalDecimalSchema,
  amount: optionalDecimalSchema,
});

const allowanceLineSchema = z.object({
  allowancePolicyId: z.preprocess(
    nullableEmptyToNull,
    z.string().uuid().nullable().optional(),
  ),
  allowanceName: z.string().trim().min(1),
  amount: optionalDecimalSchema,
});

const bonusPenaltyLineSchema = z.object({
  payrollBonusPenaltyId: z.preprocess(
    nullableEmptyToNull,
    z.string().uuid().nullable().optional(),
  ),
  isBonus: z.boolean().optional(),
  reason: z.preprocess(
    nullableEmptyToNull,
    z.string().trim().min(1).nullable().optional(),
  ),
  amount: optionalDecimalSchema,
});

const createPayrollSchema = z.object({
  employeeId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1900).max(9999),
});

const updatePayrollSchema = z.object({
  employeeId: z.string().uuid().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(1900).max(9999).optional(),
  baseSalary: optionalDecimalSchema,
  standardWorkDays: optionalDecimalSchema,
  actualWorkDays: optionalDecimalSchema,
  actualSalary: optionalDecimalSchema,
  totalOvertimeWorkDays: optionalDecimalSchema,
  totalOvertimeHours: optionalDecimalSchema,
  totalOvertimePay: optionalDecimalSchema,
  totalAllowance: optionalDecimalSchema,
  totalBonus: optionalDecimalSchema,
  totalPenalty: optionalDecimalSchema,
  socialInsurance: optionalDecimalSchema,
  healthInsurance: optionalDecimalSchema,
  unemploymentInsurance: optionalDecimalSchema,
  laborAccidentInsurance: optionalDecimalSchema,
  personalIncomeTax: optionalDecimalSchema,
  grossSalary: optionalDecimalSchema,
  totalDeduction: optionalDecimalSchema,
  netSalary: optionalDecimalSchema,
  overtimeLines: z.array(overtimeLineSchema).optional(),
  allowanceLines: z.array(allowanceLineSchema).optional(),
  bonusPenaltyLines: z.array(bonusPenaltyLineSchema).optional(),
});

const createPayrollByTargetsSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1900).max(9999),
  departmentIds: z.array(z.string().uuid()).min(1),
  positionIds: z.array(z.string().uuid()).min(1),
  skipExisting: z.boolean().optional(),
});

const idsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

router.use(authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE));

router.get("/mine", payrollController.getMine);
router.post(
  "/by-targets",
  validate(createPayrollByTargetsSchema),
  payrollController.createByTargets,
);
router.post("/", validate(createPayrollSchema), payrollController.create);
router.get("/", payrollController.getAll);
router.post("/approve-many", validate(idsSchema), payrollController.approveMany);
router.post("/pay-many", validate(idsSchema), payrollController.payMany);
router.get("/:id", payrollController.getById);
router.put("/:id", validate(updatePayrollSchema), payrollController.update);
router.post("/:id/request-approval", payrollController.requestApproval);
router.post("/:id/approve", payrollController.approve);
router.post("/:id/pay", payrollController.pay);

export default router;
