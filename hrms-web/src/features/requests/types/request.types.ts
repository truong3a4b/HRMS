import type { WorkShift } from "../../work-shifts/types/workShift.types";

export type RequestStatus =
  | "PENDING"
  | "PROCESSING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "FAILED";

export type RequestType =
  | "LEAVE"
  | "LATE_EARLY"
  | "ATTENDANCE_CORRECTION"
  | "OVERTIME"
  | "SCHEDULE_APPROVAL"
  | "TERMINATION";

export type ApprovalMode = "PARALLEL" | "SEQUENTIAL";

export type RequestApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LeaveType =
  | "ANNUAL_LEAVE"
  | "SICK_LEAVE"
  | "UNPAID_LEAVE"
  | "MATERNITY_LEAVE"
  | "BEREAVEMENT_LEAVE"
  | "MARRIAGE_LEAVE"
  | "COMPENSATORY_LEAVE"
  | "OTHER"
  | "LATE_ARRIVAL"
  | "EARLY_LEAVE";

export type RequestUser = {
  id: string;
  email: string;
  role: string;
};

export type RequestApproval = {
  id: string;
  requestId: string;
  approverId: string;
  stepOrder: number;
  status: RequestApprovalStatus;
  note?: string | null;
  decidedAt?: string | null;
  approver?: RequestUser | null;
};

export type RequestWatcher = {
  id: string;
  requestId: string;
  userId: string;
  user?: RequestUser | null;
};

export type LeaveRequestDetail = {
  id: string;
  requestId: string;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  workShiftId?: string | null;
  workShift?: WorkShift | null;
  reason?: string | null;
};

export type AttendanceCorrectionRequestDetail = {
  id: string;
  requestId: string;
  employeeId: string;
  attendanceDate: string;
  workShiftId: string;
  addedWorkUnits?: string | number | null;
  reason?: string | null;
};

export type LateEarlyRequestDetail = {
  id: string;
  requestId: string;
  employeeId: string;
  date: string;
  requestType: "LATE_ARRIVAL" | "EARLY_LEAVE";
  workShiftId: string;
  workShift?: WorkShift | null;
  startDate: string;
  endDate: string;
  reason: string;
  appliedAt?: string | null;
};

export type WorkScheduleRequestDetail = {
  id: string;
  requestId: string;
  employeeId: string;
  month: number;
  year: number;
  note?: string | null;
};

export type RequestItem = {
  id: string;
  type: RequestType;
  title: string;
  description?: string | null;
  status: RequestStatus;
  approvalMode: ApprovalMode;
  requesterId: string;
  requester?: RequestUser | null;
  approvals: RequestApproval[];
  watchers: RequestWatcher[];
  leaveRequest?: LeaveRequestDetail | null;
  lateEarlyRequest?: LateEarlyRequestDetail | null;
  attendanceCorrectionRequest?: AttendanceCorrectionRequestDetail | null;
  workScheduleRequest?: WorkScheduleRequestDetail | null;
  currentStep?: number | null;
  processingAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RequestListResponse = {
  items: RequestItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type RequestListFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: RequestStatus | "";
  type?: RequestType | "";
};

export type CreateLeaveRequestPayload = {
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  workShiftId?: string;
  reason: string;
  title: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

export type CreateLateEarlyRequestPayload = {
  date: string;
  type: "LATE_ARRIVAL" | "EARLY_LEAVE";
  workShiftId: string;
  startTime: string;
  endTime: string;
  reason: string;
  title: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

export type CreateAttendanceCorrectionRequestPayload = {
  attendanceDate: string;
  workShiftId: string;
  reason: string;
  title: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

export type RequestDecisionPayload = {
  decision: RequestApprovalStatus;
  note?: string;
};
