import {
  ApprovalMode,
  AutoPenaltyType,
  AttendanceStatus,
  LateEarlyType,
  PayrollBonusPenaltySource,
  PayrollBonusPenaltyStatus,
  PayrollPeriodStatus,
  PayrollStatus,
  LeaveType,
  NotificationType,
  Prisma,
  RequestApprovalStatus,
  RequestStatus,
  RequestType,
  UserRole,
} from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { applyScheduleAssignments } from "./schedule-assignment.service";
import { notificationService } from "./notification.service";
import { ApiError } from "../utils/apiError";

const userSummarySelect = {
  id: true,
  email: true,
  role: true,
  employee: {
    select: {
      id: true,
      employeeId: true,
      name: true,
    },
  },
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
  leaveRequest: {
    include: {
      workShift: true,
    },
  },
  lateEarlyRequest: {
    include: {
      workShift: true,
    },
  },
  attendanceCorrectionRequest: {
    include: {
      workShift: true,
    },
  },
  workScheduleRequest: true,
  payrollApprovalRequest: {
    include: {
      period: true,
    },
  },
  bonusPenaltyRequest: {
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
          name: true,
        },
      },
      bonusPenalty: true,
    },
  },
} satisfies Prisma.RequestInclude;

export type RequestWithDetails = Prisma.RequestGetPayload<{
  include: typeof requestInclude;
}>;

export type RequestListScope =
  | "all"
  | "mine"
  | "watching"
  | "pending"
  | "reviewed"
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

export type RequestEmployeeOption = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  user?: {
    id: string;
    email: string;
    role: UserRole;
  } | null;
};

export type CreateLeaveRequestInput = {
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  workShiftId?: string;
  reason: string;
  title: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

export type LateEarlyRequestType = "LATE_ARRIVAL" | "EARLY_LEAVE";

export type CreateLateEarlyRequestInput = {
  date: string;
  type: LateEarlyRequestType;
  workShiftId: string;
  startTime: string;
  endTime: string;
  reason: string;
  title: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

export type CreateAttendanceCorrectionRequestInput = {
  attendanceDate: string;
  workShiftId: string;
  reason: string;
  title: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

export type CreateBonusPenaltyRequestInput = {
  employeeId: string;
  month: string;
  amount: string | number;
  isBonus: boolean;
  reason: string;
  title: string;
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
  RequestStatus.FAILED,
]);

const SERIALIZABLE_RETRY_LIMIT = 3;

class RequestExecutionError extends Error {
  constructor(
    readonly requestId: string,
    readonly cause: unknown,
  ) {
    super("Failed to apply approved request");
    Object.setPrototypeOf(this, RequestExecutionError.prototype);
  }
}

const leaveTypes = new Set<LeaveType>(Object.values(LeaveType));
const paidLeaveStatus = "PAID_LEAVE" as AttendanceStatus;
const unpaidLeaveStatus = "UNPAID_LEAVE" as AttendanceStatus;
const leaveAttendanceStatuses = new Set<AttendanceStatus>([
  paidLeaveStatus,
  unpaidLeaveStatus,
  AttendanceStatus.ON_LEAVE,
]);
const annualLeaveTypes = new Set<LeaveType>([LeaveType.ANNUAL_LEAVE]);
const paidWithoutBalanceLeaveTypes = new Set<LeaveType>([
  LeaveType.BEREAVEMENT_LEAVE,
  LeaveType.MARRIAGE_LEAVE,
]);
const lateEarlyAttendanceStatuses = new Set<AttendanceStatus>([
  AttendanceStatus.LATE,
  AttendanceStatus.EARLY_LEAVE,
  AttendanceStatus.LATE_AND_EARLY_LEAVE,
]);

// Chuẩn hóa danh sách ID, loại bỏ trùng lặp và các giá trị rỗng
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

const parseMonthOnly = (value: string, fieldName: string) => {
  const match = /^(\d{4})-(\d{2})$/.exec(value);

  if (!match) {
    throw new ApiError(400, `${fieldName} must be in YYYY-MM format`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) {
    throw new ApiError(400, `${fieldName} is invalid`);
  }

  return new Date(Date.UTC(year, month - 1, 1));
};

// Chuyển đổi giá trị sang Prisma.Decimal và đảm bảo là số dương
const parsePositiveDecimal = (value: string | number, fieldName: string) => {
  let decimal: Prisma.Decimal;

  try {
    decimal = new Prisma.Decimal(value);
  } catch {
    throw new ApiError(400, `${fieldName} is invalid`);
  }

  if (decimal.lte(0)) {
    throw new ApiError(400, `${fieldName} must be greater than 0`);
  }

  return decimal;
};

// Chuyển đổi giá trị thời gian sang định dạng HH:mm và đảm bảo là thời gian hợp lệ
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

// Kết hợp ngày và giờ thành một đối tượng Date UTC
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

const toUtcEndOfDate = (date: Date) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

const addUtcDays = (date: Date, days: number) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
    ),
  );

const isTransactionConflict = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2034";

// Thực thi một giao dịch với mức độ cô lập Serializable, tự động thử lại khi xảy ra xung đột
const runSerializableTransaction = async <T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
) => {
  for (let attempt = 1; attempt <= SERIALIZABLE_RETRY_LIMIT; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (
        !isTransactionConflict(error) ||
        attempt === SERIALIZABLE_RETRY_LIMIT
      ) {
        throw error;
      }
    }
  }

  throw new ApiError(409, "Request was updated concurrently. Please retry.");
};

// Gửi thông báo đến danh sách người dùng liên quan đến yêu cầu
const notifyRequestUsers = async (
  userIds: string[],
  title: string,
  message: string,
  request: Pick<RequestWithDetails, "id" | "type" | "status">,
  senderId?: string,
) => {
  const recipients = normalizeIds(userIds).filter(
    (userId) => userId !== senderId,
  );

  if (recipients.length === 0) {
    return;
  }

  try {
    await notificationService.createForUsers({
      userIds: recipients,
      title,
      message,
      type: NotificationType.EMPLOYEE,
      senderId,
      data: {
        requestId: request.id,
        requestType: request.type,
        requestStatus: request.status,
      },
    });
  } catch (error) {
    console.error("Failed to send request workflow notification:", error);
  }
};

