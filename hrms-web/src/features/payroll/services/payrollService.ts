import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type {
  CreatePayrollPayload,
  CreatePayrollPaymentBatchPayload,
  CreatePayrollByTargetsPayload,
  CreatePayrollByTargetsResult,
  PayrollCalculationJob,
  PayrollDetail,
  PayrollPaymentBatch,
  PayrollPeriod,
  PayrollPeriodOverview,
  PayrollQuery,
  RequestPayrollApprovalPayload,
  PayrollSummary,
} from "../types/payroll.types";

const removeEmptyParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

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

  async exportPeriodExcel(periodId: string, fallbackName: string) {
    const response = await apiClient.get<Blob>(
      `/payrolls/periods/${periodId}/export`,
      { responseType: "blob" },
    );

    const contentDisposition = response.headers["content-disposition"];
    const filenameMatch =
      typeof contentDisposition === "string"
        ? /filename="?([^"]+)"?/i.exec(contentDisposition)
        : null;
    const filename = filenameMatch?.[1] ?? fallbackName;
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  async getPeriodEmployeeDetail(periodId: string, employeeId: string) {
    const response = await apiClient.get<ApiResponse<PayrollDetail>>(
      `/payrolls/periods/${periodId}/employees/${employeeId}`,
    );

    return response.data.data;
  },

  async requestPeriodApproval(
    periodId: string,
    payload: RequestPayrollApprovalPayload,
  ) {
    const response = await apiClient.post<ApiResponse<PayrollPeriodOverview>>(
      `/payrolls/periods/${periodId}/request-approval`,
      payload,
    );

    return response.data.data;
  },

  async approvePeriod(periodId: string) {
    const response = await apiClient.post<ApiResponse<PayrollPeriodOverview>>(
      `/payrolls/periods/${periodId}/approve`,
    );

    return response.data.data;
  },

  async cancelPeriod(periodId: string) {
    const response = await apiClient.post<ApiResponse<PayrollPeriodOverview>>(
      `/payrolls/periods/${periodId}/cancel`,
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

  async create(payload: CreatePayrollPayload) {
    const response = await apiClient.post<ApiResponse<PayrollDetail>>(
      "/payrolls",
      payload,
    );

    return response.data.data;
  },

  async createByTargets(payload: CreatePayrollByTargetsPayload) {
    const response = await apiClient.post<
      ApiResponse<CreatePayrollByTargetsResult>
    >("/payrolls/by-targets", payload);

    return response.data.data;
  },

  async createByTargetsJob(payload: CreatePayrollByTargetsPayload) {
    const response = await apiClient.post<ApiResponse<PayrollCalculationJob>>(
      "/payrolls/by-targets/jobs",
      payload,
    );

    return response.data.data;
  },

  async getCalculationJob(id: string) {
    const response = await apiClient.get<ApiResponse<PayrollCalculationJob>>(
      `/payrolls/jobs/${id}`,
    );

    return response.data.data;
  },

  async waitForCalculationJob(
    id: string,
    options: {
      intervalMs?: number;
      onProgress?: (job: PayrollCalculationJob) => void;
    } = {},
  ) {
    const intervalMs = options.intervalMs ?? 1500;

    for (;;) {
      const job = await this.getCalculationJob(id);
      if (!job) {
        throw new Error("Payroll calculation job not found");
      }

      options.onProgress?.(job);

      if (job.status === "COMPLETED" || job.status === "FAILED") {
        return job;
      }

      await delay(intervalMs);
    }
  },

  async removeEmployeeFromPeriod(periodId: string, employeeId: string) {
    const response = await apiClient.delete<ApiResponse<PayrollPeriodOverview>>(
      `/payrolls/periods/${periodId}/employees/${employeeId}`,
    );

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

  async createPaymentBatch(payload: CreatePayrollPaymentBatchPayload) {
    const response = await apiClient.post<ApiResponse<PayrollPaymentBatch>>(
      "/payrolls/payments",
      payload,
    );

    return response.data.data;
  },

  async getPaymentBatches(
    query: Pick<PayrollQuery, "periodId" | "employeeId" | "month" | "year"> = {},
  ) {
    const response = await apiClient.get<ApiResponse<PayrollPaymentBatch[]>>(
      "/payrolls/payments",
      { params: removeEmptyParams(query) },
    );

    return response.data.data ?? [];
  },

  async getPaymentBatchById(id: string) {
    const response = await apiClient.get<ApiResponse<PayrollPaymentBatch>>(
      `/payrolls/payments/${id}`,
    );

    return response.data.data;
  },
};
