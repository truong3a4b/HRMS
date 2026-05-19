import { Router } from "express";
import { z } from "zod";
import { AutoPenaltyType, UserRole } from "../../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import { payrollPolicyController } from "../controllers/payroll-policy.controller";
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

const nullableEmptyToNull = (value: unknown) => {
  if (value === "") {
    return null;
  }

  return value;
};

const decimalSchema = z.union([z.number().finite(), z.string().trim().min(1)]);

const optionalDecimalSchema = z.preprocess(
  nullableEmptyToNull,
  decimalSchema.nullable().optional(),
);

const optionalDateSchema = z.preprocess(
  nullableEmptyToNull,
  z.coerce.date().nullable().optional(),
);

const createInsurancePolicySchema = z.object({
  name: z.string().trim().min(2),
  employeeSocialRate: decimalSchema,
  employeeHealthRate: decimalSchema,
  employeeUnemploymentRate: decimalSchema,
  employerSocialRate: optionalDecimalSchema,
  employerHealthRate: optionalDecimalSchema,
  employerUnemploymentRate: optionalDecimalSchema,
  effectiveFrom: z.coerce.date(),
  effectiveTo: optionalDateSchema,
  isActive: z.boolean().optional(),
});

const updateInsurancePolicySchema = createInsurancePolicySchema.partial();

const taxBracketSchema = z.object({
  fromAmount: decimalSchema,
  toAmount: optionalDecimalSchema,
  rate: decimalSchema,
});

const createTaxPolicySchema = z.object({
  name: z.string().trim().min(2),
  personalDeduction: decimalSchema,
  dependentDeduction: decimalSchema,
  effectiveFrom: z.coerce.date(),
  effectiveTo: optionalDateSchema,
  isActive: z.boolean().optional(),
  brackets: z.array(taxBracketSchema).min(1),
});

const updateTaxPolicySchema = createTaxPolicySchema.partial();

const createAttendanceBonusPolicySchema = z.object({
  name: z.string().trim().min(2),
  amount: decimalSchema,
  requiredWorkDays: optionalDecimalSchema,
  maxLateMinutes: z.preprocess(
    emptyToUndefined,
    z.number().int().min(0).nullable().optional(),
  ),
  maxEarlyMinutes: z.preprocess(
    emptyToUndefined,
    z.number().int().min(0).nullable().optional(),
  ),
  maxAbsentDays: optionalDecimalSchema,
  isActive: z.boolean().optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: optionalDateSchema,
});

const updateAttendanceBonusPolicySchema =
  createAttendanceBonusPolicySchema.partial();

const createAllowancePolicySchema = z.object({
  name: z.string().trim().min(2),
  description: z.preprocess(
    nullableEmptyToNull,
    z.string().trim().min(1).nullable().optional(),
  ),
  amount: decimalSchema,
  isActive: z.boolean().optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: optionalDateSchema,
});

const updateAllowancePolicySchema = createAllowancePolicySchema.partial();

const autoPenaltyTierSchema = z.object({
  fromOccurrence: z.number().int().min(1),
  toOccurrence: z.number().int().min(1).nullable().optional(),
  amount: decimalSchema,
});

const createAutoPenaltyPolicySchema = z.object({
  type: z.enum(AutoPenaltyType),
  name: z.string().trim().min(2),
  description: z.preprocess(
    nullableEmptyToNull,
    z.string().trim().min(1).nullable().optional(),
  ),
  amount: decimalSchema.optional(),
  isActive: z.boolean().optional(),
  tiers: z.array(autoPenaltyTierSchema).optional(),
});

const updateAutoPenaltyPolicySchema = createAutoPenaltyPolicySchema.partial();

const idArraySchema = z.array(z.string().uuid()).min(1).optional();