// Lấy danh sách người nhận thông báo ban đầu cho yêu cầu, bao gồm các approver hiện tại và watchers
const getInitialRequestNotificationRecipients = (
  request: RequestWithDetails,
) => {
  const approverIds =
    request.approvalMode === ApprovalMode.SEQUENTIAL
      ? request.approvals
          .filter((approval) => approval.stepOrder === request.currentStep)
          .map((approval) => approval.approverId)
      : request.approvals.map((approval) => approval.approverId);

  return [...approverIds, ...request.watchers.map((watcher) => watcher.userId)];
};

// Gửi thông báo khi một yêu cầu mới được tạo, thông báo đến các approver và watchers
const notifyRequestCreated = (request: RequestWithDetails) =>
  notifyRequestUsers(
    getInitialRequestNotificationRecipients(request),
    "Yêu cầu mới",
    `Yêu cầu "${request.title}" đang chờ xử lý.`,
    request,
    request.requesterId,
  );

const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

// Xây dựng đối tượng Date UTC từ ngày và giờ, đảm bảo rằng giờ kết thúc của ca làm việc được tính toán chính xác,
// đặc biệt là khi ca làm việc qua đêm
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

// Tính toán thời gian kết thúc của ca làm việc dựa trên ngày, giờ bắt đầu, giờ kết thúc và thông tin ca làm việc qua đêm
const getShiftEndDateTime = (
  date: Date,
  startTime: string,
  endTime: string,
  isOvernight: boolean,
) => {
  const shiftStartAt = buildDateTimeOnDate(date, startTime);
  let shiftEndAt = buildDateTimeOnDate(date, endTime);

  if (isOvernight || shiftEndAt.getTime() <= shiftStartAt.getTime()) {
    shiftEndAt = addUtcDays(shiftEndAt, 1);
  }

  return shiftEndAt;
};

// Kiểm tra xem hai khoảng thời gian có chồng lấn nhau hay không
const rangesOverlap = (
  leftStart: Date,
  leftEnd: Date,
  rightStart: Date,
  rightEnd: Date,
) =>
  leftStart.getTime() < rightEnd.getTime() &&
  rightStart.getTime() < leftEnd.getTime();

type AttendanceShiftSnapshotSource = {
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime: string | null;
  breakEndTime: string | null;
  lateGracePeriod: number;
  earlyLeaveGracePeriod: number;
  checkInStartTime: string;
  checkInEndTime: string;
  checkOutStartTime: string;
  checkOutEndTime: string;
  isOvernight: boolean;
  isOvertime: boolean;
  workUnits: Prisma.Decimal;
  overtimeMultiplier: Prisma.Decimal;
};

// Xây dựng đối tượng chi tiết ca làm việc từ dữ liệu nguồn,
// bao gồm các thông tin về giờ bắt đầu, giờ kết thúc, thời gian nghỉ,
// khoảng thời gian cho phép đi muộn và về sớm, cũng như các thông tin liên quan đến ca làm việc qua đêm và ca làm thêm
const buildAttendanceDetailShiftSnapshot = (
  shift: AttendanceShiftSnapshotSource,
  shiftStartAt: Date,
  shiftEndAt: Date,
) => ({
  workShiftCode: shift.code,
  workShiftName: shift.name,
  shiftStartClock: shift.startTime,
  shiftEndClock: shift.endTime,
  shiftStartTime: shiftStartAt,
  shiftEndTime: shiftEndAt,
  shiftBreakStartTime: shift.breakStartTime,
  shiftBreakEndTime: shift.breakEndTime,
  shiftLateGracePeriod: shift.lateGracePeriod,
  shiftEarlyLeaveGracePeriod: shift.earlyLeaveGracePeriod,
  shiftCheckInStartTime: shift.checkInStartTime,
  shiftCheckInEndTime: shift.checkInEndTime,
  shiftCheckOutStartTime: shift.checkOutStartTime,
  shiftCheckOutEndTime: shift.checkOutEndTime,
  shiftIsOvernight: shift.isOvernight,
  shiftIsOvertime: shift.isOvertime,
  shiftWorkUnits: shift.workUnits,
  shiftOvertimeMultiplier: shift.overtimeMultiplier,
});

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

// Kiểm tra xem người dùng có phải là nhân viên hay không, nếu không thì ném ra lỗi
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

