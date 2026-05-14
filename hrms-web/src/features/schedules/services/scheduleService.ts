import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type {
  CreateScheduleSetupPayload,
  RegisterSchedulePayload,
  WorkScheduleItem,
  WorkScheduleSetup,
} from "../types/schedule.types";

const removeEmptyArrays = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return value !== "" && value != null;
    }),
  ) as T;

export const scheduleService = {
  async getMySchedule(month: string) {
    const response = await apiClient.get<ApiResponse<WorkScheduleItem[]>>(
      "/schedule-assignments/me",
      { params: { month } },
    );

    return response.data.data ?? [];
  },

  async getEmployeeSchedule(employeeId: string, month: string) {
    const response = await apiClient.get<ApiResponse<WorkScheduleItem[]>>(
      `/schedule-assignments/employee/${employeeId}`,
      { params: { month } },
    );

    return response.data.data ?? [];
  },

  async applyEmployeeSchedule(
    employeeId: string,
    scheduleDetails: RegisterSchedulePayload["scheduleDetails"],
  ) {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/schedule-assignments/employee/${employeeId}/apply`,
      { scheduleDetails },
    );

    return response.data.data;
  },

  async createSetup(payload: CreateScheduleSetupPayload) {
    const response = await apiClient.post<ApiResponse<WorkScheduleSetup>>(
      "/schedule-assignments",
      removeEmptyArrays(payload),
    );

    return response.data.data;
  },

  async registerSchedule(payload: RegisterSchedulePayload) {
    const response = await apiClient.post<ApiResponse<unknown>>(
      "/schedule-assignments/register",
      removeEmptyArrays(payload),
    );

    return response.data.data;
  },
};
