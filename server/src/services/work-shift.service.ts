import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

type CreateWorkShiftInput = {
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  lateGracePeriod?: number;
  earlyLeaveGracePeriod?: number;
  checkInStartTime: string;
  checkInEndTime: string;
  checkOutStartTime: string;
  checkOutEndTime: string;
  isOvernight?: boolean;
  isOvertime?: boolean;
  workUnits: number; // Required
  overtimeMultiplier?: number;
};

type UpdateWorkShiftInput = Partial<CreateWorkShiftInput> & {
  isActive?: boolean;
};

type ScheduleDetail = {
  date: string;
  workShiftIds?: string[];
};

const getUtcStartOfToday = () => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
};

const ensureActiveCodeUnique = async (code: string, excludeId?: string) => {
  // Ensure no other *active* shift uses the same code. After applying
  // a partial unique index on (code) WHERE is_active = true, this
  // enforces uniqueness for active shifts only and allows reusing codes
  // from archived/inactive records for historical display.
  const existing = await prisma.workShift.findFirst({
    where: {
      code,
      isActive: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, isActive: true },
  });

  if (existing) {
    throw new ApiError(400, "Work shift code already exists");
  }
};

const getWorkShiftOrThrow = async (id: string) => {
  const workShift = await prisma.workShift.findUnique({
    where: { id },
  });

  if (!workShift) {
    throw new ApiError(404, "Work shift not found");
  }

  return workShift;
};

const hasShiftFieldUpdates = (data: UpdateWorkShiftInput) =>
  [
    data.code,
    data.name,
    data.startTime,
    data.endTime,
    data.breakStartTime,
    data.breakEndTime,
    data.lateGracePeriod,
    data.earlyLeaveGracePeriod,
    data.checkInStartTime,
    data.checkInEndTime,
    data.checkOutStartTime,
    data.checkOutEndTime,
    data.isOvernight,
    data.isOvertime,
    data.workUnits,
    data.overtimeMultiplier,
  ].some((value) => value !== undefined);

const parseClockToMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return hours * 60 + minutes;
};

const ensureValidShiftTimeRange = (data: {
  startTime: string;
  endTime: string;
  isOvernight?: boolean;
}) => {
  if (data.isOvernight) {
    return;
  }

  if (parseClockToMinutes(data.endTime) <= parseClockToMinutes(data.startTime)) {
    throw new ApiError(
      400,
      "End time must be after start time when isOvernight is false",
    );
  }
};

const activateShift = async (id: string) => {
  const shift = await getWorkShiftOrThrow(id);

  if (shift.isActive) {
    return shift;
  }

  await ensureActiveCodeUnique(shift.code, shift.id);

  return prisma.workShift.update({
    where: { id },
    data: { isActive: true },
  });
};

const parseScheduleDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid schedule date: ${value}`);
  }

  return date;
};

const updateScheduleDetailsForShift = (
  scheduleDetails: ScheduleDetail[],
  shiftId: string,
  cutoff: Date,
  replacementShiftId?: string,
) => {
  let changed = false;

  const updated = scheduleDetails
    .map((detail) => {
      const date = parseScheduleDate(detail.date);

      if (date.getTime() <= cutoff.getTime()) {
        return detail;
      }

      const ids = Array.isArray(detail.workShiftIds) ? detail.workShiftIds : [];
      let replaced = false;

      const nextIds = ids
        .map((id) => {
          if (id !== shiftId) {
            return id;
          }

          replaced = true;
          return replacementShiftId ?? null;
        })
        .filter((id): id is string => Boolean(id));

      if (!replaced) {
        return detail;
      }

      changed = true;

      if (nextIds.length === 0) {
        return null;
      }

      return {
        ...detail,
        workShiftIds: nextIds,
      };
    })
    .filter((detail): detail is ScheduleDetail => Boolean(detail));

  return { updated, changed };
};

const updateScheduleDetailReferences = async (
  tx: Prisma.TransactionClient,
  shiftId: string,
  cutoff: Date,
  replacementShiftId?: string,
) => {
  const setups = await tx.workScheduleSetup.findMany({
    select: { id: true, scheduleDetails: true },
  });

  for (const setup of setups) {
    if (!Array.isArray(setup.scheduleDetails)) {
      continue;
    }

    const { updated, changed } = updateScheduleDetailsForShift(
      setup.scheduleDetails as ScheduleDetail[],
      shiftId,
      cutoff,
      replacementShiftId,
    );

    if (changed) {
      await tx.workScheduleSetup.update({
        where: { id: setup.id },
        data: { scheduleDetails: updated as unknown as Prisma.InputJsonValue },
      });
    }
  }

  const requests = await tx.workScheduleRequest.findMany({
    select: { id: true, scheduleDetails: true },
  });

  for (const request of requests) {
    if (!Array.isArray(request.scheduleDetails)) {
      continue;
    }

    const { updated, changed } = updateScheduleDetailsForShift(
      request.scheduleDetails as ScheduleDetail[],
      shiftId,
      cutoff,
      replacementShiftId,
    );

    if (changed) {
      await tx.workScheduleRequest.update({
        where: { id: request.id },
        data: { scheduleDetails: updated as unknown as Prisma.InputJsonValue },
      });
    }
  }
};

export const workShiftService = {
  async create(data: CreateWorkShiftInput) {
    await ensureActiveCodeUnique(data.code);
    ensureValidShiftTimeRange(data);

    return prisma.workShift.create({
      data: {
        code: data.code,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        breakStartTime: data.breakStartTime,
        breakEndTime: data.breakEndTime,
        lateGracePeriod: data.lateGracePeriod ?? 0,
        earlyLeaveGracePeriod: data.earlyLeaveGracePeriod ?? 0,
        checkInStartTime: data.checkInStartTime,
        checkInEndTime: data.checkInEndTime,
        checkOutStartTime: data.checkOutStartTime,
        checkOutEndTime: data.checkOutEndTime,
        isOvernight: data.isOvernight ?? false,
        isOvertime: data.isOvertime ?? false,
        workUnits: data.workUnits,
        overtimeMultiplier: data.overtimeMultiplier ?? 1,
      },
    });
  },

  async update(id: string, data: UpdateWorkShiftInput) {
    const hasShiftUpdates = hasShiftFieldUpdates(data);

    if (!hasShiftUpdates && data.isActive !== undefined) {
      return data.isActive ? activateShift(id) : workShiftService.remove(id);
    }

    if (data.isActive !== undefined) {
      throw new ApiError(
        400,
        "Use deactivate/reactivate without other updates",
      );
    }

    const currentShift = await getWorkShiftOrThrow(id);
    const nextCode = data.code !== undefined ? data.code : currentShift.code;

    await ensureActiveCodeUnique(nextCode, id);

    const nextShiftData = {
      code: nextCode,
      name: data.name !== undefined ? data.name : currentShift.name,
      startTime:
        data.startTime !== undefined ? data.startTime : currentShift.startTime,
      endTime: data.endTime !== undefined ? data.endTime : currentShift.endTime,
      breakStartTime:
        data.breakStartTime !== undefined
          ? data.breakStartTime
          : currentShift.breakStartTime,
      breakEndTime:
        data.breakEndTime !== undefined
          ? data.breakEndTime
          : currentShift.breakEndTime,
      lateGracePeriod:
        data.lateGracePeriod !== undefined
          ? data.lateGracePeriod
          : currentShift.lateGracePeriod,
      earlyLeaveGracePeriod:
        data.earlyLeaveGracePeriod !== undefined
          ? data.earlyLeaveGracePeriod
          : currentShift.earlyLeaveGracePeriod,
      checkInStartTime:
        data.checkInStartTime !== undefined
          ? data.checkInStartTime
          : currentShift.checkInStartTime,
      checkInEndTime:
        data.checkInEndTime !== undefined
          ? data.checkInEndTime
          : currentShift.checkInEndTime,
      checkOutStartTime:
        data.checkOutStartTime !== undefined
          ? data.checkOutStartTime
          : currentShift.checkOutStartTime,
      checkOutEndTime:
        data.checkOutEndTime !== undefined
          ? data.checkOutEndTime
          : currentShift.checkOutEndTime,
      isOvernight:
        data.isOvernight !== undefined
          ? data.isOvernight
          : currentShift.isOvernight,
      isOvertime:
        data.isOvertime !== undefined
          ? data.isOvertime
          : currentShift.isOvertime,
      workUnits:
        data.workUnits !== undefined ? data.workUnits : currentShift.workUnits,
      overtimeMultiplier:
        data.overtimeMultiplier !== undefined
          ? data.overtimeMultiplier
          : currentShift.overtimeMultiplier,
      isActive: true,
    };

    ensureValidShiftTimeRange(nextShiftData);

    const todayStart = getUtcStartOfToday();

    try {
      return await prisma.$transaction(async (tx) => {
        // deactivate current shift. We DO NOT modify the old `code` so
        // historical schedules that reference the code/name keep displaying
        // the original value. Uniqueness for active codes is enforced by
        // a partial unique index (see server/prisma/partial_unique_index.sql)
        await tx.workShift.update({
          where: { id: currentShift.id },
          data: { isActive: false },
        });

        const newShift = await tx.workShift.create({
          data: nextShiftData,
        });

        await tx.workScheduleShift.updateMany({
          where: {
            workShiftId: currentShift.id,
            workSchedule: {
              date: { gt: todayStart },
            },
          },
          data: { workShiftId: newShift.id },
        });

        await updateScheduleDetailReferences(
          tx,
          currentShift.id,
          todayStart,
          newShift.id,
        );

        return newShift;
      });
    } catch (err: any) {
      // Map common Prisma errors to ApiError for clearer client responses
      if (err?.code === "P2002") {
        // Unique constraint failed (duplicate code or other unique field)
        throw new ApiError(
          400,
          "Dữ liệu bị trùng (vi phạm ràng buộc duy nhất)",
        );
      }

      if (err?.code === "P2025") {
        throw new ApiError(404, "Dữ liệu cần cập nhật không tồn tại");
      }

      throw err;
    }
  },

  async remove(id: string) {
    await getWorkShiftOrThrow(id);
    const todayStart = getUtcStartOfToday();

    return prisma.$transaction(async (tx) => {
      const shift = await tx.workShift.update({
        where: { id },
        data: { isActive: false },
      });

      await tx.workScheduleShift.deleteMany({
        where: {
          workShiftId: id,
          workSchedule: {
            date: { gt: todayStart },
          },
        },
      });

      await updateScheduleDetailReferences(tx, id, todayStart);

      return shift;
    });
  },

  async getAll() {
    return workShiftService.getAllByStatus(false);
  },

  async getAllByStatus(includeInactive: boolean) {
    return prisma.workShift.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return getWorkShiftOrThrow(id);
  },
};
