import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import {
  EmployeeStatus,
  Prisma,
  UserRole,
} from "../../generated/prisma/client";
import { ApiError } from "../utils/apiError";
import { sendEmployeeAccountEmail } from "../config/brevo";

type EmployeeListFilters = {
  departmentId?: string;
  positionId?: string;
  status?: EmployeeStatus;
};

type LookupValue = {
  id: string;
  name: string;
};

type CreateEmployeeInput = {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  province?: LookupValue;
  ward?: LookupValue;
  bankAccount?: string;
  bank?: LookupValue;
  departmentId: string;
  positionId: string;
  hireDate: Date;
  salary: number;
};

type CreateEmployeeFromCandidateInput = {
  candidateId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  address?: string;
  province?: LookupValue;
  ward?: LookupValue;
  bankAccount?: string;
  bank?: LookupValue;
  departmentId: string;
  positionId: string;
  hireDate: Date;
  salary: number;
};

type UpdateEmployeeBasicInput = {
  name?: string;
  phone?: string | null;
  avatar?: string | null;
  dateOfBirth?: Date | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  address?: string | null;
  province?: LookupValue | null;
  ward?: LookupValue | null;
  bankAccount?: string | null;
  bank?: LookupValue | null;
};

type UpdateEmployeeAdditionalInput = {
  maritalStatus?: string | null;
  nationality?: string | null;
  religion?: string | null;
  identityCardNumber?: string | null;
  identityCardIssueDate?: Date | null;
  frontIdentityCardImage?: string | null;
  backIdentityCardImage?: string | null;
};

type UpdateEmployeeJobInput = {
  departmentId?: string | null;
  positionId?: string | null;
  hireDate?: Date | null;
  salary?: number | null;
  status?: "WORKING" | "ON_LEAVE" | "RESIGNED";
  effectiveFrom: Date;
};

const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

