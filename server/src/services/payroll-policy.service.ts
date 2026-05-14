import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

type DecimalInput = string | number;

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

type CreateAllowancePolicyInput = {
  name: string;
  description?: string | null;
  amount: DecimalInput;
  isActive?: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
};

type UpdateAllowancePolicyInput = Partial<CreateAllowancePolicyInput>;

type AssignPayrollPoliciesInput = {
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

type AssignAllowancePolicyInput = {
  allowancePolicyId: string;
  departmentIds?: string[];
  positionIds?: string[];
};

type CreatePayrollBonusPenaltyInput = {
  employeeId: string;
  month: Date;
  amount: DecimalInput;
  reason?: string | null;
};

type UpdatePayrollBonusPenaltyInput =
  Partial<CreatePayrollBonusPenaltyInput>;

type PayrollProfileQuery = {
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
};

type EmployeeAllowanceQuery = PayrollProfileQuery & {
  allowancePolicyId?: string;
};

type PayrollBonusPenaltyQuery = PayrollProfileQuery & {
  month?: Date;
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

const buildPolicyWhere = (query: PolicyQuery) => ({
  ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
});

const getTargetEmployeeIds = async (data: {
  departmentIds?: string[];
  positionIds?: string[];
}) => {
  if (!data.departmentIds?.length || !data.positionIds?.length) {
    throw new ApiError(
      400,
      "departmentIds and positionIds are required for assignment",
      "ASSIGNMENT_TARGET_REQUIRED",
    );
  }

  const employees = await prisma.employee.findMany({
    where: {
      departmentId: { in: data.departmentIds },
      positionId: { in: data.positionIds },
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
        data.effectiveTo === undefined ? existing.effectiveTo : data.effectiveTo,
      );

      return prisma.insurancePolicy.update({
        where: { id },
        data,
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
        data.effectiveTo === undefined ? existing.effectiveTo : data.effectiveTo,
      );
      ensureTaxBrackets(data.brackets);

      return prisma.$transaction(async (tx) => {
        if (data.brackets) {
          await tx.taxBracket.deleteMany({ where: { policyId: id } });
        }

        return tx.taxPolicy.update({
          where: { id },
          data: {
            name: data.name,
            personalDeduction: data.personalDeduction,
            dependentDeduction: data.dependentDeduction,
            effectiveFrom: data.effectiveFrom,
            effectiveTo: data.effectiveTo,
            isActive: data.isActive,
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
        data.effectiveTo === undefined ? existing.effectiveTo : data.effectiveTo,
      );

      return prisma.attendanceBonusPolicy.update({
        where: { id },
        data,
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
        data.effectiveTo === undefined ? existing.effectiveTo : data.effectiveTo,
      );

      return prisma.allowancePolicy.update({
        where: { id },
        data,
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

  payrollBonusPenalties: {
    getAll(query: PayrollBonusPenaltyQuery) {
      return prisma.payrollBonusPenalty.findMany({
        where: {
          ...(query.employeeId ? { employeeId: query.employeeId } : {}),
          ...(query.month ? { month: query.month } : {}),
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

    async create(data: CreatePayrollBonusPenaltyInput) {
      await ensureEmployeeExists(data.employeeId);

      return prisma.payrollBonusPenalty.create({
        data,
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
        data,
        include: payrollBonusPenaltyInclude,
      });
    },

    async delete(id: string) {
      await this.getById(id);

      return prisma.payrollBonusPenalty.delete({
        where: { id },
        include: payrollBonusPenaltyInclude,
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
                isAttendanceBonusApplicable:
                  data.isAttendanceBonusApplicable,
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
                data.isInsuranceApplicable ??
                Boolean(data.insurancePolicyId),
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
