import type { EmployeeOption } from "../../employees/types/employee.types";
import type { ApprovalMode } from "../../requests/types/request.types";

export type PayrollStatus =
  | "DRAFT"
  | "WAITING_APPROVAL"
  | "APPROVED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED";

export type PayrollPeriodStatus =
  | "DRAFT"
  | "WAITING_APPROVAL"
  | "APPROVED"
  | "CANCELLED";

export type PayrollPaymentMode = "AMOUNT" | "PERCENT" | "REMAINING";

export type PayrollEmployee = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  departmentId?: string | null;
  positionId?: string | null;
  department?: EmployeeOption | null;
  position?: EmployeeOption | null;
  payrollProfile?: {
    isInsuranceApplicable: boolean;
    isTaxApplicable: boolean;
    insuranceSalary?: MoneyValue | null;
    dependentCount: number;
    insurancePolicy?: {
      id: string;
      name: string;
      employeeSocialRate: MoneyValue;
      employeeHealthRate: MoneyValue;
      employeeUnemploymentRate: MoneyValue;
    } | null;
    taxPolicy?: {
      id: string;
      name: string;
      personalDeduction: MoneyValue;
      dependentDeduction: MoneyValue;
      brackets: Array<{
        id: string;
        fromAmount: MoneyValue;
        toAmount?: MoneyValue | null;
        rate: MoneyValue;
      }>;
    } | null;
  } | null;
};

export type MoneyValue = string | number;

export type PayrollSummary = {
  id: string;
  periodId?: string;
  employeeId: string;
  employee?: PayrollEmployee | null;
  period?: PayrollPeriod | null;
  month: number;
  year: number;
  baseSalary: MoneyValue;
  standardWorkDays: MoneyValue;
  actualWorkDays: MoneyValue;
  actualSalary: MoneyValue;
  holidayWorkDays: MoneyValue;
  holidayPay: MoneyValue;
  totalOvertimeWorkDays: MoneyValue;
  totalOvertimeHours: MoneyValue;
  totalOvertimePay: MoneyValue;
  totalAllowance: MoneyValue;
  totalBonus: MoneyValue;
  totalPenalty: MoneyValue;
  socialInsurance: MoneyValue;
  healthInsurance: MoneyValue;
  unemploymentInsurance: MoneyValue;
  personalIncomeTax: MoneyValue;
  grossSalary: MoneyValue;
  totalDeduction: MoneyValue;
  netSalary: MoneyValue;
  paidAmount?: MoneyValue;
  remainingAmount?: MoneyValue;
  status: PayrollStatus;
  generatedAt?: string;
  approvedAt?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PayrollPeriod = {
  id: string;
  name?: string | null;
  month: number;
  year: number;
  status: PayrollPeriodStatus;
  requestedAt?: string | null;
  approvedAt?: string | null;
  cancelledAt?: string | null;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    payrolls: number;
    paymentBatches: number;
  };
};

export type PayrollPeriodOverview = {
  period: PayrollPeriod;
  month: number;
  year: number;
  totalEmployees: number;
  statusCounts: Partial<Record<PayrollStatus, number>>;
  summary: {
    grossSalary: MoneyValue;
    totalDeduction: MoneyValue;
    netSalary: MoneyValue;
    paidAmount: MoneyValue;
    remainingAmount: MoneyValue;
  };
  payrolls: PayrollSummary[];
};

export type RequestPayrollApprovalPayload = {
  title?: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

export type PayrollOvertimeLine = {
  id: string;
  workShiftId?: string | null;
  workShiftCode?: string | null;
  workShiftName: string;
  workDays: MoneyValue;
  hours: MoneyValue;
  baseDailyRate: MoneyValue;
  multiplier: MoneyValue;
  amount: MoneyValue;
};

export type PayrollAllowanceLine = {
  id: string;
  allowancePolicyId?: string | null;
  allowanceName: string;
  amount: MoneyValue;
};

export type PayrollBonusPenaltyLine = {
  id: string;
  payrollBonusPenaltyId?: string | null;
  autoPenaltyPolicyId?: string | null;
  isBonus: boolean;
  reason?: string | null;
  amount: MoneyValue;
  autoPenaltyPolicy?: {
    id: string;
    type: string;
    name: string;
  } | null;
  payrollBonusPenalty?: {
    id: string;
    month: string;
    isBonus: boolean;
    reason?: string | null;
    amount: MoneyValue;
  } | null;
};

export type PayrollDetail = PayrollSummary & {
  overtimeLines: PayrollOvertimeLine[];
  allowanceLines: PayrollAllowanceLine[];
  bonusPenaltyLines: PayrollBonusPenaltyLine[];
};

export type PayrollQuery = {
  periodId?: string;
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
  month?: number;
  year?: number;
  status?: PayrollStatus | "";
};

export type CreatePayrollPayload = {
  employeeId: string;
  periodId?: string;
  month?: number;
  year?: number;
};

export type CreatePayrollByTargetsPayload = {
  periodId?: string;
  month?: number;
  year?: number;
  periodName?: string | null;
  note?: string | null;
  departmentIds: string[];
  positionIds: string[];
  skipExisting?: boolean;
};

export type CreatePayrollByTargetsResult = {
  createdCount: number;
  updatedCount?: number;
  skippedCount: number;
  payrolls: PayrollSummary[];
};

export type PayrollCalculationJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type PayrollCalculationJob = {
  id: string;
  periodId: string;
  requestedById?: string | null;
  status: PayrollCalculationJobStatus;
  targetDepartmentIds: string[];
  targetPositionIds: string[];
  skipExisting: boolean;
  totalEmployees: number;
  processedCount: number;
  failedCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorMessage?: string | null;
  errors?: Array<{ employeeId?: string; message: string }> | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  period?: PayrollPeriod | null;
};

export type CreatePayrollPaymentBatchPayload = {
  periodId?: string;
  month?: number;
  year?: number;
  employeeIds: string[];
  mode: PayrollPaymentMode;
  amount?: MoneyValue;
  percent?: MoneyValue;
  paymentDate?: string;
  note?: string | null;
};

export type PayrollPayment = {
  id: string;
  batchId: string;
  payrollId: string;
  employeeId: string;
  mode: PayrollPaymentMode;
  requestedAmount?: MoneyValue | null;
  requestedPercent?: MoneyValue | null;
  amount: MoneyValue;
  remainingBefore: MoneyValue;
  remainingAfter: MoneyValue;
  payrollNetSalary: MoneyValue;
  payrollPaidBefore: MoneyValue;
  paymentDate: string;
  note?: string | null;
  payroll?: PayrollSummary | null;
  employee?: PayrollEmployee | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PayrollPaymentBatch = {
  id: string;
  periodId: string;
  month: number;
  year: number;
  mode: PayrollPaymentMode;
  amount?: MoneyValue | null;
  percent?: MoneyValue | null;
  totalAmount: MoneyValue;
  paymentDate: string;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
  payments: PayrollPayment[];
};
