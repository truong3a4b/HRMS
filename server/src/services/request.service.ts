import {
  ApprovalMode,
  AttendanceStatus,
  Prisma,
  RequestApprovalStatus,
  RequestStatus,
  RequestType,
  UserRole,
} from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { applyScheduleAssignments } from "./schedule-assignment.service";
import { ApiError } from "../utils/apiError";

const userSummarySelect = {
  id: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

const requestInclude = {
  requester: {
    select: userSummarySelect,
  },
  approvals: {
    include: {
      approver: {
        select: userSummarySelect,
      },
    },
  },
  watchers: {
    include: {
      user: {
        select: userSummarySelect,
      },
    },
  },
  leaveRequest: true,
  attendanceCorrectionRequest: true,
  workScheduleRequest: true,
} satisfies Prisma.RequestInclude;

export type RequestWithDetails = Prisma.RequestGetPayload<{
  include: typeof requestInclude;
}>;

export type RequestListScope =
  | "all"
  | "mine"
  | "watching"
  | "pending"
  | "assigned";

export type RequestListFilters = {
  page: number;
  limit: number;
  status?: RequestStatus;
  type?: RequestType;
  approvalMode?: ApprovalMode;
  scope?: RequestListScope;
  search?: string;
};
export type CreateRequestInput = {
  type: RequestType;
  title: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

export type CreateLeaveRequestInput = {
  startDate: string;
  endDate: string;
  leaveType: string;
  reason?: string;
  title?: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

export type LateEarlyRequestType = "LATE_ARRIVAL" | "EARLY_LEAVE";

export type CreateLateEarlyRequestInput = {
  date: string;
  type: LateEarlyRequestType;
  startTime: string;
  endTime: string;
  reason: string;
  title?: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

export type ReviewDecisionInput = {
  decision: RequestApprovalStatus;
  note?: string;
};

const finalRequestStatuses = new Set<RequestStatus>([
  RequestStatus.REJECTED,
  RequestStatus.CANCELLED,
  RequestStatus.APPROVED,
]);

const lateEarlyLeaveTypes = new Set(["LATE_ARRIVAL", "EARLY_LEAVE"]);
const paidLeaveStatus = "PAID_LEAVE" as AttendanceStatus;
const unpaidLeaveStatus = "UNPAID_LEAVE" as AttendanceStatus;
const leaveAttendanceStatuses = new Set<AttendanceStatus>([
  paidLeaveStatus,
  unpaidLeaveStatus,
  AttendanceStatus.ON_LEAVE,
]);
const lateEarlyAttendanceStatuses = new Set<AttendanceStatus>([
  AttendanceStatus.LATE,
  AttendanceStatus.EARLY_LEAVE,
  AttendanceStatus.LATE_AND_EARLY_LEAVE,
]);

const normalizeIds = (values: string[]) =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))].filter(
    Boolean,
  );

const parseDateTime = (value: string, fieldName: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${fieldName} is invalid`);
  }

  return date;
};

const parseDateOnly = (value: string, fieldName: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new ApiError(400, `${fieldName} must be in YYYY-MM-DD format`);
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
    throw new ApiError(400, `${fieldName} is invalid`);
  }

  return date;
};

const parseTimeOnly = (value: string, fieldName: string) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (!match) {
    throw new ApiError(400, `${fieldName} must be in HH:mm format`);
  }

  return {
    hours: Number(match[1]),
    minutes: Number(match[2]),
  };
};

const combineDateAndTime = (date: Date, time: string, fieldName: string) => {
  const parsedTime = parseTimeOnly(time, fieldName);

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      parsedTime.hours,
      parsedTime.minutes,
      0,
      0,
    ),
  );
};

const toUtcDateOnly = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

const addUtcDays = (date: Date, days: number) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
    ),
  );

const buildDateTimeOnDate = (date: Date, time: string) => {
  const parsedTime = parseTimeOnly(time, "shift time");

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      parsedTime.hours,
      parsedTime.minutes,
      0,
      0,
    ),
  );
};

const rangesOverlap = (
  leftStart: Date,
  leftEnd: Date,
  rightStart: Date,
  rightEnd: Date,
) =>
  leftStart.getTime() < rightEnd.getTime() &&
  rightStart.getTime() < leftEnd.getTime();

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

const ensureEmployeeRequester = async (userId: string) => {
  const employee = await prisma.employee.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      employeeId: true,
    },
  });

  if (!employee) {
    throw new ApiError(400, "Only employees can create this request");
  }

  return employee;
};

const tryConsumePaidLeaveDays = async (
  tx: Prisma.TransactionClient,
  employeeId: string,
  year: number,
  days: number,
) => {
  if (days <= 0) {
    return false;
  }

  const updatedRows = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    UPDATE employee_leave_balances
    SET used_paid_leave_days = used_paid_leave_days + ${days},
        updated_at = NOW()
    WHERE employee_id = ${employeeId}
      AND year = ${year}
      AND entitled_leave_days - used_paid_leave_days >= ${days}
    RETURNING id
  `);

  return updatedRows.length > 0;
};

