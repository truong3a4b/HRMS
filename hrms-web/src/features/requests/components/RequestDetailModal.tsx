import { Modal } from "antd";
import { CheckCircle2, XCircle, Calendar, FileText, ListChecks, Clock, User, Users, FileQuestion, MessageSquare, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../../auth/services/useAuth";
import type {
  RequestApprovalStatus,
  RequestItem,
  RequestStatus,
  RequestType,
} from "../types/request.types";

const statusLabel: Record<RequestStatus, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
  FAILED: "Thất bại",
};

const statusClass: Record<RequestStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

const typeLabel: Record<RequestType, string> = {
  LEAVE: "Nghỉ phép",
  LATE_EARLY: "Đi muộn/về sớm",
  ATTENDANCE_CORRECTION: "Bổ sung chấm công",
  OVERTIME: "Tăng ca",
  SCHEDULE_APPROVAL: "Duyệt lịch",
  PAYROLL_APPROVAL: "Duyệt kỳ lương",
  BONUS_PENALTY: "Yêu cầu thưởng phạt",
  TERMINATION: "Nghỉ việc",
};

const approvalLabel: Record<RequestApprovalStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const approvalModeLabel = {
  PARALLEL: "Song song",
  SEQUENTIAL: "Tuần tự",
} as const;

const leaveTypeLabel = {
  ANNUAL_LEAVE: "Nghỉ phép năm",
  SICK_LEAVE: "Nghỉ ốm",
  UNPAID_LEAVE: "Nghỉ không lương",
  MATERNITY_LEAVE: "Nghỉ thai sản",
  BEREAVEMENT_LEAVE: "Nghỉ tang chế",
  MARRIAGE_LEAVE: "Nghỉ kết hôn",
  COMPENSATORY_LEAVE: "Nghỉ bù",
  OTHER: "Khác",
  LATE_ARRIVAL: "Đi muộn",
  EARLY_LEAVE: "Về sớm",
} as const;

const lateEarlyTypeLabel = {
  LATE_ARRIVAL: "Đi muộn",
  EARLY_LEAVE: "Về sớm",
} as const;

const payrollPeriodStatusLabel: Record<string, string> = {
  DRAFT: "Nháp",
  WAITING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  CANCELLED: "Đã hủy",
};

const finalStatuses = new Set<RequestStatus>([
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "FAILED",
]);

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatMonth(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
}

