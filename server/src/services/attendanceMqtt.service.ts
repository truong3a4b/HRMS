import mqtt, { MqttClient } from "mqtt";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { AttendanceStatus, Prisma } from "../../generated/prisma/client";

type JsonRecord = Record<string, unknown>;

type RegisterFingerprintCommandPayload = {
  commandId: string;
  employeeId: string;
  fingerName: string;
};

type DeviceCommandMessage = {
  commandId: string;
  command: string;
  payload?: JsonRecord | null;
};

type DeviceCommandResultMessage = {
  commandId?: string;
  status?: string;
  result?: JsonRecord | null;
  fingerId?: number;
  employeeId?: string;
  fingerName?: string;
};

type PunchMessage = {
  fingerId: number;
  recordedAt?: string;
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
  shiftLink: {
    workShiftId: string;
    workShift: {
      name: string;
      startTime: string;
      endTime: string;
      lateGracePeriod: number | null;
      earlyLeaveGracePeriod: number | null;
      checkInStartTime: string | null;
      checkInEndTime: string | null;
      checkOutStartTime: string | null;
      checkOutEndTime: string | null;
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

const DEFAULT_CHECK_IN_FLEXIBILITY_MINUTES = 90;
const DEFAULT_CHECK_OUT_FLEXIBILITY_MINUTES = 120;
const MINUTES_PER_DAY = 24 * 60;

const topicPrefix = env.ATTENDANCE_TOPIC_PREFIX.replace(/\/+$/, "");
const heartbeatTimeoutMs = env.ATTENDANCE_HEARTBEAT_TIMEOUT_SECONDS * 1000;
const offlineSweepIntervalMs = Math.min(
  Math.max(heartbeatTimeoutMs / 2, 30_000),
  60_000,
);
const absentSweepIntervalMs = 60_000;
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
let absentSweepTimer: NodeJS.Timeout | null = null;
let isAbsentSweepRunning = false;

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

const normalizeClockMinutes = (minutes: number) =>
  ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

const toUtcDateOnly = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

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

const getShiftEndDateTime = (
  date: Date,
  startTime: string,
  endTime: string,
) => {
  const shiftStartAt = buildDateTimeOnDate(date, startTime);
  let shiftEndAt = buildDateTimeOnDate(date, endTime);

  if (shiftEndAt.getTime() <= shiftStartAt.getTime()) {
    shiftEndAt = addUtcDays(shiftEndAt, 1);
  }

  return shiftEndAt;
};

const buildWindowDateTime = (date: Date, time: string, shiftStartTime: string) => {
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

const getClockDistance = (left: number, right: number) => {
  const rawDistance = Math.abs(left - right);
  return Math.min(rawDistance, MINUTES_PER_DAY - rawDistance);
};

const resolveShiftMatchWindow = (workShift: {
  startTime: string;
  endTime: string;
  checkInStartTime: string | null;
  checkInEndTime: string | null;
  checkOutStartTime: string | null;
  checkOutEndTime: string | null;
}): ShiftMatchWindow | null => {
  const shiftStartMinutes = parseClockToMinutes(workShift.startTime);
  const shiftEndMinutes = parseClockToMinutes(workShift.endTime);

  if (shiftStartMinutes === null || shiftEndMinutes === null) {
    return null;
  }

  const checkInStartMinutes = workShift.checkInStartTime
    ? parseClockToMinutes(workShift.checkInStartTime)
    : null;
  const checkInEndMinutes = workShift.checkInEndTime
    ? parseClockToMinutes(workShift.checkInEndTime)
    : null;
  const checkOutStartMinutes = workShift.checkOutStartTime
    ? parseClockToMinutes(workShift.checkOutStartTime)
    : null;
  const checkOutEndMinutes = workShift.checkOutEndTime
    ? parseClockToMinutes(workShift.checkOutEndTime)
    : null;

  return {
    shiftStartMinutes,
    shiftEndMinutes,
    checkInStartMinutes:
      checkInStartMinutes ??
      normalizeClockMinutes(
        shiftStartMinutes - DEFAULT_CHECK_IN_FLEXIBILITY_MINUTES,
      ),
    checkInEndMinutes:
      checkInEndMinutes ??
      normalizeClockMinutes(
        shiftStartMinutes + DEFAULT_CHECK_IN_FLEXIBILITY_MINUTES,
      ),
    checkOutStartMinutes:
      checkOutStartMinutes ??
      normalizeClockMinutes(
        shiftEndMinutes - DEFAULT_CHECK_OUT_FLEXIBILITY_MINUTES,
      ),
    checkOutEndMinutes:
      checkOutEndMinutes ??
      normalizeClockMinutes(
        shiftEndMinutes + DEFAULT_CHECK_OUT_FLEXIBILITY_MINUTES,
      ),
  };
};

const resolveShiftMatchCandidates = (
  shiftLink: ShiftMatchCandidate["shiftLink"],
  punchMinutes: number,
): ShiftMatchCandidate[] => {
  const window = resolveShiftMatchWindow(shiftLink.workShift);

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
      shiftLink,
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
      shiftLink,
      window,
      punchType: "CHECK_OUT",
      score: getClockDistance(punchMinutes, window.shiftEndMinutes),
    });
  }

  return candidates;
};

const resolveAttendanceStatus = (
  detail: AttendanceDetailSnapshot,
  shiftStartAt: Date,
  shiftEndAt: Date,
  lateGracePeriod: number | null,
  earlyLeaveGracePeriod: number | null,
) => {
  if (!detail.checkInTime && !detail.checkOutTime) {
    return AttendanceStatus.ABSENT;
  }

  const isLate = detail.checkInTime
    ? detail.checkInTime.getTime() >
      shiftStartAt.getTime() + (lateGracePeriod ?? 0) * 60_000
    : false;
  const isEarlyLeave = detail.checkOutTime
    ? detail.checkOutTime.getTime() <
      shiftEndAt.getTime() - (earlyLeaveGracePeriod ?? 0) * 60_000
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
const createAbsentDetailsForExpiredSchedules = async () => {
  const now = new Date();
  const today = toUtcDateOnly(now);
  const fromDate = addUtcDays(today, -1);
  const toDate = addUtcDays(today, 1);

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

  for (const schedule of schedules) {
    const expiredShiftLinks = schedule.shiftLinks.filter((shiftLink) => {
      const shift = shiftLink.workShift;
      const shiftEndAt = getShiftEndDateTime(
        schedule.date,
        shift.startTime,
        shift.endTime,
      );
      const attendanceDeadline = shift.checkOutEndTime
        ? buildWindowDateTime(schedule.date, shift.checkOutEndTime, shift.startTime)
        : new Date(
            shiftEndAt.getTime() +
              DEFAULT_CHECK_OUT_FLEXIBILITY_MINUTES * 60_000,
          );

      return attendanceDeadline.getTime() <= now.getTime();
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
        include: {
          details: {
            select: {
              workShiftId: true,
            },
          },
        },
      });
      const existingWorkShiftIds = new Set(
        attendanceRecord.details.map((detail) => detail.workShiftId),
      );

      for (const shiftLink of expiredShiftLinks) {
        if (existingWorkShiftIds.has(shiftLink.workShiftId)) {
          continue;
        }

        const shift = shiftLink.workShift;
        const shiftStartAt = buildDateTimeOnDate(
          schedule.date,
          shift.startTime,
        );
        const shiftEndAt = getShiftEndDateTime(
          schedule.date,
          shift.startTime,
          shift.endTime,
        );

        await tx.attendanceRecordDetail.create({
          data: {
            attendanceRecordId: attendanceRecord.id,
            workShiftId: shiftLink.workShiftId,
            workShiftName: shift.name,
            shiftStartTime: shiftStartAt,
            shiftEndTime: shiftEndAt,
            shiftLateGracePeriod: shift.lateGracePeriod,
            shiftEarlyLeaveGracePeriod: shift.earlyLeaveGracePeriod,
            checkInTime: null,
            checkOutTime: null,
            status: AttendanceStatus.ABSENT,
          },
        });
      }
    });
  }
};

