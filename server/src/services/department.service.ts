import { prisma } from "../config/prisma";
import { EmployeeStatus, Prisma } from "../../generated/prisma/client";
import { ApiError } from "../utils/apiError";

const DEPARTMENT_ERROR_CODES = {
  MANAGER_NOT_FOUND: "DEPARTMENT_MANAGER_NOT_FOUND",
  MANAGER_INVALID_DEPARTMENT: "DEPARTMENT_MANAGER_INVALID_DEPARTMENT",
  MANAGER_ALREADY_ASSIGNED: "DEPARTMENT_MANAGER_ALREADY_ASSIGNED",
  NOT_FOUND: "DEPARTMENT_NOT_FOUND",
  CODE_GENERATION_FAILED: "DEPARTMENT_CODE_GENERATION_FAILED",
  HAS_ASSIGNED_EMPLOYEES: "DEPARTMENT_HAS_ASSIGNED_EMPLOYEES",
} as const;

type CreateDepartmentInput = {
  name: string;
  description?: string;
  managerId?: string | null;
};

type UpdateDepartmentBasicInput = {
  name?: string;
  description?: string | null;
};

type DepartmentManagerSelect = {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  position: {
    id: string;
    name: string;
    code: string | null;
  } | null;
};

const departmentManagerSelect = {
  id: true,
  name: true,
  email: true,
  employeeId: true,
  position: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
};

const buildRandomDepartmentCode = () => {
  const randomSuffix = Math.floor(Math.random() * 900000 + 100000);
  return `DEP-${randomSuffix}`;
};

const isDepartmentCodeConflictError = (error: unknown) => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2002") {
    return false;
  }

  const targets = Array.isArray(error.meta?.target)
    ? error.meta.target.map((target) => String(target))
    : [];

  return targets.includes("code");
};