const getEmployeeByUserId = async (
  tx: Prisma.TransactionClient,
  userId: string,
) => {
  const employee = await tx.employee.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!employee) {
    throw new ApiError(400, "Request can only be applied to employees");
  }

  return employee;
};

const createRequestWithApprovals = async (
  userId: string,
  input: {
    type: RequestType;
    title: string;
    description?: string;
    approvalMode?: ApprovalMode;
    approverIds: string[];
    watcherIds?: string[];
    createExtra?: (
      tx: Prisma.TransactionClient,
      requestId: string,
    ) => Promise<void>;
  },
) => {
  const approverIds = normalizeIds(input.approverIds);
  const watcherIds = normalizeIds(input.watcherIds ?? []);

  if (approverIds.length === 0) {
    throw new ApiError(400, "At least one approver is required");
  }

  if (approverIds.includes(userId) || watcherIds.includes(userId)) {
    throw new ApiError(
      400,
      "Requester cannot be an approver or watcher of the same request",
    );
  }

  await ensureUsersExist([...approverIds, ...watcherIds]);

  const request = await prisma.$transaction(async (tx) => {
    const createdRequest = await tx.request.create({
      data: {
        type: input.type,
        title: input.title,
        description: input.description,
        requesterId: userId,
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
          create: watcherIds.map((watcherId) => ({
            userId: watcherId,
          })),
        },
      },
      include: requestInclude,
    });

    await input.createExtra?.(tx, createdRequest.id);

    return createdRequest;
  });

  return sortApprovals(request);
};

const sortApprovals = (request: RequestWithDetails) => ({
  ...request,
  approvals: [...request.approvals].sort(
    (left, right) => left.stepOrder - right.stepOrder,
  ),
});

const buildAccessCondition = (
  userId: string,
  scope: RequestListScope | undefined,
  isAdmin: boolean,
): Prisma.RequestWhereInput | undefined => {
  if (isAdmin && (!scope || scope === "all")) {
    return undefined;
  }

  if (scope === "mine") {
    return { requesterId: userId };
  }

  if (scope === "watching") {
    return { watchers: { some: { userId } } };
  }

  if (scope === "pending") {
    return {
      approvals: {
        some: {
          approverId: userId,
          status: RequestApprovalStatus.PENDING,
        },
      },
    };
  }

  if (scope === "assigned") {
    return { approvals: { some: { approverId: userId } } };
  }

  if (isAdmin) {
    return undefined;
  }

  return {
    OR: [
      { requesterId: userId },
      { watchers: { some: { userId } } },
      { approvals: { some: { approverId: userId } } },
    ],
  };
};

const buildBaseWhere = (
  userId: string,
  role: UserRole,
  filters: RequestListFilters,
): Prisma.RequestWhereInput => {
  const conditions: Prisma.RequestWhereInput[] = [];
  const accessCondition = buildAccessCondition(
    userId,
    filters.scope,
    role === UserRole.ADMIN,
  );

  if (accessCondition) {
    conditions.push(accessCondition);
  }

  if (filters.status) {
    conditions.push({ status: filters.status });
  }

  if (filters.type) {
    conditions.push({ type: filters.type });
  }

  if (filters.approvalMode) {
    conditions.push({ approvalMode: filters.approvalMode });
  }

  if (filters.search) {
    const search = filters.search.trim();

    if (search) {
      conditions.push({
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            requester: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      });
    }
  }

  if (conditions.length === 0) {
    return {};
  }

  return {
    AND: conditions,
  };
};