const startAbsentSweep = () => {
  if (absentSweepTimer) {
    return;
  }

  const runSweep = async () => {
    if (isAbsentSweepRunning) {
      return;
    }

    isAbsentSweepRunning = true;
    try {
      await createAbsentDetailsForExpiredSchedules();
    } catch (error) {
      console.error("Failed to create absent attendance records:", error);
    } finally {
      isAbsentSweepRunning = false;
    }
  };

  void runSweep();
  absentSweepTimer = setInterval(() => {
    void runSweep();
  }, absentSweepIntervalMs);
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

  const fingerId = Number(payload.fingerId);
  if (!Number.isInteger(fingerId)) {
    console.warn(`Invalid punch fingerId from ${deviceCode}`);
    return;
  }

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
  const attendanceDate = toUtcDateOnly(recordedAtValue);

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

    // Sử dụng upsert để tạo hoặc cập nhật attendance record và detail
    const attendanceRecord = await tx.attendanceRecord.upsert({
      where: {
        employeeId_date: {
          employeeId: fingerprint.employeeId,
          date: attendanceDate,
        },
      },
      create: {
        employeeId: fingerprint.employeeId,
        date: attendanceDate,
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

    // Tìm lịch làm việc của nhân viên trong ngày và so khớp với thời gian chấm công để xác định ca làm việc và trạng thái điểm danh
    const workSchedule = await tx.workSchedule.findUnique({
      where: {
        employeeId_date: {
          employeeId: fingerprint.employeeId,
          date: attendanceDate,
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
      return;
    }

    // Chuyển thời gian chấm công sang đơn vị phút để dễ so sánh với thời gian ca làm việc
    const punchMinutes =
      recordedAtValue.getUTCHours() * 60 + recordedAtValue.getUTCMinutes();
    const orderedShifts = [...workSchedule.shiftLinks].sort((left, right) => {
      const leftStart = parseClockToMinutes(left.workShift.startTime) ?? 0;
      const rightStart = parseClockToMinutes(right.workShift.startTime) ?? 0;
      return leftStart - rightStart;
    });

    const matchedCandidates = orderedShifts
      .flatMap((shiftLink) =>
        resolveShiftMatchCandidates(shiftLink, punchMinutes),
      )
      .sort((left, right) => {
        if (left.score !== right.score) {
          return left.score - right.score;
        }

        return left.window.shiftStartMinutes - right.window.shiftStartMinutes;
      });

    // Tìm ca làm việc phù hợp nhất với thời gian chấm công, cho phép linh hoạt trước và sau giờ làm để xử lý trường hợp quên chấm hoặc chấm nhầm ca
    const resolvedPunch = matchedCandidates
      .map((candidate) => {
        const existingDetail = attendanceRecord.details.find(
          (detail) => detail.workShiftId === candidate.shiftLink.workShiftId,
        );
        const currentCheckInTime = existingDetail?.checkInTime ?? null;
        const currentCheckOutTime = existingDetail?.checkOutTime ?? null;

        if (candidate.punchType === "CHECK_IN") {
          return {
            candidate,
            nextCheckInTime:
              currentCheckInTime &&
              currentCheckInTime.getTime() < recordedAtValue.getTime()
                ? currentCheckInTime
                : recordedAtValue,
            nextCheckOutTime: currentCheckOutTime,
          };
        }

        if (
          !currentCheckInTime ||
          recordedAtValue.getTime() <= currentCheckInTime.getTime()
        ) {
          return null;
        }

        return {
          candidate,
          nextCheckInTime: currentCheckInTime,
          nextCheckOutTime:
            currentCheckOutTime &&
            currentCheckOutTime.getTime() > recordedAtValue.getTime()
              ? currentCheckOutTime
              : recordedAtValue,
        };
      })
      .find((value): value is NonNullable<typeof value> => value !== null);

    if (!resolvedPunch) {
      return;
    }

    const matchedShiftLink = resolvedPunch.candidate.shiftLink;

    const shiftStartAt = buildDateTimeOnDate(
      attendanceDate,
      matchedShiftLink.workShift.startTime,
    );
    const shiftEndAt = getShiftEndDateTime(
      attendanceDate,
      matchedShiftLink.workShift.startTime,
      matchedShiftLink.workShift.endTime,
    );
    // Nếu đã có chi tiết điểm danh cho ca này rồi thì sẽ cập nhật lại thời gian check-in/check-out và trạng thái, nếu chưa có thì tạo mới. Logic check-in/check-out dựa trên việc đã có thời gian check-in hay chưa, và so sánh với giờ vào/ra của ca để xác định trạng thái đi trễ, về sớm hay đúng giờ
    const status = resolveAttendanceStatus(
      {
        checkInTime: resolvedPunch.nextCheckInTime,
        checkOutTime: resolvedPunch.nextCheckOutTime,
      },
      shiftStartAt,
      shiftEndAt,
      matchedShiftLink.workShift.lateGracePeriod,
      matchedShiftLink.workShift.earlyLeaveGracePeriod,
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
        workShiftName: matchedShiftLink.workShift.name,
        shiftStartTime: shiftStartAt,
        shiftEndTime: shiftEndAt,
        shiftLateGracePeriod: matchedShiftLink.workShift.lateGracePeriod,
        shiftEarlyLeaveGracePeriod:
          matchedShiftLink.workShift.earlyLeaveGracePeriod,
        checkInTime: resolvedPunch.nextCheckInTime,
        checkOutTime: resolvedPunch.nextCheckOutTime,
        status,
      },
      update: {
        workShiftName: matchedShiftLink.workShift.name,
        shiftStartTime: shiftStartAt,
        shiftEndTime: shiftEndAt,
        shiftLateGracePeriod: matchedShiftLink.workShift.lateGracePeriod,
        shiftEarlyLeaveGracePeriod:
          matchedShiftLink.workShift.earlyLeaveGracePeriod,
        checkInTime: resolvedPunch.nextCheckInTime,
        checkOutTime: resolvedPunch.nextCheckOutTime,
        status,
      },
    });
  });
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

  if (
    command.command !== "register_fingerprint" ||
    nextStatus.toLowerCase() !== "success"
  ) {
    return;
  }

  const commandPayload = command.payload as JsonRecord | null;
  if (!commandPayload) {
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
    startAbsentSweep();
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

    if (absentSweepTimer) {
      clearInterval(absentSweepTimer);
      absentSweepTimer = null;
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
  async findDeviceByCode(deviceCode: string) {
    return resolveDeviceByCode(deviceCode);
  },
};
