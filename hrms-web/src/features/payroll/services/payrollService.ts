import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type {
  CreatePayrollByTargetsPayload,
  CreatePayrollByTargetsResult,
  PayrollDetail,
  PayrollPeriod,
  PayrollPeriodOverview,
  PayrollQuery,
  PayrollSummary,
  RecalculatePayrollPeriodResult,
} from "../types/payroll.types";

const removeEmptyParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );

export const payrollService = {
  async getPeriods(query: Pick<PayrollQuery, "month" | "year"> = {}) {
    const response = await apiClient.get<ApiResponse<PayrollPeriod[]>>(
      "/payrolls/periods",
      { params: removeEmptyParams(query) },
    );

    return response.data.data ?? [];
  },

  async getPeriodOverview(periodId: string) {
    const response = await apiClient.get<ApiResponse<PayrollPeriodOverview>>(
      `/payrolls/periods/${periodId}/overview`,
    );

    return response.data.data;
  },

  async getPeriodEmployeeDetail(periodId: string, employeeId: string) {
    const response = await apiClient.get<ApiResponse<PayrollDetail>>(
      `/payrolls/periods/${periodId}/employees/${employeeId}`,
    );

    return response.data.data;
  },

  async requestPeriodApproval(periodId: string) {
    const response = await apiClient.post<ApiResponse<PayrollPeriodOverview>>(
      `/payrolls/periods/${periodId}/request-approval`,
    );

    return response.data.data;
  },

  async recalculatePeriod(periodId: string) {
    const response = await apiClient.post<
      ApiResponse<RecalculatePayrollPeriodResult>
    >(`/payrolls/periods/${periodId}/recalculate`);

    return response.data.data;
  },

  async approvePeriod(periodId: string) {
    const response = await apiClient.post<ApiResponse<PayrollPeriodOverview>>(
      `/payrolls/periods/${periodId}/approve`,
    );

    return response.data.data;
  },

  async getPayrolls(query: PayrollQuery) {
    const response = await apiClient.get<ApiResponse<PayrollSummary[]>>(
      "/payrolls",
      { params: removeEmptyParams(query) },
    );

    return response.data.data ?? [];
  },

  async getMine(query: Pick<PayrollQuery, "month" | "year">) {
    const response = await apiClient.get<ApiResponse<PayrollSummary[]>>(
      "/payrolls/mine",
      { params: removeEmptyParams(query) },
    );

    return response.data.data ?? [];
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<PayrollDetail>>(
      `/payrolls/${id}`,
    );

    return response.data.data;
  },

  async createByTargets(payload: CreatePayrollByTargetsPayload) {
    const response = await apiClient.post<
      ApiResponse<CreatePayrollByTargetsResult>
    >("/payrolls/by-targets", payload);

    return response.data.data;
  },

  async requestApproval(id: string) {
    const response = await apiClient.post<ApiResponse<PayrollDetail>>(
      `/payrolls/${id}/request-approval`,
    );

    return response.data.data;
  },

  async approve(id: string) {
    const response = await apiClient.post<ApiResponse<PayrollDetail>>(
      `/payrolls/${id}/approve`,
    );

    return response.data.data;
  },

  async pay(id: string) {
    const response = await apiClient.post<ApiResponse<PayrollDetail>>(
      `/payrolls/${id}/pay`,
    );

    return response.data.data;
  },
};