const getRequestByIdWithDetails = async (requestId: string) => {
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
    include: requestInclude,
  });

  if (!request) {
    throw new ApiError(404, "Request not found", "REQUEST_NOT_FOUND");
  }

  return sortApprovals(request);
};

const assertCanViewRequest = (
  request: RequestWithDetails,
  userId: string,
  isAdmin: boolean,
) => {
  if (isAdmin) {
    return;
  }

  const canView =
    request.requesterId === userId ||
    request.watchers.some((watcher) => watcher.userId === userId) ||
    request.approvals.some((approval) => approval.approverId === userId);

  if (!canView) {
    throw new ApiError(403, "Forbidden");
  }
};

const assertCanActAsApprover = (
  request: RequestWithDetails,
  userId: string,
  isAdmin: boolean,
) => {
  if (isAdmin) {
    return;
  }

  const isAssignedApprover = request.approvals.some(
    (approval) => approval.approverId === userId,
  );

  if (!isAssignedApprover) {
    throw new ApiError(403, "You are not assigned to this request");
  }
};

const assertCanCompleteOrCancel = (
  request: RequestWithDetails,
  userId: string,
  isAdmin: boolean,
) => {
  if (isAdmin || request.requesterId === userId) {
    return;
  }

  throw new ApiError(403, "You can only manage your own request");
};

const updateRequestWithDetails = async (
  requestId: string,
  data: Prisma.RequestUpdateInput,
) => {
  const updatedRequest = await prisma.request.update({
    where: {
      id: requestId,
    },
    data,
    include: requestInclude,
  });

  return sortApprovals(updatedRequest);
};

const getNextSequentialStep = (
  request: RequestWithDetails,
  currentStep: number,
) =>
  request.approvals.find(
    (approval) =>
      approval.stepOrder > currentStep &&
      approval.status === RequestApprovalStatus.PENDING,
  )?.stepOrder ?? null;

/**
 * Thực thi logic cụ thể cho từng loại đơn khi đơn được duyệt
 * Mỗi loại đơn có logic riêng để xử lý sau khi tất cả approver duyệt
 */
const executeRequestLogic = async (
  tx: Prisma.TransactionClient,
  request: RequestWithDetails,
  decidedAt: Date,
) => {
  switch (request.type) {
    case RequestType.SCHEDULE_APPROVAL:
      return await executeScheduleApprovalLogic(tx, request, decidedAt);
    case RequestType.LEAVE:
      return await executeLeaveLogic(tx, request, decidedAt);
    case RequestType.ATTENDANCE_CORRECTION:
      return await executeAttendanceCorrectionLogic(tx, request, decidedAt);
    case RequestType.OVERTIME:
      return await executeOvertimeLogic(tx, request, decidedAt);
    case RequestType.TERMINATION:
      return await executeTerminationLogic(tx, request, decidedAt);
    default:
      const _exhaustiveCheck: never = request.type;
      return _exhaustiveCheck;
  }
};

/**
 * Xử lý logic cho đơn phê duyệt lịch làm việc
 */
const executeScheduleApprovalLogic = async (
  tx: Prisma.TransactionClient,
  request: RequestWithDetails,
  decidedAt: Date,
) => {
  const workScheduleRequest = await tx.workScheduleRequest.findUnique({
    where: {
      requestId: request.id,
    },
    select: {
      scheduleDetails: true,
    },
  });

  if (!workScheduleRequest) {
    throw new ApiError(
      400,
      "Schedule request data is missing",
      "WORK_SCHEDULE_REQUEST_NOT_FOUND",
    );
  }

  const employee = await tx.employee.findUnique({
    where: {
      userId: request.requesterId,
    },
    select: {
      id: true,
    },
  });

  if (!employee) {
    throw new ApiError(
      400,
      "Schedule requests can only be approved for employees",
    );
  }

  await applyScheduleAssignments(
    tx,
    [employee.id],
    workScheduleRequest.scheduleDetails as Array<{
      date: string;
      workShiftIds: string[];
    }>,
    decidedAt,
  );
};