const assignPayrollPoliciesSchema = z.object({
  departmentIds: z.array(z.string().uuid()).min(1),
  positionIds: z.array(z.string().uuid()).min(1),
  insurancePolicyId: z.preprocess(
    nullableEmptyToNull,
    z.string().uuid().nullable().optional(),
  ),
  taxPolicyId: z.preprocess(
    nullableEmptyToNull,
    z.string().uuid().nullable().optional(),
  ),
  attendanceBonusPolicyId: z.preprocess(
    nullableEmptyToNull,
    z.string().uuid().nullable().optional(),
  ),
  isInsuranceApplicable: z.boolean().optional(),
  isTaxApplicable: z.boolean().optional(),
  isAttendanceBonusApplicable: z.boolean().optional(),
  insuranceSalary: optionalDecimalSchema,
  dependentCount: z.number().int().min(0).optional(),
  taxCode: z.preprocess(
    nullableEmptyToNull,
    z.string().trim().min(1).nullable().optional(),
  ),
});

const assignAllowancePolicySchema = z.object({
  allowancePolicyId: z.string().uuid(),
  departmentIds: z.array(z.string().uuid()).min(1),
  positionIds: z.array(z.string().uuid()).min(1),
});

const assignAutoPenaltyPolicySchema = z.object({
  autoPenaltyPolicyId: z.string().min(1),
  departmentIds: z.array(z.string().uuid()).min(1),
  positionIds: z.array(z.string().uuid()).min(1),
});

const createPayrollBonusPenaltySchema = z.object({
  employeeId: z.string().uuid(),
  month: z.coerce.date(),
  amount: decimalSchema,
  isBonus: z.boolean().optional(),
  reason: z.preprocess(
    nullableEmptyToNull,
    z.string().trim().min(1).nullable().optional(),
  ),
});

const updatePayrollBonusPenaltySchema =
  createPayrollBonusPenaltySchema.partial();

const canViewPayrollPolicies = [
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(
    PERMISSIONS.PAYROLL_POLICY_VIEW,
    PERMISSIONS.PAYROLL_POLICY_SETUP,
  ),
];

const canSetupPayrollPolicies = [
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.PAYROLL_POLICY_SETUP),
];

router.get(
  "/insurance",
  ...canViewPayrollPolicies,
  payrollPolicyController.getInsurancePolicies,
);
router.get(
  "/insurance/:id",
  ...canViewPayrollPolicies,
  payrollPolicyController.getInsurancePolicyById,
);
router.post(
  "/insurance",
  ...canSetupPayrollPolicies,
  validate(createInsurancePolicySchema),
  payrollPolicyController.createInsurancePolicy,
);
router.put(
  "/insurance/:id",
  ...canSetupPayrollPolicies,
  validate(updateInsurancePolicySchema),
  payrollPolicyController.updateInsurancePolicy,
);
router.delete(
  "/insurance/:id",
  ...canSetupPayrollPolicies,
  payrollPolicyController.deleteInsurancePolicy,
);

router.get(
  "/tax",
  ...canViewPayrollPolicies,
  payrollPolicyController.getTaxPolicies,
);
router.get(
  "/tax/:id",
  ...canViewPayrollPolicies,
  payrollPolicyController.getTaxPolicyById,
);
router.post(
  "/tax",
  ...canSetupPayrollPolicies,
  validate(createTaxPolicySchema),
  payrollPolicyController.createTaxPolicy,
);
router.put(
  "/tax/:id",
  ...canSetupPayrollPolicies,
  validate(updateTaxPolicySchema),
  payrollPolicyController.updateTaxPolicy,
);
router.delete(
  "/tax/:id",
  ...canSetupPayrollPolicies,
  payrollPolicyController.deleteTaxPolicy,
);

router.get(
  "/attendance-bonus",
  ...canViewPayrollPolicies,
  payrollPolicyController.getAttendanceBonusPolicies,
);
router.get(
  "/attendance-bonus/:id",
  ...canViewPayrollPolicies,
  payrollPolicyController.getAttendanceBonusPolicyById,
);
router.post(
  "/attendance-bonus",
  ...canSetupPayrollPolicies,
  validate(createAttendanceBonusPolicySchema),
  payrollPolicyController.createAttendanceBonusPolicy,
);
router.put(
  "/attendance-bonus/:id",
  ...canSetupPayrollPolicies,
  validate(updateAttendanceBonusPolicySchema),
  payrollPolicyController.updateAttendanceBonusPolicy,
);
router.delete(
  "/attendance-bonus/:id",
  ...canSetupPayrollPolicies,
  payrollPolicyController.deleteAttendanceBonusPolicy,
);

