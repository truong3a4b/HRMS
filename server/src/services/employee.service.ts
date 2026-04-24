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

type CreateEmployeeInput = {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  provinceCode?: string;
  wardCode?: string;
  bankAccount?: string;
  bankCode?: string;
  departmentId: string;
  positionId: string;
  hireDate: Date;
  salary: number;
};

type UpdateEmployeeBasicInput = {
  name?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  provinceCode?: string;
  wardCode?: string;
  bankAccount?: string;
  bankCode?: string;
};

type UpdateEmployeeAdditionalInput = {
  maritalStatus?: string;
  nationality?: string;
  religion?: string;
  identityCardNumber?: string;
  identityCardIssueDate?: Date;
  frontIdentityCardImage?: string;
  backIdentityCardImage?: string;
};

type UpdateEmployeeJobInput = {
  departmentId?: string | null;
  positionId?: string | null;
  hireDate?: Date | null;
  salary?: number | null;
  status?: "WORKING" | "ON_LEAVE" | "RESIGNED";
  effectiveFrom: Date;
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
    }

    const where: Prisma.EmployeeWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: employeeInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: temporaryPassword,
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

  //Ham cập nhật thông tin cơ bản của một nhân viên
  async updateBasic(id: string, data: UpdateEmployeeBasicInput) {
    await ensureEmployeeExists(id);

    return prisma.employee.update({
      where: { id },
      data,
      include: employeeInclude,
    });
  },

  async updateAdditional(id: string, data: UpdateEmployeeAdditionalInput) {
    await ensureEmployeeExists(id);

    return prisma.employee.update({
      where: { id },
      data,
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

      const latestJobHistory = await tx.employeeJobHistory.findFirst({
        where: { employeeId: id },
        orderBy: { effectiveFrom: "desc" },
      });

      if (
        latestJobHistory &&
        data.effectiveFrom.getTime() <= latestJobHistory.effectiveFrom.getTime()
      ) {
        throw new ApiError(
          400,
          "effectiveFrom must be greater than the latest applied date",
        );
      }

      const activeJobHistory = await tx.employeeJobHistory.findFirst({
        where: {
          employeeId: id,
          effectiveTo: null,
        },
        orderBy: { effectiveFrom: "desc" },
      });

      if (activeJobHistory) {
        await tx.employeeJobHistory.update({
          where: { id: activeJobHistory.id },
          data: {
            effectiveTo: data.effectiveFrom,
          },
        });
      }

      await tx.employeeJobHistory.create({
        data: {
          employeeId: id,
          departmentId:
            data.departmentId !== undefined
              ? data.departmentId
              : employee.departmentId,
          positionId:
            data.positionId !== undefined
              ? data.positionId
              : employee.positionId,
          hireDate:
            data.hireDate !== undefined ? data.hireDate : employee.hireDate,
          salary: data.salary !== undefined ? data.salary : employee.salary,
          status: data.status ?? employee.status,
          effectiveFrom: data.effectiveFrom,
        },
      });

      return tx.employee.update({
        where: { id },
        data: {
          ...(data.departmentId !== undefined
            ? { departmentId: data.departmentId }
            : {}),
          ...(data.positionId !== undefined
            ? { positionId: data.positionId }
            : {}),
          ...(data.hireDate !== undefined ? { hireDate: data.hireDate } : {}),
          ...(data.salary !== undefined ? { salary: data.salary } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
        },
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
};
