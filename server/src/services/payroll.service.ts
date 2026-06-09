import {
  AutoPenaltyType,
  ApprovalMode,
  AttendanceStatus,
  PayrollBonusPenaltySource,
  PayrollBonusPenaltyStatus,
  PayrollPaymentMode,
  PayrollPeriodStatus,
  PayrollStatus,
  Prisma,
  RequestStatus,
  RequestType,
  UserRole,
} from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { PERMISSIONS, PermissionKey } from "../constants/permissions";
import { ApiError } from "../utils/apiError";
import {
  getInitialRequestRecipientIds,
  notifyRequestWorkflow,
} from "./request-notification.service";

type DecimalInput = string | number;

type AuthUser = {
  id: string;
  role: UserRole;
  employeeId?: string;
  permissions: PermissionKey[];
};

type PayrollLineInput = {
  workShiftId?: string | null;
  workShiftCode?: string | null;
  workShiftName: string;
  workDays?: DecimalInput;
  hours?: DecimalInput;
  baseDailyRate?: DecimalInput;
  multiplier?: DecimalInput;
  amount?: DecimalInput;
};

type AllowanceLineInput = {
  allowancePolicyId?: string | null;
  allowanceName: string;
  amount?: DecimalInput;
};

type BonusPenaltyLineInput = {
  payrollBonusPenaltyId?: string | null;
  autoPenaltyPolicyId?: string | null;
  isBonus?: boolean;
  reason?: string | null;
  amount?: DecimalInput;
};

type CreatePayrollInput = {
  employeeId: string;
  month?: number;
  year?: number;
  periodId?: string;
};

type PayrollCalculationResult = Omit<CreatePayrollInput, "month" | "year"> & {
  month: number;
  year: number;
  baseSalary?: DecimalInput;
  standardWorkDays?: DecimalInput;
  actualWorkDays?: DecimalInput;
  actualSalary?: DecimalInput;
  holidayWorkDays?: DecimalInput;
  holidayPay?: DecimalInput;
  totalOvertimeWorkDays?: DecimalInput;
  totalOvertimeHours?: DecimalInput;
  totalOvertimePay?: DecimalInput;
  totalAllowance?: DecimalInput;
  totalBonus?: DecimalInput;
  totalPenalty?: DecimalInput;
  socialInsurance?: DecimalInput;
  healthInsurance?: DecimalInput;
  unemploymentInsurance?: DecimalInput;
  personalIncomeTax?: DecimalInput;
  grossSalary?: DecimalInput;
  totalDeduction?: DecimalInput;
  netSalary?: DecimalInput;
  overtimeLines?: PayrollLineInput[];
  allowanceLines?: AllowanceLineInput[];
  bonusPenaltyLines?: BonusPenaltyLineInput[];
};

type UpdatePayrollInput = Partial<PayrollCalculationResult>;

type CreatePayrollByTargetsInput = {
  month?: number;
  year?: number;
  periodId?: string;
  periodName?: string | null;
  note?: string | null;
  departmentIds: string[];
  positionIds: string[];
  skipExisting?: boolean;
};

type CreatePayrollPaymentBatchInput = {
  periodId?: string;
  month?: number;
  year?: number;
  employeeIds: string[];
  mode: PayrollPaymentMode;
  amount?: DecimalInput;
  percent?: DecimalInput;
  paymentDate?: Date | string;
  note?: string | null;
};

type PayrollQuery = {
  periodId?: string;
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
  month?: number;
  year?: number;
  status?: PayrollStatus;
};

const payrollEmployeeSelect = {
  id: true,
  employeeId: true,
  name: true,
  email: true,
  departmentId: true,
  positionId: true,
  department: {
    select: {
      id: true,
      name: true,
    },
  },
  position: {
    select: {
      id: true,
      name: true,
    },
  },
};

const payrollListSelect = {
  id: true,
  periodId: true,
  employeeId: true,
  month: true,
  year: true,
  baseSalary: true,
  standardWorkDays: true,
  actualWorkDays: true,
  actualSalary: true,
  holidayWorkDays: true,
  holidayPay: true,
  totalOvertimeWorkDays: true,
  totalOvertimeHours: true,
  totalOvertimePay: true,
  totalAllowance: true,
  totalBonus: true,
  totalPenalty: true,
  socialInsurance: true,
  healthInsurance: true,
  unemploymentInsurance: true,
  personalIncomeTax: true,
  grossSalary: true,
  totalDeduction: true,
  netSalary: true,
  paidAmount: true,
  status: true,
  generatedAt: true,
  approvedAt: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
  employee: {
    select: payrollEmployeeSelect,
  },
  period: {
    select: {
      id: true,
      name: true,
      month: true,
      year: true,
      status: true,
    },
  },
};

const payrollOverviewSelect = {
  id: true,
  periodId: true,
  employeeId: true,
  month: true,
  year: true,
  baseSalary: true,
  standardWorkDays: true,
  actualWorkDays: true,
  actualSalary: true,
  holidayWorkDays: true,
  holidayPay: true,
  totalOvertimeWorkDays: true,
  totalOvertimeHours: true,
  totalOvertimePay: true,
  totalAllowance: true,
  totalBonus: true,
  totalPenalty: true,
  socialInsurance: true,
  healthInsurance: true,
  unemploymentInsurance: true,
  personalIncomeTax: true,
  grossSalary: true,
  totalDeduction: true,
  netSalary: true,
  paidAmount: true,
  status: true,
  generatedAt: true,
  approvedAt: true,
  paidAt: true,
  employee: {
    select: payrollEmployeeSelect,
  },
};

