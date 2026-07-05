import mqtt, { MqttClient } from "mqtt";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import {
  AttendanceStatus,
  Prisma,
  RequestStatus,
} from "../../generated/prisma/client";

type JsonRecord = Record<string, unknown>;

type RegisterFingerprintCommandPayload = {
  commandId: string;
  employeeId: string;
  fingerName: string;
};

type DeleteFingerprintCommandPayload = {
  commandId: string;
  fingerId: number;
};

type ShowInfoCommandPayload = {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  fingerId: number;
  recordedAt: string;
  punchType: "CHECK_IN" | "CHECK_OUT" | "UNKNOWN";
  message: string;
};

type DeviceCommandMessage = {
  commandId: string;
  command: string;
  payload?: JsonRecord | null;
};

type ShiftMatchWindow = {
  shiftStartMinutes: number;
  shiftEndMinutes: number;
  checkInStartMinutes: number;
  checkInEndMinutes: number;
  checkOutStartMinutes: number;
  checkOutEndMinutes: number;
};

type ShiftMatchCandidate = {
  scheduleDate: Date;
  shiftLink: {
    workShiftId: string;
    workShift: {
      name: string;
      startTime: string;
      endTime: string;
      code: string;
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
  };
  window: ShiftMatchWindow;
  punchType: "CHECK_IN" | "CHECK_OUT";
  score: number;
};

type AttendanceDetailSnapshot = {
  checkInTime: Date | null;
  checkOutTime: Date | null;
};

const MINUTES_PER_DAY = 24 * 60;

const topicPrefix = env.ATTENDANCE_TOPIC_PREFIX.replace(/\/+$/, "");
const attendanceTimezoneOffsetMs = 7 * 60 * 60 * 1000;
const heartbeatTimeoutMs = env.ATTENDANCE_HEARTBEAT_TIMEOUT_SECONDS * 1000;
const offlineSweepIntervalMs = Math.min(
  Math.max(heartbeatTimeoutMs / 2, 30_000),
  60_000,
);

const mqttOptions = {
  clientId: env.MQTT_CLIENT_ID,
  keepalive: env.MQTT_KEEP_ALIVE_SECONDS,
  reconnectPeriod: 5_000,
  clean: true,
  username: env.MQTT_USERNAME || undefined,
  password: env.MQTT_PASSWORD || undefined,
};

let mqttClient: MqttClient | null = null;
let offlineSweepTimer: NodeJS.Timeout | null = null;

let isAbsentSweepRunning = false;

const activeLeaveRequestStatuses = [
  RequestStatus.PENDING,
  RequestStatus.PROCESSING,
  RequestStatus.APPROVED,
];

const isObject = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseJson = (value: Buffer | string): JsonRecord | null => {
  try {
    const text = value.toString();
    const parsed = JSON.parse(text) as unknown;
    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const buildTopic = (deviceCode: string, suffix: string) =>
  `${topicPrefix}/${deviceCode}/${suffix}`;

const parseDeviceCodeFromTopic = (topic: string, suffix: string) => {
  const expectedPrefix = `${topicPrefix}/`;
  if (!topic.startsWith(expectedPrefix) || !topic.endsWith(`/${suffix}`)) {
    return null;
  }

  const body = topic.slice(
    expectedPrefix.length,
    topic.length - suffix.length - 1,
  );
  const parts = body.split("/").filter(Boolean);
  return parts.length === 1 ? parts[0] : null;
};

const parseClockToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map((value) => Number(value));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const toUtcDateOnly = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

const getUtcDayRange = (date: Date) => {
  const start = toUtcDateOnly(date);
  return {
    start,
    end: addUtcDays(start, 1),
  };
};

const buildDateTimeOnDate = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map((value) => Number(value));
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
      0,
      0,
    ),
  );
};

const isSameUtcDate = (left: Date, right: Date) =>
  left.getUTCFullYear() === right.getUTCFullYear() &&
  left.getUTCMonth() === right.getUTCMonth() &&
  left.getUTCDate() === right.getUTCDate();

const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

const addUtcDays = (date: Date, days: number) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );

const toAttendanceClockTime = (date: Date) =>
  new Date(date.getTime() + attendanceTimezoneOffsetMs);

const fromAttendanceClockTime = (date: Date) =>
  new Date(date.getTime() - attendanceTimezoneOffsetMs);

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

const buildWindowDateTime = (
  date: Date,
  time: string,
  shiftStartTime: string,
) => {
  const shiftStartMinutes = parseClockToMinutes(shiftStartTime);
  const windowMinutes = parseClockToMinutes(time);
  let windowAt = buildDateTimeOnDate(date, time);

  if (
    shiftStartMinutes !== null &&
    windowMinutes !== null &&
    windowMinutes < shiftStartMinutes
  ) {
    windowAt = addUtcDays(windowAt, 1);
  }

  return windowAt;
};

const isMinutesInWindow = (
  punchMinutes: number,
  startMinutes: number,
  endMinutes: number,
) => {
  if (startMinutes <= endMinutes) {
    return punchMinutes >= startMinutes && punchMinutes <= endMinutes;
  }

  return punchMinutes >= startMinutes || punchMinutes <= endMinutes;
};

