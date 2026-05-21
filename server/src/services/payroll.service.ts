import {
  AutoPenaltyType,
  AttendanceStatus,
  PayrollPaymentMode,
  PayrollPeriodStatus,
  PayrollStatus,
  Prisma,
  UserRole,
} from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { PERMISSIONS, PermissionKey } from "../constants/permissions";
import { ApiError } from "../utils/apiError";

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
  baseHourlyRate?: DecimalInput;
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
      baseHourlyRate: true,
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

const toNumber = (value: unknown) => Number(value ?? 0);

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

const progressiveCountMultiplier = (count: number) => (count * (count + 1)) / 2;

const calculateTieredPenalty = (
  count: number,
  tiers: Array<{
    fromOccurrence: number;
    toOccurrence: number | null;
    amount: unknown;
  }>,
) => {
  if (count <= 0 || tiers.length === 0) {
    return 0;
  }

  return tiers.reduce((total, tier) => {
    const from = tier.fromOccurrence;
    const to = tier.toOccurrence ?? Number.POSITIVE_INFINITY;
    const matchedCount = Math.max(0, Math.min(count, to) - from + 1);

    return total + matchedCount * toNumber(tier.amount);
  }, 0);
};

const getMonthRange = (month: number, year: number) => ({
  start: new Date(Date.UTC(year, month - 1, 1)),
  end: new Date(Date.UTC(year, month, 1)),
});

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

