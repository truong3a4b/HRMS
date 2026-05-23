import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type {
  CreateAttendanceCorrectionRequestPayload,
  CreateLateEarlyRequestPayload,
  CreateLeaveRequestPayload,
  RequestDecisionPayload,
  RequestItem,
  RequestListFilters,
  RequestListResponse,
} from "../types/request.types";
import type { WorkShift } from "../../work-shifts/types/workShift.types";

const removeEmptyParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );

export const requestService = {
  async getMyRequests(filters: RequestListFilters = {}) {
    const response = await apiClient.get<ApiResponse<RequestListResponse>>(
      "/requests/me",
      { params: removeEmptyParams(filters) },
    );

    return response.data.data;
  },

  async getMyWatchingRequests(filters: RequestListFilters = {}) {
    const response = await apiClient.get<ApiResponse<RequestListResponse>>(
      "/requests/me/watching",
      { params: removeEmptyParams(filters) },
    );

    return response.data.data;
  },

  async getMyPendingApprovals(filters: RequestListFilters = {}) {
    const response = await apiClient.get<ApiResponse<RequestListResponse>>(
      "/requests/me/pending-approvals",
      { params: removeEmptyParams(filters) },
    );

    return response.data.data;
  },

  async getAllRequests(filters: RequestListFilters = {}) {
    const response = await apiClient.get<ApiResponse<RequestListResponse>>(
      "/requests",
      { params: removeEmptyParams(filters) },
    );

    return response.data.data;
  },

  async getRequestById(id: string) {
    const response = await apiClient.get<ApiResponse<RequestItem>>(
      `/requests/${id}`,
    );

    return response.data.data;
  },

  async getMyLeaveShiftsByDate(date: string) {
    const response = await apiClient.get<ApiResponse<WorkShift[]>>(
      "/requests/leave/shifts",
      { params: { date } },
    );

    return response.data.data ?? [];
  },

  async getMyScheduleShiftsByDate(date: string) {
    const response = await apiClient.get<ApiResponse<WorkShift[]>>(
      "/requests/schedule-shifts",
      { params: { date } },
    );

    return response.data.data ?? [];
  },

  async createLeaveRequest(payload: CreateLeaveRequestPayload) {
    const response = await apiClient.post<ApiResponse<RequestItem>>(
      "/requests/leave",
      payload,
    );

    return response.data.data;
  },

  async createLateEarlyRequest(payload: CreateLateEarlyRequestPayload) {
    const response = await apiClient.post<ApiResponse<RequestItem>>(
      "/requests/late-early",
      payload,
    );

    return response.data.data;
  },

  async createAttendanceCorrectionRequest(
    payload: CreateAttendanceCorrectionRequestPayload,
  ) {
    const response = await apiClient.post<ApiResponse<RequestItem>>(
      "/requests/attendance-correction",
      payload,
    );

    return response.data.data;
  },

  async startReview(id: string) {
    const response = await apiClient.post<ApiResponse<RequestItem>>(
      `/requests/${id}/start-review`,
    );

    return response.data.data;
  },

  async decideRequest(id: string, payload: RequestDecisionPayload) {
    const response = await apiClient.post<ApiResponse<RequestItem>>(
      `/requests/${id}/decision`,
      payload,
    );

    return response.data.data;
  },

  async cancelRequest(id: string) {
    const response = await apiClient.post<ApiResponse<RequestItem>>(
      `/requests/${id}/cancel`,
    );

    return response.data.data;
  },
};
