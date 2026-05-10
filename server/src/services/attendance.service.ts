import {
  ApprovalMode,
  AttendanceStatus,
  Prisma,
  RequestStatus,
  RequestType,
  UserRole,
} from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { PERMISSIONS, PermissionKey } from "../constants/permissions";
import { requestService } from "./request.service";
import { ApiError } from "../utils/apiError";

const normalizeIds = (values: string[]) =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))].filter(
    Boolean,
  );

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

const getMonthRange = (month: string) => {
  const start = parseMonth(month);
  const end = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1),
  );

  return { start, end };
};

const parseDateOnly = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid date: ${value}`);
  }

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const toNumber = (value: Prisma.Decimal | number | null | undefined) =>
  value === null || value === undefined ? 0 : Number(value);

const attendanceEmployeeSelect = {
  id: true,
  employeeId: true,
  name: true,
  email: true,
  userId: true,
} satisfies Prisma.EmployeeSelect;

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

const resolveEmployeeForUser = async (
  userId: string,
  role: UserRole,
  employeeId?: string,
) => {
  if (role === UserRole.ADMIN) {
    if (!employeeId) {
      throw new ApiError(400, "employeeId is required for admin requests");
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: attendanceEmployeeSelect,
    });

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    return employee;
  }

  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: attendanceEmployeeSelect,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  if (employeeId && employee.id !== employeeId) {
    throw new ApiError(403, "You can only access your own attendance data");
  }

  return employee;
};

const ensureAttendanceCorrectionIsAllowed = async (params: {
  employeeId: string;
  attendanceDate: Date;
  workShiftId: string;
}) => {
  const workSchedule = await prisma.workSchedule.findUnique({
    where: {
      employeeId_date: {
        employeeId: params.employeeId,
        date: params.attendanceDate,
      },
    },
    include: {
      shiftLinks: {
        include: {
          workShift: true,
        },
      },
    },
  });

  if (!workSchedule || workSchedule.shiftLinks.length === 0) {
    throw new ApiError(
      400,
      "No work schedule found for the selected attendance date",
    );
  }

  const scheduledShift = workSchedule.shiftLinks.find(
    (shiftLink) => shiftLink.workShiftId === params.workShiftId,
  );

  if (!scheduledShift) {
    throw new ApiError(
      400,
      "Selected shift is not assigned on the chosen attendance date",
    );
  }

  const attendanceRecord = await prisma.attendanceRecord.findUnique({
    where: {
      employeeId_date: {
        employeeId: params.employeeId,
        date: params.attendanceDate,
      },
    },
    include: {
      details: {
        where: {
          workShiftId: params.workShiftId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (attendanceRecord?.details.length) {
    throw new ApiError(
      400,
      "Attendance has already been recorded for this shift",
    );
  }

  const duplicateRequest = await prisma.attendanceCorrectionRequest.findFirst({
    where: {
      employeeId: params.employeeId,
      attendanceDate: params.attendanceDate,
      workShiftId: params.workShiftId,
      request: {
        status: {
          in: [
            RequestStatus.PENDING,
            RequestStatus.PROCESSING,
            RequestStatus.APPROVED,
          ],
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (duplicateRequest) {
    throw new ApiError(
      400,
      "An attendance correction request already exists for this shift",
    );
  }

  return scheduledShift.workShift;
};

type CreateAttendanceCorrectionRequestInput = {
  employeeId?: string;
  attendanceDate: string;
  workShiftId: string;
  addedWorkUnits?: number;
  reason: string;
  title?: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

type MonthQuery = {
  month: string;
};

type EmployeeMonthQuery = MonthQuery & {
  employeeId: string;
};

type AttendanceRequester = {
  id: string;
  role: UserRole;
  permissions?: PermissionKey[];
};

type AttendanceEmployee = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
};

const buildRequestTitle = (dateKey: string, workShiftName: string) =>
  `Yêu cầu cộng công ${dateKey} - ${workShiftName}`;

const getAttendanceCorrections = async (
  employeeId: string,
  from: Date,
  to: Date,
) =>
  prisma.attendanceCorrectionRequest.findMany({
    where: {
      employeeId,
      attendanceDate: {
        gte: from,
        lt: to,
      },
      appliedAt: {
        not: null,
      },
      request: {
        status: RequestStatus.APPROVED,
      },
    },
    include: {
      request: {
        select: {
          id: true,
          status: true,
          type: true,
          title: true,
          description: true,
          approvedAt: true,
          createdAt: true,
        },
      },
      workShift: {
        select: {
          id: true,
          code: true,
          name: true,
          isOvertime: true,
          workUnits: true,
        },
      },
    },
    orderBy: {
      attendanceDate: "asc",
    },
  });

const resolveOwnEmployee = async (userId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: attendanceEmployeeSelect,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return employee;
};

const resolveTargetEmployee = async (
  requester: AttendanceRequester,
  employeeId: string,
  permission: PermissionKey,
) => {
  const canView =
    requester.role === UserRole.ADMIN ||
    requester.permissions?.includes(permission);

  if (!canView) {
    throw new ApiError(403, "Forbidden");
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: attendanceEmployeeSelect,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return employee;
};

const getAttendanceLogHistory = async (
  employee: AttendanceEmployee,
  month: string,
) => {
  const { start, end } = getMonthRange(month);

  const logs = await prisma.attendanceLog.findMany({
    where: {
      employeeId: employee.id,
      timestamp: {
        gte: start,
        lt: end,
      },
    },
    include: {
      device: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  return {
    employee: {
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
    },
    month,
    logs: logs.map((log) => ({
      id: log.id,
      employeeId: log.employeeId,
      deviceId: log.deviceId,
      fingerId: log.fingerId,
      timestamp: log.timestamp,
      createdAt: log.createdAt,
      device: log.device,
    })),
  };
};

const attendedStatuses = new Set<AttendanceStatus>([
  AttendanceStatus.PRESENT,
  AttendanceStatus.LATE,
  AttendanceStatus.EARLY_LEAVE,
  AttendanceStatus.LATE_AND_EARLY_LEAVE,
  "PAID_LEAVE" as AttendanceStatus,
]);

const leaveStatuses = new Set<AttendanceStatus>([
  "PAID_LEAVE" as AttendanceStatus,
  "UNPAID_LEAVE" as AttendanceStatus,
]);

const buildMonthlyTimesheet = async (
  employee: AttendanceEmployee,
  month: string,
) => {
  const { start, end } = getMonthRange(month);

  const [schedules, attendanceRecords, corrections] = await Promise.all([
    prisma.workSchedule.findMany({
      where: {
        employeeId: employee.id,
        date: {
          gte: start,
          lt: end,
        },
      },
      include: {
        shiftLinks: {
          include: {
            workShift: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    }),
    prisma.attendanceRecord.findMany({
      where: {
        employeeId: employee.id,
        date: {
          gte: start,
          lt: end,
        },
      },
      include: {
        details: {
          include: {
            workShift: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    }),
    getAttendanceCorrections(employee.id, start, end),
  ]);

  const scheduleByDate = new Map<string, (typeof schedules)[number]>();
  const recordByDate = new Map<string, (typeof attendanceRecords)[number]>();
  const correctionsByDate = new Map<string, typeof corrections>();

  for (const schedule of schedules) {
    scheduleByDate.set(toDateKey(schedule.date), schedule);
  }

  for (const record of attendanceRecords) {
    recordByDate.set(toDateKey(record.date), record);
  }

  for (const correction of corrections) {
    const key = toDateKey(correction.attendanceDate);
    const bucket = correctionsByDate.get(key) ?? [];
    bucket.push(correction);
    correctionsByDate.set(key, bucket);
  }

  const dateKeys = new Set([
    ...scheduleByDate.keys(),
    ...recordByDate.keys(),
    ...correctionsByDate.keys(),
  ]);

  const days = Array.from(dateKeys)
    .sort()
    .map((date) => {
      const schedule = scheduleByDate.get(date);
      const record = recordByDate.get(date);
      const dayCorrections = correctionsByDate.get(date) ?? [];

      const standardWorkUnits =
        schedule?.shiftLinks.reduce((total, shiftLink) => {
          if (shiftLink.workShift.isOvertime) {
            return total;
          }

          return total + toNumber(shiftLink.workShift.workUnits);
        }, 0) ?? 0;

      const attendedDetails =
        record?.details.filter((detail) =>
          attendedStatuses.has(detail.status),
        ) ?? [];
      const hasLeaveDetail =
        record?.details.some((detail) => leaveStatuses.has(detail.status)) ??
        false;

      const workedUnits = attendedDetails.reduce((total, detail) => {
        if (detail.workShift.isOvertime) {
          return total;
        }

        return total + toNumber(detail.workShift.workUnits);
      }, 0);

      const overtimeShifts = attendedDetails
        .filter((detail) => detail.workShift.isOvertime)
        .map((detail) => ({
          id: detail.id,
          workShiftId: detail.workShiftId,
          workShiftName: detail.workShiftName,
          status: detail.status,
          checkInTime: detail.checkInTime,
          checkOutTime: detail.checkOutTime,
          workUnits: toNumber(detail.workShift.workUnits),
        }));

      const overtimeUnits = overtimeShifts.reduce(
        (total, shift) => total + shift.workUnits,
        0,
      );

      const bonusShifts = dayCorrections.map((correction) => ({
        id: correction.id,
        requestId: correction.requestId,
        workShift: correction.workShift
          ? {
              id: correction.workShift.id,
              code: correction.workShift.code,
              name: correction.workShift.name,
              isOvertime: correction.workShift.isOvertime,
            }
          : null,
        workUnits: toNumber(correction.addedWorkUnits),
        reason: correction.reason,
        appliedAt: correction.appliedAt,
      }));

      const bonusUnits = bonusShifts.reduce(
        (total, shift) => total + shift.workUnits,
        0,
      );
      const isLeaveDay =
        hasLeaveDetail || (standardWorkUnits > 0 && workedUnits === 0);

      return {
        date,
        standardWorkUnits,
        workedUnits,
        overtimeUnits,
        bonusUnits,
        isLeaveDay,
        bonusShifts,
        overtimeShifts,
      };
    });

  const totals = days.reduce(
    (accumulator, day) => ({
      standardWorkUnits:
        accumulator.standardWorkUnits + day.standardWorkUnits,
      workedUnits: accumulator.workedUnits + day.workedUnits,
      overtimeUnits: accumulator.overtimeUnits + day.overtimeUnits,
      bonusUnits: accumulator.bonusUnits + day.bonusUnits,
      leaveDays: accumulator.leaveDays + (day.isLeaveDay ? 1 : 0),
    }),
    {
      standardWorkUnits: 0,
      workedUnits: 0,
      overtimeUnits: 0,
      bonusUnits: 0,
      leaveDays: 0,
    },
  );

  return {
    employee: {
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
    },
    month,
    totals,
    days,
  };
};

export const attendanceService = {
  async createCompensationRequest(
    requester: { id: string; role: UserRole },
    input: CreateAttendanceCorrectionRequestInput,
  ) {
    const attendanceDate = parseDateOnly(input.attendanceDate);
    const today = parseDateOnly(new Date().toISOString());

    if (attendanceDate.getTime() > today.getTime()) {
      throw new ApiError(400, "attendanceDate cannot be in the future");
    }

    const targetEmployee = await resolveEmployeeForUser(
      requester.id,
      requester.role,
      input.employeeId,
    );

    const approverIds = normalizeIds(input.approverIds);
    const watcherIds = normalizeIds(input.watcherIds ?? []);

    if (approverIds.length === 0) {
      throw new ApiError(400, "At least one approver is required");
    }

    if (
      approverIds.includes(requester.id) ||
      watcherIds.includes(requester.id)
    ) {
      throw new ApiError(
        400,
        "Requester cannot be an approver or watcher of the same request",
      );
    }

    await ensureUsersExist([...approverIds, ...watcherIds]);

    const workShift = await ensureAttendanceCorrectionIsAllowed({
      employeeId: targetEmployee.id,
      attendanceDate,
      workShiftId: input.workShiftId,
    });

    const addedWorkUnits =
      (input.addedWorkUnits ?? toNumber(workShift.workUnits)) || 1;

    const title =
      input.title ??
      buildRequestTitle(
        toDateKey(attendanceDate),
        workShift.name,
      );
    const description = input.description ?? input.reason;

    const request = await prisma.$transaction(async (tx) => {
      const createdRequest = await tx.request.create({
        data: {
          type: RequestType.ATTENDANCE_CORRECTION,
          title,
          description,
          requesterId: requester.id,
          approvalMode: input.approvalMode ?? ApprovalMode.PARALLEL,
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
      });

      await tx.attendanceCorrectionRequest.create({
        data: {
          requestId: createdRequest.id,
          employeeId: targetEmployee.id,
          attendanceDate,
          workShiftId: input.workShiftId,
          addedWorkUnits,
          reason: input.reason,
        },
      });

      return createdRequest;
    });

    return requestService.getRequestById(
      request.id,
      requester.id,
      requester.role,
    );
  },

  async getMyAttendanceHistory(
    requester: AttendanceRequester,
    query: MonthQuery,
  ) {
    const employee = await resolveOwnEmployee(requester.id);

    return getAttendanceLogHistory(employee, query.month);
  },

  async getEmployeeAttendanceHistory(
    requester: AttendanceRequester,
    query: EmployeeMonthQuery,
  ) {
    const employee = await resolveTargetEmployee(
      requester,
      query.employeeId,
      PERMISSIONS.ATTENDANCE_HISTORY_VIEW,
    );

    return getAttendanceLogHistory(employee, query.month);
  },

  async getMyTimesheet(
    requester: AttendanceRequester,
    query: MonthQuery,
  ) {
    const employee = await resolveOwnEmployee(requester.id);

    return buildMonthlyTimesheet(employee, query.month);
  },

  async getEmployeeTimesheet(
    requester: AttendanceRequester,
    query: EmployeeMonthQuery,
  ) {
    const employee = await resolveTargetEmployee(
      requester,
      query.employeeId,
      PERMISSIONS.ATTENDANCE_TIMESHEET_VIEW,
    );

    return buildMonthlyTimesheet(employee, query.month);
  },
};