const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

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

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      salary: true,
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
        },
      },
    },
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  const baseSalary = toNumber(employee.salary);

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
  const configuredStandardWorkDays = employee.standardWorkDayConfigs[0];
  const standardWorkDays = configuredStandardWorkDays
    ? toNumber(configuredStandardWorkDays.standardWorkDays)
    : scheduledStandardWorkDays;

  const attendedDetails = employee.attendanceRecords.flatMap((record) =>
    record.details
      .filter((detail) => attendedStatuses.has(detail.status))
      .map((detail) => ({
        ...detail,
        recordDate: record.date,
      })),
  );

  const actualWorkDays = attendedDetails.reduce((total, detail) => {
    if (isDetailOvertime(detail)) {
      return total;
    }

    return total + getDetailWorkUnits(detail);
  }, 0);

  const dailyRate = standardWorkDays > 0 ? baseSalary / standardWorkDays : 0;
  const hourlyRate = dailyRate / 8;
  const actualSalary = dailyRate * actualWorkDays;

  const attendedRegularDateKeys = new Set(
    attendedDetails
      .filter((detail) => !isDetailOvertime(detail))
      .map((detail) => getDateKey(detail.recordDate)),
  );

  const attendanceDetailsByDate = new Map<
    string,
    Array<(typeof employee.attendanceRecords)[number]["details"][number]>
  >();

  employee.attendanceRecords.forEach((record) => {
    attendanceDetailsByDate.set(getDateKey(record.date), record.details);
  });

  const absentDays = employee.workSchedules.reduce((total, schedule) => {
    const hasRegularWork = schedule.shiftLinks.some(
      (shiftLink) => !shiftLink.workShift.isOvertime,
    );

    if (!hasRegularWork) {
      return total;
    }

    return (
      total + (attendedRegularDateKeys.has(getDateKey(schedule.date)) ? 0 : 1)
    );
  }, 0);

  const unauthorizedAbsenceDays = employee.workSchedules.reduce(
    (total, schedule) => {
      const hasRegularWork = schedule.shiftLinks.some(
        (shiftLink) => !shiftLink.workShift.isOvertime,
      );

      if (!hasRegularWork) {
        return total;
      }

      const dateKey = getDateKey(schedule.date);
      const details = attendanceDetailsByDate.get(dateKey) ?? [];
      const hasAbsentRegularShift = details.some(
        (detail) =>
          !isDetailOvertime(detail) &&
          detail.status === AttendanceStatus.ABSENT,
      );
      const hasApprovedLeave = details.some((detail) =>
        !isDetailOvertime(detail) && leaveStatuses.has(detail.status),
      );

      if (attendedRegularDateKeys.has(dateKey)) {
        return total;
      }

      if (hasAbsentRegularShift) {
        return total + 1;
      }

      return total + (hasApprovedLeave ? 0 : 1);
    },
    0,
  );

  const lateEarlyOccurrences = attendedDetails
    .filter((detail) => !isDetailOvertime(detail))
    .reduce((total, detail) => {
      if (detail.status === AttendanceStatus.LATE_AND_EARLY_LEAVE) {
        return total + 2;
      }

      if (
        detail.status === AttendanceStatus.LATE ||
        detail.status === AttendanceStatus.EARLY_LEAVE
      ) {
        return total + 1;
      }

      return total;
    }, 0);

  const overtimeLineMap = new Map<string, PayrollLineInput>();

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
      const amount = hourlyRate * hours * multiplier;
      const key = detail.workShiftId;
      const existing = overtimeLineMap.get(key);

      overtimeLineMap.set(key, {
        workShiftId: detail.workShiftId,
        workShiftCode: detail.workShiftCode ?? detail.workShift.code,
        workShiftName: detail.workShiftName,
        workDays: roundWork(toNumber(existing?.workDays) + workUnits),
        hours: roundWork(toNumber(existing?.hours) + hours),
        baseHourlyRate: roundMoney(hourlyRate),
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

  employee.autoPenaltyPolicies
    .map((assignment) => assignment.autoPenaltyPolicy)
    .filter((policy) => policy.isActive)
    .forEach((policy) => {
      const baseAmount = toNumber(policy.amount);
      const isProgressive =
        policy.type === AutoPenaltyType.LATE_EARLY_PROGRESSIVE ||
        policy.type === AutoPenaltyType.UNAUTHORIZED_ABSENCE_PROGRESSIVE;
      const violationCount =
        policy.type === AutoPenaltyType.LATE_EARLY ||
        policy.type === AutoPenaltyType.LATE_EARLY_PROGRESSIVE
          ? lateEarlyOccurrences
          : unauthorizedAbsenceDays;

      if (violationCount <= 0) {
        return;
      }

      const amount = isProgressive
        ? policy.tiers.length > 0
          ? calculateTieredPenalty(violationCount, policy.tiers)
          : baseAmount * progressiveCountMultiplier(violationCount)
        : baseAmount * violationCount;

      if (amount <= 0) {
        return;
      }

      bonusPenaltyLines.push({
        autoPenaltyPolicyId: policy.id,
        isBonus: false,
        reason: `${policy.name} (${violationCount} lần)`,
        amount: roundMoney(amount),
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
    const meetsWorkDays =
      !attendanceBonusPolicy.requiredWorkDays ||
      actualWorkDays >= toNumber(attendanceBonusPolicy.requiredWorkDays);
    const meetsAbsentDays =
      !attendanceBonusPolicy.maxAbsentDays ||
      absentDays <= toNumber(attendanceBonusPolicy.maxAbsentDays);

    if (meetsWorkDays && meetsAbsentDays) {
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
  const insuranceBase = toNumber(payrollProfile?.insuranceSalary) || baseSalary;

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
    actualSalary + totalOvertimePay + totalAllowance + totalBonus;
  const insuranceDeduction =
    socialInsurance +
    healthInsurance +
    unemploymentInsurance;
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

  //tạo bảng lương hàng loạt theo tiêu chí phòng ban, vị trí, bỏ qua những nhân viên đã có bảng lương trong tháng nếu có tùy chọn
  async createByTargets(user: AuthUser, data: CreatePayrollByTargetsInput) {
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);
    const period = await resolvePayrollPeriod(data, user.id);
    assertDraftOrCancelledPeriod(period);

    const employees = await prisma.employee.findMany({
      where: {
        departmentId: { in: data.departmentIds },
        positionId: { in: data.positionIds },
      },
      select: {
        id: true,
        salary: true,
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
        calculatePayrollForEmployee(employee.id, period.month, period.year).then(
          (calculated) => ({
            existing: existingPayrollByEmployeeId.get(employee.id),
            calculated,
          }),
        ),
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

  async removeEmployeeFromPeriod(user: AuthUser, data: PayrollPeriodEmployeeInput) {
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

  async requestPeriodApproval(user: AuthUser, data: PayrollPeriodInput) {
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);
    const period = await findPayrollPeriodByInput(data);
    assertDraftPeriod(period);

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

    await prisma.payroll.updateMany({
      where: {
        periodId: period.id,
      },
      data: { status: PayrollStatus.WAITING_APPROVAL },
    });
    await prisma.payrollPeriod.update({
      where: { id: period.id },
      data: {
        status: PayrollPeriodStatus.WAITING_APPROVAL,
        requestedAt: new Date(),
      },
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

  async requestApproval(user: AuthUser, id: string) {
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);
    const payroll = await getPayrollOrThrow(id);
    return this.requestPeriodApproval(user, { periodId: payroll.periodId });
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

  async createPaymentBatch(user: AuthUser, data: CreatePayrollPaymentBatchInput) {
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

  async getPeriods(user: AuthUser, query: Pick<PayrollQuery, "month" | "year">) {
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