const getUtcDateRange = (date: Date) => {
  const start = new Date(`${getDateKey(date)}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
};

const employeeInclude = {
  user: {
    select: {
      id: true,
      email: true,
      role: true,
    },
  },
  department: true,
  position: true,
  payrollProfile: {
    include: {
      insurancePolicy: true,
      taxPolicy: {
        include: {
          brackets: {
            orderBy: { fromAmount: "asc" as const },
          },
        },
      },
      attendanceBonusPolicy: true,
    },
  },
  allowances: {
    include: {
      allowancePolicy: true,
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },
  autoPenaltyPolicies: {
    include: {
      autoPenaltyPolicy: {
        include: {
          tiers: {
            orderBy: { fromOccurrence: "asc" as const },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },
};

const toNullableJson = (
  value: LookupValue | null | undefined,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return Prisma.DbNull;
  }

  return value;
};

const ensureEmployeeExists = async (id: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }
};

const ensureDepartmentExists = async (departmentId: string) => {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { id: true },
  });

  if (!department) {
    throw new ApiError(400, "Department not found");
  }
};

const ensurePositionExists = async (positionId: string) => {
  const position = await prisma.position.findUnique({
    where: { id: positionId },
    select: { id: true },
  });

  if (!position) {
    throw new ApiError(400, "Position not found");
  }
};

//ham random password
export const generateTemporaryPassword = (length = 10): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
};

//ham random employeeId
export const generateEmployeeId = async (): Promise<string> => {
  const prefix = "EMP";
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomSuffix}`;
};

export const employeeService = {
  //Ham lấy danh sách nhân viên với phân trang, tìm kiếm
  async getAll(
    page: number,
    limit: number,
    search: string,
    filters: EmployeeListFilters = {},
  ) {
    const normalizedSearch = search.trim();
    const conditions: Prisma.EmployeeWhereInput[] = [];

    if (normalizedSearch) {
      conditions.push({
        OR: [
          {
            name: { contains: normalizedSearch, mode: "insensitive" as const },
          },
        ],
      });
    }

    if (filters.departmentId) {
      conditions.push({ departmentId: filters.departmentId });
    }

    if (filters.positionId) {
      conditions.push({ positionId: filters.positionId });
    }

    if (filters.status) {
      conditions.push({ status: filters.status });
    } else {
      conditions.push({
        status: {
          not: EmployeeStatus.RESIGNED,
        },
      });
    }

    const where: Prisma.EmployeeWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};

    const isFetchAll = limit === -1;
    const normalizedPage = isFetchAll ? 1 : page;

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: employeeInclude,
        ...(isFetchAll
          ? {}
          : {
              skip: (normalizedPage - 1) * limit,
              take: limit,
            }),
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: normalizedPage,
        limit,
        total,
        totalPages: isFetchAll ? 1 : Math.ceil(total / limit),
      },
    };
  },

  //Ham lấy thông tin chi tiết của một nhân viên
  async getById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: employeeInclude,
    });
  },

  async getByUserId(userId: string) {
    return prisma.employee.findUnique({
      where: { userId },
      include: employeeInclude,
    });
  },

  //Ham tạo mới một nhân viên
  async create(data: CreateEmployeeInput) {
    // Kiểm tra tồn tại của departmentId và positionId trước khi tạo nhân viên
    await ensureDepartmentExists(data.departmentId);

    await ensurePositionExists(data.positionId);

    //check user có email trùng không
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ApiError(400, "Email already in use");
    }

    //Tao user va employee trong transaction
    const employeeId = await generateEmployeeId();
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: passwordHash,
          role: UserRole.EMPLOYEE,
        },
      });
      const employee = await tx.employee.create({
        data: {
          ...data,
          employeeId,
          userId: user.id,
        },
        include: employeeInclude,
      });

      await tx.employeeJobHistory.create({
        data: {
          employeeId: employee.id,
          departmentId: employee.departmentId,
          positionId: employee.positionId,
          hireDate: employee.hireDate,
          salary: employee.salary,
          status: employee.status,
          effectiveFrom: employee.hireDate ?? new Date(),
        },
      });

      return { user, employee };
    });
    //gui email cho nhân viên với mật khẩu tạm thời
    try {
      await sendEmployeeAccountEmail(data.email, data.name, temporaryPassword);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new ApiError(500, "Failed to send account email to employee");
    }

    return result.employee;
  },

  async createFromCandidate(data: CreateEmployeeFromCandidateInput) {
    await ensureDepartmentExists(data.departmentId);
    await ensurePositionExists(data.positionId);

    const existingCandidate = await prisma.candidate.findUnique({
      where: { id: data.candidateId },
      select: { id: true },
    });

    if (!existingCandidate) {
      throw new ApiError(404, "Candidate not found");
    }

    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [{ candidateId: data.candidateId }, { userId: data.userId }],
      },
      select: { id: true },
    });

    if (existingEmployee) {
      throw new ApiError(400, "Employee already exists for this candidate");
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: data.userId },
        data: {
          role: UserRole.EMPLOYEE,
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      const employeeId = await generateEmployeeId();

      const employee = await tx.employee.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: data.avatar,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          province: data.province,
          ward: data.ward,
          bankAccount: data.bankAccount,
          bank: data.bank,
          departmentId: data.departmentId,
          positionId: data.positionId,
          hireDate: data.hireDate,
          salary: data.salary,
          employeeId,
          userId: data.userId,
          candidateId: data.candidateId,
        },
        include: employeeInclude,
      });

      await tx.employeeJobHistory.create({
        data: {
          employeeId: employee.id,
          departmentId: employee.departmentId,
          positionId: employee.positionId,
          hireDate: employee.hireDate,
          salary: employee.salary,
          status: employee.status,
          effectiveFrom: employee.hireDate ?? new Date(),
        },
      });

      return { user, employee };
    });

    return result.employee;
  },

  //Ham cập nhật thông tin cơ bản của một nhân viên
  async updateBasic(id: string, data: UpdateEmployeeBasicInput) {
    await ensureEmployeeExists(id);

    return prisma.employee.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
        ...(data.dateOfBirth !== undefined
          ? { dateOfBirth: data.dateOfBirth }
          : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.province !== undefined
          ? { province: toNullableJson(data.province) }
          : {}),
        ...(data.ward !== undefined ? { ward: toNullableJson(data.ward) } : {}),
        ...(data.bankAccount !== undefined
          ? { bankAccount: data.bankAccount }
          : {}),
        ...(data.bank !== undefined ? { bank: toNullableJson(data.bank) } : {}),
      },
      include: employeeInclude,
    });
  },

  async updateAdditional(id: string, data: UpdateEmployeeAdditionalInput) {
    await ensureEmployeeExists(id);

    return prisma.employee.update({
      where: { id },
      data: {
        ...(data.maritalStatus !== undefined
          ? { maritalStatus: data.maritalStatus }
          : {}),
        ...(data.nationality !== undefined
          ? { nationality: data.nationality }
          : {}),
        ...(data.religion !== undefined ? { religion: data.religion } : {}),
        ...(data.identityCardNumber !== undefined
          ? { identityCardNumber: data.identityCardNumber }
          : {}),
        ...(data.identityCardIssueDate !== undefined
          ? { identityCardIssueDate: data.identityCardIssueDate }
          : {}),
        ...(data.frontIdentityCardImage !== undefined
          ? { frontIdentityCardImage: data.frontIdentityCardImage }
          : {}),
        ...(data.backIdentityCardImage !== undefined
          ? { backIdentityCardImage: data.backIdentityCardImage }
          : {}),
      },
      include: employeeInclude,
    });
  },

  async updateJob(id: string, data: UpdateEmployeeJobInput) {
    if (typeof data.departmentId === "string") {
      await ensureDepartmentExists(data.departmentId);
    }

    if (typeof data.positionId === "string") {
      await ensurePositionExists(data.positionId);
    }

    return prisma.$transaction(async (tx) => {
      const employee = await tx.employee.findUnique({
        where: { id },
        select: {
          id: true,
          departmentId: true,
          positionId: true,
          hireDate: true,
          salary: true,
          status: true,
        },
      });

      if (!employee) {
        throw new ApiError(404, "Employee not found");
      }

      const targetHireDate =
        data.hireDate !== undefined ? data.hireDate : employee.hireDate;
      if (
        targetHireDate &&
        getDateKey(data.effectiveFrom) < getDateKey(targetHireDate)
      ) {
        throw new ApiError(
          400,
          "effectiveFrom must be greater than or equal to hireDate",
        );
      }

      const effectiveDateRange = getUtcDateRange(data.effectiveFrom);
      const sameDateJobHistory = await tx.employeeJobHistory.findFirst({
        where: {
          employeeId: id,
          effectiveFrom: {
            gte: effectiveDateRange.start,
            lt: effectiveDateRange.end,
          },
        },
      });

      const historyBase = sameDateJobHistory ?? employee;
      const historyData = {
        departmentId:
          data.departmentId !== undefined
            ? data.departmentId
            : historyBase.departmentId,
        positionId:
          data.positionId !== undefined ? data.positionId : historyBase.positionId,
        hireDate:
          data.hireDate !== undefined ? data.hireDate : historyBase.hireDate,
        salary: data.salary !== undefined ? data.salary : historyBase.salary,
        status: data.status ?? historyBase.status,
        effectiveFrom: data.effectiveFrom,
      };

      if (sameDateJobHistory) {
        await tx.employeeJobHistory.update({
          where: { id: sameDateJobHistory.id },
          data: historyData,
        });
      } else {
        const previousJobHistory = await tx.employeeJobHistory.findFirst({
          where: {
            employeeId: id,
            effectiveFrom: { lt: data.effectiveFrom },
          },
          orderBy: { effectiveFrom: "desc" },
        });
        const nextJobHistory = await tx.employeeJobHistory.findFirst({
          where: {
            employeeId: id,
            effectiveFrom: { gt: data.effectiveFrom },
          },
          orderBy: { effectiveFrom: "asc" },
        });

        if (previousJobHistory) {
          await tx.employeeJobHistory.update({
            where: { id: previousJobHistory.id },
            data: { effectiveTo: data.effectiveFrom },
          });
        }

        await tx.employeeJobHistory.create({
          data: {
            employeeId: id,
            ...historyData,
            effectiveTo: nextJobHistory?.effectiveFrom ?? null,
          },
        });
      }

      const jobHistories = await tx.employeeJobHistory.findMany({
        where: { employeeId: id },
        orderBy: { effectiveFrom: "asc" },
      });

      for (const [index, history] of jobHistories.entries()) {
        const effectiveTo = jobHistories[index + 1]?.effectiveFrom ?? null;
        if (history.effectiveTo?.getTime() === effectiveTo?.getTime()) {
          continue;
        }

        await tx.employeeJobHistory.update({
          where: { id: history.id },
          data: { effectiveTo },
        });
      }

      const now = new Date();
      const currentJobHistory = jobHistories.find((history, index) => {
        const nextEffectiveFrom = jobHistories[index + 1]?.effectiveFrom;
        return (
          history.effectiveFrom.getTime() <= now.getTime() &&
          (!nextEffectiveFrom || nextEffectiveFrom.getTime() > now.getTime())
        );
      });

      if (currentJobHistory) {
        await tx.employee.update({
          where: { id },
          data: {
            departmentId: currentJobHistory.departmentId,
            positionId: currentJobHistory.positionId,
            hireDate: currentJobHistory.hireDate,
            salary: currentJobHistory.salary,
            status: currentJobHistory.status,
          },
        });
      }

      return tx.employee.findUniqueOrThrow({
        where: { id },
        include: employeeInclude,
      });
    });
  },


  async getJobHistory(id: string) {
    await ensureEmployeeExists(id);

    return prisma.employeeJobHistory.findMany({
      where: { employeeId: id },
      include: {
        department: true,
        position: true,
      },
      orderBy: { effectiveFrom: "desc" },
    });
  },

  // Hàm đồng bộ lịch sử công việc của tất cả nhân viên dựa trên thời gian hiện tại
  async syncAllJobHistories() {
    console.log("[Job] Starting employee job history synchronization...");
    
    // Lấy tất cả nhân viên
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        departmentId: true,
        positionId: true,
        hireDate: true,
        salary: true,
        status: true,
      }
    });

    let updatedCount = 0;
    const now = new Date();

    for (const emp of employees) {
      const jobHistories = await prisma.employeeJobHistory.findMany({
        where: { employeeId: emp.id },
        orderBy: { effectiveFrom: "asc" },
      });

      const currentJobHistory = jobHistories.find((history, index) => {
        const nextEffectiveFrom = jobHistories[index + 1]?.effectiveFrom;
        return (
          history.effectiveFrom.getTime() <= now.getTime() &&
          (!nextEffectiveFrom || nextEffectiveFrom.getTime() > now.getTime())
        );
      });

      if (currentJobHistory) {
        // So sánh các trường xem có cần update không
        const empSalaryNumber = emp.salary ? Number(emp.salary) : null;
        const historySalaryNumber = currentJobHistory.salary ? Number(currentJobHistory.salary) : null;

        const needsUpdate =
          emp.departmentId !== currentJobHistory.departmentId ||
          emp.positionId !== currentJobHistory.positionId ||
          emp.hireDate?.getTime() !== currentJobHistory.hireDate?.getTime() ||
          empSalaryNumber !== historySalaryNumber ||
          emp.status !== currentJobHistory.status;

        if (needsUpdate) {
          await prisma.employee.update({
            where: { id: emp.id },
            data: {
              departmentId: currentJobHistory.departmentId,
              positionId: currentJobHistory.positionId,
              hireDate: currentJobHistory.hireDate,
              salary: currentJobHistory.salary,
              status: currentJobHistory.status,
            },
          });
          updatedCount++;
        }
      }
    }
    console.log(`[Job] Finished employee job history synchronization. Updated ${updatedCount} employees.`);
  },
};
