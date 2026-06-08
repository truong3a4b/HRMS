import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type {
  PermissionCatalogItem,
  PermissionKey,
  Position,
  PositionPayload,
} from "../types/position.types";

export const fallbackPermissions: PermissionCatalogItem[] = [
  { key: "POSITION_SETUP", name: "Cấu hình chức vụ" },
  { key: "POSITION_VIEW", name: "Xem chức vụ" },
  { key: "RECRUITMENT_MANAGE_JOB", name: "Quản lý tin tuyển dụng" },
  { key: "RECRUITMENT_VIEW_APPLICATION", name: "Xem hồ sơ ứng viên" },
  { key: "RECRUITMENT_MANAGE_APPLICATION", name: "Quản lý hồ sơ ứng viên" },
  { key: "RECRUITMENT_APPROVE_DIRECT", name: "Duyệt trực tiếp ứng viên" },
  { key: "DEPARTMENT_VIEW", name: "Xem bộ phận" },
  { key: "DEPARTMENT_SETUP", name: "Cấu hình bộ phận" },
  { key: "EMPLOYEE_VIEW_LIST", name: "Xem danh sách nhân viên" },
  { key: "EMPLOYEE_VIEW_DETAIL", name: "Xem chi tiết nhân viên" },
  { key: "EMPLOYEE_CREATE", name: "Tạo nhân viên" },
  { key: "EMPLOYEE_UPDATE_BASIC", name: "Sửa thông tin cơ bản" },
  { key: "EMPLOYEE_UPDATE_JOB", name: "Sửa thông tin công việc" },
  { key: "EMPLOYEE_UPDATE_SELF_BASIC", name: "Tự sửa thông tin" },
  { key: "WORK_SCHEDULE_MANAGE", name: "Quản lý lịch làm việc" },
  { key: "WORK_SCHEDULE_REGISTER", name: "Đăng ký lịch làm việc" },
  { key: "WORK_SCHEDULE_VIEW", name: "Xem lịch làm việc" },
  { key: "ATTENDANCE_DEVICE_VIEW", name: "Xem thiết bị chấm công" },
  { key: "ATTENDANCE_DEVICE_SETUP", name: "Cấu hình thiết bị chấm công" },
  { key: "ATTENDANCE_HISTORY_VIEW", name: "Xem lịch sử chấm công" },
  { key: "ATTENDANCE_TIMESHEET_VIEW", name: "Xem bảng công" },
  { key: "PAYROLL_POLICY_VIEW", name: "Xem chính sách lương" },
  { key: "PAYROLL_POLICY_SETUP", name: "Cấu hình chính sách lương" },
  { key: "PAYROLL_VIEW", name: "Xem bảng lương" },
  { key: "PAYROLL_MANAGE", name: "Quản lý bảng lương" },
  { key: "PAYROLL_APPROVE", name: "Duyệt bảng lương" },
  { key: "PAYROLL_PAY", name: "Chi trả lương" },
  { key: "PAYROLL_VIEW_SELF", name: "Xem lương cá nhân" },
];

export function extractPermissionKeys(position: Position): PermissionKey[] {
  if (!position.permissions) {
    return [];
  }

  return position.permissions
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return item.key ?? item.permissionKey ?? item.permission?.key;
    })
    .filter((key): key is PermissionKey => Boolean(key));
}

export const positionService = {
  async getPositions() {
    const response = await apiClient.get<ApiResponse<Position[]>>("/positions");

    return response.data.data ?? [];
  },

  async getPositionById(id: string) {
    const response = await apiClient.get<ApiResponse<Position>>(
      `/positions/${id}`,
    );

    return response.data.data;
  },

  async getPermissions() {
    const response =
      await apiClient.get<ApiResponse<PermissionCatalogItem[]>>(
        "/positions/permissions",
      );

    return response.data.data ?? fallbackPermissions;
  },

  async createPosition(payload: PositionPayload) {
    const response = await apiClient.post<ApiResponse<Position>>(
      "/positions",
      payload,
    );

    return response.data.data;
  },

  async updatePosition(id: string, payload: PositionPayload) {
    const response = await apiClient.put<ApiResponse<Position>>(
      `/positions/${id}`,
      payload,
    );

    return response.data.data;
  },

  async deletePosition(id: string) {
    const response = await apiClient.delete<ApiResponse<Position>>(
      `/positions/${id}`,
    );

    return response.data.data;
  },
};
