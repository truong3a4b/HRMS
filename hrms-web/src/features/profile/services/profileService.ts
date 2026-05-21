import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type { Employee } from "../../employees/types/employee.types";
import type {
  CandidateProfile,
  CandidateProfilePayload,
} from "../types/profile.types";

export const profileService = {
  async getEmployeeProfile() {
    const response = await apiClient.get<ApiResponse<Employee>>("/employees/me");

    return response.data.data;
  },

  async getCandidateProfile() {
    const response =
      await apiClient.get<ApiResponse<CandidateProfile>>("/candidates/profile");

    return response.data.data;
  },

  async updateCandidateProfile(payload: CandidateProfilePayload) {
    const response = await apiClient.patch<ApiResponse<CandidateProfile>>(
      "/candidates/profile",
      payload,
    );

    return response.data.data;
  },
};
