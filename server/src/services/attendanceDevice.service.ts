import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { AttendanceDevice } from "../../generated/prisma/client";
import {
  CreateAttendanceDeviceInput,
  UpdateAttendanceDeviceInput,
  DeviceListFilters,
  AttendanceDeviceSummary,
  AttendanceDeviceDetail,
  PaginatedDeviceResponse,
  AttendanceDeviceCommandSummary,
} from "../types/attendance-device.types";
import { attendanceMqttService } from "./attendanceMqtt.service";

const ATTENDANCE_DEVICE_ERROR_CODES = {
  NOT_FOUND: "ATTENDANCE_DEVICE_NOT_FOUND",
  CODE_CONFLICT: "ATTENDANCE_DEVICE_CODE_CONFLICT",
  EMPLOYEE_NOT_FOUND: "EMPLOYEE_NOT_FOUND",
  FINGERPRINT_NOT_FOUND: "FINGERPRINT_NOT_FOUND",
  INVALID_OPERATION: "INVALID_OPERATION",
} as const;

const buildRandomDeviceCode = () => {
  const randomSuffix = Math.floor(Math.random() * 900000 + 100000);
  return `DEV-${randomSuffix}`;
};

const isDeviceCodeConflictError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  // Prisma error code for unique constraint violation
  return error.message.includes("Unique constraint failed");
};

interface FingerprintWithCreatedAt {
  id: string;
  createdAt: Date;
}

