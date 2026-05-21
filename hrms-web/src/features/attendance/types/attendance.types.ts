export type AttendanceDevice = {
  id: string;
  name: string;
  code: string;
  location: string | null;
  isActive: boolean;
  isConnected: boolean;
  lastHeartbeatAt: string | null;
  fingerprintCount: number;
  lastActiveAt?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type AttendanceDeviceListData = {
  devices: AttendanceDevice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AttendanceEmployee = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  departmentId?: string | null;
  positionId?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  position?: {
    id: string;
    name: string;
  } | null;
};

export type EmployeeFingerprint = {
  id: string;
  fingerId: number;
  fingerName: string | null;
  isActive: boolean;
  employee: AttendanceEmployee;
  createdAt: string;
};

export type AttendanceDeviceCommand = {
  id: string;
  deviceId: string;
  command: string;
  status: string;
};

export type CreateAttendanceDevicePayload = {
  name: string;
  code: string;
  location?: string | null;
  isActive?: boolean;
};

export type UpdateAttendanceDevicePayload =
  Partial<CreateAttendanceDevicePayload>;

export type RegisterFingerprintPayload = {
  employeeId: string;
  fingerName: string;
};

export type AttendanceLog = {
  id: string;
  employeeId: string;
  deviceId: string;
  fingerId: number;
  timestamp: string;
  createdAt: string;
  device: {
    id: string;
    name: string;
    code: string;
  };
};

export type AttendanceHistoryData = {
  employee: AttendanceEmployee;
  month: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  logs: AttendanceLog[];
};

export type AttendanceRecordDetail = {
  id: string;
  attendanceRecordId: string;
  workShiftId: string;
  workShiftCode: string | null;
  workShiftName: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftStartClock: string | null;
  shiftEndClock: string | null;
  shiftIsOvertime: boolean;
  workUnits: number;
  countedWorkUnits: number;
  countedOvertimeUnits: number;
  isLate: boolean;
  isEarlyLeave: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceTimesheetDay = {
  id?: string;
  date: string;
  standardWorkUnits: number;
  actualWorkUnits?: number;
  workedUnits: number;
  overtimeUnits: number;
  bonusUnits: number;
  lateCount?: number;
  earlyLeaveCount?: number;
  lateEarlyCount?: number;
  leaveCount?: number;
  absentCount?: number;
  leaveOrAbsentCount?: number;
  isLeaveDay: boolean;
  recordDetails?: AttendanceRecordDetail[];
  overtimeShifts: Array<{
    id: string;
    workShiftId: string;
    workShiftName: string;
    status: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    workUnits: number;
  }>;
  bonusShifts: Array<{
    id: string;
    requestId: string;
    workUnits: number;
    reason: string | null;
    appliedAt: string | null;
    workShift: {
      id: string;
      code: string;
      name: string;
      isOvertime: boolean;
    } | null;
  }>;
};

export type AttendanceTimesheetData = {
  employee: AttendanceEmployee;
  month: string;
  totals: {
    standardWorkUnits: number;
    actualWorkUnits?: number;
    workedUnits: number;
    overtimeUnits: number;
    bonusUnits: number;
    lateCount?: number;
    earlyLeaveCount?: number;
    lateEarlyCount?: number;
    leaveCount?: number;
    absentCount?: number;
    leaveOrAbsentDays?: number;
    leaveDays: number;
  };
  days: AttendanceTimesheetDay[];
};

export type EmployeeStandardWorkDay = {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  standardWorkDays: string | number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  employee: AttendanceEmployee;
};

export type StandardWorkDaysPayload = {
  month: number;
  year: number;
  standardWorkDays: string | number;
  note?: string | null;
};

export type AssignStandardWorkDaysPayload = StandardWorkDaysPayload & {
  departmentIds?: string[];
  positionIds?: string[];
};
