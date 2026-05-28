import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type {
  AttendanceDevice,
  AttendanceDeviceCommand,
  AttendanceDeviceListData,
  AttendanceHistoryData,
  AttendanceTimesheetData,
  AnnualLeaveBalancePayload,
  AssignAnnualLeaveBalancePayload,
  AssignStandardWorkDaysPayload,
  CreateAttendanceDevicePayload,
  EmployeeAnnualLeaveBalance,
  EmployeeFingerprint,
  EmployeeStandardWorkDay,
  RegisterFingerprintPayload,
  StandardWorkDaysPayload,
  UpdateAttendanceDevicePayload,
} from "../types/attendance.types";

const removeEmptyParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );

export const attendanceService = {
  async getDevices(params: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const response = await apiClient.get<ApiResponse<AttendanceDeviceListData>>(
      "/attendance-devices",
      {
        params: removeEmptyParams({
          page: params.page,
          limit: params.limit,
          search: params.search?.trim(),
        }),
      },
    );

    return response.data.data;
  },

  async createDevice(payload: CreateAttendanceDevicePayload) {
    const response = await apiClient.post<ApiResponse<AttendanceDevice>>(
      "/attendance-devices",
      payload,
    );

    return response.data.data;
  },

  async updateDevice(id: string, payload: UpdateAttendanceDevicePayload) {
    const response = await apiClient.patch<ApiResponse<AttendanceDevice>>(
      `/attendance-devices/${id}`,
      payload,
    );

    return response.data.data;
  },

  async deleteDevice(id: string) {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/attendance-devices/${id}`,
    );

    return response.data.data;
  },

  async getFingerprints(deviceId: string) {
    const response = await apiClient.get<ApiResponse<EmployeeFingerprint[]>>(
      `/attendance-devices/${deviceId}/fingerprints`,
    );

    return response.data.data ?? [];
  },

  async registerFingerprint(
    deviceId: string,
    payload: RegisterFingerprintPayload,
  ) {
    const response = await apiClient.post<ApiResponse<AttendanceDeviceCommand>>(
      `/attendance-devices/${deviceId}/fingerprints`,
      payload,
    );

    return response.data.data;
  },

  async deleteFingerprint(deviceId: string, fingerprintId: string) {
    const response = await apiClient.delete<ApiResponse<AttendanceDeviceCommand>>(
      `/attendance-devices/${deviceId}/fingerprints/${fingerprintId}`,
    );

    return response.data.data;
  },

  async getMyHistory(month: string) {
    const response = await apiClient.get<ApiResponse<AttendanceHistoryData>>(
      "/attendance/history/me",
      { params: { month } },
    );

    return response.data.data;
  },

  async getEmployeeHistory(employeeId: string, month: string) {
    const response = await apiClient.get<ApiResponse<AttendanceHistoryData>>(
      `/attendance/history/employees/${employeeId}`,
      { params: { month } },
    );

    return response.data.data;
  },

  async getMyTimesheet(month: string) {
    const response = await apiClient.get<ApiResponse<AttendanceTimesheetData>>(
      "/attendance/timesheet/me",
      { params: { month } },
    );

    return response.data.data;
  },

  async getEmployeeTimesheet(employeeId: string, month: string) {
    const response = await apiClient.get<ApiResponse<AttendanceTimesheetData>>(
      `/attendance/timesheet/employees/${employeeId}`,
      { params: { month } },
    );

    return response.data.data;
  },

  async getStandardWorkDays(params: {
    month?: number;
    year?: number;
    employeeId?: string;
    departmentId?: string;
    positionId?: string;
  }) {
    const response = await apiClient.get<ApiResponse<EmployeeStandardWorkDay[]>>(
      "/payroll-policies/standard-work-days",
      { params: removeEmptyParams(params) },
    );

    return response.data.data ?? [];
  },

  async assignStandardWorkDays(payload: AssignStandardWorkDaysPayload) {
    const response = await apiClient.post<ApiResponse<EmployeeStandardWorkDay[]>>(
      "/payroll-policies/standard-work-days/assign",
      payload,
    );

    return response.data.data ?? [];
  },

  async upsertEmployeeStandardWorkDays(
    employeeId: string,
    payload: StandardWorkDaysPayload,
  ) {
    const response = await apiClient.put<ApiResponse<EmployeeStandardWorkDay>>(
      `/payroll-policies/standard-work-days/employees/${employeeId}`,
      payload,
    );

    return response.data.data;
  },

  async deleteEmployeeStandardWorkDays(
    employeeId: string,
    year: number,
    month: number,
  ) {
    const response = await apiClient.delete<ApiResponse<EmployeeStandardWorkDay>>(
      `/payroll-policies/standard-work-days/employees/${employeeId}/${year}/${month}`,
    );

    return response.data.data;
  },

  async getAnnualLeaveBalances(params: {
    year?: number;
    employeeId?: string;
    departmentId?: string;
    positionId?: string;
  }) {
    const response = await apiClient.get<
      ApiResponse<EmployeeAnnualLeaveBalance[]>
    >("/payroll-policies/annual-leave-balances", {
      params: removeEmptyParams(params),
    });

    return response.data.data ?? [];
  },

  async assignAnnualLeaveBalances(payload: AssignAnnualLeaveBalancePayload) {
    const response = await apiClient.post<
      ApiResponse<EmployeeAnnualLeaveBalance[]>
    >("/payroll-policies/annual-leave-balances/assign", payload);

    return response.data.data ?? [];
  },

  async upsertEmployeeAnnualLeaveBalance(
    employeeId: string,
    payload: AnnualLeaveBalancePayload,
  ) {
    const response = await apiClient.put<
      ApiResponse<EmployeeAnnualLeaveBalance>
    >(`/payroll-policies/annual-leave-balances/employees/${employeeId}`, payload);

    return response.data.data;
  },

  async deleteEmployeeAnnualLeaveBalance(employeeId: string, year: number) {
    const response = await apiClient.delete<
      ApiResponse<EmployeeAnnualLeaveBalance>
    >(`/payroll-policies/annual-leave-balances/employees/${employeeId}/${year}`);

    return response.data.data;
  },
};