interface CommandWithTimestamps {
  id: string;
  command: string;
  status: string;
  payload: unknown;
  result: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const mapCommandToSummary = (
  command: CommandWithTimestamps,
): AttendanceDeviceCommandSummary => ({
  id: command.id,
  command: command.command,
  status: command.status,
  payload: (command.payload as Record<string, unknown> | null) ?? null,
  result: (command.result as Record<string, unknown> | null) ?? null,
  createdAt: command.createdAt,
  updatedAt: command.updatedAt,
});

const mapDeviceToSummary = (
  device: AttendanceDevice & {
    _count?: { fingerprints: number };
    fingerprints?: FingerprintWithCreatedAt[];
  },
): AttendanceDeviceSummary => {
  const fingerprintCount =
    device._count?.fingerprints ?? device.fingerprints?.length ?? 0;

  // Get the most recent log to determine last active time
  const lastActiveAt =
    device.fingerprints && device.fingerprints.length > 0
      ? Math.max(
          ...device.fingerprints.map((fp) => new Date(fp.createdAt).getTime()),
        )
      : null;

  return {
    id: device.id,
    name: device.name,
    code: device.code,
    location: device.location,
    isActive: device.isActive,
    isConnected: device.isConnected,
    lastHeartbeatAt: device.lastHeartbeatAt,
    fingerprintCount,
    lastActiveAt: lastActiveAt ? new Date(lastActiveAt) : null,
    createdAt: device.createdAt,
  };
};

export const attendanceDeviceService = {
  async getAllDevices(
    filters: DeviceListFilters,
  ): Promise<PaginatedDeviceResponse> {
    const { page = 1, limit = 10, isActive, search } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.attendanceDevice.count({ where });

    // Get devices with fingerprint counts
    const devices = await prisma.attendanceDevice.findMany({
      where,
      skip,
      take: limit,
      include: {
        fingerprints: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        commands: {
          select: {
            id: true,
            command: true,
            status: true,
            payload: true,
            result: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const deviceSummaries = devices.map(mapDeviceToSummary);

    return {
      devices: deviceSummaries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getDeviceById(id: string): Promise<AttendanceDeviceDetail> {
    const device = await prisma.attendanceDevice.findUnique({
      where: { id },
      include: {
        fingerprints: {
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        logs: {
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
          take: 50, // Limit recent logs
        },
        commands: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
      },
    });

    if (!device) {
      throw new ApiError(
        404,
        "Attendance device not found",
        ATTENDANCE_DEVICE_ERROR_CODES.NOT_FOUND,
      );
    }

    // Get fingerprint count separately if needed for count-only
    const fingerprintCount = await prisma.employeeFingerprint.count({
      where: { deviceId: id },
    });

    const recentLogs = device.logs.map((log) => ({
      id: log.id,
      employeeId: log.employeeId,
      fingerId: log.fingerId,
      timestamp: log.timestamp,
      employee: log.employee,
    }));

    const fingerprints = device.fingerprints.map((fp) => ({
      id: fp.id,
      fingerId: fp.fingerId,
      fingerName: fp.fingerName,
      isActive: fp.isActive,
      employee: fp.employee,
      createdAt: fp.createdAt,
    }));

    const commands = device.commands.map(mapCommandToSummary);

    return {
      id: device.id,
      name: device.name,
      code: device.code,
      location: device.location,
      isActive: device.isActive,
      isConnected: device.isConnected,
      lastHeartbeatAt: device.lastHeartbeatAt,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
      fingerprintCount,
      logs: recentLogs,
      commands,
      fingerprints,
      createdBy: null, // TODO: Add createdBy relationship if needed
    };
  },

  async createDevice(
    data: CreateAttendanceDeviceInput,
  ): Promise<AttendanceDeviceDetail> {
    // Check for code uniqueness
    const existingDevice = await prisma.attendanceDevice.findFirst({
      where: { code: data.code },
    });

    if (existingDevice) {
      throw new ApiError(
        409,
        "Attendance device with this code already exists",
        ATTENDANCE_DEVICE_ERROR_CODES.CODE_CONFLICT,
      );
    }

    const device = await prisma.attendanceDevice.create({
      data: {
        name: data.name,
        code: data.code,
        location: data.location ?? null,
        isActive: data.isActive ?? true,
      },
      include: {
        fingerprints: {
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
              },
            },
          },
        },
        logs: {
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
          take: 50,
        },
        commands: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
      },
    });

    const fingerprintCount = device.fingerprints.length;

    const recentLogs = device.logs.map((log) => ({
      id: log.id,
      employeeId: log.employeeId,
      fingerId: log.fingerId,
      timestamp: log.timestamp,
      employee: log.employee,
    }));

    const fingerprints = device.fingerprints.map((fp) => ({
      id: fp.id,
      fingerId: fp.fingerId,
      fingerName: fp.fingerName,
      isActive: fp.isActive,
      employee: fp.employee,
      createdAt: fp.createdAt,
    }));

    const commands = device.commands.map(mapCommandToSummary);

    return {
      id: device.id,
      name: device.name,
      code: device.code,
      location: device.location,
      isActive: device.isActive,
      isConnected: device.isConnected,
      lastHeartbeatAt: device.lastHeartbeatAt,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
      fingerprintCount,
      logs: recentLogs,
      commands,
      fingerprints,
      createdBy: null,
    };
  },

  async updateDevice(
    id: string,
    data: UpdateAttendanceDeviceInput,
  ): Promise<AttendanceDeviceDetail> {
    // Check if device exists
    const existingDevice = await prisma.attendanceDevice.findUnique({
      where: { id },
    });

    if (!existingDevice) {
      throw new ApiError(
        404,
        "Attendance device not found",
        ATTENDANCE_DEVICE_ERROR_CODES.NOT_FOUND,
      );
    }

    // If code is being updated, check for uniqueness
    if (data.code && data.code !== existingDevice.code) {
      const codeConflict = await prisma.attendanceDevice.findFirst({
        where: { id: { not: id }, code: data.code },
      });

      if (codeConflict) {
        throw new ApiError(
          409,
          "Attendance device with this code already exists",
          ATTENDANCE_DEVICE_ERROR_CODES.CODE_CONFLICT,
        );
      }
    }

    const updatedDevice = await prisma.attendanceDevice.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.code !== undefined ? { code: data.code } : {}),
        ...(data.location !== undefined ? { location: data.location } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
      include: {
        fingerprints: {
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
              },
            },
          },
        },
        logs: {
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
          take: 50,
        },
        commands: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
      },
    });

    const fingerprintCount = await prisma.employeeFingerprint.count({
      where: { deviceId: id },
    });

    const recentLogs = updatedDevice.logs.map((log) => ({
      id: log.id,
      employeeId: log.employeeId,
      fingerId: log.fingerId,
      timestamp: log.timestamp,
      employee: log.employee,
    }));

    const fingerprints = updatedDevice.fingerprints.map((fp) => ({
      id: fp.id,
      fingerId: fp.fingerId,
      fingerName: fp.fingerName,
      isActive: fp.isActive,
      employee: fp.employee,
      createdAt: fp.createdAt,
    }));

    const commands = updatedDevice.commands.map(mapCommandToSummary);

    return {
      id: updatedDevice.id,
      name: updatedDevice.name,
      code: updatedDevice.code,
      location: updatedDevice.location,
      isActive: updatedDevice.isActive,
      isConnected: updatedDevice.isConnected,
      lastHeartbeatAt: updatedDevice.lastHeartbeatAt,
      createdAt: updatedDevice.createdAt,
      updatedAt: updatedDevice.updatedAt,
      fingerprintCount,
      logs: recentLogs,
      commands,
      fingerprints,
      createdBy: null,
    };
  },

  async deleteDevice(id: string): Promise<{ id: string; name: string }> {
    const device = await prisma.attendanceDevice.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!device) {
      throw new ApiError(
        404,
        "Attendance device not found",
        ATTENDANCE_DEVICE_ERROR_CODES.NOT_FOUND,
      );
    }

    // Check if device has any fingerprints
    const fingerprintCount = await prisma.employeeFingerprint.count({
      where: { deviceId: id },
    });

    if (fingerprintCount > 0) {
      throw new ApiError(
        400,
        "Cannot delete device with associated fingerprints. Please remove fingerprints first.",
        ATTENDANCE_DEVICE_ERROR_CODES.INVALID_OPERATION,
      );
    }

    await prisma.attendanceDevice.delete({
      where: { id },
    });

    return { id: device.id, name: device.name };
  },