const payrollDetailInclude = {
  period: {
    select: {
      id: true,
      name: true,
      month: true,
      year: true,
      status: true,
      requestedAt: true,
      approvedAt: true,
      cancelledAt: true,
      note: true,
    },
  },
  employee: {
    select: {
      ...payrollEmployeeSelect,
      payrollProfile: {
        select: {
          isInsuranceApplicable: true,
          isTaxApplicable: true,
          insuranceSalary: true,
          dependentCount: true,
          insurancePolicy: {
            select: {
              id: true,
              name: true,
              employeeSocialRate: true,
              employeeHealthRate: true,
              employeeUnemploymentRate: true,
            },
          },
          taxPolicy: {
            select: {
              id: true,
              name: true,
              personalDeduction: true,
              dependentDeduction: true,
              brackets: {
                select: {
                  id: true,
                  fromAmount: true,
                  toAmount: true,
                  rate: true,
                },
                orderBy: { fromAmount: "asc" as const },
              },
            },
          },
        },
      },
    },
  },
  overtimeLines: {
    select: {
      id: true,
      payrollId: true,
      workShiftId: true,
      workShiftCode: true,
      workShiftName: true,
      workDays: true,
      hours: true,
      baseDailyRate: true,
      multiplier: true,
      amount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
  allowanceLines: {
    select: {
      id: true,
      payrollId: true,
      allowancePolicyId: true,
      allowanceName: true,
      amount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
  bonusPenaltyLines: {
    select: {
      id: true,
      payrollId: true,
      payrollBonusPenaltyId: true,
      autoPenaltyPolicyId: true,
      isBonus: true,
      reason: true,
      amount: true,
      createdAt: true,
      updatedAt: true,
      autoPenaltyPolicy: {
        select: {
          id: true,
          type: true,
          name: true,
        },
      },
      payrollBonusPenalty: {
        select: {
          id: true,
          month: true,
          isBonus: true,
          reason: true,
          amount: true,
          source: true,
          status: true,
          violationCount: true,
          autoPenaltyPolicyId: true,
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
  payments: {
    select: {
      id: true,
      batchId: true,
      employeeId: true,
      mode: true,
      requestedAmount: true,
      requestedPercent: true,
      amount: true,
      remainingBefore: true,
      remainingAfter: true,
      payrollNetSalary: true,
      payrollPaidBefore: true,
      paymentDate: true,
      note: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { paymentDate: "desc" as const },
  },
};

type PayrollPaymentBatchQuery = {
  periodId?: string;
  month?: number;
  year?: number;
  employeeId?: string;
};

type PayrollPeriodInput = {
  month?: number;
  year?: number;
  periodId?: string;
};

type PayrollApprovalRequestInput = {
  title?: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

type PayrollPeriodEmployeeInput = PayrollPeriodInput & {
  employeeId: string;
};

const hasAnyPermission = (user: AuthUser, permissions: PermissionKey[]) =>
  user.role === UserRole.ADMIN ||
  permissions.some((permission) => user.permissions.includes(permission));

const canViewAllPayrolls = (user: AuthUser) =>
  hasAnyPermission(user, [
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.PAYROLL_MANAGE,
    PERMISSIONS.PAYROLL_APPROVE,
    PERMISSIONS.PAYROLL_PAY,
  ]);

const canViewOwnPayrolls = (user: AuthUser) =>
  user.role === UserRole.EMPLOYEE ||
  hasAnyPermission(user, [PERMISSIONS.PAYROLL_VIEW_SELF]);

const employeeVisibleStatuses: PayrollStatus[] = [
  PayrollStatus.APPROVED,
  PayrollStatus.PARTIALLY_PAID,
  PayrollStatus.PAID,
];

const requirePermission = (user: AuthUser, permissions: PermissionKey[]) => {
  if (!hasAnyPermission(user, permissions)) {
    throw new ApiError(403, "Forbidden", "FORBIDDEN");
  }
};

const normalizeIds = (values: string[] = []) => [
  ...new Set(values.map((value) => value.trim()).filter(Boolean)),
];

const attendedStatuses = new Set<AttendanceStatus>([
  AttendanceStatus.PRESENT,
  AttendanceStatus.LATE,
  AttendanceStatus.EARLY_LEAVE,
  AttendanceStatus.LATE_AND_EARLY_LEAVE,
]);

const leaveStatuses = new Set<AttendanceStatus>([
  AttendanceStatus.ON_LEAVE,
  AttendanceStatus.PAID_LEAVE,
  AttendanceStatus.UNPAID_LEAVE,
]);
const paidWorkStatuses = new Set<AttendanceStatus>([
  ...attendedStatuses,
  AttendanceStatus.PAID_LEAVE,
]);
const activeLeaveRequestStatuses = [
  RequestStatus.PENDING,
  RequestStatus.PROCESSING,
  RequestStatus.APPROVED,
];

const toNumber = (value: unknown) => Number(value ?? 0);

//Hàm lấy số ngày công làm thêm từ chi tiết chấm công, ưu tiên lấy số ngày công làm thêm riêng nếu có, nếu không có thì lấy theo ca làm việc của lịch làm việc đã lên kế hoạch
const getDetailWorkUnits = (detail: {
  shiftWorkUnits: Prisma.Decimal | null;
  workShift: { workUnits: Prisma.Decimal };
}) => toNumber(detail.shiftWorkUnits ?? detail.workShift.workUnits);

const getDetailOvertimeMultiplier = (detail: {
  shiftOvertimeMultiplier: Prisma.Decimal | null;
  workShift: { overtimeMultiplier: Prisma.Decimal };
}) =>
  toNumber(
    detail.shiftOvertimeMultiplier ?? detail.workShift.overtimeMultiplier,
  );

const isDetailOvertime = (detail: {
  shiftIsOvertime: boolean;
  workShift: { isOvertime: boolean };
}) => detail.shiftIsOvertime || detail.workShift.isOvertime;

const roundMoney = (value: number) => Math.round(value);

const roundWork = (value: number) => Math.round(value * 100) / 100;

const payablePayrollStatuses = new Set<PayrollStatus>([
  PayrollStatus.APPROVED,
  PayrollStatus.PARTIALLY_PAID,
]);

const getMonthRange = (month: number, year: number) => ({
  start: new Date(Date.UTC(year, month - 1, 1)),
  end: new Date(Date.UTC(year, month, 1)),
});

const toUtcDateOnly = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

const addUtcDays = (date: Date, days: number) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
    ),
  );

const isEffectiveInMonth = (
  effectiveFrom: Date,
  effectiveTo: Date | null,
  monthStart: Date,
  monthEnd: Date,
) => effectiveFrom < monthEnd && (!effectiveTo || effectiveTo >= monthStart);

const getShiftHours = (start: Date, end: Date) => {
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return hours > 0 ? hours : 0;
};

const getPositiveMinutes = (start: Date, end: Date) =>
  Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60)));

const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

const buildLeaveCoverage = async (
  employeeId: string,
  start: Date,
  end: Date,
) => {
  const leaveRequests = await prisma.leaveRequest.findMany({
    where: {
      startDate: { lt: end },
      endDate: { gte: start },
      request: {
        status: { in: activeLeaveRequestStatuses },
        requester: {
          employee: {
            id: employeeId,
          },
        },
      },
    },
    select: {
      startDate: true,
      endDate: true,
      workShiftId: true,
    },
  });
  const coverage = new Map<string, Set<string | null>>();

  for (const leaveRequest of leaveRequests) {
    for (
      let date = toUtcDateOnly(leaveRequest.startDate);
      date.getTime() <= toUtcDateOnly(leaveRequest.endDate).getTime();
      date = addUtcDays(date, 1)
    ) {
      if (date < start || date >= end) {
        continue;
      }

      const dateKey = getDateKey(date);
      coverage.set(dateKey, coverage.get(dateKey) ?? new Set<string | null>());
      coverage.get(dateKey)?.add(leaveRequest.workShiftId);
    }
  }

  return coverage;
};

const hasLeaveCoverage = (
  coverage: Map<string, Set<string | null>>,
  date: Date,
  workShiftId: string,
) => {
  const coveredShiftIds = coverage.get(getDateKey(date));

  return Boolean(
    coveredShiftIds &&
      (coveredShiftIds.has(null) || coveredShiftIds.has(workShiftId)),
  );
};

const getShiftViolationLabel = (shift: {
  workShiftCode?: string | null;
  workShiftName?: string | null;
  workShift?: { code?: string | null; name?: string | null };
}) => {
  const code = shift.workShiftCode ?? shift.workShift?.code;
  const name = shift.workShiftName ?? shift.workShift?.name;

  return [code, name].filter(Boolean).join(" - ") || "Khong ro ca";
};

const sortViolationItems = <
  T extends { occurredAt: Date; workShiftName: string; detail: string },
>(
  items: T[],
) =>
  [...items].sort((first, second) => {
    const timeDiff = first.occurredAt.getTime() - second.occurredAt.getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }

    const shiftDiff = first.workShiftName.localeCompare(second.workShiftName);
    if (shiftDiff !== 0) {
      return shiftDiff;
    }

    return first.detail.localeCompare(second.detail);
  });

const isSameOrAfterDate = (date: Date, compare: Date) =>
  getDateKey(date) >= getDateKey(compare);

const isBeforeDate = (date: Date, compare: Date) =>
  getDateKey(date) < getDateKey(compare);

const isJobHistoryActiveOnDate = (
  date: Date,
  history: { effectiveFrom: Date; effectiveTo: Date | null },
) =>
  isSameOrAfterDate(date, history.effectiveFrom) &&
  (!history.effectiveTo || isBeforeDate(date, history.effectiveTo));

const getJobHistoryForDate = <
  T extends { effectiveFrom: Date; effectiveTo: Date | null },
>(
  histories: T[],
  date: Date,
) => {
  for (let index = histories.length - 1; index >= 0; index -= 1) {
    if (isJobHistoryActiveOnDate(date, histories[index])) {
      return histories[index];
    }
  }

  return null;
};

const getSalaryForDate = (
  histories: Array<{
    salary: Prisma.Decimal | null;
    effectiveFrom: Date;
    effectiveTo: Date | null;
  }>,
  date: Date,
  fallbackSalary: unknown,
) => {
  const history = getJobHistoryForDate(histories, date);
  return toNumber(history?.salary ?? fallbackSalary);
};

const calculateProgressiveTax = (
  taxableIncome: number,
  brackets: Array<{
    fromAmount: unknown;
    toAmount: unknown | null;
    rate: unknown;
  }>,
) => {
  if (taxableIncome <= 0) {
    return 0;
  }

  return brackets.reduce((total, bracket) => {
    const fromAmount = toNumber(bracket.fromAmount);
    const toAmount =
      bracket.toAmount === null || bracket.toAmount === undefined
        ? Number.POSITIVE_INFINITY
        : toNumber(bracket.toAmount);

    if (taxableIncome <= fromAmount) {
      return total;
    }

    const taxableInBracket = Math.min(taxableIncome, toAmount) - fromAmount;
    return total + taxableInBracket * (toNumber(bracket.rate) / 100);
  }, 0);
};

const ensureEmployeeExists = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found", "EMPLOYEE_NOT_FOUND");
  }
};

const calculatePenaltyOccurrenceAmount = (
  occurrence: number,
  policy: {
    amount: unknown;
    tiers: Array<{
      fromOccurrence: number;
      toOccurrence: number | null;
      amount: unknown;
    }>;
    type: AutoPenaltyType;
  },
) => {
  const isProgressive =
    policy.type === AutoPenaltyType.LATE_EARLY_PROGRESSIVE ||
    policy.type === AutoPenaltyType.UNAUTHORIZED_ABSENCE_PROGRESSIVE;

  if (!isProgressive) {
    return toNumber(policy.amount);
  }

  const tier = policy.tiers.find(
    (item) =>
      occurrence >= item.fromOccurrence &&
      (item.toOccurrence === null ||
        item.toOccurrence === undefined ||
        occurrence <= item.toOccurrence),
  );

  return tier ? toNumber(tier.amount) : toNumber(policy.amount) * occurrence;
};

const assertValidPaymentInput = (data: CreatePayrollPaymentBatchInput) => {
  if (data.mode === PayrollPaymentMode.AMOUNT) {
    if (data.amount === undefined || toNumber(data.amount) <= 0) {
      throw new ApiError(
        400,
        "Payment amount must be greater than 0",
        "INVALID_PAYMENT_AMOUNT",
      );
    }
  }

  if (data.mode === PayrollPaymentMode.PERCENT) {
    const percent = toNumber(data.percent);
    if (data.percent === undefined || percent <= 0 || percent > 100) {
      throw new ApiError(
        400,
        "Payment percent must be greater than 0 and at most 100",
        "INVALID_PAYMENT_PERCENT",
      );
    }
  }
};

const getPayrollPeriodOrThrow = async (id: string) => {
  const period = await prisma.payrollPeriod.findUnique({
    where: { id },
  });

  if (!period) {
    throw new ApiError(
      404,
      "Payroll period not found",
      "PAYROLL_PERIOD_NOT_FOUND",
    );
  }

  return period;
};

const resolvePayrollPeriod = async (
  data: {
    periodId?: string;
    month?: number;
    year?: number;
    periodName?: string | null;
    note?: string | null;
  },
  createdById?: string,
) => {
  if (data.periodId) {
    return getPayrollPeriodOrThrow(data.periodId);
  }

  if (!data.month || !data.year) {
    throw new ApiError(
      400,
      "Payroll period or month/year is required",
      "PAYROLL_PERIOD_REQUIRED",
    );
  }

  return prisma.payrollPeriod.upsert({
    where: {
      month_year: {
        month: data.month,
        year: data.year,
      },
    },
    update: {
      ...(data.periodName !== undefined
        ? { name: data.periodName?.trim() || null }
        : {}),
      ...(data.note !== undefined ? { note: data.note?.trim() || null } : {}),
    },
    create: {
      month: data.month,
      year: data.year,
      name:
        data.periodName?.trim() ||
        `Ky luong ${String(data.month).padStart(2, "0")}/${data.year}`,
      note: data.note?.trim() || null,
      createdById,
    },
  });
};

const findPayrollPeriodByInput = async (data: {
  periodId?: string;
  month?: number;
  year?: number;
}) => {
  const period = data.periodId
    ? await prisma.payrollPeriod.findUnique({ where: { id: data.periodId } })
    : data.month && data.year
      ? await prisma.payrollPeriod.findUnique({
          where: { month_year: { month: data.month, year: data.year } },
        })
      : null;

  if (!period) {
    throw new ApiError(
      404,
      "Payroll period not found",
      "PAYROLL_PERIOD_NOT_FOUND",
    );
  }

  return period;
};

const assertDraftPeriod = (period: { status: PayrollPeriodStatus }) => {
  if (period.status !== PayrollPeriodStatus.DRAFT) {
    throw new ApiError(
      400,
      "Only draft payroll periods can be modified",
      "INVALID_PAYROLL_PERIOD_STATUS",
    );
  }
};

const assertDraftOrCancelledPeriod = (period: {
  status: PayrollPeriodStatus;
}) => {
  if (
    period.status !== PayrollPeriodStatus.DRAFT &&
    period.status !== PayrollPeriodStatus.CANCELLED
  ) {
    throw new ApiError(
      400,
      "Only draft or cancelled payroll periods can be modified",
      "INVALID_PAYROLL_PERIOD_STATUS",
    );
  }
};

const getPaymentDate = (value?: Date | string) => {
  if (!value) {
    return new Date();
  }

  const paymentDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(paymentDate.getTime())) {
    throw new ApiError(400, "Invalid payment date", "INVALID_PAYMENT_DATE");
  }

  return paymentDate;
};

const calculatePaymentAmount = (
  remainingAmount: number,
  data: CreatePayrollPaymentBatchInput,
) => {
  if (data.mode === PayrollPaymentMode.REMAINING) {
    return remainingAmount;
  }

  if (data.mode === PayrollPaymentMode.PERCENT) {
    return roundMoney(remainingAmount * (toNumber(data.percent) / 100));
  }

  return roundMoney(toNumber(data.amount));
};

const getPayrollOrThrow = async (id: string) => {
  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: payrollDetailInclude,
  });

  if (!payroll) {
    throw new ApiError(404, "Payroll not found", "PAYROLL_NOT_FOUND");
  }

  return payroll;
};