const ensureEmployeeCanManageDepartment = async (
  managerId: string,
  departmentId?: string,
) => {
  const manager = await prisma.employee.findUnique({
    where: { id: managerId },
    select: {
      id: true,
      departmentId: true,
      managedDepartment: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!manager) {
    throw new ApiError(
      400,
      "Manager employee not found",
      DEPARTMENT_ERROR_CODES.MANAGER_NOT_FOUND,
    );
  }

  if (
    manager.departmentId &&
    departmentId &&
    manager.departmentId !== departmentId
  ) {
    throw new ApiError(
      400,
      "Manager must belong to this department or have no department",
      DEPARTMENT_ERROR_CODES.MANAGER_INVALID_DEPARTMENT,
    );
  }

  if (!departmentId && manager.departmentId) {
    throw new ApiError(
      400,
      "Manager is currently assigned to another department",
      DEPARTMENT_ERROR_CODES.MANAGER_INVALID_DEPARTMENT,
    );
  }

  if (
    manager.managedDepartment &&
    manager.managedDepartment.id !== departmentId
  ) {
    throw new ApiError(
      400,
      `Employee is already manager of department ${manager.managedDepartment.name}`,
      DEPARTMENT_ERROR_CODES.MANAGER_ALREADY_ASSIGNED,
    );
  }

  return manager;
};

export const departmentService = {
  async getAll() {
    const departments = await prisma.department.findMany({
      include: {
        manager: {
          select: departmentManagerSelect,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (departments.length === 0) {
      return [];
    }

    const employeeCountByDepartment = await prisma.employee.groupBy({
      by: ["departmentId"],
      where: {
        departmentId: {
          in: departments.map((department) => department.id),
        },
        status: {
          not: EmployeeStatus.RESIGNED,
        },
      },
      _count: {
        _all: true,
      },
    });

    const countMap = new Map<string, number>();

    for (const row of employeeCountByDepartment) {
      if (row.departmentId) {
        countMap.set(row.departmentId, row._count._all);
      }
    }

    return departments.map((department) => ({
      ...department,
      employeeCount: countMap.get(department.id) ?? 0,
    }));
  },

  async getById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        manager: {
          select: departmentManagerSelect,
        },
      },
    });

    if (!department) {
      return null;
    }

    const employeeCount = await prisma.employee.count({
      where: {
        departmentId: id,
        status: {
          not: EmployeeStatus.RESIGNED,
        },
      },
    });

    return {
      ...department,
      employeeCount,
    };
  },

  async create(data: CreateDepartmentInput) {
    if (data.managerId) {
      await ensureEmployeeCanManageDepartment(data.managerId);
    }

    return prisma.$transaction(async (tx) => {
      let department:
        | Awaited<ReturnType<typeof tx.department.create>>
        | undefined;

      for (let attempt = 0; attempt < 10; attempt++) {
        const code = buildRandomDepartmentCode();

        try {
          department = await tx.department.create({
            data: {
              name: data.name,
              code,
              description: data.description,
              managerId: data.managerId ?? null,
            },
            include: {
              manager: {
                select: departmentManagerSelect,
              },
            },
          });
          break;
        } catch (error) {
          if (isDepartmentCodeConflictError(error)) {
            continue;
          }

          throw error;
        }
      }

      if (!department) {
        throw new ApiError(
          500,
          "Unable to generate a unique department code",
          DEPARTMENT_ERROR_CODES.CODE_GENERATION_FAILED,
        );
      }

      if (data.managerId) {
        await tx.employee.update({
          where: { id: data.managerId },
          data: {
            departmentId: department.id,
          },
        });
      }

      return {
        ...department,
        employeeCount: data.managerId ? 1 : 0,
      };
    });
  },

  async updateManager(departmentId: string, managerId: string | null) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: {
        id: true,
        managerId: true,
      },
    });

    if (!department) {
      throw new ApiError(
        404,
        "Department not found",
        DEPARTMENT_ERROR_CODES.NOT_FOUND,
      );
    }

    if (managerId) {
      await ensureEmployeeCanManageDepartment(managerId, department.id);
    }

    return prisma.$transaction(async (tx) => {
      const updatedDepartment = await tx.department.update({
        where: { id: departmentId },
        data: { managerId },
        include: {
          manager: {
            select: departmentManagerSelect,
          },
        },
      });

      if (managerId) {
        await tx.employee.update({
          where: { id: managerId },
          data: {
            departmentId,
          },
        });
      }

      const employeeCount = await tx.employee.count({
        where: {
          departmentId,
          status: {
            not: EmployeeStatus.RESIGNED,
          },
        },
      });

      return {
        ...updatedDepartment,
        employeeCount,
      };
    });
  },

  async updateBasic(departmentId: string, data: UpdateDepartmentBasicInput) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: {
        id: true,
      },
    });

    if (!department) {
      throw new ApiError(
        404,
        "Department not found",
        DEPARTMENT_ERROR_CODES.NOT_FOUND,
      );
    }

    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
      },
      include: {
        manager: {
          select: departmentManagerSelect,
        },
      },
    });

    const employeeCount = await prisma.employee.count({
      where: {
        departmentId,
        status: {
          not: EmployeeStatus.RESIGNED,
        },
      },
    });

    return {
      ...updatedDepartment,
      employeeCount,
    };
  },

  async remove(departmentId: string) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!department) {
      throw new ApiError(
        404,
        "Department not found",
        DEPARTMENT_ERROR_CODES.NOT_FOUND,
      );
    }

    const employeeCount = await prisma.employee.count({
      where: {
        departmentId,
      },
    });

    if (employeeCount > 0) {
      throw new ApiError(
        400,
        "Cannot delete department while employees are still assigned",
        DEPARTMENT_ERROR_CODES.HAS_ASSIGNED_EMPLOYEES,
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.employeeJobHistory.updateMany({
        where: {
          departmentId,
        },
        data: {
          departmentId: null,
        },
      });

      await tx.department.delete({
        where: {
          id: departmentId,
        },
      });
    });

    return {
      id: department.id,
      name: department.name,
    };
  },
};
