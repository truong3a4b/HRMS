import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type { EmployeeListData } from "../../employees/types/employee.types";
import type {
  Department,
  DepartmentFormPayload,
  UpdateDepartmentPayload,
} from "../types/department.types";

const removeEmptyParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );

export const departmentService = {
  async getDepartments() {
    const response =
      await apiClient.get<ApiResponse<Department[]>>("/departments");

    return response.data.data ?? [];
  },

  async createDepartment(payload: DepartmentFormPayload) {
    const response = await apiClient.post<ApiResponse<Department>>(
      "/departments",
      {
        name: payload.name,
        description: payload.description || undefined,
        managerId: payload.managerId || null,
      },
    );

    return response.data.data;
  },

  async updateDepartment(id: string, payload: UpdateDepartmentPayload) {
    const response = await apiClient.patch<ApiResponse<Department>>(
      `/departments/${id}/basic`,
      payload,
    );

    return response.data.data;
  },

  async updateManager(id: string, managerId: string | null) {
    const response = await apiClient.patch<ApiResponse<Department>>(
      `/departments/${id}/manager`,
      { managerId },
    );

    return response.data.data;
  },

  async deleteDepartment(id: string) {
    const response = await apiClient.delete<ApiResponse<Department>>(
      `/departments/${id}`,
    );

    return response.data.data;
  },

  async getEmployeesByDepartment(departmentId: string) {
    const response = await apiClient.get<ApiResponse<EmployeeListData>>(
      "/employees",
      {
        params: removeEmptyParams({
          page: 1,
          limit: 100,
          departmentId,
        }),
      },
    );

    return response.data.data?.items ?? [];
  },
};
