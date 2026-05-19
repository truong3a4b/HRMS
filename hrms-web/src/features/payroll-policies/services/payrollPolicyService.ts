import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type {
  AllowanceAssignmentPayload,
  AllowancePolicy,
  AllowancePolicyPayload,
  AttendanceBonusPolicy,
  AttendanceBonusPolicyPayload,
  AutoPenaltyAssignmentPayload,
  AutoPenaltyPolicy,
  AutoPenaltyPolicyPayload,
  EmployeeAllowance,
  EmployeeAutoPenaltyPolicy,
  InsurancePolicy,
  InsurancePolicyPayload,
  PayrollPolicyAssignmentPayload,
  PayrollProfile,
  PolicyStatusFilter,
  TaxPolicy,
  TaxPolicyPayload,
} from "../types/payrollPolicy.types";

const activeParam = (status: PolicyStatusFilter) => {
  if (status === "active") return true;
  if (status === "inactive") return false;
  return undefined;
};

const cleanPayload = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      value === "" ? null : value,
    ]),
  ) as T;

export const payrollPolicyService = {
  async getInsurancePolicies(status: PolicyStatusFilter) {
    const response = await apiClient.get<ApiResponse<InsurancePolicy[]>>(
      "/payroll-policies/insurance",
      { params: { isActive: activeParam(status) } },
    );

    return response.data.data ?? [];
  },

  async createInsurancePolicy(payload: InsurancePolicyPayload) {
    const response = await apiClient.post<ApiResponse<InsurancePolicy>>(
      "/payroll-policies/insurance",
      cleanPayload(payload),
    );

    return response.data.data;
  },

  async updateInsurancePolicy(id: string, payload: InsurancePolicyPayload) {
    const response = await apiClient.put<ApiResponse<InsurancePolicy>>(
      `/payroll-policies/insurance/${id}`,
      cleanPayload(payload),
    );

    return response.data.data;
  },

  async deleteInsurancePolicy(id: string) {
    const response = await apiClient.delete<ApiResponse<InsurancePolicy>>(
      `/payroll-policies/insurance/${id}`,
    );

    return response.data.data;
  },

  async getTaxPolicies(status: PolicyStatusFilter) {
    const response = await apiClient.get<ApiResponse<TaxPolicy[]>>(
      "/payroll-policies/tax",
      { params: { isActive: activeParam(status) } },
    );

    return response.data.data ?? [];
  },

  async createTaxPolicy(payload: TaxPolicyPayload) {
    const response = await apiClient.post<ApiResponse<TaxPolicy>>(
      "/payroll-policies/tax",
      cleanPayload(payload),
    );

    return response.data.data;
  },

  async updateTaxPolicy(id: string, payload: TaxPolicyPayload) {
    const response = await apiClient.put<ApiResponse<TaxPolicy>>(
      `/payroll-policies/tax/${id}`,
      cleanPayload(payload),
    );

    return response.data.data;
  },

  async deleteTaxPolicy(id: string) {
    const response = await apiClient.delete<ApiResponse<TaxPolicy>>(
      `/payroll-policies/tax/${id}`,
    );

    return response.data.data;
  },

  async getAttendanceBonusPolicies(status: PolicyStatusFilter) {
    const response = await apiClient.get<ApiResponse<AttendanceBonusPolicy[]>>(
      "/payroll-policies/attendance-bonus",
      { params: { isActive: activeParam(status) } },
    );

    return response.data.data ?? [];
  },

  async createAttendanceBonusPolicy(payload: AttendanceBonusPolicyPayload) {
    const response = await apiClient.post<ApiResponse<AttendanceBonusPolicy>>(
      "/payroll-policies/attendance-bonus",
      cleanPayload(payload),
    );

    return response.data.data;
  },

  async updateAttendanceBonusPolicy(
    id: string,
    payload: AttendanceBonusPolicyPayload,
  ) {
    const response = await apiClient.put<ApiResponse<AttendanceBonusPolicy>>(
      `/payroll-policies/attendance-bonus/${id}`,
      cleanPayload(payload),
    );

    return response.data.data;
  },

  async deleteAttendanceBonusPolicy(id: string) {
    const response = await apiClient.delete<ApiResponse<AttendanceBonusPolicy>>(
      `/payroll-policies/attendance-bonus/${id}`,
    );

    return response.data.data;
  },

  async getAllowancePolicies(status: PolicyStatusFilter) {
    const response = await apiClient.get<ApiResponse<AllowancePolicy[]>>(
      "/payroll-policies/allowances",
      { params: { isActive: activeParam(status) } },
    );

    return response.data.data ?? [];
  },

  async createAllowancePolicy(payload: AllowancePolicyPayload) {
    const response = await apiClient.post<ApiResponse<AllowancePolicy>>(
      "/payroll-policies/allowances",
      cleanPayload(payload),
    );

    return response.data.data;
  },

  async updateAllowancePolicy(id: string, payload: AllowancePolicyPayload) {
    const response = await apiClient.put<ApiResponse<AllowancePolicy>>(
      `/payroll-policies/allowances/${id}`,
      cleanPayload(payload),
    );

    return response.data.data;
  },

  async deleteAllowancePolicy(id: string) {
    const response = await apiClient.delete<ApiResponse<AllowancePolicy>>(
      `/payroll-policies/allowances/${id}`,
    );

    return response.data.data;
  },

  async getPayrollProfiles() {
    const response = await apiClient.get<ApiResponse<PayrollProfile[]>>(
      "/payroll-policies/profiles",
    );

    return response.data.data ?? [];
  },

  async assignPayrollPolicies(payload: PayrollPolicyAssignmentPayload) {
    const response = await apiClient.post<ApiResponse<PayrollProfile[]>>(
      "/payroll-policies/assign",
      cleanPayload(payload),
    );

    return response.data.data ?? [];
  },

  async getAllowanceAssignments(allowancePolicyId?: string) {
    const response = await apiClient.get<ApiResponse<EmployeeAllowance[]>>(
      "/payroll-policies/allowances/assignments",
      { params: { allowancePolicyId } },
    );

    return response.data.data ?? [];
  },

  async assignAllowancePolicy(payload: AllowanceAssignmentPayload) {
    const response = await apiClient.post<ApiResponse<EmployeeAllowance[]>>(
      "/payroll-policies/allowances/assign",
      payload,
    );

    return response.data.data ?? [];
  },

  async getAutoPenaltyPolicies(status: PolicyStatusFilter) {
    const response = await apiClient.get<ApiResponse<AutoPenaltyPolicy[]>>(
      "/payroll-policies/auto-penalties",
      { params: { isActive: activeParam(status) } },
    );

    return response.data.data ?? [];
  },

  async createAutoPenaltyPolicy(payload: AutoPenaltyPolicyPayload) {
    const response = await apiClient.post<ApiResponse<AutoPenaltyPolicy>>(
      "/payroll-policies/auto-penalties",
      cleanPayload(payload),
    );

    return response.data.data;
  },

  async updateAutoPenaltyPolicy(
    id: string,
    payload: AutoPenaltyPolicyPayload,
  ) {
    const response = await apiClient.put<ApiResponse<AutoPenaltyPolicy>>(
      `/payroll-policies/auto-penalties/${id}`,
      cleanPayload(payload),
    );

    return response.data.data;
  },

  async deleteAutoPenaltyPolicy(id: string) {
    const response = await apiClient.delete<ApiResponse<AutoPenaltyPolicy>>(
      `/payroll-policies/auto-penalties/${id}`,
    );

    return response.data.data;
  },

  async getAutoPenaltyAssignments(autoPenaltyPolicyId?: string) {
    const response = await apiClient.get<
      ApiResponse<EmployeeAutoPenaltyPolicy[]>
    >("/payroll-policies/auto-penalties/assignments", {
      params: { autoPenaltyPolicyId },
    });

    return response.data.data ?? [];
  },

  async assignAutoPenaltyPolicy(payload: AutoPenaltyAssignmentPayload) {
    const response = await apiClient.post<
      ApiResponse<EmployeeAutoPenaltyPolicy[]>
    >("/payroll-policies/auto-penalties/assign", payload);

    return response.data.data ?? [];
  },
};
