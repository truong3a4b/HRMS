import { prisma } from "../config/prisma";

export const employeeService = {
  async getAll(page: number, limit: number, search: string) {
    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            {
              employeeCode: { contains: search, mode: "insensitive" as const },
            },
            {
              user: {
                email: { contains: search, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: true,
          department: true,
        },
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

  async getById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
      },
    });
  },
};
