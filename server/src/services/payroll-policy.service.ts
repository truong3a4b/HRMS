import {
  AutoPenaltyType,
  AttendanceStatus,
  PayrollBonusPenaltySource,
  PayrollBonusPenaltyStatus,
  Prisma,
  RequestStatus,
} from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

type DecimalInput = string | number | Prisma.Decimal;

type AuthUser = {
  employeeId?: string;
};

type PolicyQuery = {
  isActive?: boolean;
};

type CreateInsurancePolicyInput = {
  name: string;
  employeeSocialRate: DecimalInput;
  employeeHealthRate: DecimalInput;
  employeeUnemploymentRate: DecimalInput;
  employerSocialRate?: DecimalInput | null;
  employerHealthRate?: DecimalInput | null;
  employerUnemploymentRate?: DecimalInput | null;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  isActive?: boolean;
};

type UpdateInsurancePolicyInput = Partial<CreateInsurancePolicyInput>;

type TaxBracketInput = {
  fromAmount: DecimalInput;
  toAmount?: DecimalInput | null;
  rate: DecimalInput;
};

type CreateTaxPolicyInput = {
  name: string;
  personalDeduction: DecimalInput;
  dependentDeduction: DecimalInput;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  isActive?: boolean;
  brackets: TaxBracketInput[];
};

type UpdateTaxPolicyInput = Partial<Omit<CreateTaxPolicyInput, "brackets">> & {
  brackets?: TaxBracketInput[];
};

type CreateAttendanceBonusPolicyInput = {
  name: string;
  amount: DecimalInput;
  useStandardWorkDays?: boolean;
  requiredWorkDays?: DecimalInput | null;
  maxLateMinutes?: number | null;
  maxEarlyMinutes?: number | null;
  maxAbsentDays?: DecimalInput | null;
  isActive?: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
};

type UpdateAttendanceBonusPolicyInput =
  Partial<CreateAttendanceBonusPolicyInput>;

type CreateHolidayInput = {
  name: string;
  date: Date;
  salaryMultiplier: DecimalInput;
  description?: string | null;
  isActive?: boolean;
};

type UpdateHolidayInput = Partial<CreateHolidayInput>;

type HolidayQuery = {
  isActive?: boolean;
  month?: number;
  year?: number;
};

type CreateAllowancePolicyInput = {
  name: string;
  description?: string | null;
  amount: DecimalInput;
  isActive?: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
};

type UpdateAllowancePolicyInput = Partial<CreateAllowancePolicyInput>;

type AutoPenaltyTierInput = {
  fromOccurrence: number;
  toOccurrence?: number | null;
  amount: DecimalInput;
};

type CreateAutoPenaltyPolicyInput = {
  type: AutoPenaltyType;
  name: string;
  description?: string | null;
  amount?: DecimalInput;
  isActive?: boolean;
  tiers?: AutoPenaltyTierInput[];
};

type UpdateAutoPenaltyPolicyInput = Partial<CreateAutoPenaltyPolicyInput>;

type AssignPayrollPoliciesInput = {
  employeeIds?: string[];
  departmentIds?: string[];
  positionIds?: string[];
  insurancePolicyId?: string | null;
  taxPolicyId?: string | null;
  attendanceBonusPolicyId?: string | null;
  isInsuranceApplicable?: boolean;
  isTaxApplicable?: boolean;
  isAttendanceBonusApplicable?: boolean;
  insuranceSalary?: DecimalInput | null;
  dependentCount?: number;
  taxCode?: string | null;
};

type StandardWorkDayQuery = PayrollProfileQuery & {
  month?: number;
  year?: number;
};

type AnnualLeaveBalanceQuery = PayrollProfileQuery & {
  year?: number;
};

type AssignStandardWorkDaysInput = {
  employeeIds?: string[];
  departmentIds?: string[];
  positionIds?: string[];
  month: number;
  year: number;
  standardWorkDays: DecimalInput;
  note?: string | null;
};

type UpsertEmployeeStandardWorkDaysInput = {
  employeeId: string;
  month: number;
  year: number;
  standardWorkDays: DecimalInput;
  note?: string | null;
};

type AssignAnnualLeaveBalanceInput = {
  employeeIds?: string[];
  departmentIds?: string[];
  positionIds?: string[];
  year: number;
  entitledLeaveDays: DecimalInput;
};

type UpsertEmployeeAnnualLeaveBalanceInput = {
  employeeId: string;
  year: number;
  entitledLeaveDays: DecimalInput;
};

type AssignAllowancePolicyInput = {
  allowancePolicyId: string;
  employeeIds?: string[];
  departmentIds?: string[];
  positionIds?: string[];
};

type AssignAutoPenaltyPolicyInput = {
  autoPenaltyPolicyId: string;
  employeeIds?: string[];
  departmentIds?: string[];
  positionIds?: string[];
};

type CreatePayrollBonusPenaltyInput = {
  employeeId: string;
  month: Date;
  amount: DecimalInput;
  isBonus?: boolean;
  reason?: string | null;
};

type UpdatePayrollBonusPenaltyInput = Partial<CreatePayrollBonusPenaltyInput> & {
  status?: PayrollBonusPenaltyStatus;
};

type PayrollProfileQuery = {
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
};

type EmployeeAllowanceQuery = PayrollProfileQuery & {
  allowancePolicyId?: string;
};

type EmployeeAutoPenaltyPolicyQuery = PayrollProfileQuery & {
  autoPenaltyPolicyId?: string;
};

type PayrollBonusPenaltyQuery = PayrollProfileQuery & {
  month?: Date;
  status?: PayrollBonusPenaltyStatus;
};

type GenerateAutoPayrollBonusPenaltyInput = PayrollProfileQuery & {
  month: number;
  year: number;
};

const policyInclude = {
  insurancePolicy: true,
  taxPolicy: {
    include: {
      brackets: {
        orderBy: { fromAmount: "asc" as const },
      },
    },
  },
  attendanceBonusPolicy: true,
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
};

const ensureExists = async (
  modelName: "insurancePolicy" | "taxPolicy" | "attendanceBonusPolicy",
  id: string | null | undefined,
) => {
  if (!id) {
    return;
  }

  const record =
    modelName === "insurancePolicy"
      ? await prisma.insurancePolicy.findUnique({
          where: { id },
          select: { id: true },
        })
      : modelName === "taxPolicy"
        ? await prisma.taxPolicy.findUnique({
            where: { id },
            select: { id: true },
          })
        : await prisma.attendanceBonusPolicy.findUnique({
            where: { id },
            select: { id: true },
          });

  if (!record) {
    throw new ApiError(404, "Payroll policy not found", "POLICY_NOT_FOUND");
  }
};

