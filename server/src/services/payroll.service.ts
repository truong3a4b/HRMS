import {
  AttendanceStatus,
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
  isBonus?: boolean;
  reason?: string | null;
  amount?: DecimalInput;
};

type CreatePayrollInput = {
  employeeId: string;
  month: number;
  year: number;
};

type PayrollCalculationResult = CreatePayrollInput & {
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
  laborAccidentInsurance?: DecimalInput;
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
  month: number;
  year: number;
  departmentIds: string[];
  positionIds: string[];
  skipExisting?: boolean;
};

type PayrollQuery = {
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
  month?: number;
  year?: number;
  status?: PayrollStatus;
};

const payrollInclude = {
  employee: {
    select: {
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
    },
  },
  overtimeLines: {
    orderBy: { createdAt: "asc" as const },
  },
  allowanceLines: {
    orderBy: { createdAt: "asc" as const },
  },
  bonusPenaltyLines: {
    orderBy: { createdAt: "asc" as const },
  },
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

const toNumber = (value: unknown) => Number(value ?? 0);

const getDetailWorkUnits = (detail: {
  shiftWorkUnits: Prisma.Decimal | null;
  workShift: { workUnits: Prisma.Decimal };
}) => toNumber(detail.shiftWorkUnits ?? detail.workShift.workUnits);

const getDetailOvertimeMultiplier = (detail: {
  shiftOvertimeMultiplier: Prisma.Decimal | null;
  workShift: { overtimeMultiplier: Prisma.Decimal };
}) =>
  toNumber(detail.shiftOvertimeMultiplier ?? detail.workShift.overtimeMultiplier);

const isDetailOvertime = (detail: {
  shiftIsOvertime: boolean;
  workShift: { isOvertime: boolean };
}) => detail.shiftIsOvertime || detail.workShift.isOvertime;

const roundMoney = (value: number) => Math.round(value);

const roundWork = (value: number) => Math.round(value * 100) / 100;

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

const getPayrollOrThrow = async (id: string) => {
  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: payrollInclude,
  });

  if (!payroll) {
    throw new ApiError(404, "Payroll not found", "PAYROLL_NOT_FOUND");
  }

  return payroll;
};

