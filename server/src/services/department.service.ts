import { prisma } from "../config/prisma";

export const departmentService = {
  async getAll() {
    return prisma.department.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async create(data: { name: string; description?: string }) {
    return prisma.department.create({
      data,
    });
  },
};