const ensureDateRange = (effectiveFrom?: Date, effectiveTo?: Date | null) => {
  if (effectiveFrom && effectiveTo && effectiveTo < effectiveFrom) {
    throw new ApiError(
      400,
      "effectiveTo must be greater than or equal to effectiveFrom",
      "INVALID_EFFECTIVE_DATE_RANGE",
    );
  }
};

const ensurePositiveMultiplier = (value: DecimalInput) => {
  const multiplier = Number(value);

  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    throw new ApiError(
      400,
      "salaryMultiplier must be greater than 0",
      "INVALID_HOLIDAY_MULTIPLIER",
    );
  }
};

const toDateOnly = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

const ensureHolidayDateAvailable = async (date: Date, excludeId?: string) => {
  const existingHoliday = await prisma.holiday.findUnique({
    where: { date: toDateOnly(date) },
    select: { id: true },
  });

  if (existingHoliday && existingHoliday.id !== excludeId) {
    throw new ApiError(
      409,
      "Ngày nghỉ lễ này đã tồn tại",
      "HOLIDAY_DATE_EXISTS",
    );
  }
};

const ensureTaxBrackets = (brackets?: TaxBracketInput[]) => {
  if (!brackets) {
    return;
  }

  if (brackets.length === 0) {
    throw new ApiError(
      400,
      "Tax policy must have at least one bracket",
      "TAX_BRACKET_REQUIRED",
    );
  }

  brackets.forEach((bracket) => {
    if (
      bracket.toAmount !== undefined &&
      bracket.toAmount !== null &&
      Number(bracket.toAmount) <= Number(bracket.fromAmount)
    ) {
      throw new ApiError(
        400,
        "Tax bracket toAmount must be greater than fromAmount",
        "INVALID_TAX_BRACKET_RANGE",
      );
    }
  });
};

const progressiveAutoPenaltyTypes = new Set<AutoPenaltyType>([
  AutoPenaltyType.LATE_EARLY_PROGRESSIVE,
  AutoPenaltyType.UNAUTHORIZED_ABSENCE_PROGRESSIVE,
]);

const ensureAutoPenaltyTiers = (
  type: AutoPenaltyType,
  tiers?: AutoPenaltyTierInput[],
) => {
  if (!progressiveAutoPenaltyTypes.has(type)) {
    return;
  }

  if (!tiers || tiers.length === 0) {
    throw new ApiError(
      400,
      "Progressive auto penalty policy must have at least one tier",
      "AUTO_PENALTY_TIER_REQUIRED",
    );
  }

  const ordered = [...tiers].sort(
    (first, second) => first.fromOccurrence - second.fromOccurrence,
  );

  ordered.forEach((tier, index) => {
    if (tier.fromOccurrence < 1) {
      throw new ApiError(
        400,
        "Tier fromOccurrence must be greater than or equal to 1",
        "INVALID_AUTO_PENALTY_TIER_RANGE",
      );
    }

    if (
      tier.toOccurrence !== undefined &&
      tier.toOccurrence !== null &&
      tier.toOccurrence < tier.fromOccurrence
    ) {
      throw new ApiError(
        400,
        "Tier toOccurrence must be greater than or equal to fromOccurrence",
        "INVALID_AUTO_PENALTY_TIER_RANGE",
      );
    }

    const previous = ordered[index - 1];
    if (!previous) {
      return;
    }

    if (previous.toOccurrence === null || previous.toOccurrence === undefined) {
      throw new ApiError(
        400,
        "Only the last auto penalty tier can have empty toOccurrence",
        "INVALID_AUTO_PENALTY_TIER_RANGE",
      );
    }

    if (tier.fromOccurrence <= previous.toOccurrence) {
      throw new ApiError(
        400,
        "Auto penalty tiers must not overlap",
        "INVALID_AUTO_PENALTY_TIER_RANGE",
      );
    }
  });
};

const buildPolicyWhere = (query: PolicyQuery) => ({
  ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
});

const getTargetEmployeeIds = async (data: {
  employeeIds?: string[];
  departmentIds?: string[];
  positionIds?: string[];
}) => {
  if (data.employeeIds?.length) {
    const employees = await prisma.employee.findMany({
      where: { id: { in: data.employeeIds } },
      select: { id: true },
    });
    const employeeIds = [...new Set(employees.map((employee) => employee.id))];

    if (employeeIds.length === 0) {
      throw new ApiError(
        404,
        "No employees matched assignment target",
        "NO_EMPLOYEE_MATCHED",
      );
    }

    return employeeIds;
  }

  if (!data.departmentIds?.length && !data.positionIds?.length) {
    throw new ApiError(
      400,
      "employeeIds, departmentIds or positionIds is required for assignment",
      "ASSIGNMENT_TARGET_REQUIRED",
    );
  }

  const employees = await prisma.employee.findMany({
    where: {
      ...(data.departmentIds?.length
        ? { departmentId: { in: data.departmentIds } }
        : {}),
      ...(data.positionIds?.length
        ? { positionId: { in: data.positionIds } }
        : {}),
    },
    select: { id: true },
  });

  const employeeIds = [...new Set(employees.map((employee) => employee.id))];

  if (employeeIds.length === 0) {
    throw new ApiError(
      404,
      "No employees matched assignment target",
      "NO_EMPLOYEE_MATCHED",
    );
  }

  return employeeIds;
};

const employeeAllowanceInclude = {
  allowancePolicy: true,
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
};

const employeeAutoPenaltyPolicyInclude = {
  autoPenaltyPolicy: {
    include: {
      tiers: {
        orderBy: { fromOccurrence: "asc" as const },
      },
    },
  },
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
};

const payrollBonusPenaltyInclude = {
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
  autoPenaltyPolicy: {
    select: {
      id: true,
      type: true,
      name: true,
    },
  },
};

const standardWorkDayInclude = {
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
};

const annualLeaveBalanceInclude = standardWorkDayInclude;

const ensureEmployeeExists = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found", "EMPLOYEE_NOT_FOUND");
  }
};

const buildMonthRangeFilter = (month?: Date) => {
  if (!month || Number.isNaN(month.getTime())) {
    return {};
  }

  const start = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1),
  );
  const end = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1),
  );

  return {
    month: {
      gte: start,
      lt: end,
    },
  };
};

const ensureMonthYear = (month: number, year: number) => {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new ApiError(400, "month must be between 1 and 12", "INVALID_MONTH");
  }

  if (!Number.isInteger(year) || year < 1900 || year > 9999) {
    throw new ApiError(400, "year must be between 1900 and 9999", "INVALID_YEAR");
  }
};