function formatCurrency(value?: string | number | null) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${statusClass[status]}`}>
      {status === "APPROVED" && <CheckCircle2 className="h-4 w-4" />}
      {status === "REJECTED" && <XCircle className="h-4 w-4" />}
      {statusLabel[status]}
    </span>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="flex gap-3.5 items-start">
      {Icon && (
        <div className="mt-0.5 rounded-xl bg-white border border-[#edf0f5] p-2 text-[#667085] shadow-sm">
          <Icon className="h-4.5 w-4.5" />
        </div>
      )}
      <div className="flex-1">
        <div className="text-[13px] font-medium text-[#667085]">{label}</div>
        <div className="mt-0.5 text-[15px] font-semibold text-[#243247] break-words">{value}</div>
      </div>
    </div>
  );
}

function userDisplayName(user?: { email?: string; id?: string; employee?: { name: string } | null } | null, fallback?: string) {
  return user?.employee?.name ?? user?.email ?? fallback ?? "-";
}

function workShiftDisplayName(
  shift?: { name?: string | null; startTime?: string | null; endTime?: string | null } | null,
  fallback?: string | null,
) {
  if (!shift) return fallback ?? "-";
  const timeRange = shift.startTime && shift.endTime ? ` (${shift.startTime}-${shift.endTime})` : "";
  return `${shift.name ?? fallback ?? "Ca làm"}${timeRange}`;
}

export function RequestDetailModal({
  open,
  request,
  onClose,
  onDecision,
  onCancelRequest,
}: {
  open: boolean;
  request: RequestItem | null;
  onClose: () => void;
  onDecision: (decision: RequestApprovalStatus, note?: string) => Promise<void>;
  onCancelRequest: () => Promise<void>;
}) {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentApproval = useMemo(
    () =>
      request?.approvals.find(
        (approval) =>
          approval.approverId === user?.id && approval.status === "PENDING",
      ) ?? null,
    [request?.approvals, user?.id],
  );

  const canCancel =
    !!request &&
    request.requesterId === user?.id &&
    !finalStatuses.has(request.status);
  const canDecide = !!currentApproval && !!request && !finalStatuses.has(request.status);

  const runDecision = async (decision: RequestApprovalStatus) => {
    setSubmitting(true);
    try {
      await onDecision(decision, note.trim() || undefined);
      setNote("");
    } finally {
      setSubmitting(false);
    }
  };

  const runCancel = async () => {
    setSubmitting(true);
    try {
      await onCancelRequest();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={null} onCancel={onClose} footer={null} width={860} centered destroyOnClose>
      {!request ? (
        <div className="grid min-h-[300px] place-items-center text-sm font-medium text-[#667085]">
          Đang tải thông tin chi tiết...
        </div>
      ) : (
        <div className="flex max-h-[75vh] flex-col">
          {/* Header */}
          <div className="shrink-0 flex flex-wrap items-start justify-between gap-4 border-b border-[#d0d5dd] pb-5">
            <div>
              <h2 className="text-2xl font-bold text-[#101828]">{request.title || "Yêu cầu chưa có tiêu đề"}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <StatusBadge status={request.status} />
                <span className="rounded-full bg-[#f0f7ff] border border-[#d6e8ff] px-3 py-1 text-sm font-semibold text-[#006fd5]">
                  {typeLabel[request.type]}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600 border border-slate-200">
                  <Clock className="h-4 w-4" />
                  {formatDateTime(request.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pt-6 pr-2 custom-scrollbar">
            <div className="grid lg:grid-cols-3 gap-8 pb-4">
            {/* Left Column (Main content) */}
            <div className="lg:col-span-2 grid content-start gap-8">
              
              <section className="grid grid-cols-2 gap-y-6 gap-x-6 rounded-2xl border border-[#d0d5dd] bg-slate-50 p-6 shadow-[0_4px_20px_rgba(16,24,40,0.05)] max-[640px]:grid-cols-1">
                 <InfoRow label="Người gửi" value={userDisplayName(request.requester, request.requesterId)} icon={User} />
                 <InfoRow label="Chế độ duyệt" value={approvalModeLabel[request.approvalMode]} icon={ListChecks} />
              </section>

              {request.description && (
                <section>
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#243247]">Mô tả chung</h3>
                  </div>
                  <div className="rounded-2xl border border-[#d0d5dd] bg-slate-50 p-5 text-[15px] leading-relaxed text-[#344054] shadow-[0_4px_20px_rgba(16,24,40,0.05)]">
                    {request.description}
                  </div>
                </section>
              )}

              {/* Specific Details */}
              {request.leaveRequest ? (
                <section>
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#243247]">Chi tiết nghỉ phép</h3>
                  </div>
                  <div className="rounded-2xl border border-[#d0d5dd] bg-slate-50 p-5 shadow-[0_4px_20px_rgba(16,24,40,0.05)]">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-6 max-[640px]:grid-cols-1">
                      <InfoRow label="Từ ngày" value={formatDate(request.leaveRequest.startDate)} />
                      <InfoRow label="Đến ngày" value={formatDate(request.leaveRequest.endDate)} />
                      <InfoRow label="Loại nghỉ" value={leaveTypeLabel[request.leaveRequest.leaveType]} />
                      <InfoRow
                        label="Ca nghỉ"
                        value={
                          request.leaveRequest.workShift
                            ? workShiftDisplayName(request.leaveRequest.workShift)
                            : "Nghỉ cả ngày"
                        }
                      />
                    </div>
                    {request.leaveRequest.reason && (
                      <div className="mt-6 flex gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4 text-[15px] text-[#344054]">
                        <MessageSquare className="h-5 w-5 shrink-0 text-[#667085]" />
                        <div>
                          <span className="font-semibold text-[#243247] mr-2">Lý do:</span>
                          {request.leaveRequest.reason}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              ) : null}

              {request.lateEarlyRequest ? (
                <section>
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="rounded-lg bg-orange-50 p-1.5 text-orange-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#243247]">Chi tiết đi muộn/về sớm</h3>
                  </div>
                  <div className="rounded-2xl border border-[#d0d5dd] bg-slate-50 p-5 shadow-[0_4px_20px_rgba(16,24,40,0.05)]">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-6 max-[640px]:grid-cols-1">
                      <InfoRow
                        label="Ngày"
                        value={formatDate(request.lateEarlyRequest.date)}
                      />
                      <InfoRow
                        label="Loại đơn"
                        value={lateEarlyTypeLabel[request.lateEarlyRequest.requestType]}
                      />
                      <InfoRow
                        label="Thời gian bắt đầu làm"
                        value={formatDateTime(request.lateEarlyRequest.startDate)}
                      />
                      <InfoRow
                        label="Thời gian về"
                        value={formatDateTime(request.lateEarlyRequest.endDate)}
                      />
                      <InfoRow
                        label="Ca làm"
                        value={
                          workShiftDisplayName(
                            request.lateEarlyRequest.workShift,
                            request.lateEarlyRequest.workShiftId,
                          )
                        }
                      />
                    </div>
                    {request.lateEarlyRequest.reason && (
                      <div className="mt-6 flex gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4 text-[15px] text-[#344054]">
                        <MessageSquare className="h-5 w-5 shrink-0 text-[#667085]" />
                        <div>
                          <span className="font-semibold text-[#243247] mr-2">Lý do:</span>
                          {request.lateEarlyRequest.reason}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              ) : null}

              {request.attendanceCorrectionRequest ? (
                <section>
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="rounded-lg bg-cyan-50 p-1.5 text-cyan-600">
                      <FileQuestion className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#243247]">Chi tiết bổ sung công</h3>
                  </div>
                  <div className="rounded-2xl border border-[#d0d5dd] bg-slate-50 p-5 shadow-[0_4px_20px_rgba(16,24,40,0.05)]">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-6 max-[640px]:grid-cols-1">
                      <InfoRow
                        label="Ngày"
                        value={formatDate(
                          request.attendanceCorrectionRequest.attendanceDate,
                        )}
                      />
                      <InfoRow
                        label="Số công đề xuất"
                        value={String(
                          request.attendanceCorrectionRequest.addedWorkUnits ?? "-",
                        )}
                      />
                      <InfoRow
                        label="Ca làm"
                        value={workShiftDisplayName(
                          request.attendanceCorrectionRequest.workShift,
                          request.attendanceCorrectionRequest.workShiftId,
                        )}
                      />
                    </div>
                    {request.attendanceCorrectionRequest.reason && (
                      <div className="mt-6 flex gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4 text-[15px] text-[#344054]">
                        <MessageSquare className="h-5 w-5 shrink-0 text-[#667085]" />
                        <div>
                          <span className="font-semibold text-[#243247] mr-2">Lý do:</span>
                          {request.attendanceCorrectionRequest.reason}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              ) : null}

              {request.bonusPenaltyRequest ? (
                <section>
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="rounded-lg bg-violet-50 p-1.5 text-violet-600">
                      <WalletCards className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#243247]">Chi tiết thưởng phạt</h3>
                  </div>
                  <div className="rounded-2xl border border-[#d0d5dd] bg-slate-50 p-5 shadow-[0_4px_20px_rgba(16,24,40,0.05)]">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-6 max-[640px]:grid-cols-1">
                      <InfoRow
                        label="Nhân viên"
                        value={
                          request.bonusPenaltyRequest.employee
                            ? `${request.bonusPenaltyRequest.employee.employeeId} - ${request.bonusPenaltyRequest.employee.name}`
                            : request.bonusPenaltyRequest.employeeId
                        }
                      />
                      <InfoRow
                        label="Kỳ lương"
                        value={formatMonth(request.bonusPenaltyRequest.month)}
                      />
                      <InfoRow
                        label="Loại"
                        value={request.bonusPenaltyRequest.isBonus ? "Thưởng" : "Phạt"}
                      />
                      <InfoRow
                        label="Số tiền"
                        value={formatCurrency(request.bonusPenaltyRequest.amount)}
                      />
                      <InfoRow
                        label="Phiếu đã tạo"
                        value={request.bonusPenaltyRequest.bonusPenaltyId ? "Đã tạo" : "Chưa tạo"}
                      />
                      <InfoRow
                        label="Ngày áp dụng"
                        value={formatDateTime(request.bonusPenaltyRequest.appliedAt)}
                      />
                    </div>
                    <div className="mt-6 flex gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4 text-[15px] text-[#344054]">
                      <MessageSquare className="h-5 w-5 shrink-0 text-[#667085]" />
                      <div>
                        <span className="font-semibold text-[#243247] mr-2">Lý do:</span>
                        {request.bonusPenaltyRequest.reason}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {request.payrollApprovalRequest ? (
                <section>
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
                      <WalletCards className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#243247]">Chi tiết duyệt kỳ lương</h3>
                  </div>
                  <div className="rounded-2xl border border-[#d0d5dd] bg-slate-50 p-5 shadow-[0_4px_20px_rgba(16,24,40,0.05)]">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-6 max-[640px]:grid-cols-1">
                      <InfoRow
                        label="Kỳ lương"
                        value={
                          request.payrollApprovalRequest.period?.name ||
                          `Tháng ${request.payrollApprovalRequest.month}/${request.payrollApprovalRequest.year}`
                        }
                      />
                      <InfoRow
                        label="Trạng thái kỳ"
                        value={
                          request.payrollApprovalRequest.period?.status
                            ? payrollPeriodStatusLabel[request.payrollApprovalRequest.period.status] ??
                              request.payrollApprovalRequest.period.status
                            : "-"
                        }
                      />
                    </div>
                    {request.payrollApprovalRequest.note ? (
                      <div className="mt-6 flex gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4 text-[15px] text-[#344054]">
                        <MessageSquare className="h-5 w-5 shrink-0 text-[#667085]" />
                        <div>
                          <span className="font-semibold text-[#243247] mr-2">Ghi chú:</span>
                          {request.payrollApprovalRequest.note}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {/* Action Area */}
              {(canDecide || canCancel) ? (
                <section className="mt-4 grid gap-4 border-t border-[#d0d5dd] pt-8">
                  {canDecide ? (
                    <div>
                      <div className="mb-2 text-sm font-semibold text-[#344054]">Ghi chú quyết định (tùy chọn)</div>
                      <textarea
                        className="min-h-[100px] w-full rounded-xl border border-[#d0d5dd] px-4 py-3 text-[15px] outline-none transition-all focus:border-[#006fd5] focus:ring-4 focus:ring-[#006fd5]/10 shadow-sm"
                        placeholder="Nhập ghi chú hoặc lý do nếu từ chối..."
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                      />
                    </div>
                  ) : null}
                  
                  <div className="flex flex-wrap justify-end gap-3 mt-2">
                    {canCancel ? (
                      <button className="inline-flex items-center gap-2 rounded-xl border border-[#d0d5dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition-all hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 active:scale-[0.98] shadow-sm" disabled={submitting} type="button" onClick={runCancel}>
                        <XCircle className="h-4.5 w-4.5" />
                        Hủy yêu cầu
                      </button>
                    ) : null}
                    
                    {canDecide ? (
                      <>
                        <button className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-700 transition-all hover:bg-rose-50 active:scale-[0.98] shadow-sm" disabled={submitting} type="button" onClick={() => void runDecision("REJECTED")}>
                          <XCircle className="h-4.5 w-4.5" />
                          Từ chối
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#006fd5] to-[#0055a8] px-6 py-2.5 text-sm font-semibold text-white! shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 [&_*]:!text-white" disabled={submitting} type="button" onClick={() => void runDecision("APPROVED")}>
                          <CheckCircle2 className="h-4.5 w-4.5" />
                          Phê duyệt
                        </button>
                      </>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-1 grid content-start gap-8 lg:border-l lg:border-[#d0d5dd] lg:pl-8 max-lg:pt-8 max-lg:border-t max-lg:border-[#d0d5dd]">
               
               <section>
                 <div className="mb-6 flex items-center gap-2.5">
                   <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
                     <ListChecks className="h-5 w-5" />
                   </div>
                   <h3 className="text-lg font-bold text-[#243247]">Tiến trình duyệt</h3>
                 </div>
                 
                 <div className="relative border-l-2 border-[#d0d5dd] ml-3.5 pl-6 grid gap-6">
                   {/* Creator Step */}
                   <div className="relative">
                     <div className="absolute -left-[35px] top-0.5 grid h-6 w-6 place-items-center rounded-full bg-white border-2 border-[#d0d5dd]">
                       <div className="h-2 w-2 rounded-full bg-[#667085]" />
                     </div>
                     <div className="rounded-xl border border-[#d0d5dd] bg-slate-50 p-4 shadow-sm">
                       <div className="flex flex-col gap-1.5">
                         <div className="font-bold text-[#243247] break-words">
                           {userDisplayName(request.requester, request.requesterId)}
                         </div>
                         <div className="flex flex-wrap items-center justify-between gap-2">
                           <div className="text-[13px] font-medium text-[#667085]">Người tạo đơn</div>
                           <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-700">
                             Đã gửi
                           </span>
                         </div>
                       </div>
                       <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#98a2b3]">
                         <Clock className="h-3 w-3" />
                         {formatDateTime(request.createdAt)}
                       </div>
                     </div>
                   </div>

                   {/* Approvers */}
                   {request.approvals.map((approval) => (
                     <div className="relative" key={approval.id}>
                       <div className="absolute -left-[35px] top-0.5 grid h-6 w-6 place-items-center rounded-full bg-white border-2 border-[#d0d5dd]">
                         {approval.status === "APPROVED" ? (
                           <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-white rounded-full" />
                         ) : approval.status === "REJECTED" ? (
                           <XCircle className="h-5 w-5 text-rose-500 bg-white rounded-full" />
                         ) : (
                           <div className="h-2 w-2 rounded-full bg-blue-500" />
                         )}
                       </div>
                       <div className={`rounded-xl border p-4 transition-all ${
                          approval.status === "APPROVED" ? "border-emerald-200 bg-emerald-50/30" :
                          approval.status === "REJECTED" ? "border-rose-200 bg-rose-50/30" :
                          "border-[#d0d5dd] bg-white shadow-sm"
                       }`}>
                         <div className="flex flex-col gap-1.5">
                           <div className="font-bold text-[#243247] break-words">
                             {userDisplayName(approval.approver, approval.approverId)}
                           </div>
                           <div className="flex flex-wrap items-center justify-between gap-2">
                             <div className="text-[13px] font-medium text-[#667085]">
                               {request.approvalMode === "SEQUENTIAL" ? `Bước ${approval.stepOrder}` : "Người duyệt"}
                             </div>
                             <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                                approval.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                                approval.status === "REJECTED" ? "bg-rose-100 text-rose-700" :
                                "bg-amber-100 text-amber-700"
                             }`}>
                               {approvalLabel[approval.status]}
                             </span>
                           </div>
                         </div>
                         {approval.note && (
                           <div className="mt-3 rounded-lg bg-white/60 p-2.5 text-[13px] text-[#344054] border border-black/5">
                             <span className="font-semibold text-[#667085] mr-1.5">Ghi chú:</span>
                             {approval.note}
                           </div>
                         )}
                         {approval.decidedAt && (
                           <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#98a2b3]">
                             <Clock className="h-3 w-3" />
                             {formatDateTime(approval.decidedAt)}
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               </section>

               {request.watchers.length > 0 && (
                 <section>
                   <div className="mb-4 flex items-center gap-2.5">
                     <div className="rounded-lg bg-slate-100 p-1.5 text-slate-600">
                       <Users className="h-5 w-5" />
                     </div>
                     <h3 className="text-lg font-bold text-[#243247]">Người theo dõi</h3>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {request.watchers.map((watcher) => (
                       <div className="flex items-center gap-2 rounded-xl border border-[#d0d5dd] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.03)]" key={watcher.id}>
                         <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f0f7ff] text-[10px] font-bold text-[#006fd5]">
                           {userDisplayName(watcher.user, watcher.userId).charAt(0).toUpperCase()}
                         </div>
                         <span className="text-[13px] font-medium text-[#344054]">
                           {userDisplayName(watcher.user, watcher.userId)}
                         </span>
                       </div>
                     ))}
                   </div>
                 </section>
               )}

            </div>
          </div>
        </div>
      </div>
      )}
    </Modal>
  );
}
