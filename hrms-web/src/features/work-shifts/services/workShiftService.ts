import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type {
  WorkShift,
  WorkShiftFormPayload,
} from "../types/workShift.types";

const cleanPayload = (payload: WorkShiftFormPayload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value != null),
  ) as WorkShiftFormPayload;

export const workShiftService = {
  async getWorkShifts() {
    const response =
      await apiClient.get<ApiResponse<WorkShift[]>>("/work-shifts");

    return response.data.data ?? [];
  },

  async getWorkShiftById(id: string) {
    const response = await apiClient.get<ApiResponse<WorkShift>>(
      `/work-shifts/${id}`,
    );

    return response.data.data;
  },

  async createWorkShift(payload: WorkShiftFormPayload) {
    const response = await apiClient.post<ApiResponse<WorkShift>>(
      "/work-shifts",
      cleanPayload(payload),
    );

    return response.data.data;
  },

  async updateWorkShift(id: string, payload: WorkShiftFormPayload) {
    const response = await apiClient.patch<ApiResponse<WorkShift>>(
      `/work-shifts/${id}`,
      cleanPayload(payload),
    );

    return response.data.data;
  },

  async deleteWorkShift(id: string) {
    const response = await apiClient.delete<ApiResponse<WorkShift>>(
      `/work-shifts/${id}`,
    );

    return response.data.data;
  },
};