router.get(
  "/allowances",
  ...canViewPayrollPolicies,
  payrollPolicyController.getAllowancePolicies,
);
router.get(
  "/allowances/assignments",
  ...canViewPayrollPolicies,
  payrollPolicyController.getAllowanceAssignments,
);
router.get(
  "/allowances/:id",
  ...canViewPayrollPolicies,
  payrollPolicyController.getAllowancePolicyById,
);
router.post(
  "/allowances",
  ...canSetupPayrollPolicies,
  validate(createAllowancePolicySchema),
  payrollPolicyController.createAllowancePolicy,
);
router.put(
  "/allowances/:id",
  ...canSetupPayrollPolicies,
  validate(updateAllowancePolicySchema),
  payrollPolicyController.updateAllowancePolicy,
);
router.delete(
  "/allowances/:id",
  ...canSetupPayrollPolicies,
  payrollPolicyController.deleteAllowancePolicy,
);
router.post(
  "/allowances/assign",
  ...canSetupPayrollPolicies,
  validate(assignAllowancePolicySchema),
  payrollPolicyController.assignAllowancePolicy,
);

router.get(
  "/auto-penalties",
  ...canViewPayrollPolicies,
  payrollPolicyController.getAutoPenaltyPolicies,
);
router.get(
  "/auto-penalties/assignments",
  ...canViewPayrollPolicies,
  payrollPolicyController.getAutoPenaltyAssignments,
);
router.get(
  "/auto-penalties/:id",
  ...canViewPayrollPolicies,
  payrollPolicyController.getAutoPenaltyPolicyById,
);
router.post(
  "/auto-penalties",
  ...canSetupPayrollPolicies,
  validate(createAutoPenaltyPolicySchema),
  payrollPolicyController.createAutoPenaltyPolicy,
);
router.put(
  "/auto-penalties/:id",
  ...canSetupPayrollPolicies,
  validate(updateAutoPenaltyPolicySchema),
  payrollPolicyController.updateAutoPenaltyPolicy,
);
router.delete(
  "/auto-penalties/:id",
  ...canSetupPayrollPolicies,
  payrollPolicyController.deleteAutoPenaltyPolicy,
);
router.post(
  "/auto-penalties/assign",
  ...canSetupPayrollPolicies,
  validate(assignAutoPenaltyPolicySchema),
  payrollPolicyController.assignAutoPenaltyPolicy,
);

router.get(
  "/bonus-penalties",
  ...canViewPayrollPolicies,
  payrollPolicyController.getPayrollBonusPenalties,
);
router.get(
  "/bonus-penalties/:id",
  ...canViewPayrollPolicies,
  payrollPolicyController.getPayrollBonusPenaltyById,
);
router.post(
  "/bonus-penalties",
  ...canSetupPayrollPolicies,
  validate(createPayrollBonusPenaltySchema),
  payrollPolicyController.createPayrollBonusPenalty,
);
router.put(
  "/bonus-penalties/:id",
  ...canSetupPayrollPolicies,
  validate(updatePayrollBonusPenaltySchema),
  payrollPolicyController.updatePayrollBonusPenalty,
);
router.delete(
  "/bonus-penalties/:id",
  ...canSetupPayrollPolicies,
  payrollPolicyController.deletePayrollBonusPenalty,
);

router.get(
  "/profiles",
  ...canViewPayrollPolicies,
  payrollPolicyController.getPayrollProfiles,
);
router.get(
  "/profiles/employees/:employeeId",
  ...canViewPayrollPolicies,
  payrollPolicyController.getPayrollProfileByEmployeeId,
);
router.post(
  "/assign",
  ...canSetupPayrollPolicies,
  validate(assignPayrollPoliciesSchema),
  payrollPolicyController.assignPayrollPolicies,
);

export default router;