const assertCanViewPayroll = (
  user: AuthUser,
  payroll: { employeeId: string; status: PayrollStatus },
) => {
  if (canViewAllPayrolls(user)) {
    return;
  }

  const canViewOwnApproved =
    canViewOwnPayrolls(user) &&
    user.employeeId === payroll.employeeId &&
    employeeVisibleStatuses.includes(payroll.status);

  if (!canViewOwnApproved) {
    throw new ApiError(403, "Forbidden", "FORBIDDEN");
  }
};

const buildPayrollData = (data: PayrollCalculationResult) => ({
  employeeId: data.employeeId,
  month: data.month,
  year: data.year,
  baseSalary: data.baseSalary ?? 0,
  standardWorkDays: data.standardWorkDays ?? 0,
  actualWorkDays: data.actualWorkDays ?? 0,
  actualSalary: data.actualSalary ?? 0,
  holidayWorkDays: data.holidayWorkDays ?? 0,
  holidayPay: data.holidayPay ?? 0,
  totalOvertimeWorkDays: data.totalOvertimeWorkDays ?? 0,
  totalOvertimeHours: data.totalOvertimeHours ?? 0,
  totalOvertimePay: data.totalOvertimePay ?? 0,
  totalAllowance: data.totalAllowance ?? 0,
  totalBonus: data.totalBonus ?? 0,
  totalPenalty: data.totalPenalty ?? 0,
  socialInsurance: data.socialInsurance ?? 0,
  healthInsurance: data.healthInsurance ?? 0,
  unemploymentInsurance: data.unemploymentInsurance ?? 0,
  personalIncomeTax: data.personalIncomeTax ?? 0,
  grossSalary: data.grossSalary ?? 0,
  totalDeduction: data.totalDeduction ?? 0,
  netSalary: data.netSalary ?? 0,
  paidAmount: 0,
});

const replacePayrollCalculation = async (
  tx: Prisma.TransactionClient,
  payrollId: string,
  periodId: string,
  calculated: PayrollCalculationResult,
) => {
  await tx.payrollOvertimeLine.deleteMany({ where: { payrollId } });
  await tx.payrollAllowanceLine.deleteMany({ where: { payrollId } });
  await tx.payrollBonusPenaltyLine.deleteMany({ where: { payrollId } });

  return tx.payroll.update({
    where: { id: payrollId },
    data: {
      ...buildPayrollData(calculated),
      periodId,
      status: PayrollStatus.DRAFT,
      approvedAt: null,
      paidAt: null,
      overtimeLines: {
        create: calculated.overtimeLines ?? [],
      },
      allowanceLines: {
        create: calculated.allowanceLines ?? [],
      },
      bonusPenaltyLines: {
        create: calculated.bonusPenaltyLines ?? [],
      },
    },
  });
};

const assertUpdatablePayroll = (payroll: {
  status: PayrollStatus;
  paidAmount: unknown;
}) => {
  if (
    (payroll.status !== PayrollStatus.DRAFT &&
      payroll.status !== PayrollStatus.CANCELLED) ||
    toNumber(payroll.paidAmount) > 0
  ) {
    throw new ApiError(
      400,
      "Only unpaid draft payroll can be updated",
      "INVALID_PAYROLL_STATUS",
    );
  }
};

