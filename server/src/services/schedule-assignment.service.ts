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

const ensureWorkShiftsExist = async (workShiftIds: string[]) => {
  if (workShiftIds.length === 0) {
    return;
  }

  const workShifts = await prisma.workShift.findMany({
    where: {
      id: {
        in: workShiftIds,
      },
    },
    select: {
      id: true,
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
};

const parseDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid schedule date: ${value}`);
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
    .map((detail) => parseDate(detail.date))
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

const normalizeFutureScheduleDetails = (
  scheduleDetails: ScheduleDetail[],
  referenceTime = new Date(),
) => {
  const detailsByDate = new Map<string, Set<string>>();

  for (const detail of scheduleDetails) {
    const date = parseDate(detail.date);

    if (date.getTime() <= referenceTime.getTime()) {
      continue;
    }

    const workShiftIds =
      detailsByDate.get(date.toISOString()) ?? new Set<string>();

    for (const workShiftId of normalizeIds(detail.workShiftIds)) {
      workShiftIds.add(workShiftId);
    }

    detailsByDate.set(date.toISOString(), workShiftIds);
  }

  return Array.from(detailsByDate.entries()).map(([date, workShiftIds]) => ({
    date,
    workShiftIds: Array.from(workShiftIds),
  }));
};

export const applyScheduleAssignments = async (
  tx: Prisma.TransactionClient,
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
      const schedule = await tx.workSchedule.upsert({
        where: { employeeId_date: { employeeId, date: detail.date } },
        update: {},
        create: {
          employeeId,
          date: detail.date,
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

    await ensureWorkShiftsExist(workShiftIds);

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
    await ensureWorkShiftsExist(workShiftIds);

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
};
