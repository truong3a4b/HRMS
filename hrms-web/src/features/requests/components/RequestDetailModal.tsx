import { Modal } from "antd";
import { CheckCircle2, XCircle } from "lucide-react";
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
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
  CANCELLED: "bg-slate-100 text-slate-700",
  FAILED: "bg-rose-50 text-rose-700",
};

const typeLabel: Record<RequestType, string> = {
  LEAVE: "Nghỉ phép",
  ATTENDANCE_CORRECTION: "Bổ sung chấm công",
  OVERTIME: "Tăng ca",
  SCHEDULE_APPROVAL: "Duyệt lịch",
  TERMINATION: "Nghỉ việc",
};

const approvalLabel: Record<RequestApprovalStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const finalStatuses = new Set<RequestStatus>([
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "FAILED",
]);

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-[#667085]">{label}</div>
      <div className="mt-1 text-sm font-medium text-[#243247]">{value}</div>
    </div>
  );
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
    <Modal open={open} title={null} onCancel={onClose} footer={null} width={860} centered>
      {!request ? (
        <div className="grid min-h-48 place-items-center text-sm text-[#667085]">
          Đang tải chi tiết...
        </div>
      ) : (
        <div className="grid gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf0f5] pb-4">
            <div>
              <div className="text-xl font-bold text-[#243247]">{request.title}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={request.status} />
                <span className="rounded-full bg-[#f0f7ff] px-2.5 py-1 text-xs font-semibold text-[#006fd5]">
                  {typeLabel[request.type]}
                </span>
              </div>
            </div>
          </div>

          <section className="grid grid-cols-3 gap-4 max-[760px]:grid-cols-1">
            <InfoRow label="Người gửi" value={request.requester?.email ?? "-"} />
            <InfoRow label="Ngày tạo" value={formatDateTime(request.createdAt)} />
            <InfoRow label="Chế độ duyệt" value={request.approvalMode === "SEQUENTIAL" ? "Tuần tự" : "Song song"} />
          </section>

          {request.description ? (
            <section>
              <div className="text-sm font-bold text-[#243247]">Mô tả</div>
              <div className="mt-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-sm text-[#344054]">
                {request.description}
              </div>
            </section>
          ) : null}

          {request.leaveRequest ? (
            <section className="grid gap-3 rounded-lg border border-[#e2e8f0] p-4">
              <div className="text-sm font-bold text-[#243247]">Chi tiết nghỉ phép</div>
              <div className="grid grid-cols-3 gap-4 max-[760px]:grid-cols-1">
                <InfoRow label="Từ ngày" value={formatDate(request.leaveRequest.startDate)} />
                <InfoRow label="Đến ngày" value={formatDate(request.leaveRequest.endDate)} />
                <InfoRow label="Loại nghỉ" value={request.leaveRequest.leaveType} />
              </div>
              {request.leaveRequest.reason ? (
                <div className="text-sm text-[#344054]">{request.leaveRequest.reason}</div>
              ) : null}
            </section>
          ) : null}

          <section>
            <div className="mb-3 text-sm font-bold text-[#243247]">Tiến trình duyệt</div>
            <div className="grid gap-3">
              {request.approvals.map((approval) => (
                <div className="rounded-lg border border-[#e2e8f0] p-3" key={approval.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-[#243247]">
                        {approval.approver?.email ?? approval.approverId}
                      </div>
                      <div className="text-xs text-[#667085]">Bước {approval.stepOrder}</div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {approvalLabel[approval.status]}
                    </span>
                  </div>
                  {approval.note ? <div className="mt-2 text-sm text-[#344054]">{approval.note}</div> : null}
                  {approval.decidedAt ? (
                    <div className="mt-1 text-xs text-[#667085]">{formatDateTime(approval.decidedAt)}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {request.watchers.length ? (
            <section>
              <div className="mb-2 text-sm font-bold text-[#243247]">Người theo dõi</div>
              <div className="flex flex-wrap gap-2">
                {request.watchers.map((watcher) => (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700" key={watcher.id}>
                    {watcher.user?.email ?? watcher.userId}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {(canDecide || canCancel) ? (
            <section className="grid gap-3 border-t border-[#edf0f5] pt-4">
              {canDecide ? (
                <textarea
                  className="min-h-20 w-full rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm outline-none focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
                  placeholder="Ghi chú duyệt/từ chối"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              ) : null}
              <div className="flex flex-wrap justify-end gap-2">
                {canCancel ? (
                  <button className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700" disabled={submitting} type="button" onClick={runCancel}>
                    <XCircle className="h-4 w-4" />
                    Hủy yêu cầu
                  </button>
                ) : null}
                {canDecide ? (
                  <>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700" disabled={submitting} type="button" onClick={() => void runDecision("REJECTED")}>
                      <XCircle className="h-4 w-4" />
                      Từ chối
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white!" disabled={submitting} type="button" onClick={() => void runDecision("APPROVED")}>
                      <CheckCircle2 className="h-4 w-4" />
                      Duyệt
                    </button>
                  </>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
