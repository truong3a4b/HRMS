import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type {
  CreateEmployeePayload,
  EmployeeFilters,
  Employee,
  EmployeeListData,
  EmployeeOption,
  UpdateEmployeeAdditionalPayload,
  UpdateEmployeeBasicPayload,
  UpdateEmployeeJobPayload,
} from "../types/employee.types";

const removeEmptyParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );

const removeEmptyStrings = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== ""),
  );

const employeeFileFields = new Set([
  "avatarFile",
  "frontIdentityCardImageFile",
  "backIdentityCardImageFile",
]);

const employeeFileFieldNames: Record<string, string> = {
  avatarFile: "avatar",
  frontIdentityCardImageFile: "frontIdentityCardImage",
  backIdentityCardImageFile: "backIdentityCardImage",
};

const hasEmployeeFile = (payload: Record<string, unknown>) =>
  Object.entries(payload).some(
    ([key, value]) => employeeFileFields.has(key) && value instanceof File,
  );

const toFormData = (payload: Record<string, unknown>) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null || value === "") continue;

    if (value instanceof File) {
      formData.append(employeeFileFieldNames[key] ?? key, value);
      continue;
    }

    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      continue;
    }

    formData.append(key, String(value));
  }

  return formData;
};

const multipartConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

export const employeeService = {
  async getEmployees(filters: EmployeeFilters) {
    const response = await apiClient.get<ApiResponse<EmployeeListData>>(
      "/employees",
      {
        params: removeEmptyParams({
          page: filters.page,
          limit: filters.limit,
          search: filters.search?.trim(),
          departmentId: filters.departmentId,
          positionId: filters.positionId,
          status: filters.status,
        }),
      },
    );

    return response.data.data;
  },

  async getEmployeeById(id: string) {
    const response = await apiClient.get<ApiResponse<Employee>>(
      `/employees/${id}`,
    );

    return response.data.data;
  },

  async getMe() {
    const response = await apiClient.get<ApiResponse<Employee>>("/employees/me");

    return response.data.data;
  },

  async createEmployee(payload: CreateEmployeePayload) {
    const response = await apiClient.post<ApiResponse<Employee>>(
      "/employees",
      payload,
    );

    return response.data.data;
  },

  async updateEmployeeBasic(id: string, payload: UpdateEmployeeBasicPayload) {
    if (hasEmployeeFile(payload)) {
      const response = await apiClient.patch<ApiResponse<Employee>>(
        `/employees/${id}/basic`,
        toFormData(payload),
        multipartConfig,
      );

      return response.data.data;
    }

    const response = await apiClient.patch<ApiResponse<Employee>>(
      `/employees/${id}/basic`,
      removeEmptyStrings(payload),
    );

    return response.data.data;
  },

  async updateEmployeeAdditional(
    id: string,
    payload: UpdateEmployeeAdditionalPayload,
  ) {
    if (hasEmployeeFile(payload)) {
      const response = await apiClient.patch<ApiResponse<Employee>>(
        `/employees/${id}/additional`,
        toFormData(payload),
        multipartConfig,
      );

      return response.data.data;
    }

    const response = await apiClient.patch<ApiResponse<Employee>>(
      `/employees/${id}/additional`,
      removeEmptyStrings(payload),
    );

    return response.data.data;
  },

  async updateMyBasic(payload: UpdateEmployeeBasicPayload) {
    if (hasEmployeeFile(payload)) {
      const response = await apiClient.patch<ApiResponse<Employee>>(
        "/employees/me/basic",
        toFormData(payload),
        multipartConfig,
      );

      return response.data.data;
    }

    const response = await apiClient.patch<ApiResponse<Employee>>(
      "/employees/me/basic",
      removeEmptyStrings(payload),
    );

    return response.data.data;
  },

  async updateMyAdditional(payload: UpdateEmployeeAdditionalPayload) {
    if (hasEmployeeFile(payload)) {
      const response = await apiClient.patch<ApiResponse<Employee>>(
        "/employees/me/additional",
        toFormData(payload),
        multipartConfig,
      );

      return response.data.data;
    }

    const response = await apiClient.patch<ApiResponse<Employee>>(
      "/employees/me/additional",
      removeEmptyStrings(payload),
    );

    return response.data.data;
  },

  async updateEmployeeJob(id: string, payload: UpdateEmployeeJobPayload) {
    const response = await apiClient.patch<ApiResponse<Employee>>(
      `/employees/${id}/job`,
      payload,
    );

    return response.data.data;
  },

  async getDepartments() {
    const response =
      await apiClient.get<ApiResponse<EmployeeOption[]>>("/departments");

    return response.data.data ?? [];
  },

  async getPositions() {
    const response =
      await apiClient.get<ApiResponse<EmployeeOption[]>>("/positions");

    return response.data.data ?? [];
  },
};
