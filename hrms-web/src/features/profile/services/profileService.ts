import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type { Employee } from "../../employees/types/employee.types";
import type {
  CandidateProfile,
  CandidateProfilePayload,
} from "../types/profile.types";

const candidateFileFields = new Set([
  "avatarFile",
  "cvFile",
  "frontIdentityCardImageFile",
  "backIdentityCardImageFile",
]);

const candidateFileFieldNames: Record<string, string> = {
  avatarFile: "avatar",
  cvFile: "cv",
  frontIdentityCardImageFile: "frontIdentityCardImage",
  backIdentityCardImageFile: "backIdentityCardImage",
};

const hasCandidateFile = (payload: CandidateProfilePayload) =>
  Object.entries(payload).some(
    ([key, value]) => candidateFileFields.has(key) && value instanceof File,
  );

const appendPayloadToFormData = (
  formData: FormData,
  payload: Record<string, unknown>,
) => {
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null || value === "") continue;

    if (value instanceof File) {
      formData.append(candidateFileFieldNames[key] ?? key, value);
      continue;
    }

    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      continue;
    }

    formData.append(key, String(value));
  }
};

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
    if (hasCandidateFile(payload)) {
      const formData = new FormData();
      appendPayloadToFormData(formData, payload);

      const response = await apiClient.patch<ApiResponse<CandidateProfile>>(
        "/candidates/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data.data;
    }

    const response = await apiClient.patch<ApiResponse<CandidateProfile>>(
      "/candidates/profile",
      payload,
    );

    return response.data.data;
  },
};