const calculatePayrollForEmployee = async (
  employeeId: string,
  month: number,
  year: number,
): Promise<PayrollCalculationResult> => {
  const { start, end } = getMonthRange(month, year);

  //lấy tất cả dữ liệu liên quan trong tháng để tính toán bảng lương
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      salary: true,
      jobHistories: {
        where: {
          effectiveFrom: { lt: end },
          OR: [{ effectiveTo: null }, { effectiveTo: { gt: start } }],
        },
        select: {
          salary: true,
          effectiveFrom: true,
          effectiveTo: true,
        },
        orderBy: { effectiveFrom: "asc" },
      },
      payrollProfile: {
        include: {
          insurancePolicy: true,
          taxPolicy: {
            include: {
              brackets: {
                orderBy: { fromAmount: "asc" },
              },
            },
          },
          attendanceBonusPolicy: true,
        },
      },
      standardWorkDayConfigs: {
        where: {
          month,
          year,
        },
        select: {
          standardWorkDays: true,
        },
        take: 1,
      },
      workSchedules: {
        where: {
          date: {
            gte: start,
            lt: end,
          },
        },
        include: {
          shiftLinks: {
            include: {
              workShift: true,
            },
          },
        },
      },
      attendanceRecords: {
        where: {
          date: {
            gte: start,
            lt: end,
          },
        },
        include: {
          details: {
            include: {
              workShift: true,
            },
          },
        },
      },
      allowances: {
        include: {
          allowancePolicy: true,
        },
      },
      autoPenaltyPolicies: {
        include: {
          autoPenaltyPolicy: {
            include: {
              tiers: {
                orderBy: { fromOccurrence: "asc" },
              },
            },
          },
        },
      },
      payrollBonusPenalties: {
        where: {
          month: {
            gte: start,
            lt: end,
          },
          status: PayrollBonusPenaltyStatus.ACTIVE,
          source: PayrollBonusPenaltySource.MANUAL,
        },
      },
    },
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  const [leaveCoverage, holidays] = await Promise.all([
    buildLeaveCoverage(employeeId, start, end),
    prisma.holiday.findMany({
      where: {
        isActive: true,
        date: {
          gte: start,
          lt: end,
        },
      },
      orderBy: { date: "asc" },
    }),
  ]);
  const baseSalary = toNumber(employee.salary);

  // Tính tổng số ngày công chuẩn theo lịch làm việc đã lên kế hoạch trong tháng
  const scheduledStandardWorkDays = employee.workSchedules.reduce(
    (total, schedule) => {
      const dayUnits = schedule.shiftLinks.reduce((dayTotal, shiftLink) => {
        if (shiftLink.workShift.isOvertime) {
          return dayTotal;
        }

        return dayTotal + toNumber(shiftLink.workShift.workUnits);
      }, 0);

      return total + dayUnits;
    },
    0,
  );
  // Nếu nhân viên có cấu hình ngày công chuẩn riêng cho tháng, sử dụng cấu hình đó thay vì tính theo lịch làm việc
  const configuredStandardWorkDays = employee.standardWorkDayConfigs[0];
  const standardWorkDays = configuredStandardWorkDays
    ? toNumber(configuredStandardWorkDays.standardWorkDays)
    : scheduledStandardWorkDays;

  /* Tính lương cơ bản hiệu chỉnh theo số ngày công chuẩn thực tế (nếu có)
  để đảm bảo tính đúng phần lương cơ bản cho các ngày công đã lên kế hoạch,
  đồng thời không bị ảnh hưởng bởi việc nhân viên đi làm thêm hoặc nghỉ bù*/
  const effectiveBaseSalary =
    standardWorkDays > 0 && scheduledStandardWorkDays > 0
      ? employee.workSchedules.reduce((total, schedule) => {
          const regularWorkUnits = schedule.shiftLinks.reduce(
            (dayTotal, shiftLink) => {
              if (shiftLink.workShift.isOvertime) {
                return dayTotal;
              }

              return dayTotal + toNumber(shiftLink.workShift.workUnits);
            },
            0,
          );

          return (
            total +
            (getSalaryForDate(
              employee.jobHistories,
              schedule.date,
              baseSalary,
            ) /
              standardWorkDays) *
              regularWorkUnits
          );
        }, 0)
      : baseSalary;

  // Tạo một mảng tất cả chi tiết chấm công đã có trạng thái đi làm (bao gồm đi làm bình thường, đi muộn, về sớm, đi muộn và về sớm) để tính toán số ngày công thực tế và lương thực tế dựa trên chi tiết chấm công thay vì chỉ dựa trên lịch làm việc đã lên kế hoạch
  const paidWorkDetails = employee.attendanceRecords.flatMap((record) =>
    record.details
      .filter((detail) => paidWorkStatuses.has(detail.status))
      .map((detail) => ({
        ...detail,
        recordDate: record.date,
      })),
  );
  const attendedDetails = paidWorkDetails.filter((detail) =>
    attendedStatuses.has(detail.status),
  );

  // Tính tổng số ngày công thực tế (không tính làm thêm) dựa trên chi tiết chấm công
  const actualAttendanceWorkDays = paidWorkDetails.reduce((total, detail) => {
    if (isDetailOvertime(detail)) {
      return total;
    }

    return total + getDetailWorkUnits(detail);
  }, 0);

  // Tính lương thực tế cho các ngày công đã chấm công (không tính làm thêm) dựa trên chi tiết chấm công và lương cơ bản hiệu chỉnh
  const getDailyRateForDate = (date: Date) =>
    standardWorkDays > 0
      ? getSalaryForDate(employee.jobHistories, date, baseSalary) /
        standardWorkDays
      : 0;
  // Đơn giá công theo từng ngày được dùng cho cả công thường và công tăng ca.
  // Tính lương thực tế dựa trên chi tiết chấm công, chỉ tính cho các ngày công thường
  const actualSalary = paidWorkDetails.reduce((total, detail) => {
    if (isDetailOvertime(detail)) {
      return total;
    }

    return (
      total +
      getDailyRateForDate(detail.recordDate) * getDetailWorkUnits(detail)
    );
  }, 0);

  const schedulesByDate = new Map(
    employee.workSchedules.map((schedule) => [getDateKey(schedule.date), schedule]),
  );
  const payableHolidays = holidays.filter((holiday) => {
    const schedule = schedulesByDate.get(getDateKey(holiday.date));
    const hasRegularShift = schedule?.shiftLinks.some(
      (shiftLink) => !shiftLink.workShift.isOvertime,
    );

    return !hasRegularShift;
  });
  const holidayWorkDays = payableHolidays.length;
  const holidayPay = payableHolidays.reduce(
    (total, holiday) =>
      total +
      getDailyRateForDate(holiday.date) * toNumber(holiday.salaryMultiplier),
    0,
  );
  const actualWorkDays = actualAttendanceWorkDays;

  // Tạo một Set các ngày đã chấm công có làm việc thường để tính số ngày vắng mặt sau này
  // Tạo một Map để tra cứu nhanh chi tiết chấm công theo ngày, phục vụ cho việc tính toán số ngày vắng mặt không phép và số lần đi muộn/về sớm
  const attendanceDetailsByDate = new Map<
    string,
    Array<(typeof employee.attendanceRecords)[number]["details"][number]>
  >();

  // Đi qua tất cả bản ghi chấm công và lưu chi tiết chấm công theo ngày vào Map để tra cứu nhanh sau này
  employee.attendanceRecords.forEach((record) => {
    attendanceDetailsByDate.set(getDateKey(record.date), record.details);
  });

  // Tính số ngày vắng mặt không phép dựa trên lịch làm việc đã lên kế hoạch và chi tiết chấm công, chỉ tính cho các ngày có làm việc thường
  const leaveOrAbsentShiftCount = employee.workSchedules.reduce(
    (total, schedule) => {
      const detailsByShiftId = new Map(
        (attendanceDetailsByDate.get(getDateKey(schedule.date)) ?? []).map(
          (detail) => [detail.workShiftId, detail],
        ),
      );

      return (
        total +
        schedule.shiftLinks.filter((shiftLink) => {
          if (shiftLink.workShift.isOvertime) {
            return false;
          }

          if (
            hasLeaveCoverage(
              leaveCoverage,
              schedule.date,
              shiftLink.workShiftId,
            )
          ) {
            return false;
          }

          const detail = detailsByShiftId.get(shiftLink.workShiftId);
          return !detail || !attendedStatuses.has(detail.status);
        }).length
      );
    },
    0,
  );

  // Tính số ngày vắng mặt không phép dựa trên lịch làm việc đã lên kế hoạch và chi tiết chấm công, chỉ tính cho các ngày có làm việc thường
  const unauthorizedAbsenceViolations = sortViolationItems(
    employee.workSchedules.flatMap((schedule) => {
      const detailsByShiftId = new Map(
        (attendanceDetailsByDate.get(getDateKey(schedule.date)) ?? []).map(
          (detail) => [detail.workShiftId, detail],
        ),
      );

      return schedule.shiftLinks.flatMap((shiftLink) => {
          if (shiftLink.workShift.isOvertime) {
            return [];
          }

          if (
            hasLeaveCoverage(
              leaveCoverage,
              schedule.date,
              shiftLink.workShiftId,
            )
          ) {
            return [];
          }

          const detail = detailsByShiftId.get(shiftLink.workShiftId);
          if (!detail) {
            return [
              {
                occurredAt: schedule.date,
                workShiftId: shiftLink.workShiftId,
                workShiftName: getShiftViolationLabel({
                  workShift: shiftLink.workShift,
                }),
                detail: "vang khong cham cong",
              },
            ];
          }

          const isUnauthorized =
            detail.status === AttendanceStatus.ABSENT ||
            (!attendedStatuses.has(detail.status) &&
              !leaveStatuses.has(detail.status));

          if (!isUnauthorized) {
            return [];
          }

          return [
            {
              occurredAt: schedule.date,
              workShiftId: shiftLink.workShiftId,
              workShiftName: getShiftViolationLabel(detail),
              detail:
                detail.status === AttendanceStatus.ABSENT
                  ? "vang mat"
                  : `trang thai ${detail.status}`,
            },
          ];
        });
    }),
  );
  const unauthorizedAbsenceShiftCount = unauthorizedAbsenceViolations.length;

  // Tính số lần đi muộn về sớm dựa trên chi tiết chấm công, chỉ tính cho các ngày công thường
  const lateEarlyViolations = sortViolationItems(
    attendedDetails.flatMap((detail) => {
      if (isDetailOvertime(detail)) {
        return [];
      }

      if (hasLeaveCoverage(leaveCoverage, detail.recordDate, detail.workShiftId)) {
        return [];
      }

      if (detail.status === AttendanceStatus.LATE_AND_EARLY_LEAVE) {
        return [
          {
            occurredAt: detail.recordDate,
            workShiftId: detail.workShiftId,
            workShiftName: getShiftViolationLabel(detail),
            detail: "di muon",
          },
          {
            occurredAt: detail.recordDate,
            workShiftId: detail.workShiftId,
            workShiftName: getShiftViolationLabel(detail),
            detail: "ve som",
          },
        ];
      }

      if (detail.status === AttendanceStatus.LATE) {
        return [
          {
            occurredAt: detail.recordDate,
            workShiftId: detail.workShiftId,
            workShiftName: getShiftViolationLabel(detail),
            detail: "di muon",
          },
        ];
      }

      if (detail.status === AttendanceStatus.EARLY_LEAVE) {
        return [
          {
            occurredAt: detail.recordDate,
            workShiftId: detail.workShiftId,
            workShiftName: getShiftViolationLabel(detail),
            detail: "ve som",
          },
        ];
      }

      return [];
    }),
  );
  const lateEarlyOccurrences = lateEarlyViolations.length;
  const attendanceViolationMinutes = attendedDetails.reduce(
    (totals, detail) => {
      if (
        isDetailOvertime(detail) ||
        hasLeaveCoverage(
          leaveCoverage,
          detail.recordDate,
          detail.workShiftId,
        )
      ) {
        return totals;
      }

      if (
        detail.checkInTime &&
        (detail.status === AttendanceStatus.LATE ||
          detail.status === AttendanceStatus.LATE_AND_EARLY_LEAVE)
      ) {
        totals.late += getPositiveMinutes(
          detail.shiftStartTime,
          detail.checkInTime,
        );
      }

      if (
        detail.checkOutTime &&
        (detail.status === AttendanceStatus.EARLY_LEAVE ||
          detail.status === AttendanceStatus.LATE_AND_EARLY_LEAVE)
      ) {
        totals.early += getPositiveMinutes(
          detail.checkOutTime,
          detail.shiftEndTime,
        );
      }

      return totals;
    },
    { late: 0, early: 0 },
  );

  // Tính lương tăng ca theo công của ca; giờ chỉ được giữ lại để thống kê.
  const overtimeLineMap = new Map<string, PayrollLineInput>();

  // Gộp các chi tiết tăng ca theo ca và đơn giá công áp dụng tại ngày làm việc.
  attendedDetails
    .filter((detail) => isDetailOvertime(detail))
    .forEach((detail) => {
      const workUnits = getDetailWorkUnits(detail);
      const hours =
        detail.checkInTime && detail.checkOutTime
          ? getShiftHours(detail.checkInTime, detail.checkOutTime)
          : getShiftHours(detail.shiftStartTime, detail.shiftEndTime) ||
            workUnits * 8;
      const multiplier = getDetailOvertimeMultiplier(detail);
      const dailyRate = getDailyRateForDate(detail.recordDate);
      const amount = dailyRate * workUnits * multiplier;
      const key = `${detail.workShiftId}:${roundMoney(dailyRate)}`;
      const existing = overtimeLineMap.get(key);

      overtimeLineMap.set(key, {
        workShiftId: detail.workShiftId,
        workShiftCode: detail.workShiftCode ?? detail.workShift.code,
        workShiftName: detail.workShiftName,
        workDays: roundWork(toNumber(existing?.workDays) + workUnits),
        hours: roundWork(toNumber(existing?.hours) + hours),
        baseDailyRate: roundMoney(dailyRate),
        multiplier,
        amount: roundMoney(toNumber(existing?.amount) + amount),
      });
    });

  const overtimeLines = [...overtimeLineMap.values()];
  const totalOvertimeWorkDays = overtimeLines.reduce(
    (total, line) => total + toNumber(line.workDays),
    0,
  );
  const totalOvertimeHours = overtimeLines.reduce(
    (total, line) => total + toNumber(line.hours),
    0,
  );
  const totalOvertimePay = overtimeLines.reduce(
    (total, line) => total + toNumber(line.amount),
    0,
  );

  const allowanceLines = employee.allowances
    .map((employeeAllowance) => employeeAllowance.allowancePolicy)
    .filter(
      (policy) =>
        policy.isActive &&
        isEffectiveInMonth(
          policy.effectiveFrom,
          policy.effectiveTo,
          start,
          end,
        ),
    )
    .map((policy) => ({
      allowancePolicyId: policy.id,
      allowanceName: policy.name,
      amount: roundMoney(toNumber(policy.amount)),
    }));

  const totalAllowance = allowanceLines.reduce(
    (total, line) => total + toNumber(line.amount),
    0,
  );

  const payrollProfile = employee.payrollProfile;
  const bonusPenaltyLines: BonusPenaltyLineInput[] =
    employee.payrollBonusPenalties.map((item) => ({
      payrollBonusPenaltyId: item.id,
      isBonus: item.isBonus,
      reason: item.reason,
      amount: roundMoney(Math.abs(toNumber(item.amount))),
    }));

  const autoPenaltyVouchers = await Promise.all(
    employee.autoPenaltyPolicies
      .map((assignment) => assignment.autoPenaltyPolicy)
      .filter((policy) => policy.isActive)
      .map(async (policy) => {
        const violations =
          policy.type === AutoPenaltyType.LATE_EARLY ||
          policy.type === AutoPenaltyType.LATE_EARLY_PROGRESSIVE
            ? lateEarlyViolations
            : unauthorizedAbsenceViolations;
        const violationCount =
          policy.type === AutoPenaltyType.LATE_EARLY ||
          policy.type === AutoPenaltyType.LATE_EARLY_PROGRESSIVE
            ? lateEarlyOccurrences
            : unauthorizedAbsenceShiftCount;

        const existingItems = await prisma.payrollBonusPenalty.findMany({
          where: {
            employeeId,
            autoPenaltyPolicyId: policy.id,
            source: PayrollBonusPenaltySource.AUTO,
            month: {
              gte: start,
              lt: end,
            },
          },
        });
        const occurrenceKeys = new Set(
          Array.from(
            { length: violationCount },
            (_, index) => `auto:${policy.type}:${index + 1}`,
          ),
        );
        const staleItems = existingItems.filter(
          (item) =>
            item.status === PayrollBonusPenaltyStatus.ACTIVE &&
            (!item.occurrenceKey || !occurrenceKeys.has(item.occurrenceKey)),
        );

        if (staleItems.length > 0) {
          await Promise.all(
            staleItems.map((item) =>
              prisma.payrollBonusPenalty.update({
                where: { id: item.id },
                data: {
                  status: PayrollBonusPenaltyStatus.CANCELLED,
                  cancelledAt: new Date(),
                },
              }),
            ),
          );
        }
        const existing = existingItems[0];

        if (violationCount <= 0) {
          if (existing?.status === PayrollBonusPenaltyStatus.ACTIVE) {
            await prisma.payrollBonusPenalty.update({
              where: { id: existing.id },
              data: {
                status: PayrollBonusPenaltyStatus.CANCELLED,
                cancelledAt: new Date(),
              },
            });
          }

          return null;
        }

        return Promise.all(
          Array.from({ length: violationCount }, async (_, index) => {
            const occurrenceNumber = index + 1;
            const occurrenceKey = `auto:${policy.type}:${occurrenceNumber}`;
            const violation = violations[index];
            const existingOccurrence = existingItems.find(
              (item) => item.occurrenceKey === occurrenceKey,
            );
            const amount = calculatePenaltyOccurrenceAmount(
              occurrenceNumber,
              policy,
            );

            if (
              amount <= 0 ||
              existingOccurrence?.status === PayrollBonusPenaltyStatus.CANCELLED
            ) {
              return null;
            }

            const data = {
              employeeId,
              month: start,
              autoPenaltyPolicyId: policy.id,
              isBonus: false,
              source: PayrollBonusPenaltySource.AUTO,
              status: PayrollBonusPenaltyStatus.ACTIVE,
              violationCount: 1,
              occurrenceKey,
              occurredAt: start,
              reason: `${policy.name} - lần ${occurrenceNumber}`,
              amount: roundMoney(amount),
              cancelledAt: null,
            };

            data.occurredAt = violation?.occurredAt ?? start;
            data.reason = `${policy.name} - ${violation?.detail ?? "vi pham"} - ngay ${getDateKey(violation?.occurredAt ?? start)}, ca ${violation?.workShiftName ?? "Khong ro ca"}`;

            return prisma.payrollBonusPenalty.upsert({
              where: {
                employeeId_autoPenaltyPolicyId_occurrenceKey: {
                  employeeId,
                  autoPenaltyPolicyId: policy.id,
                  occurrenceKey,
                },
              },
              update: data,
              create: data,
            });
          }),
        );
      }),
  );

  autoPenaltyVouchers
    .flat()
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .forEach((item) => {
      bonusPenaltyLines.push({
        payrollBonusPenaltyId: item.id,
        isBonus: false,
        reason: item.reason,
        amount: roundMoney(Math.abs(toNumber(item.amount))),
      });
    });

  const attendanceBonusPolicy = payrollProfile?.attendanceBonusPolicy;

  if (
    payrollProfile?.isAttendanceBonusApplicable &&
    attendanceBonusPolicy?.isActive &&
    isEffectiveInMonth(
      attendanceBonusPolicy.effectiveFrom,
      attendanceBonusPolicy.effectiveTo,
      start,
      end,
    )
  ) {
    const requiredAttendanceWorkDays = attendanceBonusPolicy.useStandardWorkDays
      ? standardWorkDays
      : toNumber(attendanceBonusPolicy.requiredWorkDays);
    const meetsWorkDays =
      requiredAttendanceWorkDays <= 0 ||
      actualWorkDays >= requiredAttendanceWorkDays;
    const meetsAbsentDays =
      !attendanceBonusPolicy.maxAbsentDays ||
      leaveOrAbsentShiftCount <= toNumber(attendanceBonusPolicy.maxAbsentDays);
    const meetsLateMinutes =
      attendanceBonusPolicy.maxLateMinutes === null ||
      attendanceBonusPolicy.maxLateMinutes === undefined ||
      attendanceViolationMinutes.late <= attendanceBonusPolicy.maxLateMinutes;
    const meetsEarlyMinutes =
      attendanceBonusPolicy.maxEarlyMinutes === null ||
      attendanceBonusPolicy.maxEarlyMinutes === undefined ||
      attendanceViolationMinutes.early <= attendanceBonusPolicy.maxEarlyMinutes;

    if (
      meetsWorkDays &&
      meetsAbsentDays &&
      meetsLateMinutes &&
      meetsEarlyMinutes
    ) {
      bonusPenaltyLines.push({
        isBonus: true,
        reason: attendanceBonusPolicy.name,
        amount: roundMoney(toNumber(attendanceBonusPolicy.amount)),
      });
    }
  }

  const totalBonus = bonusPenaltyLines
    .filter((line) => line.isBonus)
    .reduce((total, line) => total + toNumber(line.amount), 0);
  const totalPenalty = bonusPenaltyLines
    .filter((line) => !line.isBonus)
    .reduce((total, line) => total + toNumber(line.amount), 0);

  const insurancePolicy = payrollProfile?.insurancePolicy;
  const taxPolicy = payrollProfile?.taxPolicy;
  const insuranceBase =
    toNumber(payrollProfile?.insuranceSalary) || effectiveBaseSalary;

  const socialInsurance =
    payrollProfile?.isInsuranceApplicable && insurancePolicy
      ? insuranceBase * (toNumber(insurancePolicy.employeeSocialRate) / 100)
      : 0;
  const healthInsurance =
    payrollProfile?.isInsuranceApplicable && insurancePolicy
      ? insuranceBase * (toNumber(insurancePolicy.employeeHealthRate) / 100)
      : 0;
  const unemploymentInsurance =
    payrollProfile?.isInsuranceApplicable && insurancePolicy
      ? insuranceBase *
        (toNumber(insurancePolicy.employeeUnemploymentRate) / 100)
      : 0;
  const grossSalary =
    actualSalary + holidayPay + totalOvertimePay + totalAllowance + totalBonus;
  const insuranceDeduction =
    socialInsurance + healthInsurance + unemploymentInsurance;
  const taxableIncome =
    payrollProfile?.isTaxApplicable && taxPolicy
      ? grossSalary -
        insuranceDeduction -
        toNumber(taxPolicy.personalDeduction) -
        payrollProfile.dependentCount * toNumber(taxPolicy.dependentDeduction)
      : 0;
  const personalIncomeTax =
    payrollProfile?.isTaxApplicable && taxPolicy
      ? calculateProgressiveTax(taxableIncome, taxPolicy.brackets)
      : 0;
  const totalDeduction = insuranceDeduction + personalIncomeTax + totalPenalty;
  const netSalary = grossSalary - totalDeduction;

  return {
    employeeId,
    month,
    year,
    baseSalary: roundMoney(baseSalary),
    standardWorkDays: roundWork(standardWorkDays),
    actualWorkDays: roundWork(actualWorkDays),
    actualSalary: roundMoney(actualSalary),
    holidayWorkDays: roundWork(holidayWorkDays),
    holidayPay: roundMoney(holidayPay),
    totalOvertimeWorkDays: roundWork(totalOvertimeWorkDays),
    totalOvertimeHours: roundWork(totalOvertimeHours),
    totalOvertimePay: roundMoney(totalOvertimePay),
    totalAllowance: roundMoney(totalAllowance),
    totalBonus: roundMoney(totalBonus),
    totalPenalty: roundMoney(totalPenalty),
    socialInsurance: roundMoney(socialInsurance),
    healthInsurance: roundMoney(healthInsurance),
    unemploymentInsurance: roundMoney(unemploymentInsurance),
    personalIncomeTax: roundMoney(personalIncomeTax),
    grossSalary: roundMoney(grossSalary),
    totalDeduction: roundMoney(totalDeduction),
    netSalary: roundMoney(netSalary),
    overtimeLines,
    allowanceLines,
    bonusPenaltyLines,
  };
};