// Kiểm tra xem nhân viên có tồn tại hay không, nếu không thì ném ra lỗi
const ensureEmployeeExists = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
    select: {
      id: true,
    },
  });

  if (!employee) {
    throw new ApiError(400, "Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  return employee;
};

// Lấy danh sách ca làm việc của nhân viên theo ngày từ lịch làm việc, bao gồm thông tin chi tiết về ca làm việc
const getEmployeeScheduleShiftsByDate = async (
  client: Prisma.TransactionClient | typeof prisma,
  employeeId: string,
  date: Date,
) => {
  const dateOnly = toUtcDateOnly(date);

  const schedule = await client.workSchedule.findUnique({
    where: {
      employeeId_date: {
        employeeId,
        date: dateOnly,
      },
    },
    include: {
      shiftLinks: {
        include: {
          workShift: true,
        },
        orderBy: {
          workShift: {
            startTime: "asc",
          },
        },
      },
    },
  });

  return schedule?.shiftLinks.map((link) => link.workShift) ?? [];
};

// Kiểm tra xem workShiftId có thuộc lịch làm việc của nhân viên vào ngày được chọn hay không, nếu không thì ném ra lỗi
const ensureLeaveWorkShiftInSchedule = async (
  employeeId: string,
  date: Date,
  workShiftId?: string,
) => {
  if (!workShiftId) {
    return;
  }

  const shifts = await getEmployeeScheduleShiftsByDate(
    prisma,
    employeeId,
    date,
  );
  const found = shifts.some((shift) => shift.id === workShiftId);

  if (!found) {
    throw new ApiError(
      400,
      "workShiftId must belong to the employee schedule on selected date",
    );
  }
};

type LeaveShiftOccurrence = {
  date: Date;
  workShiftId: string;
  workUnits: number;
  shift: AttendanceShiftSnapshotSource;
  shiftStartAt: Date;
  shiftEndAt: Date;
};

// Lấy danh sách các ca làm việc của nhân viên trong khoảng thời gian nghỉ phép, bao gồm thông tin chi tiết về ca làm việc
const getLeaveShiftOccurrences = async (
  client: Prisma.TransactionClient | typeof prisma,
  employeeId: string,
  startDate: Date,
  endDate: Date,
  workShiftId?: string | null,
) => {
  const startDateOnly = toUtcDateOnly(startDate);
  const endDateExclusive = addUtcDays(toUtcDateOnly(endDate), 1);
  const schedules = await client.workSchedule.findMany({
    where: {
      employeeId,
      date: {
        gte: startDateOnly,
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

  return schedules.flatMap((schedule) =>
    schedule.shiftLinks.flatMap((shiftLink) => {
      const shift = shiftLink.workShift;

      if (workShiftId && shift.id !== workShiftId) {
        return [];
      }

      const shiftStartAt = buildDateTimeOnDate(schedule.date, shift.startTime);
      const shiftEndAt = getShiftEndDateTime(
        schedule.date,
        shift.startTime,
        shift.endTime,
        shift.isOvernight,
      );

      if (!rangesOverlap(startDate, endDate, shiftStartAt, shiftEndAt)) {
        return [];
      }

      return [
        {
          date: schedule.date,
          workShiftId: shift.id,
          workUnits: Number(shift.workUnits ?? 0),
          shift,
          shiftStartAt,
          shiftEndAt,
        },
      ];
    }),
  );
};

// Nhóm các ca làm việc nghỉ phép theo năm và tính tổng số đơn vị làm việc cho mỗi năm
const groupLeaveUnitsByYear = (occurrences: LeaveShiftOccurrence[]) => {
  const unitsByYear = new Map<number, number>();

  for (const occurrence of occurrences) {
    const year = occurrence.date.getUTCFullYear();
    unitsByYear.set(year, (unitsByYear.get(year) ?? 0) + occurrence.workUnits);
  }

  return unitsByYear;
};

// Kiểm tra xem nhân viên có đủ số ngày nghỉ phép hàng năm hay không, nếu không thì ném ra lỗi
const ensureAnnualLeaveBalance = async (
  client: Prisma.TransactionClient | typeof prisma,
  employeeId: string,
  unitsByYear: Map<number, number>,
) => {
  if (unitsByYear.size === 0) {
    return;
  }

  const years = [...unitsByYear.keys()];
  const balances = await client.employeeLeaveBalance.findMany({
    where: {
      employeeId,
      year: {
        in: years,
      },
    },
    select: {
      year: true,
      entitledLeaveDays: true,
      usedPaidLeaveDays: true,
    },
  });
  const balancesByYear = new Map(balances.map((item) => [item.year, item]));

  for (const [year, requestedUnits] of unitsByYear) {
    const balance = balancesByYear.get(year);
    const remaining =
      Number(balance?.entitledLeaveDays ?? 0) -
      Number(balance?.usedPaidLeaveDays ?? 0);

    if (requestedUnits > remaining) {
      throw new ApiError(
        400,
        `Annual leave balance is not enough for ${year}. Remaining: ${remaining}, requested: ${requestedUnits}`,
        "ANNUAL_LEAVE_BALANCE_NOT_ENOUGH",
      );
    }
  }
};

// Trừ số đơn vị nghỉ phép hàng năm khỏi số ngày nghỉ phép đã sử dụng của nhân viên trong cơ sở dữ liệu
const consumeAnnualLeaveUnits = async (
  tx: Prisma.TransactionClient,
  employeeId: string,
  year: number,
  units: number,
) => {
  if (units <= 0) {
    return;
  }

  const updatedRows = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    UPDATE employee_leave_balances
    SET used_paid_leave_days = used_paid_leave_days + ${units},
        updated_at = NOW()
    WHERE employee_id = ${employeeId}
      AND year = ${year}
      AND entitled_leave_days - used_paid_leave_days >= ${units}
    RETURNING id
  `);

  if (updatedRows.length === 0) {
    throw new ApiError(
      400,
      `Annual leave balance is not enough for ${year}`,
      "ANNUAL_LEAVE_BALANCE_NOT_ENOUGH",
    );
  }
};

// Hủy bỏ các phiếu thưởng/phạt tự động liên quan đến các ngày nghỉ phép của nhân viên
const cancelAutoPenaltyVouchersForLeave = async (
  tx: Prisma.TransactionClient,
  employeeId: string,
  occurrences: LeaveShiftOccurrence[],
) => {
  if (occurrences.length === 0) {
    return;
  }

  const leaveDateKeys = new Set(
    occurrences.map((occurrence) => occurrence.date.toISOString().slice(0, 10)),
  );
  const start = [...occurrences].sort(
    (left, right) => left.date.getTime() - right.date.getTime(),
  )[0].date;
  const endExclusive = addUtcDays(
    [...occurrences].sort(
      (left, right) => right.date.getTime() - left.date.getTime(),
    )[0].date,
    1,
  );

  const existingItems = await tx.payrollBonusPenalty.findMany({
    where: {
      employeeId,
      source: PayrollBonusPenaltySource.AUTO,
      status: PayrollBonusPenaltyStatus.ACTIVE,
      occurredAt: {
        gte: start,
        lt: endExclusive,
      },
    },
    select: {
      id: true,
      occurredAt: true,
    },
  });
  const itemIds = existingItems
    .filter(
      (item) =>
        item.occurredAt && leaveDateKeys.has(getDateKey(item.occurredAt)),
    )
    .map((item) => item.id);

  if (itemIds.length === 0) {
    return;
  }

  await tx.payrollBonusPenalty.updateMany({
    where: {
      id: {
        in: itemIds,
      },
    },
    data: {
      status: PayrollBonusPenaltyStatus.CANCELLED,
      cancelledAt: new Date(),
    },
  });
};

// Hủy bỏ các phiếu thưởng/phạt tự động liên quan đến việc đi muộn/về sớm của nhân viên
const cancelAutoPenaltyVouchersForLateEarly = async (
  tx: Prisma.TransactionClient,
  employeeId: string,
  date: Date,
  workShiftId: string,
) => {
  const start = toUtcDateOnly(date);
  const end = addUtcDays(start, 1);
  const workShift = await tx.workShift.findUnique({
    where: {
      id: workShiftId,
    },
    select: {
      code: true,
      name: true,
    },
  });
  const shiftLabels = [
    [workShift?.code, workShift?.name].filter(Boolean).join(" - "),
    workShift?.code,
    workShift?.name,
  ].filter((value): value is string => Boolean(value));
  const reasonFilter =
    shiftLabels.length > 0
      ? {
          OR: shiftLabels.map((label) => ({
            reason: {
              contains: label,
              mode: "insensitive" as const,
            },
          })),
        }
      : {};

  await tx.payrollBonusPenalty.updateMany({
    where: {
      employeeId,
      source: PayrollBonusPenaltySource.AUTO,
      status: PayrollBonusPenaltyStatus.ACTIVE,
      occurredAt: {
        gte: start,
        lt: end,
      },
      autoPenaltyPolicy: {
        type: {
          in: [
            AutoPenaltyType.LATE_EARLY,
            AutoPenaltyType.LATE_EARLY_PROGRESSIVE,
          ],
        },
      },
      ...reasonFilter,
    },
    data: {
      status: PayrollBonusPenaltyStatus.CANCELLED,
      cancelledAt: new Date(),
    },
  });
};

// Lấy thông tin nhân viên dựa trên userId, nếu không tìm thấy thì ném ra lỗi
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

// Tạo một yêu cầu mới cùng với các approver và watcher, đảm bảo rằng dữ liệu hợp lệ và thông báo được gửi đi
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
  const title = input.title.trim();

  if (title.length < 2) {
    throw new ApiError(400, "Title is required");
  }

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
        title,
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

  const sortedRequest = sortApprovals(request);
  await notifyRequestCreated(sortedRequest);
  return sortedRequest;
};

// Sắp xếp danh sách các approver theo thứ tự bước (stepOrder) để đảm bảo rằng các approver được xử lý theo đúng trình tự
const sortApprovals = (request: RequestWithDetails) => ({
  ...request,
  approvals: [...request.approvals].sort(
    (left, right) => left.stepOrder - right.stepOrder,
  ),
});

// Xây dựng điều kiện truy cập dựa trên vai trò của người dùng và phạm vi yêu cầu
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

  if (scope === "reviewed") {
    return {
      approvals: {
        some: {
          approverId: userId,
          status: { not: RequestApprovalStatus.PENDING },
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

// Xây dựng điều kiện truy vấn cơ bản cho danh sách yêu cầu dựa trên vai trò người dùng, phạm vi và các bộ lọc khác
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

// Lấy thông tin chi tiết của một yêu cầu dựa trên ID, bao gồm danh sách các approver và watchers, và sắp xếp các approver theo thứ tự bước
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

// Kiểm tra xem người dùng có quyền xem yêu cầu hay không, nếu không thì ném ra lỗi
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

// Kiểm tra xem người dùng có quyền duyệt yêu cầu hay không, nếu không thì ném ra lỗi
const assertCanActAsApprover = (
  request: RequestWithDetails,
  userId: string,
) => {
  const isAssignedApprover = request.approvals.some(
    (approval) => approval.approverId === userId,
  );

  if (!isAssignedApprover) {
    throw new ApiError(403, "You are not assigned to this request");
  }
};

// Kiểm tra xem người dùng có quyền hoàn tất hoặc hủy yêu cầu hay không, nếu không thì ném ra lỗi
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

// Lấy bước tiếp theo trong quy trình phê duyệt dựa trên bước hiện tại và trạng thái của các approver
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
    case RequestType.PAYROLL_APPROVAL:
      return await executePayrollApprovalLogic(tx, request, decidedAt);
    case RequestType.BONUS_PENALTY:
      return await executeBonusPenaltyLogic(tx, request, decidedAt);
    case RequestType.LEAVE:
      return await executeLeaveLogic(tx, request, decidedAt);
    case RequestType.LATE_EARLY:
      return await executeLateEarlyLogic(tx, request, decidedAt);
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

// Chuyển đổi trạng thái của các đơn phê duyệt lương trở về trạng thái nháp nếu đơn đang ở trạng thái chờ phê duyệt
const revertPayrollApprovalLogic = async (
  tx: Prisma.TransactionClient,
  request: RequestWithDetails,
) => {
  if (request.type !== RequestType.PAYROLL_APPROVAL) {
    return;
  }

  const approvalRequest = await tx.payrollApprovalRequest.findUnique({
    where: { requestId: request.id },
    select: { periodId: true },
  });

  if (!approvalRequest) {
    return;
  }

  const period = await tx.payrollPeriod.findUnique({
    where: { id: approvalRequest.periodId },
    select: { status: true },
  });

  if (period?.status !== PayrollPeriodStatus.WAITING_APPROVAL) {
    return;
  }

  await tx.payroll.updateMany({
    where: {
      periodId: approvalRequest.periodId,
      status: PayrollStatus.WAITING_APPROVAL,
    },
    data: { status: PayrollStatus.DRAFT },
  });
  await tx.payrollPeriod.update({
    where: { id: approvalRequest.periodId },
    data: {
      status: PayrollPeriodStatus.DRAFT,
      requestedAt: null,
    },
  });
};

// Thực thi logic phê duyệt lương, bao gồm việc kiểm tra trạng thái của kỳ lương và cập nhật trạng thái của các phiếu lương và kỳ lương
const executePayrollApprovalLogic = async (
  tx: Prisma.TransactionClient,
  request: RequestWithDetails,
  decidedAt: Date,
) => {
  const approvalRequest = await tx.payrollApprovalRequest.findUnique({
    where: { requestId: request.id },
    select: { periodId: true },
  });

  if (!approvalRequest) {
    throw new ApiError(
      400,
      "Payroll approval request data is missing",
      "PAYROLL_APPROVAL_REQUEST_NOT_FOUND",
    );
  }

  const period = await tx.payrollPeriod.findUnique({
    where: { id: approvalRequest.periodId },
    select: { status: true },
  });

  if (period?.status !== PayrollPeriodStatus.WAITING_APPROVAL) {
    throw new ApiError(
      400,
      "Only payroll periods waiting for approval can be approved",
      "INVALID_PAYROLL_PERIOD_STATUS",
    );
  }

  await tx.payroll.updateMany({
    where: {
      periodId: approvalRequest.periodId,
      status: PayrollStatus.WAITING_APPROVAL,
    },
    data: {
      status: PayrollStatus.APPROVED,
      approvedAt: decidedAt,
    },
  });
  await tx.payrollPeriod.update({
    where: { id: approvalRequest.periodId },
    data: {
      status: PayrollPeriodStatus.APPROVED,
      approvedAt: decidedAt,
    },
  });
};

// Thực thi logic cho đơn thưởng/phạt, bao gồm việc tạo phiếu thưởng/phạt nếu chưa tồn tại và cập nhật thời gian áp dụng
const executeBonusPenaltyLogic = async (
  tx: Prisma.TransactionClient,
  request: RequestWithDetails,
  decidedAt: Date,
) => {
  const bonusPenaltyRequest = await tx.bonusPenaltyRequest.findUnique({
    where: {
      requestId: request.id,
    },
  });

  if (!bonusPenaltyRequest) {
    throw new ApiError(
      400,
      "Bonus/penalty request data is missing",
      "BONUS_PENALTY_REQUEST_NOT_FOUND",
    );
  }

  if (bonusPenaltyRequest.bonusPenaltyId) {
    await tx.bonusPenaltyRequest.update({
      where: {
        requestId: request.id,
      },
      data: {
        appliedAt: bonusPenaltyRequest.appliedAt ?? decidedAt,
      },
    });
    return;
  }

  const voucher = await tx.payrollBonusPenalty.create({
    data: {
      employeeId: bonusPenaltyRequest.employeeId,
      month: bonusPenaltyRequest.month,
      amount: bonusPenaltyRequest.amount,
      isBonus: bonusPenaltyRequest.isBonus,
      reason: bonusPenaltyRequest.reason,
      source: PayrollBonusPenaltySource.MANUAL,
      status: PayrollBonusPenaltyStatus.ACTIVE,
      cancelledAt: null,
    },
  });

  await tx.bonusPenaltyRequest.update({
    where: {
      requestId: request.id,
    },
    data: {
      bonusPenaltyId: voucher.id,
      appliedAt: decidedAt,
    },
  });
};

// Xử lý logic cho đơn phê duyệt lịch làm việc, bao gồm việc áp dụng các ca làm việc từ yêu cầu vào lịch làm việc của nhân viên
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
  const occurrences = await getLeaveShiftOccurrences(
    tx,
    employee.id,
    leaveRequest.startDate,
    leaveRequest.endDate,
    leaveRequest.workShiftId,
  );

  if (annualLeaveTypes.has(leaveRequest.leaveType)) {
    const unitsByYear = groupLeaveUnitsByYear(occurrences);
    await ensureAnnualLeaveBalance(tx, employee.id, unitsByYear);

    for (const [year, units] of unitsByYear) {
      await consumeAnnualLeaveUnits(tx, employee.id, year, units);
    }
  }

  await cancelAutoPenaltyVouchersForLeave(tx, employee.id, occurrences);

  const occurrencesByDate = new Map<string, LeaveShiftOccurrence[]>();
  for (const occurrence of occurrences) {
    const key = getDateKey(occurrence.date);
    occurrencesByDate.set(key, [
      ...(occurrencesByDate.get(key) ?? []),
      occurrence,
    ]);
  }

  const isPaidLeave =
    annualLeaveTypes.has(leaveRequest.leaveType) ||
    paidWithoutBalanceLeaveTypes.has(leaveRequest.leaveType);
  const status = isPaidLeave ? paidLeaveStatus : unpaidLeaveStatus;

  for (const dateOccurrences of occurrencesByDate.values()) {
    const attendanceDate = dateOccurrences[0].date;
    const attendanceRecord = await tx.attendanceRecord.upsert({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: attendanceDate,
        },
      },
      create: {
        employeeId: employee.id,
        date: attendanceDate,
      },
      update: {},
    });

    for (const occurrence of dateOccurrences) {
      const shiftSnapshot = buildAttendanceDetailShiftSnapshot(
        occurrence.shift,
        occurrence.shiftStartAt,
        occurrence.shiftEndAt,
      );

      await tx.attendanceRecordDetail.upsert({
        where: {
          attendanceRecordId_workShiftId: {
            attendanceRecordId: attendanceRecord.id,
            workShiftId: occurrence.workShiftId,
          },
        },
        create: {
          attendanceRecordId: attendanceRecord.id,
          workShiftId: occurrence.workShiftId,
          ...shiftSnapshot,
          checkInTime: null,
          checkOutTime: null,
          status,
        },
        update: {
          ...shiftSnapshot,
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
    throw new ApiError(
      409,
      "Attendance record does not exist for the selected date",
      "ATTENDANCE_RECORD_NOT_FOUND",
    );
  }

  const details = attendanceRecord.details.filter((detail) => {
    if (leaveAttendanceStatuses.has(detail.status)) {
      return false;
    }

    return correctionRequest.workShiftId
      ? detail.workShiftId === correctionRequest.workShiftId
      : true;
  });

  if (details.length === 0) {
    throw new ApiError(
      409,
      "No attendance detail can be corrected for the selected shift",
      "ATTENDANCE_DETAIL_NOT_FOUND",
    );
  }

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

  await tx.attendanceCorrectionRequest.update({
    where: {
      requestId: request.id,
    },
    data: {
      appliedAt: decidedAt,
    },
  });
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
  workShiftId: string | null,
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

    if (workShiftId && detail.workShiftId !== workShiftId) {
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

/** Xử lý logic cho đơn đi muộn về sớm
 */
const executeLateEarlyLogic = async (
  tx: Prisma.TransactionClient,
  request: RequestWithDetails,
  decidedAt: Date,
) => {
  const lateEarlyRequest = await tx.lateEarlyRequest.findUnique({
    where: {
      requestId: request.id,
    },
  });

  if (!lateEarlyRequest) {
    throw new ApiError(
      400,
      "Late/early request data is missing",
      "LATE_EARLY_REQUEST_NOT_FOUND",
    );
  }

  await applyLateEarlyApproval(
    tx,
    lateEarlyRequest.employeeId,
    lateEarlyRequest.startDate,
    lateEarlyRequest.endDate,
    lateEarlyRequest.workShiftId,
  );
  await cancelAutoPenaltyVouchersForLateEarly(
    tx,
    lateEarlyRequest.employeeId,
    lateEarlyRequest.date,
    lateEarlyRequest.workShiftId,
  );

  await tx.lateEarlyRequest.update({
    where: {
      requestId: request.id,
    },
    data: {
      appliedAt: decidedAt,
    },
  });
};

export const requestService = {
  // Lấy danh sách các yêu cầu dựa trên userId, vai trò và các bộ lọc
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

  // Lấy danh sách các yêu cầu của người dùng dựa trên userId, vai trò và các bộ lọc,
  // chỉ lấy các yêu cầu mà người dùng là requester
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

  // Lấy danh sách các yêu cầu mà người dùng đang theo dõi dựa trên userId, vai trò và các bộ lọc
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

  // Lấy danh sách các yêu cầu đang chờ phê duyệt của người dùng dựa trên userId, vai trò và các bộ lọc
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

  // Lấy danh sách các yêu cầu mà người dùng đã phê duyệt dựa trên userId, vai trò và các bộ lọc
  async getRequestById(requestId: string, userId: string, role: UserRole) {
    const request = await getRequestByIdWithDetails(requestId);
    assertCanViewRequest(request, userId, role === UserRole.ADMIN);
    return request;
  },

  // Lấy danh sách các ca làm việc nghỉ phép của người dùng dựa trên userId và ngày cụ thể
  async getMyLeaveShiftsByDate(userId: string, dateValue: string) {
    const employee = await ensureEmployeeRequester(userId);
    const date = parseDateOnly(dateValue, "date");
    return getEmployeeScheduleShiftsByDate(prisma, employee.id, date);
  },

  async getMyScheduleShiftsByDate(userId: string, dateValue: string) {
    const employee = await ensureEmployeeRequester(userId);
    const date = parseDateOnly(dateValue, "date");
    return getEmployeeScheduleShiftsByDate(prisma, employee.id, date);
  },

  // Lấy danh sách các nhân viên có userId hợp lệ để hiển thị trong các tùy chọn yêu cầu
  async getEmployeeOptions(): Promise<RequestEmployeeOption[]> {
    return prisma.employee.findMany({
      where: {
        userId: {
          not: null,
        },
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  async createRequest(userId: string, input: CreateRequestInput) {
    return createRequestWithApprovals(userId, input);
  },

  async createLeaveRequest(userId: string, input: CreateLeaveRequestInput) {
    const employee = await ensureEmployeeRequester(userId);

    const startDate = parseDateOnly(input.startDate, "startDate");
    const endDate = toUtcEndOfDate(parseDateOnly(input.endDate, "endDate"));

    if (endDate.getTime() < startDate.getTime()) {
      throw new ApiError(400, "endDate must be on or after startDate");
    }

    if (!leaveTypes.has(input.leaveType)) {
      throw new ApiError(400, "leaveType is invalid");
    }

    await ensureLeaveWorkShiftInSchedule(
      employee.id,
      startDate,
      input.workShiftId,
    );

    const occurrences = await getLeaveShiftOccurrences(
      prisma,
      employee.id,
      startDate,
      endDate,
      input.workShiftId,
    );

    if (annualLeaveTypes.has(input.leaveType)) {
      await ensureAnnualLeaveBalance(
        prisma,
        employee.id,
        groupLeaveUnitsByYear(occurrences),
      );
    }

    const reason = input.reason.trim();
    if (!reason) {
      throw new ApiError(400, "reason is required");
    }
    const title = input.title.trim();

    return createRequestWithApprovals(userId, {
      type: RequestType.LEAVE,
      title,
      description: input.description,
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
            workShiftId: input.workShiftId || null,
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
    const employee = await ensureEmployeeRequester(userId);

    const date = parseDateOnly(input.date, "date");
    const startDate = combineDateAndTime(date, input.startTime, "startTime");
    const endDate = combineDateAndTime(date, input.endTime, "endTime");

    if (endDate.getTime() <= startDate.getTime()) {
      throw new ApiError(400, "endTime must be after startTime");
    }

    const scheduleShifts = await getEmployeeScheduleShiftsByDate(
      prisma,
      employee.id,
      date,
    );
    const selectedShift = scheduleShifts.find(
      (shift) => shift.id === input.workShiftId,
    );

    if (!selectedShift) {
      throw new ApiError(
        400,
        "workShiftId must belong to the employee schedule on selected date",
      );
    }

    const shiftStartAt = buildDateTimeOnDate(date, selectedShift.startTime);
    const shiftEndAt = getShiftEndDateTime(
      date,
      selectedShift.startTime,
      selectedShift.endTime,
      selectedShift.isOvernight,
    );

    if (!rangesOverlap(startDate, endDate, shiftStartAt, shiftEndAt)) {
      throw new ApiError(400, "Selected time range must overlap work shift");
    }

    const title = input.title.trim();

    return createRequestWithApprovals(userId, {
      type: RequestType.LATE_EARLY,
      title,
      description: input.description,
      approvalMode: input.approvalMode,
      approverIds: input.approverIds,
      watcherIds: input.watcherIds,
      createExtra: async (tx, requestId) => {
        await tx.lateEarlyRequest.create({
          data: {
            requestId,
            employeeId: employee.id,
            date,
            startDate,
            endDate,
            requestType: input.type as LateEarlyType,
            workShiftId: selectedShift.id,
            reason: input.reason,
          },
        });
      },
    });
  },

  async createAttendanceCorrectionRequest(
    userId: string,
    input: CreateAttendanceCorrectionRequestInput,
  ) {
    const employee = await ensureEmployeeRequester(userId);
    const attendanceDate = parseDateOnly(
      input.attendanceDate,
      "attendanceDate",
    );
    const reason = input.reason.trim();

    if (!reason) {
      throw new ApiError(400, "reason is required");
    }

    const scheduleShifts = await getEmployeeScheduleShiftsByDate(
      prisma,
      employee.id,
      attendanceDate,
    );
    const selectedShift = scheduleShifts.find(
      (shift) => shift.id === input.workShiftId,
    );

    if (!selectedShift) {
      throw new ApiError(
        400,
        "workShiftId must belong to the employee schedule on selected date",
      );
    }

    const title = input.title.trim();

    return createRequestWithApprovals(userId, {
      type: RequestType.ATTENDANCE_CORRECTION,
      title,
      description: input.description,
      approvalMode: input.approvalMode,
      approverIds: input.approverIds,
      watcherIds: input.watcherIds,
      createExtra: async (tx, requestId) => {
        await tx.attendanceCorrectionRequest.create({
          data: {
            requestId,
            employeeId: employee.id,
            attendanceDate,
            workShiftId: selectedShift.id,
            addedWorkUnits: selectedShift.workUnits,
            reason,
          },
        });
      },
    });
  },

  async createBonusPenaltyRequest(
    userId: string,
    input: CreateBonusPenaltyRequestInput,
  ) {
    await ensureEmployeeExists(input.employeeId);

    const month = parseMonthOnly(input.month, "month");
    const amount = parsePositiveDecimal(input.amount, "amount");
    const reason = input.reason.trim();

    if (!reason) {
      throw new ApiError(400, "reason is required");
    }

    const title = input.title.trim();

    return createRequestWithApprovals(userId, {
      type: RequestType.BONUS_PENALTY,
      title,
      description: input.description,
      approvalMode: input.approvalMode,
      approverIds: input.approverIds,
      watcherIds: input.watcherIds,
      createExtra: async (tx, requestId) => {
        await tx.bonusPenaltyRequest.create({
          data: {
            requestId,
            employeeId: input.employeeId,
            month,
            amount,
            isBonus: input.isBonus,
            reason,
          },
        });
      },
    });
  },

  async startReview(requestId: string, userId: string, role: UserRole) {
    void role;

    return runSerializableTransaction(async (tx) => {
      const request = await tx.request.findUnique({
        where: { id: requestId },
        include: requestInclude,
      });

      if (!request) {
        throw new ApiError(404, "Request not found", "REQUEST_NOT_FOUND");
      }

      assertCanActAsApprover(request, userId);

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

      if (
        request.approvalMode === ApprovalMode.SEQUENTIAL &&
        approver.stepOrder !== request.currentStep
      ) {
        throw new ApiError(
          409,
          "It is not your turn to review this request",
          "REQUEST_APPROVAL_OUT_OF_ORDER",
        );
      }

      if (request.status === RequestStatus.PENDING) {
        await tx.request.update({
          where: { id: requestId },
          data: {
            status: RequestStatus.PROCESSING,
            processingAt: new Date(),
          },
        });
      }

      const updatedRequest = await tx.request.findUnique({
        where: { id: requestId },
        include: requestInclude,
      });

      if (!updatedRequest) {
        throw new ApiError(404, "Request not found", "REQUEST_NOT_FOUND");
      }

      return sortApprovals(updatedRequest);
    });
  },

  async decideRequest(
    requestId: string,
    userId: string,
    role: UserRole,
    input: ReviewDecisionInput,
  ) {
    void role;

    if (
      input.decision !== RequestApprovalStatus.APPROVED &&
      input.decision !== RequestApprovalStatus.REJECTED
    ) {
      throw new ApiError(
        400,
        "Decision must be APPROVED or REJECTED",
        "INVALID_REQUEST_DECISION",
      );
    }

    // Chuyển sang PROCESSING nếu còn ở PENDING
    const decidedAt = new Date();
    let result: RequestWithDetails;

    try {
      result = await runSerializableTransaction(async (tx) => {
        const transactionRequest = await tx.request.findUnique({
          where: { id: requestId },
          include: requestInclude,
        });

        if (!transactionRequest) {
          throw new ApiError(404, "Request not found", "REQUEST_NOT_FOUND");
        }

        // Kiểm tra xem người dùng có quyền duyệt yêu cầu hay không
        assertCanActAsApprover(transactionRequest, userId);

        if (finalRequestStatuses.has(transactionRequest.status)) {
          throw new ApiError(
            400,
            "Request is already finished",
            "REQUEST_ALREADY_FINAL",
          );
        }
        // Kiểm tra xem approver đã duyệt hay chưa
        const transactionApproval = transactionRequest.approvals.find(
          (item) => item.approverId === userId,
        );

        if (
          !transactionApproval ||
          transactionApproval.status !== RequestApprovalStatus.PENDING
        ) {
          throw new ApiError(400, "You have already reviewed this request");
        }

        // Kiểm tra xem approver có phải là người duyệt tiếp theo trong quy trình tuần tự hay không
        if (
          transactionRequest.approvalMode === ApprovalMode.SEQUENTIAL &&
          transactionApproval.stepOrder !== transactionRequest.currentStep
        ) {
          throw new ApiError(
            409,
            "It is not your turn to review this request",
            "REQUEST_APPROVAL_OUT_OF_ORDER",
          );
        }
        // Cập nhật quyết định của approver
        const claimedApproval = await tx.requestApproval.updateMany({
          where: {
            requestId,
            approverId: userId,
            status: RequestApprovalStatus.PENDING,
          },
          data: {
            status: input.decision,
            note: input.note,
            decidedAt,
          },
        });

        // Nếu không có bản ghi nào được cập nhật, điều đó có nghĩa là approver đã duyệt trước đó
        if (claimedApproval.count !== 1) {
          throw new ApiError(
            409,
            "This approval was already updated",
            "REQUEST_APPROVAL_CONFLICT",
          );
        }

        // Nếu đơn đang ở trạng thái PENDING, chuyển sang PROCESSING
        if (transactionRequest.status === RequestStatus.PENDING) {
          await tx.request.update({
            where: { id: requestId },
            data: {
              status: RequestStatus.PROCESSING,
              processingAt: decidedAt,
            },
          });
        }

        // Lấy lại thông tin đơn sau khi cập nhật quyết định của approver
        const latestRequest = await tx.request.findUnique({
          where: {
            id: requestId,
          },
          include: requestInclude,
        });

        if (!latestRequest) {
          throw new ApiError(404, "Request not found", "REQUEST_NOT_FOUND");
        }

        // Sắp xếp danh sách approvals theo stepOrder để xử lý tiếp theo
        const sortedApprovals = [...latestRequest.approvals].sort(
          (left, right) => left.stepOrder - right.stepOrder,
        );

        // Nếu approver reject thì reject ngay đơn
        if (input.decision === RequestApprovalStatus.REJECTED) {
          await revertPayrollApprovalLogic(tx, latestRequest);
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
          // Nếu approver approve thì kiểm tra xem có bước tiếp theo hay không
          const nextStep = getNextSequentialStep(
            latestRequest,
            transactionApproval.stepOrder,
          );

          // Nếu có bước tiếp theo thì chuyển sang bước đó, nếu không thì approve đơn
          const updateData: Prisma.RequestUpdateInput = nextStep
            ? {
                status: RequestStatus.PROCESSING,
                currentStep: nextStep,
              }
            : {
                status: RequestStatus.APPROVED,
                approvedAt: decidedAt,
              };

          // Cập nhật trạng thái của đơn
          const updatedRequest = await tx.request.update({
            where: {
              id: requestId,
            },
            data: updateData,
            include: requestInclude,
          });

          // Nếu đơn đã được duyệt hoàn toàn thì thực thi logic cụ thể
          if (updatedRequest.status === RequestStatus.APPROVED) {
            try {
              await executeRequestLogic(tx, updatedRequest, decidedAt);
            } catch (error) {
              throw new RequestExecutionError(requestId, error);
            }
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
          try {
            await executeRequestLogic(tx, updatedRequest, decidedAt);
          } catch (error) {
            throw new RequestExecutionError(requestId, error);
          }
        }

        return sortApprovals(updatedRequest);
      });
    } catch (error) {
      // Nếu có lỗi xảy ra trong quá trình thực thi logic duyệt đơn, cập nhật trạng thái đơn thành FAILED và thông báo cho các user liên quan
      if (error instanceof RequestExecutionError) {
        await prisma.request.updateMany({
          where: {
            id: error.requestId,
            status: {
              in: [RequestStatus.PENDING, RequestStatus.PROCESSING],
            },
          },
          data: {
            status: RequestStatus.FAILED,
          },
        });

        const failedRequest = await getRequestByIdWithDetails(error.requestId);
        await notifyRequestUsers(
          [
            failedRequest.requesterId,
            ...failedRequest.watchers.map((watcher) => watcher.userId),
          ],
          "Yêu cầu xử lý thất bại",
          `Yêu cầu "${failedRequest.title}" không thể áp dụng dữ liệu nghiệp vụ.`,
          failedRequest,
        );

        console.error("Failed to execute approved request:", error.cause);
        throw new ApiError(
          500,
          "Request approval could not be applied",
          "REQUEST_EXECUTION_FAILED",
        );
      }

      throw error;
    }

    // Sắp xếp danh sách approvals theo stepOrder để gửi thông báo cho các user liên quan
    const sortedResult = sortApprovals(result);
    const nextApproverIds =
      sortedResult.approvalMode === ApprovalMode.SEQUENTIAL &&
      sortedResult.status === RequestStatus.PROCESSING
        ? sortedResult.approvals
            .filter(
              (item) =>
                item.stepOrder === sortedResult.currentStep &&
                item.status === RequestApprovalStatus.PENDING,
            )
            .map((item) => item.approverId)
        : [];
    const notificationTitle =
      sortedResult.status === RequestStatus.APPROVED
        ? "Yêu cầu đã được duyệt"
        : sortedResult.status === RequestStatus.REJECTED
          ? "Yêu cầu đã bị từ chối"
          : "Yêu cầu đã được cập nhật";

    // Gửi thông báo cho các user liên quan về trạng thái mới của yêu cầu
    await notifyRequestUsers(
      [
        sortedResult.requesterId,
        ...sortedResult.watchers.map((watcher) => watcher.userId),
        ...nextApproverIds,
      ],
      notificationTitle,
      `Yêu cầu "${sortedResult.title}" hiện ở trạng thái ${sortedResult.status}.`,
      sortedResult,
      userId,
    );

    return sortedResult;
  },

  async cancelRequest(requestId: string, userId: string, role: UserRole) {
    const cancelledAt = new Date();
    const result = await runSerializableTransaction(async (tx) => {
      const request = await tx.request.findUnique({
        where: { id: requestId },
        include: requestInclude,
      });

      if (!request) {
        throw new ApiError(404, "Request not found", "REQUEST_NOT_FOUND");
      }

      assertCanCompleteOrCancel(request, userId, role === UserRole.ADMIN);

      if (
        request.status !== RequestStatus.PENDING &&
        request.status !== RequestStatus.PROCESSING
      ) {
        throw new ApiError(
          400,
          "Only pending or processing requests can be cancelled",
          "REQUEST_CANNOT_BE_CANCELLED",
        );
      }

      await revertPayrollApprovalLogic(tx, request);
      const updatedRequest = await tx.request.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.CANCELLED,
          cancelledAt,
        },
        include: requestInclude,
      });

      return updatedRequest;
    });

    const sortedResult = sortApprovals(result);
    await notifyRequestUsers(
      [
        ...sortedResult.approvals.map((approval) => approval.approverId),
        ...sortedResult.watchers.map((watcher) => watcher.userId),
      ],
      "Yêu cầu đã bị hủy",
      `Yêu cầu "${sortedResult.title}" đã bị hủy.`,
      sortedResult,
      userId,
    );

    return sortedResult;
  },
};
