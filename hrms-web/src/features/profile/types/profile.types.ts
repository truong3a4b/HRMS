import type { Employee } from "../../employees/types/employee.types";

export type CandidateProfile = {
  id: string;
  userId: string;
  fullName?: string | null;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  address?: string | null;
  avatar?: string | null;
  cvUrl?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  religion?: string | null;
  bankAccount?: string | null;
  bank?: Record<string, unknown> | null;
  identityCardNumber?: string | null;
  identityCardIssueDate?: string | null;
  frontIdentityCardImage?: string | null;
  backIdentityCardImage?: string | null;
  province?: Record<string, unknown> | null;
  ward?: Record<string, unknown> | null;
  employee?: Employee | null;
  applications?: Array<{
    id: string;
    status: string;
    appliedAt: string;
    updatedAt?: string;
    recruitmentJob?: {
      id: string;
      title: string;
      status?: string;
      deadline?: string | null;
    } | null;
    position?: {
      id: string;
      name: string;
      code?: string | null;
    } | null;
    department?: {
      id: string;
      name: string;
      code?: string | null;
    } | null;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

export type CandidateProfilePayload = {
  fullName?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  address?: string | null;
  avatar?: string | null;
  cvUrl?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  religion?: string | null;
  bankAccount?: string | null;
  bank?: Record<string, unknown> | null;
  identityCardNumber?: string | null;
  identityCardIssueDate?: string | null;
  frontIdentityCardImage?: string | null;
  backIdentityCardImage?: string | null;
  province?: Record<string, unknown> | null;
  ward?: Record<string, unknown> | null;
};