const buildPayrollUpdateData = (
  data: UpdatePayrollInput,
): Prisma.PayrollUncheckedUpdateInput => ({
  ...(data.employeeId !== undefined ? { employeeId: data.employeeId } : {}),
  ...(data.month !== undefined ? { month: data.month } : {}),
  ...(data.year !== undefined ? { year: data.year } : {}),
  ...(data.baseSalary !== undefined ? { baseSalary: data.baseSalary } : {}),
  ...(data.standardWorkDays !== undefined
    ? { standardWorkDays: data.standardWorkDays }
    : {}),
  ...(data.actualWorkDays !== undefined
    ? { actualWorkDays: data.actualWorkDays }
    : {}),
  ...(data.actualSalary !== undefined
    ? { actualSalary: data.actualSalary }
    : {}),
  ...(data.holidayWorkDays !== undefined
    ? { holidayWorkDays: data.holidayWorkDays }
    : {}),
  ...(data.holidayPay !== undefined ? { holidayPay: data.holidayPay } : {}),
  ...(data.totalOvertimeWorkDays !== undefined
    ? { totalOvertimeWorkDays: data.totalOvertimeWorkDays }
    : {}),
  ...(data.totalOvertimeHours !== undefined
    ? { totalOvertimeHours: data.totalOvertimeHours }
    : {}),
  ...(data.totalOvertimePay !== undefined
    ? { totalOvertimePay: data.totalOvertimePay }
    : {}),
  ...(data.totalAllowance !== undefined
    ? { totalAllowance: data.totalAllowance }
    : {}),
  ...(data.totalBonus !== undefined ? { totalBonus: data.totalBonus } : {}),
  ...(data.totalPenalty !== undefined
    ? { totalPenalty: data.totalPenalty }
    : {}),
  ...(data.socialInsurance !== undefined
    ? { socialInsurance: data.socialInsurance }
    : {}),
  ...(data.healthInsurance !== undefined
    ? { healthInsurance: data.healthInsurance }
    : {}),
  ...(data.unemploymentInsurance !== undefined
    ? { unemploymentInsurance: data.unemploymentInsurance }
    : {}),
  ...(data.personalIncomeTax !== undefined
    ? { personalIncomeTax: data.personalIncomeTax }
    : {}),
  ...(data.grossSalary !== undefined ? { grossSalary: data.grossSalary } : {}),
  ...(data.totalDeduction !== undefined
    ? { totalDeduction: data.totalDeduction }
    : {}),
  ...(data.netSalary !== undefined ? { netSalary: data.netSalary } : {}),
});