/**
 * Xử lý logic cho đơn xin nghỉ phép
 */
const executeLeaveLogic = async (
  tx: Prisma.TransactionClient,
  request: RequestWithDetails,
  decidedAt: Date,
) => {
  const leaveRequest = await tx.leaveRequest.findUnique({
    where: {
      requestId: request.id,
    },
  });

  if (!leaveRequest) {
    throw new ApiError(
      400,
      "Leave request data is missing",
      "LEAVE_REQUEST_NOT_FOUND",
    );
  }

  const employee = await getEmployeeByUserId(tx, request.requesterId);

  if (lateEarlyLeaveTypes.has(leaveRequest.leaveType)) {
    await applyLateEarlyApproval(
      tx,
      employee.id,
      leaveRequest.startDate,
      leaveRequest.endDate,
    );
    return;
  }

  const startDate = toUtcDateOnly(leaveRequest.startDate);
  const endDateExclusive = addUtcDays(toUtcDateOnly(leaveRequest.endDate), 1);
  const schedules = await tx.workSchedule.findMany({
    where: {
      employeeId: employee.id,
      date: {
        gte: startDate,
        lt: endDateExclusive,
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
  });

  for (const schedule of schedules) {
    const attendanceRecord = await tx.attendanceRecord.upsert({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: schedule.date,
        },
      },
      create: {
        employeeId: employee.id,
        date: schedule.date,
      },
      update: {},
    });

    for (const shiftLink of schedule.shiftLinks) {
      const shift = shiftLink.workShift;
      const shiftStartAt = buildDateTimeOnDate(schedule.date, shift.startTime);
      let shiftEndAt = buildDateTimeOnDate(schedule.date, shift.endTime);

      if (shiftEndAt.getTime() <= shiftStartAt.getTime()) {
        shiftEndAt = addUtcDays(shiftEndAt, 1);
      }

      if (
        !rangesOverlap(
          leaveRequest.startDate,
          leaveRequest.endDate,
          shiftStartAt,
          shiftEndAt,
        )
      ) {
        continue;
      }

      const workUnits = Number(shift.workUnits);
      const isPaidLeave =
        !shift.isOvertime &&
        (await tryConsumePaidLeaveDays(
          tx,
          employee.id,
          schedule.date.getUTCFullYear(),
          workUnits,
        ));
      const status = isPaidLeave ? paidLeaveStatus : unpaidLeaveStatus;

      await tx.attendanceRecordDetail.upsert({
        where: {
          attendanceRecordId_workShiftId: {
            attendanceRecordId: attendanceRecord.id,
            workShiftId: shift.id,
          },
        },
        create: {
          attendanceRecordId: attendanceRecord.id,
          workShiftId: shift.id,
          workShiftName: shift.name,
          shiftStartTime: shiftStartAt,
          shiftEndTime: shiftEndAt,
          shiftLateGracePeriod: shift.lateGracePeriod,
          shiftEarlyLeaveGracePeriod: shift.earlyLeaveGracePeriod,
          checkInTime: null,
          checkOutTime: null,
          status,
        },
        update: {
          workShiftName: shift.name,
          shiftStartTime: shiftStartAt,
          shiftEndTime: shiftEndAt,
          shiftLateGracePeriod: shift.lateGracePeriod,
          shiftEarlyLeaveGracePeriod: shift.earlyLeaveGracePeriod,
          checkInTime: null,
          checkOutTime: null,
          status,
        },
      });
    }
  }

  return;
};

/**
 * Xử lý logic cho đơn sửa chữa chấm công
 */
