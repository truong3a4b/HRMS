import {
  ApprovalMode,
  Prisma,
  RequestStatus,
  RequestType,
} from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

type ScheduleDetail = {
  date: string;
  workShiftIds: string[];
};

type CreateSetupInput = {
  name: string;
  description?: string;
  applicableDepartments?: string[];
  applicablePositions?: string[];
  scheduleDetails: ScheduleDetail[];
};

type RegisterScheduleRequestInput = {
  title: string;
  description?: string;
  month: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
  scheduleDetails: ScheduleDetail[];
};

const requestInclude = {
  requester: {
    select: {
      id: true,
      email: true,
      role: true,
    },
  },
  approvals: {
    include: {
      approver: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  },
  watchers: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  },
} satisfies Prisma.RequestInclude;

const normalizeIds = (values: string[]) =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))].filter(
    Boolean,
  );

const ensureUsersExist = async (userIds: string[]) => {
  if (userIds.length === 0) {
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
    },
  });

  const foundUserIds = new Set(users.map((user) => user.id));
  const missingUserIds = userIds.filter((userId) => !foundUserIds.has(userId));

  if (missingUserIds.length > 0) {
    throw new ApiError(400, `User not found: ${missingUserIds.join(", ")}`);
  }
};

const getWorkShiftIdsFromDetails = (scheduleDetails: ScheduleDetail[]) =>
  normalizeIds(scheduleDetails.flatMap((detail) => detail.workShiftIds ?? []));

type WorkShiftInfo = {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  isActive: boolean;
};

const getWorkShiftsByIds = async (
  workShiftIds: string[],
  requireActive = true,
) => {
  if (workShiftIds.length === 0) {
    return new Map<string, WorkShiftInfo>();
  }

  const workShifts = await prisma.workShift.findMany({
    where: {
      id: {
        in: workShiftIds,
      },
    },
    select: {
      id: true,
      code: true,
      name: true,
      startTime: true,
      endTime: true,
      isOvernight: true,
      isActive: true,
    },
  });

  const foundWorkShiftIds = new Set(
    workShifts.map((workShift) => workShift.id),
  );
  const missingWorkShiftIds = workShiftIds.filter(
    (workShiftId) => !foundWorkShiftIds.has(workShiftId),
  );

  if (missingWorkShiftIds.length > 0) {
    throw new ApiError(
      400,
      `Work shift not found: ${missingWorkShiftIds.join(", ")}`,
    );
  }

  if (requireActive) {
    const inactive = workShifts
      .filter((shift) => !shift.isActive)
      .map((shift) => shift.code || shift.id);

    if (inactive.length > 0) {
      throw new ApiError(400, `Work shifts inactive: ${inactive.join(", ")}`);
    }
  }

  return new Map(workShifts.map((workShift) => [workShift.id, workShift]));
};

const MINUTES_PER_DAY = 24 * 60;

const parseClockToMinutes = (value: string, label: string) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (!match) {
    throw new ApiError(400, `Invalid ${label} time: ${value}`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours * 60 + minutes;
};

const ensureNoOverlappingWorkShifts = (
  scheduleDetails: ScheduleDetail[],
  workShiftsById: Map<string, WorkShiftInfo>,
) => {
  for (const detail of scheduleDetails) {
    const intervals = detail.workShiftIds.flatMap((workShiftId) => {
      const shift = workShiftsById.get(workShiftId);

      if (!shift) {
        throw new ApiError(400, `Work shift not found: ${workShiftId}`);
      }

      const start = parseClockToMinutes(shift.startTime, "start");
      const endRaw = parseClockToMinutes(shift.endTime, "end");

      if (shift.isOvernight) {
        return [
          { start, end: MINUTES_PER_DAY, shift },
          { start: 0, end: endRaw, shift },
        ];
      }

      return [{ start, end: endRaw, shift }];
    });

    const sortedIntervals = [...intervals].sort((a, b) => a.start - b.start);

    for (let index = 1; index < sortedIntervals.length; index += 1) {
      const previous = sortedIntervals[index - 1];
      const current = sortedIntervals[index];

      if (current.start < previous.end) {
        throw new ApiError(
          400,
          `Work shifts overlap on ${detail.date}: ${previous.shift.code} (${previous.shift.startTime}-${previous.shift.endTime}) and ${current.shift.code} (${current.shift.startTime}-${current.shift.endTime})`,
        );
      }
    }
  }
};

const parseDateOnly = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new ApiError(400, "date must be in YYYY-MM-DD format");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new ApiError(400, "date is invalid");
  }

  return date;
};

const parseMonth = (value: string) => {
  const match = /^(\d{4})-(\d{2})$/.exec(value);

  if (!match) {
    throw new ApiError(400, "month must be in YYYY-MM format");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) {
    throw new ApiError(400, "month must be in YYYY-MM format");
  }

  return new Date(Date.UTC(year, month - 1, 1));
};