const assertCanViewPayroll = (user: AuthUser, payroll: { employeeId: string; status: PayrollStatus }) => {
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
  laborAccidentInsurance: data.laborAccidentInsurance ?? 0,
  personalIncomeTax: data.personalIncomeTax ?? 0,
  grossSalary: data.grossSalary ?? 0,
  totalDeduction: data.totalDeduction ?? 0,
  netSalary: data.netSalary ?? 0,
});

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

  const standardWorkDays = employee.workSchedules.reduce((total, schedule) => {
    const dayUnits = schedule.shiftLinks.reduce((dayTotal, shiftLink) => {
      if (shiftLink.workShift.isOvertime) {
        return dayTotal;
      }

      return dayTotal + toNumber(shiftLink.workShift.workUnits);
    }, 0);

    return total + dayUnits;
  }, 0);

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
  const absentDays = employee.workSchedules.reduce((total, schedule) => {
    const hasRegularWork = schedule.shiftLinks.some(
      (shiftLink) => !shiftLink.workShift.isOvertime,
    );

    if (!hasRegularWork) {
      return total;
    }

    return total + (attendedRegularDateKeys.has(getDateKey(schedule.date)) ? 0 : 1);
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
        policy.isActive && isEffectiveInMonth(policy.effectiveFrom, policy.effectiveTo, start, end),
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
  const bonusPenaltyLines: BonusPenaltyLineInput[] = employee.payrollBonusPenalties.map((item) => ({
    payrollBonusPenaltyId: item.id,
    isBonus: item.isBonus,
    reason: item.reason,
    amount: roundMoney(Math.abs(toNumber(item.amount))),
  }));

  const attendanceBonusPolicy = payrollProfile?.attendanceBonusPolicy;

  if (
    payrollProfile?.isAttendanceBonusApplicable &&
    attendanceBonusPolicy?.isActive &&
    isEffectiveInMonth(attendanceBonusPolicy.effectiveFrom, attendanceBonusPolicy.effectiveTo, start, end)
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
  const laborAccidentInsurance = 0;

  const grossSalary =
    actualSalary + totalOvertimePay + totalAllowance + totalBonus;
  const insuranceDeduction =
    socialInsurance +
    healthInsurance +
    unemploymentInsurance +
    laborAccidentInsurance;
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
    laborAccidentInsurance: roundMoney(laborAccidentInsurance),
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
  ...(data.actualSalary !== undefined ? { actualSalary: data.actualSalary } : {}),
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
  ...(data.laborAccidentInsurance !== undefined
    ? { laborAccidentInsurance: data.laborAccidentInsurance }
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
  async create(user: AuthUser, data: CreatePayrollInput) {
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);
    await ensureEmployeeExists(data.employeeId);

    const existing = await prisma.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: data.employeeId,
          month: data.month,
          year: data.year,
        },
      },
      select: { id: true },
    });

    if (existing) {
      throw new ApiError(
        400,
        "Payroll already exists for this employee and month",
        "PAYROLL_ALREADY_EXISTS",
      );
    }

    const calculatedPayroll = await calculatePayrollForEmployee(
      data.employeeId,
      data.month,
      data.year,
    );

    return prisma.payroll.create({
      data: {
        ...buildPayrollData(calculatedPayroll),
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
      include: payrollInclude,
    });
  },

  async createByTargets(user: AuthUser, data: CreatePayrollByTargetsInput) {
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);

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
        month: data.month,
        year: data.year,
      },
      select: {
        employeeId: true,
      },
    });

    const existingEmployeeIds = new Set(
      existingPayrolls.map((payroll) => payroll.employeeId),
    );
    const skipExisting = data.skipExisting ?? true;

    if (!skipExisting && existingEmployeeIds.size > 0) {
      throw new ApiError(
        400,
        "Some employees already have payroll for this month",
        "PAYROLL_ALREADY_EXISTS",
      );
    }

    const targetEmployees = employees.filter(
      (employee) => !existingEmployeeIds.has(employee.id),
    );

    if (targetEmployees.length === 0) {
      throw new ApiError(
        400,
        "All matched employees already have payroll for this month",
        "PAYROLL_ALREADY_EXISTS",
      );
    }

    const calculatedPayrolls = await Promise.all(
      targetEmployees.map((employee) =>
        calculatePayrollForEmployee(employee.id, data.month, data.year),
      ),
    );

    await prisma.$transaction(
      calculatedPayrolls.map((payrollData) =>
        prisma.payroll.create({
          data: {
            ...buildPayrollData(payrollData),
            status: PayrollStatus.DRAFT,
            overtimeLines: {
              create: payrollData.overtimeLines ?? [],
            },
            allowanceLines: {
              create: payrollData.allowanceLines ?? [],
            },
            bonusPenaltyLines: {
              create: payrollData.bonusPenaltyLines ?? [],
            },
          },
        }),
      ),
    );

    const createdEmployeeIds = targetEmployees.map((employee) => employee.id);

    return {
      createdCount: createdEmployeeIds.length,
      skippedCount: existingEmployeeIds.size,
      payrolls: await prisma.payroll.findMany({
        where: {
          employeeId: { in: createdEmployeeIds },
          month: data.month,
          year: data.year,
        },
        include: payrollInclude,
        orderBy: { employee: { name: "asc" } },
      }),
    };
  },

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

    if (data.employeeId) {
      await ensureEmployeeExists(data.employeeId);
    }

    const targetEmployeeId = data.employeeId ?? payroll.employeeId;
    const targetMonth = data.month ?? payroll.month;
    const targetYear = data.year ?? payroll.year;

    if (
      targetEmployeeId !== payroll.employeeId ||
      targetMonth !== payroll.month ||
      targetYear !== payroll.year
    ) {
      const duplicate = await prisma.payroll.findFirst({
        where: {
          id: { not: id },
          employeeId: targetEmployeeId,
          month: targetMonth,
          year: targetYear,
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
        include: payrollInclude,
      });
    });
  },

  async getAll(user: AuthUser, query: PayrollQuery) {
    if (!canViewAllPayrolls(user)) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN");
    }

    return prisma.payroll.findMany({
      where: {
        ...(query.employeeId ? { employeeId: query.employeeId } : {}),
        ...(query.month ? { month: query.month } : {}),
        ...(query.year ? { year: query.year } : {}),
        ...(query.status ? { status: query.status } : {}),
        employee: {
          ...(query.departmentId ? { departmentId: query.departmentId } : {}),
          ...(query.positionId ? { positionId: query.positionId } : {}),
        },
      },
      include: payrollInclude,
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    });
  },

  getMine(user: AuthUser, query: Pick<PayrollQuery, "month" | "year">) {
    if (!user.employeeId || !canViewOwnPayrolls(user)) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN");
    }

    return prisma.payroll.findMany({
      where: {
        employeeId: user.employeeId,
        status: { in: [PayrollStatus.APPROVED, PayrollStatus.PAID] },
        ...(query.month ? { month: query.month } : {}),
        ...(query.year ? { year: query.year } : {}),
      },
      include: payrollInclude,
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  },

  async requestApproval(user: AuthUser, id: string) {
    requirePermission(user, [PERMISSIONS.PAYROLL_MANAGE]);
    const payroll = await getPayrollOrThrow(id);

    if (payroll.status !== PayrollStatus.DRAFT) {
      throw new ApiError(
        400,
        "Only draft payroll can be submitted for approval",
        "INVALID_PAYROLL_STATUS",
      );
    }

    return prisma.payroll.update({
      where: { id },
      data: { status: PayrollStatus.WAITING_APPROVAL },
      include: payrollInclude,
    });
  },

  async approve(user: AuthUser, id: string) {
    requirePermission(user, [PERMISSIONS.PAYROLL_APPROVE]);
    const payroll = await getPayrollOrThrow(id);

    if (payroll.status !== PayrollStatus.WAITING_APPROVAL) {
      throw new ApiError(
        400,
        "Only payroll waiting for approval can be approved",
        "INVALID_PAYROLL_STATUS",
      );
    }

    return prisma.payroll.update({
      where: { id },
      data: {
        status: PayrollStatus.APPROVED,
        approvedAt: new Date(),
      },
      include: payrollInclude,
    });
  },

  async approveMany(user: AuthUser, ids: string[]) {
    requirePermission(user, [PERMISSIONS.PAYROLL_APPROVE]);

    const payrolls = await prisma.payroll.findMany({
      where: { id: { in: ids } },
      select: { id: true, status: true },
    });

    if (payrolls.length !== new Set(ids).size) {
      throw new ApiError(404, "Some payrolls were not found", "PAYROLL_NOT_FOUND");
    }

    const invalid = payrolls.find(
      (payroll) => payroll.status !== PayrollStatus.WAITING_APPROVAL,
    );

    if (invalid) {
      throw new ApiError(
        400,
        "Only payrolls waiting for approval can be approved",
        "INVALID_PAYROLL_STATUS",
      );
    }

    await prisma.payroll.updateMany({
      where: { id: { in: ids } },
      data: {
        status: PayrollStatus.APPROVED,
        approvedAt: new Date(),
      },
    });

    return prisma.payroll.findMany({
      where: { id: { in: ids } },
      include: payrollInclude,
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  },

  async pay(user: AuthUser, id: string) {
    requirePermission(user, [PERMISSIONS.PAYROLL_PAY]);
    const payroll = await getPayrollOrThrow(id);

    if (payroll.status !== PayrollStatus.APPROVED) {
      throw new ApiError(
        400,
        "Only approved payroll can be paid",
        "INVALID_PAYROLL_STATUS",
      );
    }

    return prisma.payroll.update({
      where: { id },
      data: {
        status: PayrollStatus.PAID,
        paidAt: new Date(),
      },
      include: payrollInclude,
    });
  },

  async payMany(user: AuthUser, ids: string[]) {
    requirePermission(user, [PERMISSIONS.PAYROLL_PAY]);

    const payrolls = await prisma.payroll.findMany({
      where: { id: { in: ids } },
      select: { id: true, status: true },
    });

    if (payrolls.length !== new Set(ids).size) {
      throw new ApiError(404, "Some payrolls were not found", "PAYROLL_NOT_FOUND");
    }

    const invalid = payrolls.find(
      (payroll) => payroll.status !== PayrollStatus.APPROVED,
    );

    if (invalid) {
      throw new ApiError(
        400,
        "Only approved payrolls can be paid",
        "INVALID_PAYROLL_STATUS",
      );
    }

    await prisma.payroll.updateMany({
      where: { id: { in: ids } },
      data: {
        status: PayrollStatus.PAID,
        paidAt: new Date(),
      },
    });

    return prisma.payroll.findMany({
      where: { id: { in: ids } },
      include: payrollInclude,
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  },
};