const ensurePositiveStandardWorkDays = (standardWorkDays: DecimalInput) => {
  const value = Number(standardWorkDays);

  if (!Number.isFinite(value) || value <= 0) {
    throw new ApiError(
      400,
      "standardWorkDays must be greater than 0",
      "INVALID_STANDARD_WORK_DAYS",
    );
  }
};

const ensureYear = (year: number) => {
  if (!Number.isInteger(year) || year < 1900 || year > 9999) {
    throw new ApiError(400, "year must be between 1900 and 9999", "INVALID_YEAR");
  }
};

const ensureNonNegativeLeaveDays = (leaveDays: DecimalInput) => {
  const value = Number(leaveDays);

  if (!Number.isFinite(value) || value < 0) {
    throw new ApiError(
      400,
      "entitledLeaveDays must be greater than or equal to 0",
      "INVALID_ENTITLED_LEAVE_DAYS",
    );
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
const activeLeaveRequestStatuses = [
  RequestStatus.PENDING,
  RequestStatus.PROCESSING,
  RequestStatus.APPROVED,
];

const toNumber = (value: unknown) => Number(value ?? 0);

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

const roundMoney = (value: number) => Math.round(value);

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

const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

const buildLeaveCoverageByEmployee = async (
  employeeIds: string[],
  start: Date,
  end: Date,
) => {
  if (employeeIds.length === 0) {
    return new Map<string, Map<string, Set<string | null>>>();
  }

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: {
      startDate: { lt: end },
      endDate: { gte: start },
      request: {
        status: { in: activeLeaveRequestStatuses },
        requester: {
          employee: {
            id: { in: employeeIds },
          },
        },
      },
    },
    select: {
      startDate: true,
      endDate: true,
      workShiftId: true,
      request: {
        select: {
          requester: {
            select: {
              employee: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });
  const coverage = new Map<string, Map<string, Set<string | null>>>();

  for (const leaveRequest of leaveRequests) {
    const employeeId = leaveRequest.request.requester.employee?.id;
    if (!employeeId) {
      continue;
    }

    const employeeCoverage =
      coverage.get(employeeId) ?? new Map<string, Set<string | null>>();
    coverage.set(employeeId, employeeCoverage);

    for (
      let date = toUtcDateOnly(leaveRequest.startDate);
      date.getTime() <= toUtcDateOnly(leaveRequest.endDate).getTime();
      date = addUtcDays(date, 1)
    ) {
      if (date < start || date >= end) {
        continue;
      }

      const dateKey = getDateKey(date);
      employeeCoverage.set(
        dateKey,
        employeeCoverage.get(dateKey) ?? new Set<string | null>(),
      );
      employeeCoverage.get(dateKey)?.add(leaveRequest.workShiftId);
    }
  }

  return coverage;
};

const hasLeaveCoverage = (
  coverage: Map<string, Set<string | null>> | undefined,
  date: Date,
  workShiftId: string,
) => {
  const coveredShiftIds = coverage?.get(getDateKey(date));

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

const isDetailOvertime = (detail: {
  shiftIsOvertime: boolean;
  workShift: { isOvertime: boolean };
}) => detail.shiftIsOvertime || detail.workShift.isOvertime;

export const payrollPolicyService = {
  insurancePolicies: {
    getAll(query: PolicyQuery) {
      return prisma.insurancePolicy.findMany({
        where: buildPolicyWhere(query),
        orderBy: [{ isActive: "desc" }, { effectiveFrom: "desc" }],
      });
    },

    async getById(id: string) {
      const policy = await prisma.insurancePolicy.findUnique({ where: { id } });

      if (!policy) {
        throw new ApiError(
          404,
          "Insurance policy not found",
          "INSURANCE_POLICY_NOT_FOUND",
        );
      }

      return policy;
    },

    create(data: CreateInsurancePolicyInput) {
      ensureDateRange(data.effectiveFrom, data.effectiveTo);

      return prisma.insurancePolicy.create({
        data,
      });
    },

    async update(id: string, data: UpdateInsurancePolicyInput) {
      const existing = await this.getById(id);
      ensureDateRange(
        data.effectiveFrom ?? existing.effectiveFrom,
        data.effectiveTo === undefined
          ? existing.effectiveTo
          : data.effectiveTo,
      );

      return prisma.insurancePolicy.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.employeeSocialRate !== undefined
            ? { employeeSocialRate: data.employeeSocialRate }
            : {}),
          ...(data.employeeHealthRate !== undefined
            ? { employeeHealthRate: data.employeeHealthRate }
            : {}),
          ...(data.employeeUnemploymentRate !== undefined
            ? { employeeUnemploymentRate: data.employeeUnemploymentRate }
            : {}),
          ...(data.employerSocialRate !== undefined
            ? { employerSocialRate: data.employerSocialRate }
            : {}),
          ...(data.employerHealthRate !== undefined
            ? { employerHealthRate: data.employerHealthRate }
            : {}),
          ...(data.employerUnemploymentRate !== undefined
            ? { employerUnemploymentRate: data.employerUnemploymentRate }
            : {}),
          ...(data.effectiveFrom !== undefined
            ? { effectiveFrom: data.effectiveFrom }
            : {}),
          ...(data.effectiveTo !== undefined
            ? { effectiveTo: data.effectiveTo }
            : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        },
      });
    },

    async delete(id: string) {
      await this.getById(id);

      const usedCount = await prisma.employeePayrollProfile.count({
        where: { insurancePolicyId: id },
      });

      if (usedCount > 0) {
        throw new ApiError(
          400,
          "Cannot delete insurance policy assigned to employees",
          "INSURANCE_POLICY_IN_USE",
        );
      }

      return prisma.insurancePolicy.delete({ where: { id } });
    },
  },

  taxPolicies: {
    getAll(query: PolicyQuery) {
      return prisma.taxPolicy.findMany({
        where: buildPolicyWhere(query),
        include: {
          brackets: {
            orderBy: { fromAmount: "asc" },
          },
        },
        orderBy: [{ isActive: "desc" }, { effectiveFrom: "desc" }],
      });
    },

    async getById(id: string) {
      const policy = await prisma.taxPolicy.findUnique({
        where: { id },
        include: {
          brackets: {
            orderBy: { fromAmount: "asc" },
          },
        },
      });

      if (!policy) {
        throw new ApiError(404, "Tax policy not found", "TAX_POLICY_NOT_FOUND");
      }

      return policy;
    },

    create(data: CreateTaxPolicyInput) {
      ensureDateRange(data.effectiveFrom, data.effectiveTo);
      ensureTaxBrackets(data.brackets);

      return prisma.taxPolicy.create({
        data: {
          name: data.name,
          personalDeduction: data.personalDeduction,
          dependentDeduction: data.dependentDeduction,
          effectiveFrom: data.effectiveFrom,
          effectiveTo: data.effectiveTo,
          isActive: data.isActive,
          brackets: {
            create: data.brackets,
          },
        },
        include: {
          brackets: {
            orderBy: { fromAmount: "asc" },
          },
        },
      });
    },

    async update(id: string, data: UpdateTaxPolicyInput) {
      const existing = await this.getById(id);
      ensureDateRange(
        data.effectiveFrom ?? existing.effectiveFrom,
        data.effectiveTo === undefined
          ? existing.effectiveTo
          : data.effectiveTo,
      );
      ensureTaxBrackets(data.brackets);

      return prisma.$transaction(async (tx) => {
        if (data.brackets) {
          await tx.taxBracket.deleteMany({ where: { policyId: id } });
        }

        return tx.taxPolicy.update({
          where: { id },
          data: {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.personalDeduction !== undefined
              ? { personalDeduction: data.personalDeduction }
              : {}),
            ...(data.dependentDeduction !== undefined
              ? { dependentDeduction: data.dependentDeduction }
              : {}),
            ...(data.effectiveFrom !== undefined
              ? { effectiveFrom: data.effectiveFrom }
              : {}),
            ...(data.effectiveTo !== undefined
              ? { effectiveTo: data.effectiveTo }
              : {}),
            ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            ...(data.brackets
              ? {
                  brackets: {
                    create: data.brackets,
                  },
                }
              : {}),
          },
          include: {
            brackets: {
              orderBy: { fromAmount: "asc" },
            },
          },
        });
      });
    },

    async delete(id: string) {
      await this.getById(id);

      const usedCount = await prisma.employeePayrollProfile.count({
        where: { taxPolicyId: id },
      });

      if (usedCount > 0) {
        throw new ApiError(
          400,
          "Cannot delete tax policy assigned to employees",
          "TAX_POLICY_IN_USE",
        );
      }

      return prisma.taxPolicy.delete({ where: { id } });
    },
  },

  attendanceBonusPolicies: {
    getAll(query: PolicyQuery) {
      return prisma.attendanceBonusPolicy.findMany({
        where: buildPolicyWhere(query),
        orderBy: [{ isActive: "desc" }, { effectiveFrom: "desc" }],
      });
    },

    async getById(id: string) {
      const policy = await prisma.attendanceBonusPolicy.findUnique({
        where: { id },
      });

      if (!policy) {
        throw new ApiError(
          404,
          "Attendance bonus policy not found",
          "ATTENDANCE_BONUS_POLICY_NOT_FOUND",
        );
      }

      return policy;
    },

    create(data: CreateAttendanceBonusPolicyInput) {
      ensureDateRange(data.effectiveFrom, data.effectiveTo);

      return prisma.attendanceBonusPolicy.create({
        data,
      });
    },

    async update(id: string, data: UpdateAttendanceBonusPolicyInput) {
      const existing = await this.getById(id);
      ensureDateRange(
        data.effectiveFrom ?? existing.effectiveFrom,
        data.effectiveTo === undefined
          ? existing.effectiveTo
          : data.effectiveTo,
      );

      return prisma.attendanceBonusPolicy.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.amount !== undefined ? { amount: data.amount } : {}),
          ...(data.useStandardWorkDays !== undefined
            ? { useStandardWorkDays: data.useStandardWorkDays }
            : {}),
          ...(data.requiredWorkDays !== undefined
            ? { requiredWorkDays: data.requiredWorkDays }
            : {}),
          ...(data.maxLateMinutes !== undefined
            ? { maxLateMinutes: data.maxLateMinutes }
            : {}),
          ...(data.maxEarlyMinutes !== undefined
            ? { maxEarlyMinutes: data.maxEarlyMinutes }
            : {}),
          ...(data.maxAbsentDays !== undefined
            ? { maxAbsentDays: data.maxAbsentDays }
            : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
          ...(data.effectiveFrom !== undefined
            ? { effectiveFrom: data.effectiveFrom }
            : {}),
          ...(data.effectiveTo !== undefined
            ? { effectiveTo: data.effectiveTo }
            : {}),
        },
      });
    },

    async delete(id: string) {
      await this.getById(id);

      const usedCount = await prisma.employeePayrollProfile.count({
        where: { attendanceBonusPolicyId: id },
      });

      if (usedCount > 0) {
        throw new ApiError(
          400,
          "Cannot delete attendance bonus policy assigned to employees",
          "ATTENDANCE_BONUS_POLICY_IN_USE",
        );
      }

      return prisma.attendanceBonusPolicy.delete({ where: { id } });
    },
  },

  holidays: {
    getAll(query: HolidayQuery) {
      const monthRange =
        query.month && query.year ? getMonthRange(query.month, query.year) : null;

      return prisma.holiday.findMany({
        where: {
          ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
          ...(monthRange
            ? {
                date: {
                  gte: monthRange.start,
                  lt: monthRange.end,
                },
              }
            : {}),
        },
        orderBy: [{ date: "asc" }, { name: "asc" }],
      });
    },

    async getById(id: string) {
      const holiday = await prisma.holiday.findUnique({
        where: { id },
      });

      if (!holiday) {
        throw new ApiError(404, "Holiday not found", "HOLIDAY_NOT_FOUND");
      }

      return holiday;
    },

    async create(data: CreateHolidayInput) {
      ensurePositiveMultiplier(data.salaryMultiplier);
      await ensureHolidayDateAvailable(data.date);

      return prisma.holiday.create({
        data: {
          name: data.name,
          date: toDateOnly(data.date),
          salaryMultiplier: data.salaryMultiplier,
          description: data.description,
          isActive: data.isActive ?? true,
        },
      });
    },

    async update(id: string, data: UpdateHolidayInput) {
      await this.getById(id);

      if (data.salaryMultiplier !== undefined) {
        ensurePositiveMultiplier(data.salaryMultiplier);
      }
      if (data.date !== undefined) {
        await ensureHolidayDateAvailable(data.date, id);
      }

      return prisma.holiday.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.date !== undefined ? { date: toDateOnly(data.date) } : {}),
          ...(data.salaryMultiplier !== undefined
            ? { salaryMultiplier: data.salaryMultiplier }
            : {}),
          ...(data.description !== undefined
            ? { description: data.description }
            : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        },
      });
    },

    async delete(id: string) {
      await this.getById(id);

      return prisma.holiday.delete({ where: { id } });
    },
  },

  allowancePolicies: {
    getAll(query: PolicyQuery) {
      return prisma.allowancePolicy.findMany({
        where: buildPolicyWhere(query),
        orderBy: [{ isActive: "desc" }, { effectiveFrom: "desc" }],
      });
    },

    async getById(id: string) {
      const policy = await prisma.allowancePolicy.findUnique({
        where: { id },
      });

      if (!policy) {
        throw new ApiError(
          404,
          "Allowance policy not found",
          "ALLOWANCE_POLICY_NOT_FOUND",
        );
      }

      return policy;
    },

    create(data: CreateAllowancePolicyInput) {
      ensureDateRange(data.effectiveFrom, data.effectiveTo);

      return prisma.allowancePolicy.create({
        data,
      });
    },

    async update(id: string, data: UpdateAllowancePolicyInput) {
      const existing = await this.getById(id);
      ensureDateRange(
        data.effectiveFrom ?? existing.effectiveFrom,
        data.effectiveTo === undefined
          ? existing.effectiveTo
          : data.effectiveTo,
      );

      return prisma.allowancePolicy.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.description !== undefined
            ? { description: data.description }
            : {}),
          ...(data.amount !== undefined ? { amount: data.amount } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
          ...(data.effectiveFrom !== undefined
            ? { effectiveFrom: data.effectiveFrom }
            : {}),
          ...(data.effectiveTo !== undefined
            ? { effectiveTo: data.effectiveTo }
            : {}),
        },
      });
    },

    async delete(id: string) {
      await this.getById(id);

      const usedCount = await prisma.employeeAllowance.count({
        where: { allowancePolicyId: id },
      });

      if (usedCount > 0) {
        throw new ApiError(
          400,
          "Cannot delete allowance policy assigned to employees",
          "ALLOWANCE_POLICY_IN_USE",
        );
      }

      return prisma.allowancePolicy.delete({ where: { id } });
    },

    async assign(data: AssignAllowancePolicyInput) {
      await this.getById(data.allowancePolicyId);

      const employeeIds = await getTargetEmployeeIds(data);

      await prisma.employeeAllowance.createMany({
        data: employeeIds.map((employeeId) => ({
          employeeId,
          allowancePolicyId: data.allowancePolicyId,
        })),
        skipDuplicates: true,
      });

      return prisma.employeeAllowance.findMany({
        where: {
          allowancePolicyId: data.allowancePolicyId,
          employeeId: { in: employeeIds },
        },
        include: employeeAllowanceInclude,
        orderBy: { employee: { name: "asc" } },
      });
    },

    async unassign(data: AssignAllowancePolicyInput) {
      await this.getById(data.allowancePolicyId);

      const employeeIds = await getTargetEmployeeIds(data);

      await prisma.employeeAllowance.deleteMany({
        where: {
          allowancePolicyId: data.allowancePolicyId,
          employeeId: { in: employeeIds },
        },
      });

      return prisma.employeeAllowance.findMany({
        where: {
          allowancePolicyId: data.allowancePolicyId,
          employeeId: { in: employeeIds },
        },
        include: employeeAllowanceInclude,
        orderBy: { employee: { name: "asc" } },
      });
    },

    getAssignments(query: EmployeeAllowanceQuery) {
      return prisma.employeeAllowance.findMany({
        where: {
          ...(query.allowancePolicyId
            ? { allowancePolicyId: query.allowancePolicyId }
            : {}),
          ...(query.employeeId ? { employeeId: query.employeeId } : {}),
          employee: {
            ...(query.departmentId ? { departmentId: query.departmentId } : {}),
            ...(query.positionId ? { positionId: query.positionId } : {}),
          },
        },
        include: employeeAllowanceInclude,
        orderBy: { createdAt: "desc" },
      });
    },
  },

  autoPenaltyPolicies: {
    getAll(query: PolicyQuery) {
      return prisma.autoPenaltyPolicy.findMany({
        where: buildPolicyWhere(query),
        include: {
          tiers: {
            orderBy: { fromOccurrence: "asc" },
          },
        },
        orderBy: [{ isActive: "desc" }, { type: "asc" }],
      });
    },

    async getById(id: string) {
      const policy = await prisma.autoPenaltyPolicy.findUnique({
        where: { id },
        include: {
          tiers: {
            orderBy: { fromOccurrence: "asc" },
          },
        },
      });

      if (!policy) {
        throw new ApiError(
          404,
          "Auto penalty policy not found",
          "AUTO_PENALTY_POLICY_NOT_FOUND",
        );
      }

      return policy;
    },

    create(data: CreateAutoPenaltyPolicyInput) {
      ensureAutoPenaltyTiers(data.type, data.tiers);

      return prisma.autoPenaltyPolicy.create({
        data: {
          type: data.type,
          name: data.name,
          description: data.description,
          amount: data.amount ?? 0,
          isActive: data.isActive,
          tiers: data.tiers?.length
            ? {
                create: data.tiers,
              }
            : undefined,
        },
        include: {
          tiers: {
            orderBy: { fromOccurrence: "asc" },
          },
        },
      });
    },

    async update(id: string, data: UpdateAutoPenaltyPolicyInput) {
      const existing = await this.getById(id);
      const nextType = data.type ?? existing.type;
      ensureAutoPenaltyTiers(
        nextType,
        data.tiers ?? (existing.tiers as AutoPenaltyTierInput[]),
      );

      return prisma.$transaction(async (tx) => {
        if (data.tiers) {
          await tx.autoPenaltyTier.deleteMany({
            where: { autoPenaltyPolicyId: id },
          });
        }

        return tx.autoPenaltyPolicy.update({
          where: { id },
          data: {
            ...(data.type !== undefined ? { type: data.type } : {}),
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.description !== undefined
              ? { description: data.description }
              : {}),
            ...(data.amount !== undefined ? { amount: data.amount } : {}),
            ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            ...(data.tiers
              ? {
                  tiers: {
                    create: data.tiers,
                  },
                }
              : {}),
          },
          include: {
            tiers: {
              orderBy: { fromOccurrence: "asc" },
            },
          },
        });
      });
    },

    async delete(id: string) {
      await this.getById(id);

      const usedCount = await prisma.employeeAutoPenaltyPolicy.count({
        where: { autoPenaltyPolicyId: id },
      });

      if (usedCount > 0) {
        throw new ApiError(
          400,
          "Cannot delete auto penalty policy assigned to employees",
          "AUTO_PENALTY_POLICY_IN_USE",
        );
      }

      return prisma.autoPenaltyPolicy.delete({
        where: { id },
        include: {
          tiers: {
            orderBy: { fromOccurrence: "asc" },
          },
        },
      });
    },

    async assign(data: AssignAutoPenaltyPolicyInput) {
      await this.getById(data.autoPenaltyPolicyId);

      const employeeIds = await getTargetEmployeeIds(data);

      await prisma.employeeAutoPenaltyPolicy.createMany({
        data: employeeIds.map((employeeId) => ({
          employeeId,
          autoPenaltyPolicyId: data.autoPenaltyPolicyId,
        })),
        skipDuplicates: true,
      });

      return prisma.employeeAutoPenaltyPolicy.findMany({
        where: {
          autoPenaltyPolicyId: data.autoPenaltyPolicyId,
          employeeId: { in: employeeIds },
        },
        include: employeeAutoPenaltyPolicyInclude,
        orderBy: { employee: { name: "asc" } },
      });
    },

    async unassign(data: AssignAutoPenaltyPolicyInput) {
      await this.getById(data.autoPenaltyPolicyId);

      const employeeIds = await getTargetEmployeeIds(data);

      await prisma.employeeAutoPenaltyPolicy.deleteMany({
        where: {
          autoPenaltyPolicyId: data.autoPenaltyPolicyId,
          employeeId: { in: employeeIds },
        },
      });

      return prisma.employeeAutoPenaltyPolicy.findMany({
        where: {
          autoPenaltyPolicyId: data.autoPenaltyPolicyId,
          employeeId: { in: employeeIds },
        },
        include: employeeAutoPenaltyPolicyInclude,
        orderBy: { employee: { name: "asc" } },
      });
    },

    getAssignments(query: EmployeeAutoPenaltyPolicyQuery) {
      return prisma.employeeAutoPenaltyPolicy.findMany({
        where: {
          ...(query.autoPenaltyPolicyId
            ? { autoPenaltyPolicyId: query.autoPenaltyPolicyId }
            : {}),
          ...(query.employeeId ? { employeeId: query.employeeId } : {}),
          employee: {
            ...(query.departmentId ? { departmentId: query.departmentId } : {}),
            ...(query.positionId ? { positionId: query.positionId } : {}),
          },
        },
        include: employeeAutoPenaltyPolicyInclude,
        orderBy: { createdAt: "desc" },
      });
    },
  },

  payrollBonusPenalties: {
    getAll(query: PayrollBonusPenaltyQuery) {
      return prisma.payrollBonusPenalty.findMany({
        where: {
          ...(query.employeeId ? { employeeId: query.employeeId } : {}),
          ...buildMonthRangeFilter(query.month),
          ...(query.status ? { status: query.status } : {}),
          employee: {
            ...(query.departmentId ? { departmentId: query.departmentId } : {}),
            ...(query.positionId ? { positionId: query.positionId } : {}),
          },
        },
        include: payrollBonusPenaltyInclude,
        orderBy: [{ month: "desc" }, { createdAt: "desc" }],
      });
    },

    async getById(id: string) {
      const item = await prisma.payrollBonusPenalty.findUnique({
        where: { id },
        include: payrollBonusPenaltyInclude,
      });

      if (!item) {
        throw new ApiError(
          404,
          "Payroll bonus penalty not found",
          "PAYROLL_BONUS_PENALTY_NOT_FOUND",
        );
      }

      return item;
    },

    getMine(user: AuthUser, query: Pick<PayrollBonusPenaltyQuery, "month" | "status">) {
      if (!user.employeeId) {
        return [];
      }

      return prisma.payrollBonusPenalty.findMany({
        where: {
          employeeId: user.employeeId,
          ...buildMonthRangeFilter(query.month),
          ...(query.status ? { status: query.status } : {}),
        },
        include: payrollBonusPenaltyInclude,
        orderBy: [{ month: "desc" }, { createdAt: "desc" }],
      });
    },

    async create(data: CreatePayrollBonusPenaltyInput) {
      await ensureEmployeeExists(data.employeeId);

      return prisma.payrollBonusPenalty.create({
        data: {
          ...data,
          source: PayrollBonusPenaltySource.MANUAL,
          status: PayrollBonusPenaltyStatus.ACTIVE,
          cancelledAt: null,
        },
        include: payrollBonusPenaltyInclude,
      });
    },

    async update(id: string, data: UpdatePayrollBonusPenaltyInput) {
      await this.getById(id);

      if (data.employeeId) {
        await ensureEmployeeExists(data.employeeId);
      }

      return prisma.payrollBonusPenalty.update({
        where: { id },
        data: {
          ...(data.employeeId !== undefined
            ? { employeeId: data.employeeId }
            : {}),
          ...(data.month !== undefined ? { month: data.month } : {}),
          ...(data.amount !== undefined ? { amount: data.amount } : {}),
          ...(data.isBonus !== undefined ? { isBonus: data.isBonus } : {}),
          ...(data.reason !== undefined ? { reason: data.reason } : {}),
          ...(data.status !== undefined
            ? {
                status: data.status,
                cancelledAt:
                  data.status === PayrollBonusPenaltyStatus.CANCELLED
                    ? new Date()
                    : null,
              }
            : {}),
        },
        include: payrollBonusPenaltyInclude,
      });
    },

    async delete(id: string) {
      await this.getById(id);

      return prisma.payrollBonusPenalty.update({
        where: { id },
        data: {
          status: PayrollBonusPenaltyStatus.CANCELLED,
          cancelledAt: new Date(),
        },
        include: payrollBonusPenaltyInclude,
      });
    },

    async generateAuto(data: GenerateAutoPayrollBonusPenaltyInput) {
      ensureMonthYear(data.month, data.year);
      const { start, end } = getMonthRange(data.month, data.year);

      const employees = await prisma.employee.findMany({
        where: {
          ...(data.employeeId ? { id: data.employeeId } : {}),
          ...(data.departmentId ? { departmentId: data.departmentId } : {}),
          ...(data.positionId ? { positionId: data.positionId } : {}),
          autoPenaltyPolicies: {
            some: {
              autoPenaltyPolicy: {
                isActive: true,
              },
            },
          },
        },
        select: {
          id: true,
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
        },
      });

      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      let cancelledCount = 0;
      const leaveCoverageByEmployee = await buildLeaveCoverageByEmployee(
        employees.map((employee) => employee.id),
        start,
        end,
      );

      await Promise.all(
        employees.flatMap((employee) => {
          const leaveCoverage = leaveCoverageByEmployee.get(employee.id);
          const attendedDetails = employee.attendanceRecords.flatMap((record) =>
            record.details
              .filter((detail) => attendedStatuses.has(detail.status))
              .map((detail) => ({
                ...detail,
                recordDate: record.date,
              })),
          );
          const attendanceDetailsByDate = new Map<
            string,
            Array<(typeof employee.attendanceRecords)[number]["details"][number]>
          >();

          employee.attendanceRecords.forEach((record) => {
            attendanceDetailsByDate.set(getDateKey(record.date), record.details);
          });

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
          const unauthorizedAbsenceShiftCount =
            unauthorizedAbsenceViolations.length;

          const lateEarlyViolations = sortViolationItems(
            attendedDetails.flatMap((detail) => {
              if (isDetailOvertime(detail)) {
                return [];
              }

              if (
                hasLeaveCoverage(
                  leaveCoverage,
                  detail.recordDate,
                  detail.workShiftId,
                )
              ) {
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

          return employee.autoPenaltyPolicies.map(async (assignment) => {
            const policy = assignment.autoPenaltyPolicy;
            if (!policy.isActive) {
              skippedCount += 1;
              return;
            }

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
            const occurrenceKeys = new Set(
              Array.from({ length: violationCount }, (_, index) =>
                `auto:${policy.type}:${index + 1}`,
              ),
            );
            const existingItems = await prisma.payrollBonusPenalty.findMany({
              where: {
                employeeId: employee.id,
                autoPenaltyPolicyId: policy.id,
                source: PayrollBonusPenaltySource.AUTO,
                month: {
                  gte: start,
                  lt: end,
                },
              },
            });
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
              cancelledCount += staleItems.length;
            }

            if (violationCount <= 0) {
              skippedCount += 1;
              return;
            }

            await Promise.all(
              Array.from({ length: violationCount }, async (_, index) => {
                const occurrenceNumber = index + 1;
                const occurrenceKey = `auto:${policy.type}:${occurrenceNumber}`;
                const violation = violations[index];
                const existing = existingItems.find(
                  (item) => item.occurrenceKey === occurrenceKey,
                );
                const amount = calculatePenaltyOccurrenceAmount(
                  occurrenceNumber,
                  policy,
                );

                if (
                  amount <= 0 ||
                  existing?.status === PayrollBonusPenaltyStatus.CANCELLED
                ) {
                  skippedCount += 1;
                  return;
                }

                const payload = {
                  employeeId: employee.id,
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

                payload.occurredAt = violation?.occurredAt ?? start;
                payload.reason = `${policy.name} - ${violation?.detail ?? "vi pham"} - ngay ${getDateKey(violation?.occurredAt ?? start)}, ca ${violation?.workShiftName ?? "Khong ro ca"}`;

                await prisma.payrollBonusPenalty.upsert({
                  where: {
                    employeeId_autoPenaltyPolicyId_occurrenceKey: {
                      employeeId: employee.id,
                      autoPenaltyPolicyId: policy.id,
                      occurrenceKey,
                    },
                  },
                  update: payload,
                  create: payload,
                });

                if (existing) {
                  updatedCount += 1;
                } else {
                  createdCount += 1;
                }
              }),
            );
          });
        }),
      );

      return {
        month: data.month,
        year: data.year,
        createdCount,
        updatedCount,
        skippedCount,
        cancelledCount,
      };
    },
  },

  standardWorkDays: {
    getAll(query: StandardWorkDayQuery) {
      return prisma.employeeStandardWorkDay.findMany({
        where: {
          ...(query.employeeId ? { employeeId: query.employeeId } : {}),
          ...(query.month ? { month: query.month } : {}),
          ...(query.year ? { year: query.year } : {}),
          employee: {
            ...(query.departmentId ? { departmentId: query.departmentId } : {}),
            ...(query.positionId ? { positionId: query.positionId } : {}),
          },
        },
        include: standardWorkDayInclude,
        orderBy: [{ year: "desc" }, { month: "desc" }, { employee: { name: "asc" } }],
      });
    },

    async getByEmployeeMonth(employeeId: string, month: number, year: number) {
      ensureMonthYear(month, year);
      await ensureEmployeeExists(employeeId);

      const config = await prisma.employeeStandardWorkDay.findUnique({
        where: {
          employeeId_month_year: {
            employeeId,
            month,
            year,
          },
        },
        include: standardWorkDayInclude,
      });

      if (!config) {
        throw new ApiError(
          404,
          "Employee standard work days config not found",
          "STANDARD_WORK_DAYS_NOT_FOUND",
        );
      }

      return config;
    },

    async upsertEmployee(data: UpsertEmployeeStandardWorkDaysInput) {
      ensureMonthYear(data.month, data.year);
      ensurePositiveStandardWorkDays(data.standardWorkDays);
      await ensureEmployeeExists(data.employeeId);

      return prisma.employeeStandardWorkDay.upsert({
        where: {
          employeeId_month_year: {
            employeeId: data.employeeId,
            month: data.month,
            year: data.year,
          },
        },
        update: {
          standardWorkDays: data.standardWorkDays,
          ...(data.note !== undefined ? { note: data.note } : {}),
        },
        create: {
          employeeId: data.employeeId,
          month: data.month,
          year: data.year,
          standardWorkDays: data.standardWorkDays,
          note: data.note,
        },
        include: standardWorkDayInclude,
      });
    },

    async assign(data: AssignStandardWorkDaysInput) {
      ensureMonthYear(data.month, data.year);
      ensurePositiveStandardWorkDays(data.standardWorkDays);

      const employeeIds = await getTargetEmployeeIds(data);

      await prisma.$transaction(
        employeeIds.map((employeeId) =>
          prisma.employeeStandardWorkDay.upsert({
            where: {
              employeeId_month_year: {
                employeeId,
                month: data.month,
                year: data.year,
              },
            },
            update: {
              standardWorkDays: data.standardWorkDays,
              ...(data.note !== undefined ? { note: data.note } : {}),
            },
            create: {
              employeeId,
              month: data.month,
              year: data.year,
              standardWorkDays: data.standardWorkDays,
              note: data.note,
            },
          }),
        ),
      );

      return prisma.employeeStandardWorkDay.findMany({
        where: {
          employeeId: { in: employeeIds },
          month: data.month,
          year: data.year,
        },
        include: standardWorkDayInclude,
        orderBy: { employee: { name: "asc" } },
      });
    },

    async deleteByEmployeeMonth(employeeId: string, month: number, year: number) {
      await this.getByEmployeeMonth(employeeId, month, year);

      return prisma.employeeStandardWorkDay.delete({
        where: {
          employeeId_month_year: {
            employeeId,
            month,
            year,
          },
        },
        include: standardWorkDayInclude,
      });
    },
  },

  annualLeaveBalances: {
    getAll(query: AnnualLeaveBalanceQuery) {
      return prisma.employeeLeaveBalance.findMany({
        where: {
          ...(query.employeeId ? { employeeId: query.employeeId } : {}),
          ...(query.year ? { year: query.year } : {}),
          employee: {
            ...(query.departmentId ? { departmentId: query.departmentId } : {}),
            ...(query.positionId ? { positionId: query.positionId } : {}),
          },
        },
        include: annualLeaveBalanceInclude,
        orderBy: [{ year: "desc" }, { employee: { name: "asc" } }],
      });
    },

    async getByEmployeeYear(employeeId: string, year: number) {
      ensureYear(year);
      await ensureEmployeeExists(employeeId);

      const config = await prisma.employeeLeaveBalance.findUnique({
        where: {
          employeeId_year: {
            employeeId,
            year,
          },
        },
        include: annualLeaveBalanceInclude,
      });

      if (!config) {
        throw new ApiError(
          404,
          "Employee annual leave balance config not found",
          "ANNUAL_LEAVE_BALANCE_NOT_FOUND",
        );
      }

      return config;
    },

    async upsertEmployee(data: UpsertEmployeeAnnualLeaveBalanceInput) {
      ensureYear(data.year);
      ensureNonNegativeLeaveDays(data.entitledLeaveDays);
      await ensureEmployeeExists(data.employeeId);

      return prisma.employeeLeaveBalance.upsert({
        where: {
          employeeId_year: {
            employeeId: data.employeeId,
            year: data.year,
          },
        },
        update: {
          entitledLeaveDays: data.entitledLeaveDays,
        },
        create: {
          employeeId: data.employeeId,
          year: data.year,
          entitledLeaveDays: data.entitledLeaveDays,
        },
        include: annualLeaveBalanceInclude,
      });
    },

    async assign(data: AssignAnnualLeaveBalanceInput) {
      ensureYear(data.year);
      ensureNonNegativeLeaveDays(data.entitledLeaveDays);

      const employeeIds = await getTargetEmployeeIds(data);

      await prisma.$transaction(
        employeeIds.map((employeeId) =>
          prisma.employeeLeaveBalance.upsert({
            where: {
              employeeId_year: {
                employeeId,
                year: data.year,
              },
            },
            update: {
              entitledLeaveDays: data.entitledLeaveDays,
            },
            create: {
              employeeId,
              year: data.year,
              entitledLeaveDays: data.entitledLeaveDays,
            },
          }),
        ),
      );

      return prisma.employeeLeaveBalance.findMany({
        where: {
          employeeId: { in: employeeIds },
          year: data.year,
        },
        include: annualLeaveBalanceInclude,
        orderBy: { employee: { name: "asc" } },
      });
    },

    async deleteByEmployeeYear(employeeId: string, year: number) {
      await this.getByEmployeeYear(employeeId, year);

      return prisma.employeeLeaveBalance.delete({
        where: {
          employeeId_year: {
            employeeId,
            year,
          },
        },
        include: annualLeaveBalanceInclude,
      });
    },
  },

  payrollProfiles: {
    getAll(query: PayrollProfileQuery) {
      return prisma.employeePayrollProfile.findMany({
        where: {
          ...(query.employeeId ? { employeeId: query.employeeId } : {}),
          employee: {
            ...(query.departmentId ? { departmentId: query.departmentId } : {}),
            ...(query.positionId ? { positionId: query.positionId } : {}),
          },
        },
        include: policyInclude,
        orderBy: { updatedAt: "desc" },
      });
    },

    async getByEmployeeId(employeeId: string) {
      const profile = await prisma.employeePayrollProfile.findUnique({
        where: { employeeId },
        include: policyInclude,
      });

      if (!profile) {
        throw new ApiError(
          404,
          "Employee payroll profile not found",
          "PAYROLL_PROFILE_NOT_FOUND",
        );
      }

      return profile;
    },

    async assign(data: AssignPayrollPoliciesInput) {
      await Promise.all([
        ensureExists("insurancePolicy", data.insurancePolicyId),
        ensureExists("taxPolicy", data.taxPolicyId),
        ensureExists("attendanceBonusPolicy", data.attendanceBonusPolicyId),
      ]);

      const employeeIds = await getTargetEmployeeIds(data);

      const profileData: Prisma.EmployeePayrollProfileUncheckedUpdateInput = {
        ...(data.insurancePolicyId !== undefined
          ? {
              insurancePolicyId: data.insurancePolicyId,
              isInsuranceApplicable:
                data.isInsuranceApplicable ?? Boolean(data.insurancePolicyId),
            }
          : data.isInsuranceApplicable !== undefined
            ? { isInsuranceApplicable: data.isInsuranceApplicable }
            : {}),
        ...(data.taxPolicyId !== undefined
          ? {
              taxPolicyId: data.taxPolicyId,
              isTaxApplicable:
                data.isTaxApplicable ?? Boolean(data.taxPolicyId),
            }
          : data.isTaxApplicable !== undefined
            ? { isTaxApplicable: data.isTaxApplicable }
            : {}),
        ...(data.attendanceBonusPolicyId !== undefined
          ? {
              attendanceBonusPolicyId: data.attendanceBonusPolicyId,
              isAttendanceBonusApplicable:
                data.isAttendanceBonusApplicable ??
                Boolean(data.attendanceBonusPolicyId),
            }
          : data.isAttendanceBonusApplicable !== undefined
            ? {
                isAttendanceBonusApplicable: data.isAttendanceBonusApplicable,
              }
            : {}),
        ...(data.insuranceSalary !== undefined
          ? { insuranceSalary: data.insuranceSalary }
          : {}),
        ...(data.dependentCount !== undefined
          ? { dependentCount: data.dependentCount }
          : {}),
        ...(data.taxCode !== undefined ? { taxCode: data.taxCode } : {}),
      };

      await prisma.$transaction(
        employeeIds.map((employeeId) =>
          prisma.employeePayrollProfile.upsert({
            where: { employeeId },
            update: profileData,
            create: {
              employeeId,
              insurancePolicyId:
                data.insurancePolicyId === undefined
                  ? null
                  : data.insurancePolicyId,
              taxPolicyId:
                data.taxPolicyId === undefined ? null : data.taxPolicyId,
              attendanceBonusPolicyId:
                data.attendanceBonusPolicyId === undefined
                  ? null
                  : data.attendanceBonusPolicyId,
              isInsuranceApplicable:
                data.isInsuranceApplicable ?? Boolean(data.insurancePolicyId),
              isTaxApplicable:
                data.isTaxApplicable ?? Boolean(data.taxPolicyId),
              isAttendanceBonusApplicable:
                data.isAttendanceBonusApplicable ??
                Boolean(data.attendanceBonusPolicyId),
              insuranceSalary:
                data.insuranceSalary === undefined
                  ? null
                  : data.insuranceSalary,
              dependentCount: data.dependentCount ?? 0,
              taxCode: data.taxCode === undefined ? null : data.taxCode,
            },
          }),
        ),
      );

      return prisma.employeePayrollProfile.findMany({
        where: { employeeId: { in: employeeIds } },
        include: policyInclude,
        orderBy: { employee: { name: "asc" } },
      });
    },
  },
};
