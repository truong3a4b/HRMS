import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type {
  ApplyJobPayload,
  EvaluationPayload,
  InterviewPayload,
  JobApplication,
  JobApplicationFilters,
  JobApplicationListData,
  OfferPayload,
  InterviewEvaluation,
  RecruitmentJob,
  RecruitmentJobFilters,
  RecruitmentJobListData,
  RecruitmentJobPayload,
} from "../types/recruitment.types";

const removeEmptyParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );

const removeEmptyPayload = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== "" && value != null),
  );

export const recruitmentService = {
  async getJobs(filters: RecruitmentJobFilters) {
    const response = await apiClient.get<ApiResponse<RecruitmentJobListData>>(
      "/recruitment/jobs",
      {
        params: removeEmptyParams(filters),
      },
    );

    return response.data.data;
  },

  async getJobById(id: string) {
    const response = await apiClient.get<ApiResponse<RecruitmentJob>>(
      `/recruitment/jobs/${id}`,
    );

    return response.data.data;
  },

  async createJob(payload: RecruitmentJobPayload) {
    const response = await apiClient.post<ApiResponse<RecruitmentJob>>(
      "/recruitment/jobs",
      payload,
    );

    return response.data.data;
  },

  async updateJob(id: string, payload: Partial<RecruitmentJobPayload>) {
    const response = await apiClient.patch<ApiResponse<RecruitmentJob>>(
      `/recruitment/jobs/${id}`,
      removeEmptyPayload(payload),
    );

    return response.data.data;
  },

  async closeJob(id: string) {
    const response = await apiClient.patch<ApiResponse<RecruitmentJob>>(
      `/recruitment/jobs/${id}/close`,
    );

    return response.data.data;
  },

  async reopenJob(id: string) {
    const response = await apiClient.patch<ApiResponse<RecruitmentJob>>(
      `/recruitment/jobs/${id}/reopen`,
    );

    return response.data.data;
  },

  async applyJob(payload: ApplyJobPayload) {
    if (payload.cvFile) {
      const formData = new FormData();

      for (const [key, value] of Object.entries(payload)) {
        if (key === "cvFile" || value === "" || value == null) {
          continue;
        }

        formData.append(key, String(value));
      }

      formData.append("cv", payload.cvFile);

      const response = await apiClient.post<ApiResponse<JobApplication>>(
        "/recruitment/applications",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data.data;
    }

    const response = await apiClient.post<ApiResponse<JobApplication>>(
      "/recruitment/applications",
      removeEmptyPayload(payload),
    );

    return response.data.data;
  },

  async getApplications(filters: JobApplicationFilters) {
    const response = await apiClient.get<ApiResponse<JobApplicationListData>>(
      "/recruitment/applications",
      {
        params: removeEmptyParams(filters),
      },
    );

    return response.data.data;
  },

  async getMyApplications() {
    const response = await apiClient.get<ApiResponse<JobApplicationListData>>(
      "/candidates/applications/me",
    );

    return response.data.data;
  },

  async getApplicationById(id: string, isCandidate?: boolean) {
    const endpoint = isCandidate
      ? `/candidates/applications/${id}`
      : `/recruitment/applications/${id}`;
    const response = await apiClient.get<ApiResponse<JobApplication>>(endpoint);

    return response.data.data;
  },

  async rejectApplication(id: string) {
    const response = await apiClient.patch<ApiResponse<JobApplication>>(
      `/recruitment/applications/${id}/reject`,
    );

    return response.data.data;
  },

  async cancelApplication(id: string) {
    const response = await apiClient.post<ApiResponse<JobApplication>>(
      `/recruitment/applications/${id}/cancel`,
    );

    return response.data.data;
  },

  async scheduleInterview(applicationId: string, payload: InterviewPayload) {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/recruitment/applications/${applicationId}/interviews`,
      removeEmptyPayload(payload),
    );

    return response.data.data;
  },

  async respondInterview(
    applicationId: string,
    scheduleId: string,
    payload: { decision: "CONFIRMED" | "DECLINED"; note?: string },
  ) {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/recruitment/applications/${applicationId}/interviews/${scheduleId}/respond`,
      removeEmptyPayload(payload),
    );

    return response.data.data;
  },

  async submitEvaluation(applicationId: string, payload: EvaluationPayload) {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/recruitment/applications/${applicationId}/evaluations`,
      removeEmptyPayload(payload),
    );

    return response.data.data;
  },

  async getEvaluationById(applicationId: string, evaluationId: string) {
    const response = await apiClient.get<ApiResponse<InterviewEvaluation>>(
      `/recruitment/applications/${applicationId}/evaluations/${evaluationId}`,
    );

    return response.data.data;
  },

  async updateEvaluation(
    applicationId: string,
    evaluationId: string,
    payload: EvaluationPayload,
  ) {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      `/recruitment/applications/${applicationId}/evaluations/${evaluationId}`,
      removeEmptyPayload(payload),
    );

    return response.data.data;
  },

  async deleteEvaluation(applicationId: string, evaluationId: string) {
    const response = await apiClient.delete<ApiResponse<unknown>>(
      `/recruitment/applications/${applicationId}/evaluations/${evaluationId}`,
    );

    return response.data.data;
  },

  async sendOffer(applicationId: string, payload: OfferPayload) {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/recruitment/applications/${applicationId}/offer`,
      removeEmptyPayload(payload),
    );

    return response.data.data;
  },

  async respondOffer(
    applicationId: string,
    payload: { decision: "ACCEPTED" | "DECLINED"; note?: string },
  ) {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/recruitment/applications/${applicationId}/offer/respond`,
      removeEmptyPayload(payload),
    );

    return response.data.data;
  },
};