const ensureScheduleDetailsInMonth = (
  scheduleDetails: ScheduleDetail[],
  monthStart: Date,
) => {
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();
  const invalidDates = scheduleDetails
    .map((detail) => parseDateOnly(detail.date))
    .filter(
      (date) => date.getUTCFullYear() !== year || date.getUTCMonth() !== month,
    )
    .map((date) => date.toISOString().slice(0, 10));

  if (invalidDates.length > 0) {
    throw new ApiError(
      400,
      `Schedule dates must be within registration month: ${[
        ...new Set(invalidDates),
      ].join(", ")}`,
    );
  }
};

const ensureEmployeeExists = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }
};

const normalizeFutureScheduleDetails = (
  scheduleDetails: ScheduleDetail[],
  referenceTime = new Date(),
) => {
  const detailsByDate = new Map<string, Set<string>>();
  const referenceDate = new Date(
    Date.UTC(
      referenceTime.getUTCFullYear(),
      referenceTime.getUTCMonth(),
      referenceTime.getUTCDate(),
    ),
  );

  for (const detail of scheduleDetails) {
    const date = parseDateOnly(detail.date);

    if (date.getTime() <= referenceDate.getTime()) {
      continue;
    }

    const dateKey = date.toISOString().slice(0, 10);
    const workShiftIds =
      detailsByDate.get(dateKey) ?? new Set<string>();

    for (const workShiftId of normalizeIds(detail.workShiftIds)) {
      workShiftIds.add(workShiftId);
    }

    detailsByDate.set(dateKey, workShiftIds);
  }

  return Array.from(detailsByDate.entries()).map(([date, workShiftIds]) => ({
    date,
    workShiftIds: Array.from(workShiftIds),
  }));
};

export const applyScheduleAssignments = async (
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  employeeIds: string[],
  scheduleDetails: ScheduleDetail[],
  referenceTime = new Date(),
) => {
  const normalizedScheduleDetails = normalizeFutureScheduleDetails(
    scheduleDetails,
    referenceTime,
  );

  if (employeeIds.length === 0 || normalizedScheduleDetails.length === 0) {
    return;
  }

  for (const employeeId of employeeIds) {
    for (const detail of normalizedScheduleDetails) {
      const dateObj = parseDateOnly(detail.date);
      const schedule = await tx.workSchedule.upsert({
        where: { employeeId_date: { employeeId, date: dateObj } },
        update: {},
        create: {
          employeeId,
          date: dateObj,
        },
      });

      await tx.workScheduleShift.deleteMany({
        where: { workScheduleId: schedule.id },
      });

      await tx.workScheduleShift.createMany({
        data: detail.workShiftIds.map((workShiftId) => ({
          workScheduleId: schedule.id,
          workShiftId,
        })),
        skipDuplicates: true,
      });
    }
  }
};

