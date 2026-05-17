import { z } from "zod";

// Zod Validation Schemas

export const createAttendanceDeviceSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(100),
  location: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateAttendanceDeviceSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    code: z.string().min(1).max(100).optional(),
    location: z.string().max(500).optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const deviceListQuerySchema = z.object({
  page: z.preprocess(
    (val) => (val === undefined ? 1 : Number(val)),
    z.number().int().positive(),
  ),
  limit: z.preprocess(
    (val) => (val === undefined ? 10 : Number(val)),
    z.number().int().positive().max(100),
  ),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

// Response Types

export interface AttendanceDeviceResponse {
  id: string;
  name: string;
  code: string;
  location: string | null;
  isActive: boolean;
  isConnected: boolean;
  lastHeartbeatAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  fingerprintCount: number;
  logs: AttendanceLogSummary[];
  commands: AttendanceDeviceCommandSummary[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AttendanceDeviceSummary {
  id: string;
  name: string;
  code: string;
  location: string | null;
  isActive: boolean;
  isConnected: boolean;
  lastHeartbeatAt: Date | null;
  fingerprintCount: number;
  lastActiveAt: Date | null;
  createdAt: Date;
}

export interface AttendanceDeviceDetail extends AttendanceDeviceResponse {
  fingerprints: Array<{
    id: string;
    fingerId: number;
    fingerName: string | null;
    isActive: boolean;
    employee: {
      id: string;
      employeeId: string;
      name: string;
      email: string;
    };
    createdAt: Date;
  }>;
}

export interface AttendanceDeviceCommandSummary {
  id: string;
  command: string;
  status: string;
  payload: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceLogSummary {
  id: string;
  employeeId: string;
  fingerId: number;
  timestamp: Date;
  employee: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
  };
}

export interface PaginatedDeviceResponse {
  devices: AttendanceDeviceSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Input Types (for service layer)

export type CreateAttendanceDeviceInput = {
  name: string;
  code: string;
  location?: string | null;
  isActive?: boolean;
};

export type UpdateAttendanceDeviceInput = Partial<CreateAttendanceDeviceInput>;

export type DeviceListFilters = {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
};

export const registerFingerprintCommandSchema = z.object({
  employeeId: z.string().uuid(),
  fingerName: z.string().min(1).max(100),
});

export type RegisterFingerprintCommandInput = z.infer<
  typeof registerFingerprintCommandSchema
>;

export interface FingerprintCommandResponse {
  id: string;
  deviceId: string;
  command: string;
  status: string;
}
