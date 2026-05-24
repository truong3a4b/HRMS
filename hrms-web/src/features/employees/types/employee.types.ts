export type EmployeeStatus = "WORKING" | "ON_LEAVE" | "RESIGNED";

export type EmployeeOption = {
  id: string;
  name: string;
};

export type UpdateEmployeeAdditionalPayload = {
  maritalStatus?: string | null;
  nationality?: string | null;
  religion?: string | null;
  identityCardNumber?: string | null;
  identityCardIssueDate?: string | null;
  frontIdentityCardImageFile?: File | null;
  frontIdentityCardImage?: string | null;
  backIdentityCardImageFile?: File | null;
  backIdentityCardImage?: string | null;
};

export type UpdateEmployeeBasicPayload = {
  name?: string;
  phone?: string | null;
  avatarFile?: File | null;
  avatar?: string | null;
  dateOfBirth?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  address?: string | null;
  bankAccount?: string | null;
  bank?: EmployeeOption | Record<string, unknown> | null;
  province?: EmployeeOption | Record<string, unknown> | null;
  ward?: EmployeeOption | Record<string, unknown> | null;
};

export type TaxBracket = {
  id?: string;
  fromAmount: string | number;
  toAmount?: string | number | null;
  rate: string | number;
};

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
};

export type TaxPolicy = {
  id: string;
  name: string;
  personalDeduction: string | number;
  dependentDeduction: string | number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  brackets?: TaxBracket[];
};

export type AttendanceBonusPolicy = {
  id: string;
  name: string;
  amount: string | number;
  requiredWorkDays?: string | number | null;
  maxLateMinutes?: number | null;
  maxEarlyMinutes?: number | null;
  maxAbsentDays?: string | number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};

export type AllowancePolicy = {
  id: string;
  name: string;
  description?: string | null;
  amount: string | number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};

export type AutoPenaltyPolicy = {
  id: string;
  type:
    | "LATE_EARLY"
    | "UNAUTHORIZED_ABSENCE"
    | "UNAUTHORIZED_ABSENCE_PROGRESSIVE"
    | "LATE_EARLY_PROGRESSIVE";
  name: string;
  description?: string | null;
  amount: string | number;
  isActive: boolean;
  tiers?: Array<{
    id?: string;
    fromOccurrence: number;
    toOccurrence?: number | null;
    amount: string | number;
  }>;
};

export type EmployeePayrollProfile = {
  id: string;
  employeeId: string;
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
  allowancePolicy?: AllowancePolicy | null;
};

export type EmployeeAutoPenaltyPolicy = {
  id: string;
  employeeId: string;
  autoPenaltyPolicyId: string;
  autoPenaltyPolicy?: AutoPenaltyPolicy | null;
};

export type EmployeeJobHistory = {
  id: string;
  employeeId: string;
  departmentId?: string | null;
  positionId?: string | null;
  hireDate?: string | null;
  salary?: string | number | null;
  status: EmployeeStatus;
  effectiveFrom: string;
  effectiveTo?: string | null;
  createdAt?: string;
  department?: EmployeeOption | null;
  position?: EmployeeOption | null;
};

export type Employee = {
  id: string;
  employeeId: string;
  user?: {
    id: string;
    email: string;
    role?: string;
  } | null;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  status: EmployeeStatus;
  dateOfBirth?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  address?: string | null;
  bankAccount?: string | null;
  bank?: EmployeeOption | Record<string, unknown> | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  religion?: string | null;
  identityCardNumber?: string | null;
  identityCardIssueDate?: string | null;
  frontIdentityCardImage?: string | null;
  backIdentityCardImage?: string | null;
  province?: EmployeeOption | Record<string, unknown> | null;
  ward?: EmployeeOption | Record<string, unknown> | null;
  department?: EmployeeOption | null;
  position?: EmployeeOption | null;
  departmentId?: string | null;
  positionId?: string | null;
  hireDate?: string | null;
  salary?: string | number | null;
  payrollProfile?: EmployeePayrollProfile | null;
  allowances?: EmployeeAllowance[];
  autoPenaltyPolicies?: EmployeeAutoPenaltyPolicy[];
};

export type EmployeeFilters = {
  search?: string;
  departmentId?: string;
  positionId?: string;
  status?: EmployeeStatus;
  page: number;
  limit: number;
};

export type EmployeeListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type EmployeeListData = {
  items: Employee[];
  meta: EmployeeListMeta;
};

export type CreateEmployeePayload = {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  bankAccount?: string;
  departmentId: string;
  positionId: string;
  hireDate: string;
  salary: number;
};

export type UpdateEmployeeJobPayload = {
  departmentId: string;
  positionId: string;
  hireDate: string;
  salary: number;
  status: EmployeeStatus;
  effectiveFrom: string;
};
