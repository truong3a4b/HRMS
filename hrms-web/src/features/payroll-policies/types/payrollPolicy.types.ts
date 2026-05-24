import type { Department } from "../../departments/types/department.types";
import type { Employee, EmployeeOption } from "../../employees/types/employee.types";
import type { Position } from "../../positions/types/position.types";

export type PolicyStatusFilter = "all" | "active" | "inactive";

export type InsurancePolicy = {
  id: string;
  name: string;
  employeeSocialRate: string | number;
  employeeHealthRate: string | number;
  employeeUnemploymentRate: string | number;
  employerSocialRate?: string | number | null;
  employerHealthRate?: string | number | null;
  employerUnemploymentRate?: string | number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type InsurancePolicyPayload = Omit<
  InsurancePolicy,
  "id" | "createdAt" | "updatedAt"
>;

export type TaxBracket = {
  id?: string;
  fromAmount: string | number;
  toAmount?: string | number | null;
  rate: string | number;
};

export type TaxPolicy = {
  id: string;
  name: string;
  personalDeduction: string | number;
  dependentDeduction: string | number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  brackets: TaxBracket[];
  createdAt?: string;
  updatedAt?: string;
};

export type TaxPolicyPayload = Omit<TaxPolicy, "id" | "createdAt" | "updatedAt">;

export type AttendanceBonusPolicy = {
  id: string;
  name: string;
  amount: string | number;
  requiredWorkDays?: string | number | null;
  maxLateMinutes?: number | null;
  maxEarlyMinutes?: number | null;
  maxAbsentDays?: string | number | null;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AttendanceBonusPolicyPayload = Omit<
  AttendanceBonusPolicy,
  "id" | "createdAt" | "updatedAt"
>;

export type AllowancePolicy = {
  id: string;
  name: string;
  description?: string | null;
  amount: string | number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AllowancePolicyPayload = Omit<
  AllowancePolicy,
  "id" | "createdAt" | "updatedAt"
>;

export type AutoPenaltyType =
  | "LATE_EARLY"
  | "UNAUTHORIZED_ABSENCE"
  | "UNAUTHORIZED_ABSENCE_PROGRESSIVE"
  | "LATE_EARLY_PROGRESSIVE";

export type AutoPenaltyTier = {
  id?: string;
  fromOccurrence: number;
  toOccurrence?: number | null;
  amount: string | number;
};

export type AutoPenaltyPolicy = {
  id: string;
  type: AutoPenaltyType;
  name: string;
  description?: string | null;
  amount: string | number;
  isActive: boolean;
  tiers?: AutoPenaltyTier[];
  effectiveFrom?: string;
  effectiveTo?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AutoPenaltyPolicyPayload = {
  type: AutoPenaltyType;
  name: string;
  description?: string | null;
  amount?: string | number;
  isActive?: boolean;
  tiers?: AutoPenaltyTier[];
};

export type PayrollProfile = {
  id: string;
  employeeId: string;
  employee?: Employee | null;
  insurancePolicy?: InsurancePolicy | null;
  taxPolicy?: TaxPolicy | null;
  attendanceBonusPolicy?: AttendanceBonusPolicy | null;
  insurancePolicyId?: string | null;
  taxPolicyId?: string | null;
  attendanceBonusPolicyId?: string | null;
  isInsuranceApplicable: boolean;
  isTaxApplicable: boolean;
  isAttendanceBonusApplicable: boolean;
  insuranceSalary?: string | number | null;
  dependentCount: number;
  taxCode?: string | null;
};

export type EmployeeAllowance = {
  id: string;
  employeeId: string;
  allowancePolicyId: string;
  employee?: Employee | null;
  allowancePolicy?: AllowancePolicy | null;
  createdAt?: string;
};

export type AssignmentPayload = {
  employeeIds?: string[];
  departmentIds?: string[];
  positionIds?: string[];
};

export type PayrollPolicyAssignmentPayload = AssignmentPayload & {
  insurancePolicyId?: string | null;
  taxPolicyId?: string | null;
  attendanceBonusPolicyId?: string | null;
  isInsuranceApplicable?: boolean;
  isTaxApplicable?: boolean;
  isAttendanceBonusApplicable?: boolean;
  insuranceSalary?: string | number | null;
  dependentCount?: number;
  taxCode?: string | null;
};

export type AllowanceAssignmentPayload = AssignmentPayload & {
  allowancePolicyId: string;
};

export type AutoPenaltyAssignmentPayload = AssignmentPayload & {
  autoPenaltyPolicyId: string;
};

export type EmployeeAutoPenaltyPolicy = {
  id: string;
  employeeId: string;
  autoPenaltyPolicyId: string;
  employee?: Employee | null;
  autoPenaltyPolicy?: AutoPenaltyPolicy | null;
  createdAt?: string;
};

export type PayrollBonusPenaltyStatus = "ACTIVE" | "CANCELLED";
export type PayrollBonusPenaltySource = "MANUAL" | "AUTO";

export type PayrollBonusPenalty = {
  id: string;
  employeeId: string;
  month: string;
  autoPenaltyPolicyId?: string | null;
  amount: string | number;
  isBonus: boolean;
  reason?: string | null;
  source: PayrollBonusPenaltySource;
  status: PayrollBonusPenaltyStatus;
  violationCount?: number | null;
  cancelledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  employee?: Employee | null;
  autoPenaltyPolicy?: AutoPenaltyPolicy | null;
};

export type PayrollBonusPenaltyPayload = {
  employeeId: string;
  month: string;
  amount: string | number;
  isBonus?: boolean;
  reason?: string | null;
  status?: PayrollBonusPenaltyStatus;
};

export type PayrollPolicyOptions = {
  departments: Department[];
  positions: Position[] | EmployeeOption[];
};