export const scheduleAssignmentService = {
  async applyForEmployee(
    employeeId: string,
    scheduleDetails: ScheduleDetail[],
  ) {
    const futureScheduleDetails =
      normalizeFutureScheduleDetails(scheduleDetails);
    const workShiftIds = getWorkShiftIdsFromDetails(futureScheduleDetails);

    if (futureScheduleDetails.length === 0) {
      throw new ApiError(
        400,
        "At least one future schedule detail is required",
      );
    }

    await ensureEmployeeExists(employeeId);

    const workShiftsById = await getWorkShiftsByIds(workShiftIds);
    ensureNoOverlappingWorkShifts(futureScheduleDetails, workShiftsById);

    await prisma.$transaction(async (tx) => {
      await applyScheduleAssignments(tx, [employeeId], futureScheduleDetails);
    });

    return {
      employeeId,
      appliedDates: futureScheduleDetails.map((detail) => detail.date),
    };
  },

  async createSetupAndApply(payload: CreateSetupInput) {
    const futureScheduleDetails = normalizeFutureScheduleDetails(
      payload.scheduleDetails,
    );
    const workShiftIds = getWorkShiftIdsFromDetails(futureScheduleDetails);

    if (futureScheduleDetails.length === 0) {
      throw new ApiError(
        400,
        "At least one future schedule detail is required",
      );
    }

    const workShiftsById = await getWorkShiftsByIds(workShiftIds);
    ensureNoOverlappingWorkShifts(futureScheduleDetails, workShiftsById);

    const setup = await prisma.workScheduleSetup.create({
      data: {
        name: payload.name,
        description: payload.description,
        applicableDepartments: payload.applicableDepartments ?? undefined,
        applicablePositions: payload.applicablePositions ?? undefined,
        scheduleDetails: futureScheduleDetails as any,
      },
    });

    const employeeIdsSet = new Set<string>();

    if (
      (payload.applicableDepartments && payload.applicableDepartments.length) ||
      (payload.applicablePositions && payload.applicablePositions.length)
    ) {
      const employees = await prisma.employee.findMany({
        where: {
          OR: [
            ...(payload.applicableDepartments
              ? payload.applicableDepartments.map((d) => ({ departmentId: d }))
              : []),
            ...(payload.applicablePositions
              ? payload.applicablePositions.map((p) => ({ positionId: p }))
              : []),
          ],
        },
        select: { id: true },
      });

      for (const employee of employees) {
        employeeIdsSet.add(employee.id);
      }
    }

    const employeeIds = Array.from(employeeIdsSet);

    if (employeeIds.length === 0) {
      return setup;
    }

    await prisma.$transaction(async (tx) => {
      await applyScheduleAssignments(tx, employeeIds, futureScheduleDetails);
    });

    return setup;
  },

  async createRegistrationRequest(
    requesterId: string,
    payload: RegisterScheduleRequestInput,
  ) {
    const monthStart = parseMonth(payload.month);
    ensureScheduleDetailsInMonth(payload.scheduleDetails, monthStart);

    const futureScheduleDetails = normalizeFutureScheduleDetails(
      payload.scheduleDetails,
    );
    const workShiftIds = getWorkShiftIdsFromDetails(futureScheduleDetails);

    const approverIds = normalizeIds(payload.approverIds);
    const watcherIds = normalizeIds(payload.watcherIds ?? []);

    if (futureScheduleDetails.length === 0) {
      throw new ApiError(
        400,
        "At least one future schedule detail is required",
      );
    }

    if (approverIds.length === 0) {
      throw new ApiError(400, "At least one approver is required");
    }

    if (approverIds.includes(requesterId) || watcherIds.includes(requesterId)) {
      throw new ApiError(
        400,
        "Requester cannot be an approver or watcher of the same request",
      );
    }

    await ensureUsersExist([requesterId, ...approverIds, ...watcherIds]);
    const workShiftsById = await getWorkShiftsByIds(workShiftIds);
    ensureNoOverlappingWorkShifts(futureScheduleDetails, workShiftsById);

    const request = await prisma.$transaction(async (tx) => {
      const createdRequest = await tx.request.create({
        data: {
          type: RequestType.SCHEDULE_APPROVAL,
          title: payload.title,
          description: payload.description,
          requesterId,
          approvalMode: payload.approvalMode ?? ApprovalMode.PARALLEL,
          status: RequestStatus.PENDING,
          currentStep: 1,
          approvals: {
            create: approverIds.map((approverId, index) => ({
              approverId,
              stepOrder: index + 1,
            })),
          },
          watchers: {
            create: watcherIds.map((userId) => ({
              userId,
            })),
          },
        },
        include: requestInclude,
      });

      await tx.workScheduleRequest.create({
        data: {
          requestId: createdRequest.id,
          month: monthStart,
          scheduleDetails: futureScheduleDetails as Prisma.InputJsonValue,
        },
      });

      return createdRequest;
    });

    return request;
  },

  async getEmployeeScheduleByMonth(
    employeeId: string,
    year: number,
    month: number,
  ) {
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 1));

    const items = await prisma.workSchedule.findMany({
      where: { employeeId, date: { gte: from, lt: to } },
      select: {
        id: true,
        date: true,
        shiftLinks: {
          include: {
            workShift: {
              select: {
                id: true,
                code: true,
                name: true,
                startTime: true,
                endTime: true,
                isOvertime: true,
              },
            },
          },
          orderBy: { workShift: { startTime: "asc" } },
        },
      },
      orderBy: { date: "asc" },
    });

    return items.map(({ shiftLinks, ...schedule }) => ({
      ...schedule,
      workShifts: shiftLinks.map((link) => link.workShift),
    }));
  },

  async getEmployeeScheduleByDate(employeeId: string, dateValue: string) {
    const date = parseDateOnly(dateValue);
    const from = date;
    const to = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate() + 1,
      ),
    );

    const item = await prisma.workSchedule.findFirst({
      where: { employeeId, date: { gte: from, lt: to } },
      select: {
        id: true,
        date: true,
        shiftLinks: {
          include: {
            workShift: {
              select: {
                id: true,
                code: true,
                name: true,
                startTime: true,
                endTime: true,
                isOvertime: true,
              },
            },
          },
          orderBy: { workShift: { startTime: "asc" } },
        },
      },
    });

    if (!item) {
      return null;
    }

    return {
      id: item.id,
      date: item.date,
      workShifts: item.shiftLinks.map((link) => link.workShift),
    };
  },
};
