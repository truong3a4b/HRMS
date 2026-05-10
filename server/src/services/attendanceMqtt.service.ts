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

const topicPrefix = env.ATTENDANCE_TOPIC_PREFIX.replace(/\/+$/, "");
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
    await tx.attendanceLog.create({
      data: {
        employeeId: fingerprint.employeeId,
        deviceId: device.id,
        fingerId,
        timestamp: recordedAtValue,
      },
    });

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

    const punchMinutes =
      recordedAtValue.getUTCHours() * 60 + recordedAtValue.getUTCMinutes();
    const orderedShifts = [...workSchedule.shiftLinks].sort((left, right) => {
      const leftStart = parseClockToMinutes(left.workShift.startTime) ?? 0;
      const rightStart = parseClockToMinutes(right.workShift.startTime) ?? 0;
      return leftStart - rightStart;
    });

    const matchedShiftLink =
      orderedShifts.find((shiftLink) => {
        const shiftStart = parseClockToMinutes(shiftLink.workShift.startTime);
        const shiftEnd = parseClockToMinutes(shiftLink.workShift.endTime);
        if (shiftStart === null || shiftEnd === null) {
          return false;
        }

        const lowerBound = shiftStart - 90;
        const upperBound = shiftEnd + 120;
        return punchMinutes >= lowerBound && punchMinutes <= upperBound;
      }) ?? orderedShifts[0];

    const shiftStartAt = buildDateTimeOnDate(
      attendanceDate,
      matchedShiftLink.workShift.startTime,
    );
    const shiftEndAt = buildDateTimeOnDate(
      attendanceDate,
      matchedShiftLink.workShift.endTime,
    );
    const existingDetail = attendanceRecord.details.find(
      (detail) => detail.workShiftId === matchedShiftLink.workShiftId,
    );

    const nextCheckInTime = existingDetail?.checkInTime ?? recordedAtValue;
    const nextCheckOutTime =
      existingDetail?.checkInTime && !existingDetail.checkOutTime
        ? recordedAtValue
        : (existingDetail?.checkOutTime ?? null);

    const isCheckOutPunch = Boolean(
      existingDetail?.checkInTime && !existingDetail.checkOutTime,
    );
    const status = isCheckOutPunch
      ? recordedAtValue.getTime() <
        shiftEndAt.getTime() -
          (matchedShiftLink.workShift.earlyLeaveGracePeriod ?? 0) * 60_000
        ? AttendanceStatus.EARLY_LEAVE
        : AttendanceStatus.PRESENT
      : recordedAtValue.getTime() >
          shiftStartAt.getTime() +
            (matchedShiftLink.workShift.lateGracePeriod ?? 0) * 60_000
        ? AttendanceStatus.LATE
        : AttendanceStatus.PRESENT;

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
        checkInTime: recordedAtValue,
        checkOutTime: null,
        status,
      },
      update: {
        workShiftName: matchedShiftLink.workShift.name,
        shiftStartTime: shiftStartAt,
        shiftEndTime: shiftEndAt,
        shiftLateGracePeriod: matchedShiftLink.workShift.lateGracePeriod,
        shiftEarlyLeaveGracePeriod:
          matchedShiftLink.workShift.earlyLeaveGracePeriod,
        checkInTime: nextCheckInTime,
        checkOutTime: nextCheckOutTime,
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
  async findDeviceByCode(deviceCode: string) {
    return resolveDeviceByCode(deviceCode);
  },
};