const executeAttendanceCorrectionLogic = async (
  tx: Prisma.TransactionClient,
  request: RequestWithDetails,
  decidedAt: Date,
) => {
  const correctionRequest = await tx.attendanceCorrectionRequest.findUnique({
    where: {
      requestId: request.id,
    },
  });

  if (!correctionRequest) {
    throw new ApiError(
      400,
      "Attendance correction request data is missing",
      "ATTENDANCE_CORRECTION_REQUEST_NOT_FOUND",
    );
  }

  await tx.attendanceCorrectionRequest.update({
    where: {
      requestId: request.id,
    },
    data: {
      appliedAt: decidedAt,
    },
  });

  const attendanceRecord = await tx.attendanceRecord.findUnique({
    where: {
      employeeId_date: {
        employeeId: correctionRequest.employeeId,
        date: correctionRequest.attendanceDate,
      },
    },
    include: {
      details: true,
    },
  });

  if (!attendanceRecord) {
    return;
  }

  const details = attendanceRecord.details.filter((detail) => {
    if (leaveAttendanceStatuses.has(detail.status)) {
      return false;
    }

    return correctionRequest.workShiftId
      ? detail.workShiftId === correctionRequest.workShiftId
      : true;
  });

  for (const detail of details) {
    await tx.attendanceRecordDetail.update({
      where: {
        id: detail.id,
      },
      data: {
        status: AttendanceStatus.PRESENT,
      },
    });
  }
};

/**
 * Xử lý logic cho đơn tăng ca
 */
const executeOvertimeLogic = async (
  tx: Prisma.TransactionClient,
  request: RequestWithDetails,
  decidedAt: Date,
) => {
  // TODO: Xử lý logic tăng ca
};

/**
 * Xử lý logic cho đơn chấm dứt hợp đồng
 */
const executeTerminationLogic = async (
  tx: Prisma.TransactionClient,
  request: RequestWithDetails,
  decidedAt: Date,
) => {
  // TODO: Xử lý logic chấm dứt hợp đồng (có thể cập nhật trạng thái nhân viên, v.v.)
};

/**
 * Áp dụng logic duyệt cho đơn đi muộn về sớm
 */
const applyLateEarlyApproval = async (
  tx: Prisma.TransactionClient,
  employeeId: string,
  startDate: Date,
  endDate: Date,
) => {
  const attendanceDate = toUtcDateOnly(startDate);
  const attendanceRecord = await tx.attendanceRecord.findUnique({
    where: {
      employeeId_date: {
        employeeId,
        date: attendanceDate,
      },
    },
    include: {
      details: true,
    },
  });

  if (!attendanceRecord) {
    return;
  }

  const matchingDetails = attendanceRecord.details.filter((detail) => {
    if (leaveAttendanceStatuses.has(detail.status)) {
      return false;
    }

    if (!lateEarlyAttendanceStatuses.has(detail.status)) {
      return false;
    }

    return rangesOverlap(
      startDate,
      endDate,
      detail.shiftStartTime,
      detail.shiftEndTime,
    );
  });

  for (const detail of matchingDetails) {
    await tx.attendanceRecordDetail.update({
      where: {
        id: detail.id,
      },
      data: {
        status: AttendanceStatus.PRESENT,
      },
    });
  }
};

