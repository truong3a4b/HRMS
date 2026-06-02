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
  | "PAYROLL_APPROVAL"
  | "BONUS_PENALTY"
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
  employee?: {
    id: string;
    employeeId: string;
    name: string;
  } | null;
};

export type RequestEmployeeOption = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
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
  workShift?: WorkShift | null;
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

export type PayrollApprovalRequestDetail = {
  id: string;
  requestId: string;
  periodId: string;
  month: number;
  year: number;
  note?: string | null;
  period?: {
    id: string;
    name?: string | null;
    month: number;
    year: number;
    status: string;
  } | null;
};

export type BonusPenaltyRequestDetail = {
  id: string;
  requestId: string;
  employeeId: string;
  month: string;
  amount: string | number;
  isBonus: boolean;
  reason: string;
  bonusPenaltyId?: string | null;
  appliedAt?: string | null;
  employee?: {
    id: string;
    employeeId: string;
    name: string;
  } | null;
  bonusPenalty?: {
    id: string;
    month: string;
    amount: string | number;
    isBonus: boolean;
    reason?: string | null;
    status: string;
  } | null;
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
  payrollApprovalRequest?: PayrollApprovalRequestDetail | null;
  bonusPenaltyRequest?: BonusPenaltyRequestDetail | null;
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

export type CreateBonusPenaltyRequestPayload = {
  employeeId: string;
  month: string;
  amount: number;
  isBonus: boolean;
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
