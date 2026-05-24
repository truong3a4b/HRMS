import { Router } from "express";
import { z } from "zod";
import {
  ApprovalMode,
  PayrollPaymentMode,
  UserRole,
} from "../../generated/prisma/client";
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
  autoPenaltyPolicyId: z.preprocess(
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

const createPayrollSchema = z
  .object({
    employeeId: z.string().uuid(),
    periodId: z.string().trim().min(1).optional(),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(1900).max(9999).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.periodId && (!data.month || !data.year)) {
      ctx.addIssue({
        code: "custom",
        path: ["periodId"],
        message: "periodId or month/year is required",
      });
    }
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
  personalIncomeTax: optionalDecimalSchema,
  grossSalary: optionalDecimalSchema,
  totalDeduction: optionalDecimalSchema,
  netSalary: optionalDecimalSchema,
  overtimeLines: z.array(overtimeLineSchema).optional(),
  allowanceLines: z.array(allowanceLineSchema).optional(),
  bonusPenaltyLines: z.array(bonusPenaltyLineSchema).optional(),
});

const createPayrollByTargetsSchema = z
  .object({
    periodId: z.string().trim().min(1).optional(),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(1900).max(9999).optional(),
    periodName: z.preprocess(
      nullableEmptyToNull,
      z.string().trim().min(1).nullable().optional(),
    ),
    note: z.preprocess(
      nullableEmptyToNull,
      z.string().trim().min(1).nullable().optional(),
    ),
    departmentIds: z.array(z.string().uuid()).min(1),
    positionIds: z.array(z.string().uuid()).min(1),
    skipExisting: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.periodId && (!data.month || !data.year)) {
      ctx.addIssue({
        code: "custom",
        path: ["periodId"],
        message: "periodId or month/year is required",
      });
    }
  });

const idsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

const requestPayrollApprovalSchema = z.object({
  title: z.string().trim().min(2).optional(),
  description: z
    .preprocess(nullableEmptyToNull, z.string().trim().min(1).nullable().optional()),
  approvalMode: z.nativeEnum(ApprovalMode).optional(),
  approverIds: z.array(z.string().trim().min(1)).min(1),
  watcherIds: z.array(z.string().trim().min(1)).optional(),
});

const createPayrollPaymentBatchSchema = z
  .object({
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(1900).max(9999).optional(),
    periodId: z.string().trim().min(1).optional(),
    employeeIds: z.array(z.string().uuid()).min(1),
    mode: z.enum(PayrollPaymentMode),
    amount: decimalSchema.optional(),
    percent: decimalSchema.optional(),
    paymentDate: z.coerce.date().optional(),
    note: z.preprocess(
      nullableEmptyToNull,
      z.string().trim().min(1).nullable().optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (!data.periodId && (!data.month || !data.year)) {
      ctx.addIssue({
        code: "custom",
        path: ["periodId"],
        message: "periodId or month/year is required",
      });
    }

    if (data.mode === PayrollPaymentMode.AMOUNT && data.amount === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "amount is required when mode is AMOUNT",
      });
    }

    if (
      data.mode === PayrollPaymentMode.PERCENT &&
      data.percent === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["percent"],
        message: "percent is required when mode is PERCENT",
      });
    }
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
router.get("/periods", payrollController.getPeriods);
router.get(
  "/periods/:periodId/overview",
  payrollController.getPeriodOverviewById,
);
router.get(
  "/periods/:periodId/employees/:employeeId",
  payrollController.getPeriodEmployeeDetailById,
);
router.delete(
  "/periods/:periodId/employees/:employeeId",
  payrollController.removePeriodEmployeeById,
);
router.post(
  "/periods/:periodId/request-approval",
  validate(requestPayrollApprovalSchema),
  payrollController.requestPeriodApprovalById,
);
router.post(
  "/periods/:periodId/approve",
  payrollController.approvePeriodById,
);
router.post(
  "/periods/:periodId/cancel",
  payrollController.cancelPeriodById,
);
router.get(
  "/periods/:year/:month/overview",
  payrollController.getPeriodOverview,
);
router.get(
  "/periods/:year/:month/employees/:employeeId",
  payrollController.getPeriodEmployeeDetail,
);
router.post(
  "/periods/:year/:month/request-approval",
  validate(requestPayrollApprovalSchema),
  payrollController.requestPeriodApproval,
);
router.post("/periods/:year/:month/approve", payrollController.approvePeriod);
router.post("/periods/:year/:month/cancel", payrollController.cancelPeriod);
router.post("/approve-many", validate(idsSchema), payrollController.approveMany);
router.post("/pay-many", validate(idsSchema), payrollController.payMany);
router.get("/payments", payrollController.getPaymentBatches);
router.post(
  "/payments",
  validate(createPayrollPaymentBatchSchema),
  payrollController.createPaymentBatch,
);
router.get("/payments/:id", payrollController.getPaymentBatchById);
router.get("/:id", payrollController.getById);
router.put("/:id", validate(updatePayrollSchema), payrollController.update);
router.post(
  "/:id/request-approval",
  validate(requestPayrollApprovalSchema),
  payrollController.requestApproval,
);
router.post("/:id/approve", payrollController.approve);
router.post("/:id/pay", payrollController.pay);

export default router;
