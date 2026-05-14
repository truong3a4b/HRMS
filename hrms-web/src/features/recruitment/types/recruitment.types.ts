import type { EmployeeOption } from "../../employees/types/employee.types";

export type RecruitmentJobStatus = "OPEN" | "CLOSED" | "CANCELLED";

export type JobApplicationStatus =
  | "APPLIED"
  | "INTERVIEWING"
  | "OFFER_SENT"
  | "OFFER_DECLINED"
  | "REJECTED"
  | "CANCELLED"
  | "ONBOARDED";

export type InterviewScheduleStatus = "INVITED" | "CONFIRMED" | "DECLINED";

export type OfferStatus = "SENT" | "ACCEPTED" | "DECLINED";

export type RecruitmentMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RecruitmentJob = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  salaryMin?: string | number | null;
  salaryMax?: string | number | null;
  quantity: number;
  deadline?: string | null;
  status: RecruitmentJobStatus;
  applied?: boolean;
  position?: EmployeeOption | null;
  department?: EmployeeOption | null;
  positionId?: string;
  departmentId?: string;
};

export type RecruitmentJobPayload = {
  positionId: string;
  departmentId: string;
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  salaryMin: number;
  salaryMax: number;
  quantity: number;
  deadline: string;
  status?: RecruitmentJobStatus;
};

export type RecruitmentJobFilters = {
  page: number;
  limit: number;
  search?: string;
  positionId?: string;
  departmentId?: string;
};

export type RecruitmentJobListData = {
  items: RecruitmentJob[];
  meta: RecruitmentMeta;
};

export type CandidateSnapshot = {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  cvUrl?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
};

export type InterviewSchedule = {
  id: string;
  title: string;
  scheduledAt: string;
  type: string;
  location?: string | null;
  status: InterviewScheduleStatus;
};

export type InterviewEvaluation = {
  id: string;
  jobApplicationId?: string | null;
  evaluatorEmployeeId?: string | null;
  title: string;
  score?: number | null;
  strengths?: string | null;
  concerns?: string | null;
  recommendation?: string | null;
  comments?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  evaluator?: {
    id: string;
    employeeId?: string | null;
    name: string;
    email: string;
    status?: string;
  } | null;
};

export type Offer = {
  id: string;
  departmentId?: string | null;
  proposedSalary?: string | number | null;
  proposedHireDate?: string | null;
  notes?: string | null;
  candidateNote?: string | null;
  status: OfferStatus;
  createdAt?: string;
};

export type JobApplication = {
  id: string;
  status: JobApplicationStatus;
  appliedAt: string;
  updatedAt?: string | null;
  cancelledAt?: string | null;
  rejectedAt?: string | null;
  onboardedAt?: string | null;
  candidateId?: string | null;
  candidateAvatar?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  candidatePhone?: string | null;
  candidateCvUrl?: string | null;
  coverLetter?: string | null;
  notes?: string | null;
  position?: EmployeeOption | null;
  department?: EmployeeOption | null;
  recruitmentJob?: RecruitmentJob | null;
  interviewSchedules?: InterviewSchedule[];
  evaluations?: InterviewEvaluation[];
  offers?: Offer[];
};

export type JobApplicationFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: JobApplicationStatus;
  positionId?: string;
  recruitmentJobId?: string;
};

export type JobApplicationListData = {
  items: JobApplication[];
  meta?: RecruitmentMeta;
};

export type ApplyJobPayload = {
  recruitmentJobId: string;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  cvUrl?: string;
  cvFile?: File;
  coverLetter?: string;
  notes?: string;
};

export type InterviewPayload = {
  title: string;
  scheduledAt: string;
  type: string;
  location?: string;
  interviewerNotes?: string;
};

export type EvaluationPayload = {
  title: string;
  score?: number;
  strengths?: string;
  concerns?: string;
  recommendation?: string;
  comments?: string;
};

export type OfferPayload = {
  departmentId: string;
  proposedSalary: number;
  proposedHireDate: string;
  notes?: string;
};