export const payrollService = {
  //tạo bảng lương mới, chỉ tạo khi chưa tồn tại bảng lương nào cho nhân viên đó trong tháng
  async create(user: AuthUser, data: CreatePayrollInput) {
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);
    const period = await resolvePayrollPeriod(data, user.id);
    assertDraftOrCancelledPeriod(period);
    // Chỉ cho phép tạo mới, không cho phép cập nhật nếu đã tồn tại bảng lương cho nhân viên đó trong tháng
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);
    // Kiểm tra nhân viên tồn tại
    await ensureEmployeeExists(data.employeeId);

    // Kiểm tra trùng lặp bảng lương
    const existing = await prisma.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: data.employeeId,
          month: period.month,
          year: period.year,
        },
      },
      select: { id: true, status: true, paidAmount: true },
    });

    if (existing) {
      assertUpdatablePayroll(existing);
    }

    // Tính toán bảng lương dựa trên dữ liệu chấm công, công thêm giờ, phụ cấp, thưởng/phạt tự động
    const calculatedPayroll = await calculatePayrollForEmployee(
      data.employeeId,
      period.month,
      period.year,
    );

    return prisma.$transaction(async (tx) => {
      if (period.status === PayrollPeriodStatus.CANCELLED) {
        await tx.payrollPeriod.update({
          where: { id: period.id },
          data: {
            status: PayrollPeriodStatus.DRAFT,
            requestedAt: null,
            approvedAt: null,
            cancelledAt: null,
          },
        });
      }

      if (existing) {
        await replacePayrollCalculation(
          tx,
          existing.id,
          period.id,
          calculatedPayroll,
        );

        return tx.payroll.findUniqueOrThrow({
          where: { id: existing.id },
          include: payrollDetailInclude,
        });
      }

      return tx.payroll.create({
        data: {
          ...buildPayrollData(calculatedPayroll),
          periodId: period.id,
          status: PayrollStatus.DRAFT,
          overtimeLines: {
            create: calculatedPayroll.overtimeLines ?? [],
          },
          allowanceLines: {
            create: calculatedPayroll.allowanceLines ?? [],
          },
          bonusPenaltyLines: {
            create: calculatedPayroll.bonusPenaltyLines ?? [],
          },
        },
        include: payrollDetailInclude,
      });
    });
  },

  //tạo bảng lương hàng loạt theo tiêu chí phòng ban, vị trí
  async createByTargets(user: AuthUser, data: CreatePayrollByTargetsInput) {
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);
    const period = await resolvePayrollPeriod(data, user.id);
    assertDraftOrCancelledPeriod(period);
    const { start, end } = getMonthRange(period.month, period.year);

    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          {
            departmentId: { in: data.departmentIds },
            positionId: { in: data.positionIds },
          },
          {
            jobHistories: {
              some: {
                departmentId: { in: data.departmentIds },
                positionId: { in: data.positionIds },
                effectiveFrom: { lt: end },
                OR: [{ effectiveTo: null }, { effectiveTo: { gt: start } }],
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
      orderBy: { name: "asc" },
    });

    if (employees.length === 0) {
      throw new ApiError(
        404,
        "No employees matched payroll target",
        "NO_EMPLOYEE_MATCHED",
      );
    }

    const employeeIds = employees.map((employee) => employee.id);
    const existingPayrolls = await prisma.payroll.findMany({
      where: {
        employeeId: { in: employeeIds },
        periodId: period.id,
      },
      select: {
        id: true,
        employeeId: true,
        status: true,
        paidAmount: true,
      },
    });

    existingPayrolls.forEach(assertUpdatablePayroll);

    const existingPayrollByEmployeeId = new Map(
      existingPayrolls.map((payroll) => [payroll.employeeId, payroll]),
    );

    const calculatedPayrolls = await Promise.all(
      employees.map((employee) =>
        calculatePayrollForEmployee(
          employee.id,
          period.month,
          period.year,
        ).then((calculated) => ({
          existing: existingPayrollByEmployeeId.get(employee.id),
          calculated,
        })),
      ),
    );

    await prisma.$transaction(async (tx) => {
      if (period.status === PayrollPeriodStatus.CANCELLED) {
        await tx.payrollPeriod.update({
          where: { id: period.id },
          data: {
            status: PayrollPeriodStatus.DRAFT,
            requestedAt: null,
            approvedAt: null,
            cancelledAt: null,
          },
        });
      }

      for (const item of calculatedPayrolls) {
        if (item.existing) {
          await replacePayrollCalculation(
            tx,
            item.existing.id,
            period.id,
            item.calculated,
          );
          continue;
        }

        await tx.payroll.create({
          data: {
            ...buildPayrollData(item.calculated),
            periodId: period.id,
            status: PayrollStatus.DRAFT,
            overtimeLines: {
              create: item.calculated.overtimeLines ?? [],
            },
            allowanceLines: {
              create: item.calculated.allowanceLines ?? [],
            },
            bonusPenaltyLines: {
              create: item.calculated.bonusPenaltyLines ?? [],
            },
          },
        });
      }
    });

    const updatedEmployeeIds = new Set(
      existingPayrolls.map((payroll) => payroll.employeeId),
    );

    return {
      createdCount: employees.length - updatedEmployeeIds.size,
      updatedCount: updatedEmployeeIds.size,
      skippedCount: 0,
      payrolls: await prisma.payroll.findMany({
        where: {
          employeeId: { in: employeeIds },
          periodId: period.id,
        },
        select: payrollListSelect,
        orderBy: { employee: { name: "asc" } },
      }),
    };
  },

  //lấy chi tiết bảng lương, chỉ trả về nếu có quyền xem bảng lương đó
  async getById(user: AuthUser, id: string) {
    const payroll = await getPayrollOrThrow(id);
    assertCanViewPayroll(user, payroll);
    return payroll;
  },

  async update(user: AuthUser, id: string, data: UpdatePayrollInput) {
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);
    const payroll = await getPayrollOrThrow(id);

    if (payroll.status !== PayrollStatus.DRAFT) {
      throw new ApiError(
        400,
        "Only draft payroll can be updated",
        "INVALID_PAYROLL_STATUS",
      );
    }
    assertDraftPeriod(payroll.period);

    if (data.employeeId) {
      await ensureEmployeeExists(data.employeeId);
    }

    const targetEmployeeId = data.employeeId ?? payroll.employeeId;
    const targetMonth = data.month ?? payroll.month;
    const targetYear = data.year ?? payroll.year;
    const targetPeriod =
      targetMonth !== payroll.month || targetYear !== payroll.year
        ? await resolvePayrollPeriod(
            { month: targetMonth, year: targetYear },
            user.id,
          )
        : payroll.period;
    assertDraftPeriod(targetPeriod);

    if (
      targetEmployeeId !== payroll.employeeId ||
      targetMonth !== payroll.month ||
      targetYear !== payroll.year
    ) {
      const duplicate = await prisma.payroll.findFirst({
        where: {
          id: { not: id },
          employeeId: targetEmployeeId,
          periodId: targetPeriod.id,
        },
        select: { id: true },
      });

      if (duplicate) {
        throw new ApiError(
          400,
          "Payroll already exists for this employee and month",
          "PAYROLL_ALREADY_EXISTS",
        );
      }
    }

    return prisma.$transaction(async (tx) => {
      if (data.overtimeLines) {
        await tx.payrollOvertimeLine.deleteMany({ where: { payrollId: id } });
      }

      if (data.allowanceLines) {
        await tx.payrollAllowanceLine.deleteMany({ where: { payrollId: id } });
      }

      if (data.bonusPenaltyLines) {
        await tx.payrollBonusPenaltyLine.deleteMany({
          where: { payrollId: id },
        });
      }

      return tx.payroll.update({
        where: { id },
        data: {
          ...buildPayrollUpdateData(data),
          periodId: targetPeriod.id,
          month: targetPeriod.month,
          year: targetPeriod.year,
          ...(data.overtimeLines
            ? { overtimeLines: { create: data.overtimeLines } }
            : {}),
          ...(data.allowanceLines
            ? { allowanceLines: { create: data.allowanceLines } }
            : {}),
          ...(data.bonusPenaltyLines
            ? { bonusPenaltyLines: { create: data.bonusPenaltyLines } }
            : {}),
        },
        include: payrollDetailInclude,
      });
    });
  },

  async getAll(user: AuthUser, query: PayrollQuery) {
    if (!canViewAllPayrolls(user)) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN");
    }

    return prisma.payroll.findMany({
      where: {
        ...(query.periodId ? { periodId: query.periodId } : {}),
        ...(query.employeeId ? { employeeId: query.employeeId } : {}),
        ...(query.month ? { month: query.month } : {}),
        ...(query.year ? { year: query.year } : {}),
        ...(query.status ? { status: query.status } : {}),
        employee: {
          ...(query.departmentId ? { departmentId: query.departmentId } : {}),
          ...(query.positionId ? { positionId: query.positionId } : {}),
        },
      },
      select: payrollListSelect,
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    });
  },

  //lấy bảng lương của chính mình, chỉ trả về những bảng lương đã được duyệt hoặc đã thanh toán
  async getPeriodOverview(user: AuthUser, data: PayrollPeriodInput) {
    if (!canViewAllPayrolls(user)) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN");
    }
    const period = await findPayrollPeriodByInput(data);

    const payrolls = await prisma.payroll.findMany({
      where: {
        periodId: period.id,
      },
      select: payrollOverviewSelect,
      orderBy: { employee: { name: "asc" } },
    });

    const statusCounts = payrolls.reduce(
      (counts, payroll) => ({
        ...counts,
        [payroll.status]: (counts[payroll.status] ?? 0) + 1,
      }),
      {} as Record<PayrollStatus, number>,
    );

    const summary = payrolls.reduce(
      (totals, payroll) => {
        const netSalary = toNumber(payroll.netSalary);
        const paidAmount = toNumber(payroll.paidAmount);

        return {
          grossSalary: totals.grossSalary + toNumber(payroll.grossSalary),
          totalDeduction:
            totals.totalDeduction + toNumber(payroll.totalDeduction),
          netSalary: totals.netSalary + netSalary,
          paidAmount: totals.paidAmount + paidAmount,
          remainingAmount:
            totals.remainingAmount + Math.max(0, netSalary - paidAmount),
        };
      },
      {
        grossSalary: 0,
        totalDeduction: 0,
        netSalary: 0,
        paidAmount: 0,
        remainingAmount: 0,
      },
    );

    return {
      period,
      month: period.month,
      year: period.year,
      totalEmployees: payrolls.length,
      statusCounts,
      summary: {
        grossSalary: roundMoney(summary.grossSalary),
        totalDeduction: roundMoney(summary.totalDeduction),
        netSalary: roundMoney(summary.netSalary),
        paidAmount: roundMoney(summary.paidAmount),
        remainingAmount: roundMoney(summary.remainingAmount),
      },
      payrolls: payrolls.map((payroll) => ({
        ...payroll,
        remainingAmount: roundMoney(
          Math.max(
            0,
            toNumber(payroll.netSalary) - toNumber(payroll.paidAmount),
          ),
        ),
      })),
    };
  },

  async getPeriodEmployeeDetail(
    user: AuthUser,
    data: PayrollPeriodEmployeeInput,
  ) {
    const period = await findPayrollPeriodByInput(data);
    const payroll = await prisma.payroll.findUnique({
      where: {
        periodId_employeeId: {
          periodId: period.id,
          employeeId: data.employeeId,
        },
      },
      include: payrollDetailInclude,
    });

    if (!payroll) {
      throw new ApiError(404, "Payroll not found", "PAYROLL_NOT_FOUND");
    }

    assertCanViewPayroll(user, payroll);
    return payroll;
  },

  async removeEmployeeFromPeriod(
    user: AuthUser,
    data: PayrollPeriodEmployeeInput,
  ) {
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);
    const period = await findPayrollPeriodByInput(data);
    assertDraftOrCancelledPeriod(period);

    const payroll = await prisma.payroll.findUnique({
      where: {
        periodId_employeeId: {
          periodId: period.id,
          employeeId: data.employeeId,
        },
      },
      select: {
        id: true,
        status: true,
        paidAmount: true,
        _count: {
          select: { payments: true },
        },
      },
    });

    if (!payroll) {
      throw new ApiError(404, "Payroll not found", "PAYROLL_NOT_FOUND");
    }

    if (
      toNumber(payroll.paidAmount) > 0 ||
      payroll._count.payments > 0 ||
      payroll.status === PayrollStatus.PAID ||
      payroll.status === PayrollStatus.PARTIALLY_PAID
    ) {
      throw new ApiError(
        400,
        "Paid payroll cannot be removed from period",
        "PAYROLL_ALREADY_PAID",
      );
    }

    await prisma.payroll.delete({ where: { id: payroll.id } });

    return this.getPeriodOverview(user, { ...data, periodId: period.id });
  },

  async requestPeriodApproval(
    user: AuthUser,
    data: PayrollPeriodInput,
    approvalInput: PayrollApprovalRequestInput,
  ) {
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);
    const period = await findPayrollPeriodByInput(data);
    assertDraftPeriod(period);
    const approverIds = normalizeIds(approvalInput.approverIds);
    const watcherIds = normalizeIds(approvalInput.watcherIds);

    if (approverIds.length === 0) {
      throw new ApiError(400, "At least one approver is required");
    }

    if (approverIds.includes(user.id) || watcherIds.includes(user.id)) {
      throw new ApiError(
        400,
        "Requester cannot be an approver or watcher of the same request",
      );
    }

    const payrolls = await prisma.payroll.findMany({
      where: {
        periodId: period.id,
      },
      select: { id: true, status: true },
    });

    if (payrolls.length === 0) {
      throw new ApiError(
        404,
        "No payrolls found for this period",
        "PAYROLL_NOT_FOUND",
      );
    }

    const invalid = payrolls.find(
      (payroll) => payroll.status !== PayrollStatus.DRAFT,
    );

    if (invalid) {
      throw new ApiError(
        400,
        "Only draft payroll periods can be submitted for approval",
        "INVALID_PAYROLL_STATUS",
      );
    }

    const users = await prisma.user.findMany({
      where: { id: { in: [...approverIds, ...watcherIds] } },
      select: { id: true },
    });

    if (users.length !== new Set([...approverIds, ...watcherIds]).size) {
      throw new ApiError(400, "One or more approvers/watchers do not exist");
    }

    const existingRequest = await prisma.request.findFirst({
      where: {
        status: { in: [RequestStatus.PENDING, RequestStatus.PROCESSING] },
        payrollApprovalRequest: { periodId: period.id },
      },
      select: { id: true },
    });

    if (existingRequest) {
      throw new ApiError(
        400,
        "This payroll period already has a pending approval request",
        "PAYROLL_APPROVAL_REQUEST_EXISTS",
      );
    }

    const requestedAt = new Date();
    const title =
      approvalInput.title?.trim() ||
      `Duyệt kỳ lương tháng ${period.month}/${period.year}`;

    const approvalRequest = await prisma.$transaction(async (tx) => {
      const createdRequest = await tx.request.create({
        data: {
          type: RequestType.PAYROLL_APPROVAL,
          title,
          description: approvalInput.description,
          requesterId: user.id,
          approvalMode: approvalInput.approvalMode ?? ApprovalMode.PARALLEL,
          status: RequestStatus.PENDING,
          currentStep: 1,
          approvals: {
            create: approverIds.map((approverId, index) => ({
              approverId,
              stepOrder: index + 1,
            })),
          },
          watchers: {
            create: watcherIds.map((watcherId) => ({
              userId: watcherId,
            })),
          },
          payrollApprovalRequest: {
            create: {
              periodId: period.id,
              month: period.month,
              year: period.year,
              note: period.note,
            },
          },
        },
      });

      await tx.payroll.updateMany({
        where: {
          periodId: period.id,
        },
        data: { status: PayrollStatus.WAITING_APPROVAL },
      });
      await tx.payrollPeriod.update({
        where: { id: period.id },
        data: {
          status: PayrollPeriodStatus.WAITING_APPROVAL,
          requestedAt,
          approvedAt: null,
          cancelledAt: null,
        },
      });

      return createdRequest;
    });

    await notifyRequestWorkflow({
      userIds: getInitialRequestRecipientIds(
        approvalInput.approvalMode ?? ApprovalMode.PARALLEL,
        approverIds,
        watcherIds,
      ),
      title: "Yêu cầu mới",
      message: `Yêu cầu "${approvalRequest.title}" đang chờ xử lý.`,
      request: approvalRequest,
      senderId: user.id,
    });

    return this.getPeriodOverview(user, { ...data, periodId: period.id });
  },

  async approvePeriod(user: AuthUser, data: PayrollPeriodInput) {
    requirePermission(user, [PERMISSIONS.PAYROLL_APPROVE]);
    const period = await findPayrollPeriodByInput(data);

    if (period.status !== PayrollPeriodStatus.WAITING_APPROVAL) {
      throw new ApiError(
        400,
        "Only payroll periods waiting for approval can be approved",
        "INVALID_PAYROLL_PERIOD_STATUS",
      );
    }

    const payrolls = await prisma.payroll.findMany({
      where: {
        periodId: period.id,
      },
      select: { id: true, status: true },
    });

    if (payrolls.length === 0) {
      throw new ApiError(
        404,
        "No payrolls found for this period",
        "PAYROLL_NOT_FOUND",
      );
    }

    const invalid = payrolls.find(
      (payroll) => payroll.status !== PayrollStatus.WAITING_APPROVAL,
    );

    if (invalid) {
      throw new ApiError(
        400,
        "Only payroll periods waiting for approval can be approved",
        "INVALID_PAYROLL_STATUS",
      );
    }

    await prisma.payroll.updateMany({
      where: {
        periodId: period.id,
      },
      data: {
        status: PayrollStatus.APPROVED,
        approvedAt: new Date(),
      },
    });
    await prisma.payrollPeriod.update({
      where: { id: period.id },
      data: {
        status: PayrollPeriodStatus.APPROVED,
        approvedAt: new Date(),
      },
    });

    return this.getPeriodOverview(user, { ...data, periodId: period.id });
  },

  async cancelPeriod(user: AuthUser, data: PayrollPeriodInput) {
    requirePermission(user, [PERMISSIONS.PAYROLL_APPROVE]);
    const period = await findPayrollPeriodByInput(data);

    if (period.status !== PayrollPeriodStatus.APPROVED) {
      throw new ApiError(
        400,
        "Only approved payroll periods can be cancelled",
        "INVALID_PAYROLL_PERIOD_STATUS",
      );
    }

    const payrolls = await prisma.payroll.findMany({
      where: { periodId: period.id },
      select: { id: true, paidAmount: true, status: true },
    });

    if (payrolls.length === 0) {
      throw new ApiError(
        404,
        "No payrolls found for this period",
        "PAYROLL_NOT_FOUND",
      );
    }

    const paidPayroll = payrolls.find(
      (payroll) =>
        toNumber(payroll.paidAmount) > 0 ||
        payroll.status === PayrollStatus.PAID ||
        payroll.status === PayrollStatus.PARTIALLY_PAID,
    );

    if (paidPayroll) {
      throw new ApiError(
        400,
        "Paid payroll periods cannot be cancelled",
        "PAYROLL_PERIOD_ALREADY_PAID",
      );
    }

    await prisma.$transaction([
      prisma.payroll.updateMany({
        where: { periodId: period.id },
        data: {
          status: PayrollStatus.CANCELLED,
          paidAt: null,
        },
      }),
      prisma.payrollPeriod.update({
        where: { id: period.id },
        data: {
          status: PayrollPeriodStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      }),
    ]);

    return this.getPeriodOverview(user, { ...data, periodId: period.id });
  },

  getMine(user: AuthUser, query: Pick<PayrollQuery, "month" | "year">) {
    if (!user.employeeId) {
      if (canViewAllPayrolls(user)) {
        return [];
      }

      throw new ApiError(403, "Forbidden", "FORBIDDEN");
    }

    if (!canViewOwnPayrolls(user)) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN");
    }

    return prisma.payroll.findMany({
      where: {
        employeeId: user.employeeId,
        status: { in: employeeVisibleStatuses },
        ...(query.month ? { month: query.month } : {}),
        ...(query.year ? { year: query.year } : {}),
      },
      select: payrollListSelect,
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  },

  async requestApproval(
    user: AuthUser,
    id: string,
    approvalInput: PayrollApprovalRequestInput,
  ) {
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);
    const payroll = await getPayrollOrThrow(id);
    return this.requestPeriodApproval(
      user,
      { periodId: payroll.periodId },
      approvalInput,
    );
  },

  async approve(user: AuthUser, id: string) {
    requirePermission(user, [PERMISSIONS.PAYROLL_APPROVE]);
    const payroll = await getPayrollOrThrow(id);
    return this.approvePeriod(user, { periodId: payroll.periodId });
  },

  async approveMany(user: AuthUser, ids: string[]) {
    requirePermission(user, [PERMISSIONS.PAYROLL_APPROVE]);

    const payrolls = await prisma.payroll.findMany({
      where: { id: { in: ids } },
      select: { id: true, periodId: true },
    });

    if (payrolls.length !== new Set(ids).size) {
      throw new ApiError(
        404,
        "Some payrolls were not found",
        "PAYROLL_NOT_FOUND",
      );
    }

    const period = payrolls[0];
    const hasMixedPeriod = payrolls.some(
      (payroll) => payroll.periodId !== period.periodId,
    );
    if (hasMixedPeriod) {
      throw new ApiError(
        400,
        "Payrolls must be in the same period to approve together",
        "MIXED_PAYROLL_PERIOD",
      );
    }

    return this.approvePeriod(user, { periodId: period.periodId });
  },

  async createPaymentBatch(
    user: AuthUser,
    data: CreatePayrollPaymentBatchInput,
  ) {
    requirePermission(user, [PERMISSIONS.PAYROLL_PAY]);
    assertValidPaymentInput(data);
    const period = await findPayrollPeriodByInput(data);
    if (period.status !== PayrollPeriodStatus.APPROVED) {
      throw new ApiError(
        400,
        "Only approved payroll periods can be paid",
        "INVALID_PAYROLL_PERIOD_STATUS",
      );
    }

    const employeeIds = [...new Set(data.employeeIds)];
    if (employeeIds.length !== data.employeeIds.length) {
      throw new ApiError(
        400,
        "Duplicate employees are not allowed",
        "DUPLICATE_EMPLOYEE",
      );
    }

    const paymentDate = getPaymentDate(data.paymentDate);
    const note = data.note?.trim() || null;

    return prisma.$transaction(async (tx) => {
      const payrolls = await tx.payroll.findMany({
        where: {
          periodId: period.id,
          employeeId: { in: employeeIds },
        },
        select: {
          id: true,
          employeeId: true,
          periodId: true,
          month: true,
          year: true,
          netSalary: true,
          paidAmount: true,
          status: true,
        },
      });

      if (payrolls.length !== employeeIds.length) {
        throw new ApiError(
          404,
          "Some employee payrolls were not found for this period",
          "PAYROLL_NOT_FOUND",
        );
      }

      const invalid = payrolls.find(
        (payroll) => !payablePayrollStatuses.has(payroll.status),
      );
      if (invalid) {
        throw new ApiError(
          400,
          "Only approved or partially paid payrolls can be paid",
          "INVALID_PAYROLL_STATUS",
        );
      }

      const paymentItems = payrolls.map((payroll) => {
        const netSalary = roundMoney(toNumber(payroll.netSalary));
        const paidBefore = roundMoney(toNumber(payroll.paidAmount));
        const remainingBefore = roundMoney(netSalary - paidBefore);
        const amount = calculatePaymentAmount(remainingBefore, data);

        if (remainingBefore <= 0) {
          throw new ApiError(
            400,
            "Some payrolls have no remaining salary to pay",
            "PAYROLL_ALREADY_PAID",
          );
        }

        if (amount <= 0) {
          throw new ApiError(
            400,
            "Calculated payment amount must be greater than 0",
            "INVALID_PAYMENT_AMOUNT",
          );
        }

        if (amount > remainingBefore) {
          throw new ApiError(
            400,
            "Payment amount cannot exceed remaining salary",
            "PAYMENT_EXCEEDS_REMAINING",
          );
        }

        const paidAfter = roundMoney(paidBefore + amount);
        const remainingAfter = roundMoney(netSalary - paidAfter);

        return {
          payroll,
          amount,
          paidBefore,
          paidAfter,
          netSalary,
          remainingBefore,
          remainingAfter,
        };
      });

      const totalAmount = paymentItems.reduce(
        (total, item) => total + item.amount,
        0,
      );

      const batch = await tx.payrollPaymentBatch.create({
        data: {
          month: period.month,
          year: period.year,
          periodId: period.id,
          mode: data.mode,
          amount:
            data.mode === PayrollPaymentMode.AMOUNT
              ? roundMoney(toNumber(data.amount))
              : null,
          percent:
            data.mode === PayrollPaymentMode.PERCENT
              ? toNumber(data.percent)
              : null,
          totalAmount: roundMoney(totalAmount),
          paymentDate,
          note,
          createdById: user.id,
          payments: {
            create: paymentItems.map((item) => ({
              payrollId: item.payroll.id,
              employeeId: item.payroll.employeeId,
              mode: data.mode,
              requestedAmount:
                data.mode === PayrollPaymentMode.AMOUNT
                  ? roundMoney(toNumber(data.amount))
                  : null,
              requestedPercent:
                data.mode === PayrollPaymentMode.PERCENT
                  ? toNumber(data.percent)
                  : null,
              amount: item.amount,
              remainingBefore: item.remainingBefore,
              remainingAfter: item.remainingAfter,
              payrollNetSalary: item.netSalary,
              payrollPaidBefore: item.paidBefore,
              paymentDate,
              note,
            })),
          },
        },
        include: {
          payments: {
            include: {
              payroll: {
                select: payrollListSelect,
              },
              employee: {
                select: payrollEmployeeSelect,
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      await Promise.all(
        paymentItems.map((item) =>
          tx.payroll.update({
            where: { id: item.payroll.id },
            data: {
              paidAmount: item.paidAfter,
              status:
                item.remainingAfter <= 0
                  ? PayrollStatus.PAID
                  : PayrollStatus.PARTIALLY_PAID,
              paidAt: item.remainingAfter <= 0 ? paymentDate : null,
            },
          }),
        ),
      );

      return batch;
    });
  },

  async getPeriods(
    user: AuthUser,
    query: Pick<PayrollQuery, "month" | "year">,
  ) {
    if (!canViewAllPayrolls(user)) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN");
    }

    return prisma.payrollPeriod.findMany({
      where: {
        ...(query.month ? { month: query.month } : {}),
        ...(query.year ? { year: query.year } : {}),
      },
      include: {
        _count: {
          select: {
            payrolls: true,
            paymentBatches: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    });
  },

  async getPaymentBatches(user: AuthUser, query: PayrollPaymentBatchQuery) {
    if (!canViewAllPayrolls(user)) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN");
    }

    return prisma.payrollPaymentBatch.findMany({
      where: {
        ...(query.periodId ? { periodId: query.periodId } : {}),
        ...(query.month ? { month: query.month } : {}),
        ...(query.year ? { year: query.year } : {}),
        ...(query.employeeId
          ? { payments: { some: { employeeId: query.employeeId } } }
          : {}),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        payments: {
          include: {
            employee: {
              select: payrollEmployeeSelect,
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
    });
  },

  async getPaymentBatchById(user: AuthUser, id: string) {
    if (!canViewAllPayrolls(user)) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN");
    }

    const batch = await prisma.payrollPaymentBatch.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        payments: {
          include: {
            payroll: {
              select: payrollListSelect,
            },
            employee: {
              select: payrollEmployeeSelect,
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!batch) {
      throw new ApiError(
        404,
        "Payroll payment batch not found",
        "PAYROLL_PAYMENT_BATCH_NOT_FOUND",
      );
    }

    return batch;
  },

  async pay(user: AuthUser, id: string) {
    requirePermission(user, [PERMISSIONS.PAYROLL_PAY]);
    const payroll = await prisma.payroll.findUnique({
      where: { id },
      select: { employeeId: true, periodId: true },
    });

    if (!payroll) {
      throw new ApiError(404, "Payroll not found", "PAYROLL_NOT_FOUND");
    }

    await this.createPaymentBatch(user, {
      periodId: payroll.periodId,
      employeeIds: [payroll.employeeId],
      mode: PayrollPaymentMode.REMAINING,
    });

    return getPayrollOrThrow(id);
  },

  async payMany(user: AuthUser, ids: string[]) {
    requirePermission(user, [PERMISSIONS.PAYROLL_PAY]);

    const payrolls = await prisma.payroll.findMany({
      where: { id: { in: ids } },
      select: { id: true, employeeId: true, periodId: true },
    });

    if (payrolls.length !== new Set(ids).size) {
      throw new ApiError(
        404,
        "Some payrolls were not found",
        "PAYROLL_NOT_FOUND",
      );
    }

    const period = payrolls[0];
    const hasMixedPeriod = payrolls.some(
      (payroll) => payroll.periodId !== period.periodId,
    );

    if (hasMixedPeriod) {
      throw new ApiError(
        400,
        "Payrolls must be in the same period to create one payment batch",
        "MIXED_PAYROLL_PERIOD",
      );
    }

    await this.createPaymentBatch(user, {
      periodId: period.periodId,
      employeeIds: payrolls.map((payroll) => payroll.employeeId),
      mode: PayrollPaymentMode.REMAINING,
    });

    return prisma.payroll.findMany({
      where: { id: { in: ids } },
      select: payrollListSelect,
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  },
};