  async addFingerprint(
    deviceId: string,
    employeeId: string,
    fingerName: string,
  ): Promise<{
    id: string;
    deviceId: string;
    command: string;
    status: string;
  }> {
    const device = await prisma.attendanceDevice.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new ApiError(
        404,
        "Attendance device not found",
        ATTENDANCE_DEVICE_ERROR_CODES.NOT_FOUND,
      );
    }

    if (!device.isActive) {
      throw new ApiError(
        400,
        "Cannot create command for inactive device",
        ATTENDANCE_DEVICE_ERROR_CODES.INVALID_OPERATION,
      );
    }

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId },
      select: {
        id: true,
        employeeId: true,
      },
    });

    if (!employee) {
      throw new ApiError(
        404,
        "Employee not found",
        ATTENDANCE_DEVICE_ERROR_CODES.EMPLOYEE_NOT_FOUND,
      );
    }

    const command = await prisma.attendanceDeviceCommand.create({
      data: {
        deviceId,
        command: "register_fingerprint",
        status: "pending",
        payload: {
          employeeId: employee.id,
          fingerName,
        },
      },
    });

    const commandPayload =
      attendanceMqttService.normalizeRegisterFingerprintPayload({
        commandId: command.id,
        employeeId: employee.id,
        fingerName,
      });

    try {
      await attendanceMqttService.publishCommand(device.code, commandPayload);
      await prisma.attendanceDeviceCommand.update({
        where: { id: command.id },
        data: { status: "sent" },
      });
    } catch (error) {
      await prisma.attendanceDeviceCommand.update({
        where: { id: command.id },
        data: {
          status: "failed",
          result: {
            error:
              error instanceof Error
                ? error.message
                : "Failed to publish MQTT command",
          },
        },
      });

      throw new ApiError(
        503,
        "Failed to publish fingerprint registration command",
        ATTENDANCE_DEVICE_ERROR_CODES.INVALID_OPERATION,
      );
    }

    return {
      id: command.id,
      deviceId: command.deviceId,
      command: command.command,
      status: "sent",
    };
  },

  async removeFingerprint(fingerprintId: string): Promise<{ id: string }> {
    const fingerprint = await prisma.employeeFingerprint.findUnique({
      where: { id: fingerprintId },
    });

    if (!fingerprint) {
      throw new ApiError(
        404,
        "Fingerprint not found",
        ATTENDANCE_DEVICE_ERROR_CODES.FINGERPRINT_NOT_FOUND,
      );
    }

    await prisma.employeeFingerprint.delete({
      where: { id: fingerprintId },
    });

    return { id: fingerprintId };
  },

  async getDeviceFingerprints(deviceId: string) {
    const device = await prisma.attendanceDevice.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new ApiError(
        404,
        "Attendance device not found",
        ATTENDANCE_DEVICE_ERROR_CODES.NOT_FOUND,
      );
    }

    const fingerprints = await prisma.employeeFingerprint.findMany({
      where: { deviceId },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return fingerprints.map((fp) => ({
      id: fp.id,
      fingerId: fp.fingerId,
      fingerName: fp.fingerName,
      isActive: fp.isActive,
      employee: fp.employee,
      createdAt: fp.createdAt,
    }));
  },
};