const buildLeaveCoverageMap = async (
  employeeIds: string[],
  start: Date,
  end: Date,
) => {
  if (employeeIds.length === 0) {
    return new Map<string, Set<string | null>>();
  }

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: {
      startDate: { lt: end },
      endDate: { gte: start },
      request: {
        status: { in: activeLeaveRequestStatuses },
        requester: {
          employee: {
            id: { in: employeeIds },
          },
        },
      },
    },
    select: {
      startDate: true,
      endDate: true,
      workShiftId: true,
      request: {
        select: {
          requester: {
            select: {
              employee: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });
  const coverage = new Map<string, Set<string | null>>();

  for (const leaveRequest of leaveRequests) {
    const employeeId = leaveRequest.request.requester.employee?.id;
    if (!employeeId) {
      continue;
    }

    for (
      let date = toUtcDateOnly(leaveRequest.startDate);
      date.getTime() <= toUtcDateOnly(leaveRequest.endDate).getTime();
      date = addUtcDays(date, 1)
    ) {
      if (date < start || date >= end) {
        continue;
      }

      const key = `${employeeId}_${getDateKey(date)}`;
      coverage.set(key, coverage.get(key) ?? new Set<string | null>());
      coverage.get(key)?.add(leaveRequest.workShiftId);
    }
  }

  return coverage;
};

const hasLeaveCoverage = (
  coverage: Map<string, Set<string | null>>,
  employeeId: string,
  date: Date,
  workShiftId: string,
) => {
  const coveredShiftIds = coverage.get(`${employeeId}_${getDateKey(date)}`);

  return Boolean(
    coveredShiftIds &&
    (coveredShiftIds.has(null) || coveredShiftIds.has(workShiftId)),
  );
};

const parseMonth = (value: string) => {
  const match = /^(\d{4})-(\d{2})$/.exec(value);

  if (!match) {
    throw new Error("month must be in YYYY-MM format");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) {
    throw new Error("month must be in YYYY-MM format");
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

const getClockDistance = (left: number, right: number) => {
  const rawDistance = Math.abs(left - right);
  return Math.min(rawDistance, MINUTES_PER_DAY - rawDistance);
};

//Tính toán khoảng thời gian khớp với ca làm việc dựa trên các thông tin về thời gian bắt đầu và kết thúc ca, thời gian bắt đầu và kết thúc chấm công vào và ra, và trả về một đối tượng ShiftMatchWindow chứa các giá trị tính toán được. Nếu có bất kỳ giá trị nào không hợp lệ, trả về null.
const resolveShiftMatchWindow = (workShift: {
  startTime: string;
  endTime: string;
  checkInStartTime: string;
  checkInEndTime: string;
  checkOutStartTime: string;
  checkOutEndTime: string;
}): ShiftMatchWindow | null => {
  const shiftStartMinutes = parseClockToMinutes(workShift.startTime);
  const shiftEndMinutes = parseClockToMinutes(workShift.endTime);
  const checkInStartMinutes = parseClockToMinutes(workShift.checkInStartTime);
  const checkInEndMinutes = parseClockToMinutes(workShift.checkInEndTime);
  const checkOutStartMinutes = parseClockToMinutes(workShift.checkOutStartTime);
  const checkOutEndMinutes = parseClockToMinutes(workShift.checkOutEndTime);

  if (
    shiftStartMinutes === null ||
    shiftEndMinutes === null ||
    checkInStartMinutes === null ||
    checkInEndMinutes === null ||
    checkOutStartMinutes === null ||
    checkOutEndMinutes === null
  ) {
    return null;
  }

  return {
    shiftStartMinutes,
    shiftEndMinutes,
    checkInStartMinutes,
    checkInEndMinutes,
    checkOutStartMinutes,
    checkOutEndMinutes,
  };
};

//Tìm kiếm các ca làm việc phù hợp với thời gian chấm công dựa trên lịch làm việc đã được lập trước đó và trả về một mảng các đối tượng ShiftMatchCandidate chứa thông tin về ca làm việc, thời gian chấm công, loại chấm công (CHECK_IN hoặc CHECK_OUT) và điểm số khớp. Nếu không tìm thấy ca làm việc phù hợp, trả về mảng rỗng.
const resolveShiftMatchCandidates = (
  scheduledShift: {
    scheduleDate: Date;
    shiftLink: ShiftMatchCandidate["shiftLink"];
  },
  punchMinutes: number,
): ShiftMatchCandidate[] => {
  const window = resolveShiftMatchWindow(scheduledShift.shiftLink.workShift);

  if (!window) {
    return [];
  }

  const candidates: ShiftMatchCandidate[] = [];

  if (
    isMinutesInWindow(
      punchMinutes,
      window.checkInStartMinutes,
      window.checkInEndMinutes,
    )
  ) {
    candidates.push({
      scheduleDate: scheduledShift.scheduleDate,
      shiftLink: scheduledShift.shiftLink,
      window,
      punchType: "CHECK_IN",
      score: getClockDistance(punchMinutes, window.shiftStartMinutes),
    });
  }

  if (
    isMinutesInWindow(
      punchMinutes,
      window.checkOutStartMinutes,
      window.checkOutEndMinutes,
    )
  ) {
    candidates.push({
      scheduleDate: scheduledShift.scheduleDate,
      shiftLink: scheduledShift.shiftLink,
      window,
      punchType: "CHECK_OUT",
      score: getClockDistance(punchMinutes, window.shiftEndMinutes),
    });
  }

  return candidates;
};

//Tính toán mức độ ưu tiên của ca làm việc dựa trên ngày chấm công và ngày lập lịch, nếu ngày chấm công trùng với ngày lập lịch thì ưu tiên cao hơn (0), ngược lại thì ưu tiên thấp hơn (1). Nếu loại chấm công là CHECK_IN thì so sánh với ngày lập lịch, nếu loại chấm công là CHECK_OUT thì so sánh với thời gian kết thúc ca làm việc.
const getPunchSchedulePreference = (
  candidate: ShiftMatchCandidate,
  attendanceDate: Date,
) => {
  if (candidate.punchType === "CHECK_IN") {
    return isSameUtcDate(candidate.scheduleDate, attendanceDate) ? 0 : 1;
  }

  return candidate.scheduleDate.getTime() < attendanceDate.getTime() ? 0 : 1;
};

//Tính toán mức độ ưu tiên của loại chấm công dựa trên loại chấm công (CHECK_IN hoặc CHECK_OUT), nếu là CHECK_IN thì ưu tiên cao hơn (0), ngược lại thì ưu tiên thấp hơn (1).
const getPunchTypePreference = (punchType: ShiftMatchCandidate["punchType"]) =>
  punchType === "CHECK_IN" ? 0 : 1;

const resolveAttendanceStatus = (
  detail: AttendanceDetailSnapshot,
  shiftStartAt: Date,
  shiftEndAt: Date,
  lateGracePeriod: number,
  earlyLeaveGracePeriod: number,
) => {
  if (!detail.checkInTime && !detail.checkOutTime) {
    return AttendanceStatus.ABSENT;
  }

  const isLate = detail.checkInTime
    ? detail.checkInTime.getTime() >
      shiftStartAt.getTime() + lateGracePeriod * 60_000
    : false;
  const isEarlyLeave = detail.checkOutTime
    ? detail.checkOutTime.getTime() <
      shiftEndAt.getTime() - earlyLeaveGracePeriod * 60_000
    : false;

  if (detail.checkInTime && !detail.checkOutTime) {
    return isLate
      ? AttendanceStatus.LATE_AND_EARLY_LEAVE
      : AttendanceStatus.EARLY_LEAVE;
  }

  if (isLate && isEarlyLeave) {
    return AttendanceStatus.LATE_AND_EARLY_LEAVE;
  }

  if (isLate) {
    return AttendanceStatus.LATE;
  }

  if (isEarlyLeave) {
    return AttendanceStatus.EARLY_LEAVE;
  }

  return AttendanceStatus.PRESENT;
};

const buildAttendanceDetailShiftSnapshot = (
  shift: ShiftMatchCandidate["shiftLink"]["workShift"],
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

const resolveDeviceByCode = async (deviceCode: string) =>
  prisma.attendanceDevice.findUnique({
    where: { code: deviceCode },
  });

const ensureConnectedClient = async () => {
  if (!env.MQTT_URL) {
    return null;
  }

  if (mqttClient) {
    return mqttClient;
  }

  mqttClient = mqtt.connect(env.MQTT_URL, mqttOptions);

  mqttClient.on("connect", async () => {
    const topics = [
      `${topicPrefix}/+/punch`,
      `${topicPrefix}/+/heartbeat`,
      `${topicPrefix}/+/commands/result`,
    ];

    mqttClient?.subscribe(topics, { qos: 1 }, (error) => {
      if (error) {
        console.error("Failed to subscribe attendance topics:", error);
      }
    });
  });

  mqttClient.on("message", (topic, message) => {
    void (async () => {
      const deviceCodeForPunch = parseDeviceCodeFromTopic(topic, "punch");
      const deviceCodeForHeartbeat = parseDeviceCodeFromTopic(
        topic,
        "heartbeat",
      );
      const deviceCodeForResult = parseDeviceCodeFromTopic(
        topic,
        "commands/result",
      );

      if (deviceCodeForPunch) {
        await handlePunchMessage(deviceCodeForPunch, message);
        return;
      }

      if (deviceCodeForHeartbeat) {
        await handleHeartbeatMessage(deviceCodeForHeartbeat);
        return;
      }

      if (deviceCodeForResult) {
        await handleCommandResultMessage(deviceCodeForResult, message);
      }
    })().catch((error) => {
      console.error("Failed to process attendance MQTT message:", error);
    });
  });

  mqttClient.on("error", (error) => {
    console.error("Attendance MQTT error:", error);
  });

  mqttClient.on("close", () => {
    console.warn("Attendance MQTT connection closed");
  });

  startOfflineSweep();

  return mqttClient;
};

const startOfflineSweep = () => {
  if (offlineSweepTimer) {
    return;
  }

  offlineSweepTimer = setInterval(async () => {
    try {
      const cutoff = new Date(Date.now() - heartbeatTimeoutMs);
      await prisma.attendanceDevice.updateMany({
        where: {
          isConnected: true,
          OR: [{ lastHeartbeatAt: null }, { lastHeartbeatAt: { lt: cutoff } }],
        },
        data: {
          isConnected: false,
        },
      });
    } catch (error) {
      console.error("Failed to sweep offline attendance devices:", error);
    }
  }, offlineSweepIntervalMs);
};

//hàm này sẽ được chạy định kỳ để tạo các bản ghi điểm danh với trạng thái vắng mặt cho những lịch làm việc đã kết thúc nhưng chưa có bản ghi điểm danh nào, giúp đảm bảo dữ liệu điểm danh luôn đầy đủ và chính xác ngay cả khi nhân viên quên chấm công hoặc có lỗi hệ thống
export const createAbsentDetailsForExpiredSchedules = async () => {
  if (isAbsentSweepRunning) {
    return { createdCount: 0, skipped: true };
  }

  isAbsentSweepRunning = true;
  let createdCount = 0;

  try {
    // Compare with the UTC+7 attendance clock and mark absent right after
    // check-in closes, not after the check-out window closes.
    const now = new Date();
    const attendanceClockNow = toAttendanceClockTime(now);
    const today = toUtcDateOnly(attendanceClockNow);
    const fromDate = addUtcDays(today, -1);
    const toDate = addUtcDays(today, 1);

    // Lấy lịch làm việc
    const schedules = await prisma.workSchedule.findMany({
      where: {
        date: {
          gte: fromDate,
          lt: toDate,
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

    if (schedules.length === 0) {
      return { createdCount, skipped: false };
    }

    const leaveCoverage = await buildLeaveCoverageMap(
      [...new Set(schedules.map((schedule) => schedule.employeeId))],
      fromDate,
      toDate,
    );

    // Lấy trước toàn bộ attendance record trong khoảng thời gian này để đối chiếu
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        date: {
          gte: fromDate,
          lt: toDate,
        },
      },
      include: {
        details: {
          select: {
            workShiftId: true,
          },
        },
      },
    });

    const recordMap = new Map<string, Set<string>>();
    for (const record of attendanceRecords) {
      const key = `${record.employeeId}_${record.date.getTime()}`;
      const shiftIds = new Set(record.details.map((d) => d.workShiftId));
      recordMap.set(key, shiftIds);
    }

    for (const schedule of schedules) {
      const key = `${schedule.employeeId}_${schedule.date.getTime()}`;
      const existingWorkShiftIds = recordMap.get(key) || new Set<string>();

      const expiredShiftLinks = schedule.shiftLinks.filter((shiftLink) => {
        // Nếu ca làm việc đã có điểm danh thì bỏ qua, không tính là expired
        if (existingWorkShiftIds.has(shiftLink.workShiftId)) {
          return false;
        }

        if (
          hasLeaveCoverage(
            leaveCoverage,
            schedule.employeeId,
            schedule.date,
            shiftLink.workShiftId,
          )
        ) {
          return false;
        }

        const shift = shiftLink.workShift;
        const attendanceDeadline = buildWindowDateTime(
          schedule.date,
          shift.checkInEndTime,
          shift.startTime,
        );

        return attendanceDeadline.getTime() <= attendanceClockNow.getTime();
      });

      if (expiredShiftLinks.length === 0) {
        continue;
      }

      await prisma.$transaction(async (tx) => {
        const attendanceRecord = await tx.attendanceRecord.upsert({
          where: {
            employeeId_date: {
              employeeId: schedule.employeeId,
              date: schedule.date,
            },
          },
          create: {
            employeeId: schedule.employeeId,
            date: schedule.date,
          },
          update: {},
        });

        for (const shiftLink of expiredShiftLinks) {
          const shift = shiftLink.workShift;
          const shiftStartAt = buildDateTimeOnDate(
            schedule.date,
            shift.startTime,
          );
          const shiftEndAt = getShiftEndDateTime(
            schedule.date,
            shift.startTime,
            shift.endTime,
            shift.isOvernight,
          );
          const shiftSnapshot = buildAttendanceDetailShiftSnapshot(
            shift,
            shiftStartAt,
            shiftEndAt,
          );

          const existingShiftIds = recordMap.get(key) ?? new Set<string>();

          await tx.attendanceRecordDetail.upsert({
            where: {
              attendanceRecordId_workShiftId: {
                attendanceRecordId: attendanceRecord.id,
                workShiftId: shiftLink.workShiftId,
              },
            },
            create: {
              attendanceRecordId: attendanceRecord.id,
              workShiftId: shiftLink.workShiftId,
              ...shiftSnapshot,
              checkInTime: null,
              checkOutTime: null,
              status: AttendanceStatus.ABSENT,
            },
            update: {},
          });

          if (!existingShiftIds.has(shiftLink.workShiftId)) {
            existingShiftIds.add(shiftLink.workShiftId);
            recordMap.set(key, existingShiftIds);
            createdCount += 1;
          }
        }
      });
    }

    return { createdCount, skipped: false };
  } finally {
    isAbsentSweepRunning = false;
  }
};

//Hàm này sẽ được gọi để tạo các bản ghi điểm danh với trạng thái vắng mặt cho tất cả các lịch làm việc trong một tháng cụ thể, giúp đảm bảo dữ liệu điểm danh đầy đủ và chính xác cho toàn bộ tháng đó. Nếu quá trình tạo bản ghi đang chạy, hàm sẽ trả về thông tin về việc bỏ qua và không thực hiện tạo bản ghi mới.
export const createAbsentDetailsForMonth = async (month: string) => {
  if (isAbsentSweepRunning) {
    return {
      month,
      createdCount: 0,
      existingCount: 0,
      leaveCoveredCount: 0,
      futureShiftCount: 0,
      scheduledShiftCount: 0,
      scheduleCount: 0,
      skipped: true,
    };
  }

  isAbsentSweepRunning = true;
  let createdCount = 0;
  let existingCount = 0;
  let leaveCoveredCount = 0;
  let futureShiftCount = 0;
  let scheduledShiftCount = 0;

  try {
    const { start: fromDate, end: toDate } = getMonthRange(month);
    const attendanceClockNow = toAttendanceClockTime(new Date());

    const schedules = await prisma.workSchedule.findMany({
      where: {
        date: {
          gte: fromDate,
          lt: toDate,
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

    if (schedules.length === 0) {
      return {
        month,
        createdCount,
        existingCount,
        leaveCoveredCount,
        futureShiftCount,
        scheduledShiftCount,
        scheduleCount: 0,
        skipped: false,
      };
    }

    const leaveCoverage = await buildLeaveCoverageMap(
      [...new Set(schedules.map((schedule) => schedule.employeeId))],
      fromDate,
      toDate,
    );

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        date: {
          gte: fromDate,
          lt: toDate,
        },
      },
      include: {
        details: {
          select: {
            workShiftId: true,
          },
        },
      },
    });

    const recordMap = new Map<string, Set<string>>();
    for (const record of attendanceRecords) {
      const key = `${record.employeeId}_${record.date.getTime()}`;
      const shiftIds = new Set(record.details.map((d) => d.workShiftId));
      recordMap.set(key, shiftIds);
    }

    for (const schedule of schedules) {
      const key = `${schedule.employeeId}_${schedule.date.getTime()}`;
      const existingWorkShiftIds = recordMap.get(key) || new Set<string>();
      scheduledShiftCount += schedule.shiftLinks.length;

      const expiredShiftLinks = schedule.shiftLinks.filter((shiftLink) => {
        if (existingWorkShiftIds.has(shiftLink.workShiftId)) {
          existingCount += 1;
          return false;
        }

        if (
          hasLeaveCoverage(
            leaveCoverage,
            schedule.employeeId,
            schedule.date,
            shiftLink.workShiftId,
          )
        ) {
          leaveCoveredCount += 1;
          return false;
        }

        const shift = shiftLink.workShift;
        const attendanceDeadline = buildWindowDateTime(
          schedule.date,
          shift.checkInEndTime,
          shift.startTime,
        );

        if (attendanceDeadline.getTime() > attendanceClockNow.getTime()) {
          futureShiftCount += 1;
          return false;
        }

        return true;
      });

      if (expiredShiftLinks.length === 0) {
        continue;
      }

      await prisma.$transaction(async (tx) => {
        const attendanceRecord = await tx.attendanceRecord.upsert({
          where: {
            employeeId_date: {
              employeeId: schedule.employeeId,
              date: schedule.date,
            },
          },
          create: {
            employeeId: schedule.employeeId,
            date: schedule.date,
          },
          update: {},
        });

        for (const shiftLink of expiredShiftLinks) {
          const shift = shiftLink.workShift;
          const shiftStartAt = buildDateTimeOnDate(
            schedule.date,
            shift.startTime,
          );
          const shiftEndAt = getShiftEndDateTime(
            schedule.date,
            shift.startTime,
            shift.endTime,
            shift.isOvernight,
          );
          const shiftSnapshot = buildAttendanceDetailShiftSnapshot(
            shift,
            shiftStartAt,
            shiftEndAt,
          );

          const existingShiftIds = recordMap.get(key) ?? new Set<string>();

          await tx.attendanceRecordDetail.upsert({
            where: {
              attendanceRecordId_workShiftId: {
                attendanceRecordId: attendanceRecord.id,
                workShiftId: shiftLink.workShiftId,
              },
            },
            create: {
              attendanceRecordId: attendanceRecord.id,
              workShiftId: shiftLink.workShiftId,
              ...shiftSnapshot,
              checkInTime: null,
              checkOutTime: null,
              status: AttendanceStatus.ABSENT,
            },
            update: {},
          });

          if (!existingShiftIds.has(shiftLink.workShiftId)) {
            existingShiftIds.add(shiftLink.workShiftId);
            recordMap.set(key, existingShiftIds);
            createdCount += 1;
          }
        }
      });
    }

    return {
      month,
      createdCount,
      existingCount,
      leaveCoveredCount,
      futureShiftCount,
      scheduledShiftCount,
      scheduleCount: schedules.length,
      skipped: false,
    };
  } finally {
    isAbsentSweepRunning = false;
  }
};

const handleHeartbeatMessage = async (deviceCode: string) => {
  await prisma.attendanceDevice.updateMany({
    where: { code: deviceCode, isActive: true },
    data: {
      isConnected: true,
      lastHeartbeatAt: new Date(),
    },
  });
};

const handlePunchMessage = async (deviceCode: string, message: Buffer) => {
  //Phân tích payload và validate dữ liệu cơ bản trước khi truy vấn database để tối ưu hiệu suất
  const payload = parseJson(message);
  if (!payload) {
    console.warn(`Invalid punch payload from ${deviceCode}`);
    return;
  }

  // Validate dữ liệu cơ bản
  const fingerId = Number(payload.fingerId);
  if (!Number.isInteger(fingerId)) {
    console.warn(`Invalid punch fingerId from ${deviceCode}`);
    return;
  }

  // Validate dữ liệu thời gian chấm công, nếu không hợp lệ thì log cảnh báo và bỏ qua
  const recordedAtValue =
    typeof payload.recordedAt === "string"
      ? new Date(payload.recordedAt)
      : new Date();
  if (Number.isNaN(recordedAtValue.getTime())) {
    console.warn(`Invalid recordedAt from ${deviceCode}`);
    return;
  }

  // Truy vấn database để tìm thiết bị và vân tay, sau đó xử lý logic chấm công
  const device = await prisma.attendanceDevice.findUnique({
    where: { code: deviceCode },
    include: {
      fingerprints: {
        where: {
          fingerId,
          isActive: true,
        },
        include: {
          employee: true,
        },
        take: 1,
      },
    },
  });

  if (!device || device.fingerprints.length === 0) {
    console.warn(
      `No active fingerprint found for device ${deviceCode} and fingerId ${fingerId}`,
    );
    return;
  }

  const fingerprint = device.fingerprints[0];

  const attendanceRecordedAt = toAttendanceClockTime(recordedAtValue);
  const attendanceDate = toUtcDateOnly(attendanceRecordedAt);
  const previousAttendanceDate = addUtcDays(attendanceDate, -1);
  const attendanceDateRange = getUtcDayRange(attendanceDate);
  const previousAttendanceDateRange = getUtcDayRange(previousAttendanceDate);
  let resolvedPunchType: ShowInfoCommandPayload["punchType"] = "UNKNOWN";
  let attendanceUpdated = false;
  let unmatchedReason = "no matching shift";

  await prisma.$transaction(async (tx) => {
    // Ghi lại log chấm công thô trước, sau đó mới cập nhật record tổng hợp để đảm bảo không bỏ sót dữ liệu nào dù có lỗi ở bước sau
    await tx.attendanceLog.create({
      data: {
        employeeId: fingerprint.employeeId,
        deviceId: device.id,
        fingerId,
        timestamp: recordedAtValue,
      },
    });

    // Tìm lịch làm việc của nhân viên trong ngày chấm công và ngày liền trước để xử lý ca qua đêm
    const workSchedules = await tx.workSchedule.findMany({
      where: {
        employeeId: fingerprint.employeeId,
        OR: [
          {
            date: {
              gte: previousAttendanceDateRange.start,
              lt: previousAttendanceDateRange.end,
            },
          },
          {
            date: {
              gte: attendanceDateRange.start,
              lt: attendanceDateRange.end,
            },
          },
        ],
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

    if (workSchedules.length === 0) {
      unmatchedReason = `no work schedule for ${attendanceDate.toISOString().slice(0, 10)}`;
      return;
    }

    // Tìm các bản ghi điểm danh đã tồn tại trong ngày chấm công và ngày liền trước để tránh tạo trùng lặp và để cập nhật trạng thái điểm danh chính xác
    const attendanceRecords = await tx.attendanceRecord.findMany({
      where: {
        employeeId: fingerprint.employeeId,
        OR: [
          {
            date: {
              gte: previousAttendanceDateRange.start,
              lt: previousAttendanceDateRange.end,
            },
          },
          {
            date: {
              gte: attendanceDateRange.start,
              lt: attendanceDateRange.end,
            },
          },
        ],
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
    });

    // Chuyển thời gian chấm công sang đơn vị phút để dễ so sánh với thời gian ca làm việc
    const punchMinutes =
      attendanceRecordedAt.getUTCHours() * 60 +
      attendanceRecordedAt.getUTCMinutes();
    const orderedShifts = workSchedules.flatMap((workSchedule) =>
      [...workSchedule.shiftLinks]
        .sort((left, right) => {
          const leftStart = parseClockToMinutes(left.workShift.startTime) ?? 0;
          const rightStart =
            parseClockToMinutes(right.workShift.startTime) ?? 0;
          return leftStart - rightStart;
        })
        .map((shiftLink) => ({
          scheduleDate: workSchedule.date,
          shiftLink: {
            workShiftId: shiftLink.workShiftId,
            workShift: shiftLink.workShift,
          },
        })),
    );

    const matchedCandidates = orderedShifts
      .flatMap((shiftLink) =>
        resolveShiftMatchCandidates(shiftLink, punchMinutes),
      )
      .sort((left, right) => {
        if (left.score !== right.score) {
          return left.score - right.score;
        }

        const leftPreference = getPunchSchedulePreference(left, attendanceDate);
        const rightPreference = getPunchSchedulePreference(
          right,
          attendanceDate,
        );

        if (leftPreference !== rightPreference) {
          return leftPreference - rightPreference;
        }

        const leftPunchTypePreference = getPunchTypePreference(left.punchType);
        const rightPunchTypePreference = getPunchTypePreference(
          right.punchType,
        );

        if (leftPunchTypePreference !== rightPunchTypePreference) {
          return leftPunchTypePreference - rightPunchTypePreference;
        }

        return left.window.shiftStartMinutes - right.window.shiftStartMinutes;
      });

    if (matchedCandidates.length === 0) {
      unmatchedReason = `punch time ${String(
        Math.floor(punchMinutes / 60),
      ).padStart(2, "0")}:${String(punchMinutes % 60).padStart(
        2,
        "0",
      )} is outside configured check-in/check-out windows`;
    }

    type AttendanceRecordState = {
      id: string;
      date: Date;
      detailsByShiftId: Map<
        string,
        {
          checkInTime: Date | null;
          checkOutTime: Date | null;
        }
      >;
    };

    const attendanceRecordStates = new Map<number, AttendanceRecordState>();

    for (const attendanceRecord of attendanceRecords) {
      attendanceRecordStates.set(attendanceRecord.date.getTime(), {
        id: attendanceRecord.id,
        date: attendanceRecord.date,
        detailsByShiftId: new Map(
          attendanceRecord.details.map((detail) => [
            detail.workShiftId,
            {
              checkInTime: detail.checkInTime,
              checkOutTime: detail.checkOutTime,
            },
          ]),
        ),
      });
    }

    // Hàm này sẽ đảm bảo rằng có một bản ghi điểm danh tồn tại cho ngày chấm công cụ thể, nếu chưa có thì sẽ tạo mới. Nó cũng lưu trữ trạng thái của bản ghi điểm danh trong một Map để tránh truy vấn lại cơ sở dữ liệu nhiều lần.
    const ensureAttendanceRecordState = async (scheduleDate: Date) => {
      const stateKey = scheduleDate.getTime();
      const existingState = attendanceRecordStates.get(stateKey);
      if (existingState) {
        return existingState;
      }

      const attendanceRecord = await tx.attendanceRecord.upsert({
        where: {
          employeeId_date: {
            employeeId: fingerprint.employeeId,
            date: scheduleDate,
          },
        },
        create: {
          employeeId: fingerprint.employeeId,
          date: scheduleDate,
        },
        update: {},
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
      });

      const createdState: AttendanceRecordState = {
        id: attendanceRecord.id,
        date: attendanceRecord.date,
        detailsByShiftId: new Map(
          attendanceRecord.details.map((detail) => [
            detail.workShiftId,
            {
              checkInTime: detail.checkInTime,
              checkOutTime: detail.checkOutTime,
            },
          ]),
        ),
      };

      attendanceRecordStates.set(stateKey, createdState);
      return createdState;
    };

    // Cập nhật bản ghi điểm danh dựa trên các ca làm việc phù hợp đã tìm thấy, nếu có. Nếu không có ca làm việc phù hợp, sẽ log cảnh báo và gửi thông báo đến thiết bị chấm công.
    for (const candidate of matchedCandidates) {
      const attendanceRecordDate = candidate.scheduleDate;
      const attendanceRecord =
        await ensureAttendanceRecordState(attendanceRecordDate);
      const currentDetail = attendanceRecord.detailsByShiftId.get(
        candidate.shiftLink.workShiftId,
      );

      const currentCheckInTime = currentDetail?.checkInTime ?? null;
      const currentCheckOutTime = currentDetail?.checkOutTime ?? null;

      let nextCheckInTime = currentCheckInTime;
      let nextCheckOutTime = currentCheckOutTime;

      if (candidate.punchType === "CHECK_IN") {
        nextCheckInTime =
          currentCheckInTime &&
          currentCheckInTime.getTime() < recordedAtValue.getTime()
            ? currentCheckInTime
            : recordedAtValue;
      } else {
        if (
          !currentCheckInTime ||
          recordedAtValue.getTime() < currentCheckInTime.getTime()
        ) {
          continue;
        }

        nextCheckOutTime =
          currentCheckOutTime &&
          currentCheckOutTime.getTime() > recordedAtValue.getTime()
            ? currentCheckOutTime
            : recordedAtValue;
      }

      const matchedShiftLink = candidate.shiftLink;
      const shiftStartAt = fromAttendanceClockTime(
        buildDateTimeOnDate(
          attendanceRecordDate,
          matchedShiftLink.workShift.startTime,
        ),
      );
      const shiftEndAt = fromAttendanceClockTime(
        getShiftEndDateTime(
          attendanceRecordDate,
          matchedShiftLink.workShift.startTime,
          matchedShiftLink.workShift.endTime,
          matchedShiftLink.workShift.isOvernight,
        ),
      );

      const status = resolveAttendanceStatus(
        {
          checkInTime: nextCheckInTime,
          checkOutTime: nextCheckOutTime,
        },
        shiftStartAt,
        shiftEndAt,
        matchedShiftLink.workShift.lateGracePeriod,
        matchedShiftLink.workShift.earlyLeaveGracePeriod,
      );

      const shiftSnapshot = buildAttendanceDetailShiftSnapshot(
        matchedShiftLink.workShift,
        shiftStartAt,
        shiftEndAt,
      );

      await tx.attendanceRecordDetail.upsert({
        where: {
          attendanceRecordId_workShiftId: {
            attendanceRecordId: attendanceRecord.id,
            workShiftId: matchedShiftLink.workShiftId,
          },
        },
        create: {
          attendanceRecordId: attendanceRecord.id,
          workShiftId: matchedShiftLink.workShiftId,
          ...shiftSnapshot,
          checkInTime: nextCheckInTime,
          checkOutTime: nextCheckOutTime,
          status,
        },
        update: {
          ...shiftSnapshot,
          checkInTime: nextCheckInTime,
          checkOutTime: nextCheckOutTime,
          status,
        },
      });

      // Cập nhật trạng thái trong Map để tránh truy vấn lại cơ sở dữ liệu nhiều lần
      attendanceRecord.detailsByShiftId.set(matchedShiftLink.workShiftId, {
        checkInTime: nextCheckInTime,
        checkOutTime: nextCheckOutTime,
      });
      if (!attendanceUpdated) {
        resolvedPunchType = candidate.punchType;
        attendanceUpdated = true;
      }
    }
  });

  if (!attendanceUpdated) {
    console.warn(
      `Attendance log recorded but timesheet not updated for employee ${fingerprint.employeeId}, device ${deviceCode}, fingerId ${fingerId}: ${unmatchedReason}`,
    );
  }

  const showInfoPayload = attendanceMqttService.normalizeShowInfoPayload({
    employeeId: fingerprint.employeeId,
    employeeCode: fingerprint.employee.employeeId,
    employeeName: fingerprint.employee.name,
    fingerId,
    recordedAt: attendanceRecordedAt.toISOString(),
    punchType: resolvedPunchType,
    message: attendanceUpdated
      ? "Attendance recorded"
      : `Punch logged, ${unmatchedReason}`,
  });

  try {
    await attendanceMqttService.publishCommand(device.code, showInfoPayload);
  } catch (error) {
    console.error(
      `Failed to publish attendance showinfo command for device ${deviceCode}:`,
      error,
    );
  }
};

const handleCommandResultMessage = async (
  deviceCode: string,
  message: Buffer,
) => {
  const payload = parseJson(message);
  if (!payload) {
    console.warn(`Invalid command result payload from ${deviceCode}`);
    return;
  }

  const commandId =
    typeof payload.commandId === "string" ? payload.commandId : null;
  if (!commandId) {
    console.warn(`Missing commandId in command result from ${deviceCode}`);
    return;
  }

  const command = await prisma.attendanceDeviceCommand.findFirst({
    where: {
      id: commandId,
      device: {
        code: deviceCode,
      },
    },
  });

  if (!command) {
    console.warn(`Command ${commandId} not found for device ${deviceCode}`);
    return;
  }

  const nextStatus =
    typeof payload.status === "string" ? payload.status : "success";
  const resultPayload = (
    payload.result && isObject(payload.result) ? payload.result : payload
  ) as JsonRecord;

  await prisma.attendanceDeviceCommand.update({
    where: { id: command.id },
    data: {
      status: nextStatus,
      result: resultPayload as Prisma.InputJsonValue,
    },
  });

  if (nextStatus.toLowerCase() !== "success") {
    return;
  }

  const commandPayload = command.payload as JsonRecord | null;
  if (!commandPayload) {
    return;
  }

  if (command.command === "delete_fingerprint") {
    const fingerprintId =
      typeof commandPayload.fingerprintId === "string"
        ? commandPayload.fingerprintId
        : null;
    const payloadFingerId = Number(
      payload.fingerId ?? resultPayload.fingerId ?? commandPayload.fingerId,
    );

    if (!fingerprintId || !Number.isInteger(payloadFingerId)) {
      console.warn(
        `Incomplete fingerprint deletion result payload for command ${commandId}`,
      );
      return;
    }

    await prisma.employeeFingerprint.updateMany({
      where: {
        id: fingerprintId,
        deviceId: command.deviceId,
        fingerId: payloadFingerId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
    return;
  }

  if (command.command !== "register_fingerprint") {
    return;
  }

  const employeeId =
    typeof commandPayload.employeeId === "string"
      ? commandPayload.employeeId
      : null;
  const fingerName =
    typeof commandPayload.fingerName === "string"
      ? commandPayload.fingerName
      : null;
  const fingerIdValue = Number(payload.fingerId ?? resultPayload.fingerId);

  if (!employeeId || !fingerName || !Number.isInteger(fingerIdValue)) {
    console.warn(
      `Incomplete fingerprint result payload for command ${commandId}`,
    );
    return;
  }

  await prisma.employeeFingerprint.upsert({
    where: {
      deviceId_fingerId: {
        deviceId: command.deviceId,
        fingerId: fingerIdValue,
      },
    },
    create: {
      employeeId,
      deviceId: command.deviceId,
      fingerId: fingerIdValue,
      fingerName,
      isActive: true,
    },
    update: {
      employeeId,
      fingerName,
      isActive: true,
    },
  });
};

export const attendanceMqttService = {
  async initialize() {
    const client = await ensureConnectedClient();
    if (!client) {
      console.warn("MQTT_URL is not configured; attendance MQTT is disabled.");
    }

    return true;
  },

  async publishCommand(deviceCode: string, command: DeviceCommandMessage) {
    const client = await ensureConnectedClient();
    if (!client) {
      throw new Error("MQTT_URL is not configured");
    }

    return new Promise<void>((resolve, reject) => {
      client.publish(
        buildTopic(deviceCode, "commands"),
        JSON.stringify(command),
        { qos: 1 },
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );
    });
  },

  async shutdown() {
    if (offlineSweepTimer) {
      clearInterval(offlineSweepTimer);
      offlineSweepTimer = null;
    }

    if (mqttClient) {
      mqttClient.end(true);
      mqttClient = null;
    }
  },

  buildTopic,
  normalizeRegisterFingerprintPayload(
    payload: RegisterFingerprintCommandPayload,
  ) {
    return {
      commandId: payload.commandId,
      command: "register_fingerprint",
      payload: {
        employeeId: payload.employeeId,
        fingerName: payload.fingerName,
      },
    } satisfies DeviceCommandMessage;
  },
  normalizeDeleteFingerprintPayload(payload: DeleteFingerprintCommandPayload) {
    return {
      commandId: payload.commandId,
      command: "delete_fingerprint",
      payload: {
        fingerId: payload.fingerId,
      },
    } satisfies DeviceCommandMessage;
  },
  normalizeShowInfoPayload(payload: ShowInfoCommandPayload) {
    return {
      commandId: `showinfo-${Date.now()}`,
      command: "showinfo",
      payload: {
        employeeId: payload.employeeId,
        employeeCode: payload.employeeCode,
        employeeName: payload.employeeName,
        fingerId: payload.fingerId,
        recordedAt: payload.recordedAt,
        punchType: payload.punchType,
        message: payload.message,
      },
    } satisfies DeviceCommandMessage;
  },
  async findDeviceByCode(deviceCode: string) {
    return resolveDeviceByCode(deviceCode);
  },
};