export const requestService = {
  async getRequests(
    userId: string,
    role: UserRole,
    filters: RequestListFilters,
  ) {
    const where = buildBaseWhere(userId, role, filters);
    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: requestInclude,
        skip,
        take: filters.limit,
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.request.count({ where }),
    ]);

    return {
      items: items.map(sortApprovals),
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  },

  async getMyRequests(
    userId: string,
    role: UserRole,
    filters: Omit<RequestListFilters, "scope">,
  ) {
    return this.getRequests(userId, role, {
      ...filters,
      scope: "mine",
    });
  },

  async getMyWatchingRequests(
    userId: string,
    role: UserRole,
    filters: Omit<RequestListFilters, "scope">,
  ) {
    return this.getRequests(userId, role, {
      ...filters,
      scope: "watching",
    });
  },

  async getMyPendingApprovals(
    userId: string,
    role: UserRole,
    filters: Omit<RequestListFilters, "scope">,
  ) {
    return this.getRequests(userId, role, {
      ...filters,
      scope: "pending",
    });
  },

  async getRequestById(requestId: string, userId: string, role: UserRole) {
    const request = await getRequestByIdWithDetails(requestId);
    assertCanViewRequest(request, userId, role === UserRole.ADMIN);
    return request;
  },

  async createRequest(userId: string, input: CreateRequestInput) {
    return createRequestWithApprovals(userId, input);
  },

  async createLeaveRequest(userId: string, input: CreateLeaveRequestInput) {
    await ensureEmployeeRequester(userId);

    const startDate = parseDateTime(input.startDate, "startDate");
    const endDate = parseDateTime(input.endDate, "endDate");

    if (endDate.getTime() <= startDate.getTime()) {
      throw new ApiError(400, "endDate must be after startDate");
    }

    const reason = input.reason?.trim();
    const title =
      input.title ??
      `Leave request ${startDate.toISOString().slice(0, 10)} - ${endDate
        .toISOString()
        .slice(0, 10)}`;

    return createRequestWithApprovals(userId, {
      type: RequestType.LEAVE,
      title,
      description: input.description ?? reason,
      approvalMode: input.approvalMode,
      approverIds: input.approverIds,
      watcherIds: input.watcherIds,
      createExtra: async (tx, requestId) => {
        await tx.leaveRequest.create({
          data: {
            requestId,
            startDate,
            endDate,
            leaveType: input.leaveType,
            reason,
          },
        });
      },
    });
  },

  async createLateEarlyRequest(
    userId: string,
    input: CreateLateEarlyRequestInput,
  ) {
    await ensureEmployeeRequester(userId);

    const date = parseDateOnly(input.date, "date");
    const startDate = combineDateAndTime(date, input.startTime, "startTime");
    const endDate = combineDateAndTime(date, input.endTime, "endTime");

    if (endDate.getTime() <= startDate.getTime()) {
      throw new ApiError(400, "endTime must be after startTime");
    }

    const typeLabel =
      input.type === "LATE_ARRIVAL" ? "Late arrival" : "Early leave";
    const title =
      input.title ??
      `${typeLabel} request ${input.date} ${input.startTime}-${input.endTime}`;

    return createRequestWithApprovals(userId, {
      type: RequestType.LEAVE,
      title,
      description: input.description ?? input.reason,
      approvalMode: input.approvalMode,
      approverIds: input.approverIds,
      watcherIds: input.watcherIds,
      createExtra: async (tx, requestId) => {
        await tx.leaveRequest.create({
          data: {
            requestId,
            startDate,
            endDate,
            leaveType: input.type,
            reason: input.reason,
          },
        });
      },
    });
  },

  async startReview(requestId: string, userId: string, role: UserRole) {
    const request = await getRequestByIdWithDetails(requestId);
    assertCanActAsApprover(request, userId, role === UserRole.ADMIN);

    if (finalRequestStatuses.has(request.status)) {
      throw new ApiError(
        400,
        "Request is already finished",
        "REQUEST_ALREADY_FINAL",
      );
    }

    const approver = request.approvals.find(
      (approval) => approval.approverId === userId,
    );

    if (!approver) {
      throw new ApiError(403, "You are not assigned to this request");
    }

    if (approver.status !== RequestApprovalStatus.PENDING) {
      throw new ApiError(400, "You have already reviewed this request");
    }

    if (request.status === RequestStatus.PENDING) {
      return updateRequestWithDetails(requestId, {
        status: RequestStatus.PROCESSING,
        processingAt: new Date(),
      });
    }

    return request;
  },

  async decideRequest(
    requestId: string,
    userId: string,
    role: UserRole,
    input: ReviewDecisionInput,
  ) {
    const request = await getRequestByIdWithDetails(requestId);
    assertCanActAsApprover(request, userId, role === UserRole.ADMIN);

    if (finalRequestStatuses.has(request.status)) {
      throw new ApiError(
        400,
        "Request is already finished",
        "REQUEST_ALREADY_FINAL",
      );
    }

    const approval = request.approvals.find(
      (item) => item.approverId === userId,
    );

    if (!approval) {
      throw new ApiError(403, "You are not assigned to this request");
    }

    if (approval.status !== RequestApprovalStatus.PENDING) {
      throw new ApiError(400, "You have already reviewed this request");
    }

    // Chuyển sang PROCESSING nếu còn ở PENDING
    if (request.status === RequestStatus.PENDING) {
      await prisma.request.update({
        where: {
          id: requestId,
        },
        data: {
          status: RequestStatus.PROCESSING,
          processingAt: new Date(),
        },
      });
    }

    const decidedAt = new Date();

    return prisma.$transaction(async (tx) => {
      // Cập nhật quyết định của approver
      await tx.requestApproval.update({
        where: {
          requestId_approverId: {
            requestId,
            approverId: userId,
          },
        },
        data: {
          status: input.decision,
          note: input.note,
          decidedAt,
        },
      });

      const latestRequest = await tx.request.findUnique({
        where: {
          id: requestId,
        },
        include: requestInclude,
      });

      if (!latestRequest) {
        throw new ApiError(404, "Request not found", "REQUEST_NOT_FOUND");
      }

      const sortedApprovals = [...latestRequest.approvals].sort(
        (left, right) => left.stepOrder - right.stepOrder,
      );

      // Nếu approver reject thì reject ngay đơn
      if (input.decision === RequestApprovalStatus.REJECTED) {
        const updatedRequest = await tx.request.update({
          where: {
            id: requestId,
          },
          data: {
            status: RequestStatus.REJECTED,
            rejectedAt: decidedAt,
          },
          include: requestInclude,
        });

        return sortApprovals(updatedRequest);
      }

      // Xử lý sequential approval mode
      if (latestRequest.approvalMode === ApprovalMode.SEQUENTIAL) {
        const nextStep = getNextSequentialStep(
          latestRequest,
          approval.stepOrder,
        );

        const updateData: Prisma.RequestUpdateInput = nextStep
          ? {
              status: RequestStatus.PROCESSING,
              currentStep: nextStep,
            }
          : {
              status: RequestStatus.APPROVED,
              approvedAt: decidedAt,
            };

        const updatedRequest = await tx.request.update({
          where: {
            id: requestId,
          },
          data: updateData,
          include: requestInclude,
        });

        // Nếu đơn đã được duyệt hoàn toàn thì thực thi logic cụ thể
        if (updatedRequest.status === RequestStatus.APPROVED) {
          await executeRequestLogic(tx, updatedRequest, decidedAt);
        }

        return sortApprovals(updatedRequest);
      }

      // Xử lý parallel approval mode
      const hasPendingApprovals = sortedApprovals.some(
        (item) => item.status === RequestApprovalStatus.PENDING,
      );

      const updateData: Prisma.RequestUpdateInput = hasPendingApprovals
        ? {
            status: RequestStatus.PROCESSING,
          }
        : {
            status: RequestStatus.APPROVED,
            approvedAt: decidedAt,
          };

      const updatedRequest = await tx.request.update({
        where: {
          id: requestId,
        },
        data: updateData,
        include: requestInclude,
      });

      // Nếu đơn đã được duyệt hoàn toàn thì thực thi logic cụ thể
      if (updatedRequest.status === RequestStatus.APPROVED) {
        await executeRequestLogic(tx, updatedRequest, decidedAt);
      }

      return sortApprovals(updatedRequest);
    });
  },

  async cancelRequest(requestId: string, userId: string, role: UserRole) {
    const request = await getRequestByIdWithDetails(requestId);
    assertCanCompleteOrCancel(request, userId, role === UserRole.ADMIN);

    if (
      request.status === RequestStatus.CANCELLED ||
      request.status === RequestStatus.REJECTED
    ) {
      throw new ApiError(
        400,
        "Request is already finished",
        "REQUEST_ALREADY_FINAL",
      );
    }

    const cancelledAt = new Date();

    return updateRequestWithDetails(requestId, {
      status: RequestStatus.CANCELLED,
      cancelledAt,
    });
  },
};
