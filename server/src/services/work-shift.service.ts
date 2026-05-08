import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

type CreateWorkShiftInput = {
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  lateGracePeriod?: number;
  earlyLeaveGracePeriod?: number;
  isOvertime?: boolean;
  workUnits: number; // Required
  overtimeMultiplier?: number;
};

type UpdateWorkShiftInput = Partial<CreateWorkShiftInput> & {
  isActive?: boolean;
};

const ensureWorkShiftExists = async (id: string) => {
  const workShift = await prisma.workShift.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!workShift) {
    throw new ApiError(404, "Work shift not found");
  }
};

export const workShiftService = {
  async create(data: CreateWorkShiftInput) {
    // ensure code unique
    const existing = await prisma.workShift.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new ApiError(400, "Work shift code already exists");
    }

    return prisma.workShift.create({
      data: {
        code: data.code,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        breakStartTime: data.breakStartTime,
        breakEndTime: data.breakEndTime,
        lateGracePeriod: data.lateGracePeriod,
        earlyLeaveGracePeriod: data.earlyLeaveGracePeriod,
        isOvertime: data.isOvertime ?? false,
        workUnits: data.workUnits,
        overtimeMultiplier: data.overtimeMultiplier ?? undefined,
      },
    });
  },

  async update(id: string, data: UpdateWorkShiftInput) {
    await ensureWorkShiftExists(id);

    if (data.code) {
      const existing = await prisma.workShift.findUnique({
        where: { code: data.code },
        select: { id: true },
      });

      if (existing && existing.id !== id) {
        throw new ApiError(400, "Work shift code already exists");
      }
    }

    return prisma.workShift.update({
      where: { id },
      data: {
        ...(data.code !== undefined ? { code: data.code } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.startTime !== undefined ? { startTime: data.startTime } : {}),
        ...(data.endTime !== undefined ? { endTime: data.endTime } : {}),
        ...(data.breakStartTime !== undefined
          ? { breakStartTime: data.breakStartTime }
          : {}),
        ...(data.breakEndTime !== undefined
          ? { breakEndTime: data.breakEndTime }
          : {}),
        ...(data.lateGracePeriod !== undefined
          ? { lateGracePeriod: data.lateGracePeriod }
          : {}),
        ...(data.earlyLeaveGracePeriod !== undefined
          ? { earlyLeaveGracePeriod: data.earlyLeaveGracePeriod }
          : {}),
        ...(data.isOvertime !== undefined
          ? { isOvertime: data.isOvertime }
          : {}),
        ...(data.workUnits !== undefined ? { workUnits: data.workUnits } : {}),
        ...(data.overtimeMultiplier !== undefined
          ? { overtimeMultiplier: data.overtimeMultiplier }
          : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  },

  async remove(id: string) {
    await ensureWorkShiftExists(id);

    return prisma.workShift.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async getAll() {
    return prisma.workShift.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    const s = await prisma.workShift.findUnique({ where: { id } });
    if (!s) throw new ApiError(404, "Work shift not found");
    return s;
  },
};
