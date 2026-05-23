import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Modal, Pagination } from "antd";
import {
  CalendarPlus,
  FileCheck2,
  Gift,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import { useAuth } from "../../auth/services/useAuth";
import { employeeService } from "../../employees/services/employeeService";
import type { EmployeeOption } from "../../employees/types/employee.types";
import {
  ApplicationStatusBadge,
  applicationCandidate,
  DetailCard,
  fieldClass,
  formatDate,
  formatDateTime,
  formatMoney,
  getErrorMessage,
  InfoRow,
  labelClass,
  statusLabels,
} from "../components/recruitmentUi";
import { recruitmentService } from "../services/recruitmentService";
import type {
  EvaluationPayload,
  InterviewEvaluation,
  InterviewPayload,
  InterviewSchedule,
  JobApplication,
  JobApplicationListData,
  JobApplicationStatus,
  OfferPayload,
} from "../types/recruitment.types";

const initialData: JobApplicationListData = {
  items: [],
  meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
};

const statusOptions: Array<{ value: JobApplicationStatus; label: string }> = [
  { value: "APPLIED", label: statusLabels.APPLIED },
  { value: "INTERVIEWING", label: statusLabels.INTERVIEWING },
  { value: "OFFER_SENT", label: statusLabels.OFFER_SENT },
  { value: "OFFER_DECLINED", label: statusLabels.OFFER_DECLINED },
  { value: "REJECTED", label: statusLabels.REJECTED },
  { value: "CANCELLED", label: statusLabels.CANCELLED },
  { value: "ONBOARDED", label: statusLabels.ONBOARDED },
];

const finalStatuses: JobApplicationStatus[] = [
  "REJECTED",
  "CANCELLED",
  "ONBOARDED",
];

function hasPermission(permissions: string[] | undefined, key: string) {
  return permissions?.includes(key) ?? false;
}

function canManageApplications(user: ReturnType<typeof useAuth>["user"]) {
  return (
    user?.role === "ADMIN" ||
    hasPermission(user?.permissions, "RECRUITMENT_MANAGE_APPLICATION")
  );
}

function canSendOffer(user: ReturnType<typeof useAuth>["user"]) {
  return (
    user?.role === "ADMIN" ||
    (hasPermission(user?.permissions, "RECRUITMENT_MANAGE_APPLICATION") &&
      hasPermission(user?.permissions, "RECRUITMENT_APPROVE_DIRECT"))
  );
}

function ActionFormModal({
  open,
  title,
  children,
  error,
  isSubmitting,
  submitText,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  error: string | null;
  isSubmitting: boolean;
  submitText: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      width={620}
      centered
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '8px' } }}
      footer={
        <div className="flex justify-end gap-3 pt-4 border-t border-[#edf0f5]">
          <button
            className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] hover:bg-[#f9fafb]"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! hover:bg-[#0055a8] disabled:opacity-60"
            type="submit"
            form="actionForm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : submitText}
          </button>
        </div>
      }
    >
      <form id="actionForm" onSubmit={onSubmit}>
        {error ? (
          <div className="mb-4 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}
        <div className="grid gap-4">{children}</div>
      </form>
    </Modal>
  );
}

function ApplicationDetailModal({
  open,
  application,
  isCandidate,
  canManage,
  canOffer,
  departments,
  onClose,
  onRefresh,
}: {
  open: boolean;
  application: JobApplication | null;
  isCandidate: boolean;
  canManage: boolean;
  canOffer: boolean;
  departments: EmployeeOption[];
  onClose: () => void;
  onRefresh: () => Promise<void>;
}) {
  const [action, setAction] = useState<
    | "interview"
    | "interviewResponse"
    | "evaluation"
    | "evaluationEdit"
    | "offer"
    | "offerResponse"
    | "evaluationDetail"
    | null
  >(null);
  const [selectedInterview, setSelectedInterview] =
    useState<InterviewSchedule | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<InterviewEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    title: "",
    scheduledAt: "",
    type: "Online",
    location: "",
    interviewerNotes: "",
  });
  const [interviewResponseForm, setInterviewResponseForm] = useState({
    decision: "CONFIRMED" as "CONFIRMED" | "DECLINED",
    note: "",
  });
  const [evaluationForm, setEvaluationForm] = useState({
    title: "",
    score: "",
    strengths: "",
    concerns: "",
    recommendation: "",
    comments: "",
  });
  const [offerForm, setOfferForm] = useState({
    departmentId: "",
    proposedSalary: "",
    proposedHireDate: "",
    notes: "",
  });
  const [offerResponseForm, setOfferResponseForm] = useState({
    decision: "ACCEPTED" as "ACCEPTED" | "DECLINED",
    note: "",
  });
  const [activeTab, setActiveTab] = useState<"info" | "interviews" | "evaluations" | "offer">("info");

  useEffect(() => {
    if (!open) {
      setAction(null);
      setError(null);
    }
  }, [open]);

  if (!application) {
    return (
      <Modal open={open} title="Chi tiết đơn ứng tuyển" footer={null} onCancel={onClose}>
        <div className="py-10 text-center text-[#667085]">Không có dữ liệu</div>
      </Modal>
    );
  }

  const candidate = applicationCandidate(application);
  const isFinal = finalStatuses.includes(application.status);
  const latestOffer = application.offers?.[0];

  const submitAction = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (action === "interview") {
        const payload: InterviewPayload = {
          title: interviewForm.title.trim(),
          scheduledAt: interviewForm.scheduledAt,
          type: interviewForm.type.trim(),
          location: interviewForm.location.trim() || undefined,
          interviewerNotes: interviewForm.interviewerNotes.trim() || undefined,
        };
        await recruitmentService.scheduleInterview(application.id, payload);
      }

      if (action === "interviewResponse" && selectedInterview) {
        await recruitmentService.respondInterview(
          application.id,
          selectedInterview.id,
          {
            decision: interviewResponseForm.decision,
            note: interviewResponseForm.note.trim() || undefined,
          },
        );
      }

      if (action === "evaluation") {
        const payload: EvaluationPayload = {
          title: evaluationForm.title.trim(),
          score: evaluationForm.score ? Number(evaluationForm.score) : undefined,
          strengths: evaluationForm.strengths.trim() || undefined,
          concerns: evaluationForm.concerns.trim() || undefined,
          recommendation: evaluationForm.recommendation.trim() || undefined,
          comments: evaluationForm.comments.trim() || undefined,
        };
        await recruitmentService.submitEvaluation(application.id, payload);
      }

      if (action === "evaluationEdit" && selectedEvaluation) {
        const payload: EvaluationPayload = {
          title: evaluationForm.title.trim(),
          score: evaluationForm.score ? Number(evaluationForm.score) : undefined,
          strengths: evaluationForm.strengths.trim() || undefined,
          concerns: evaluationForm.concerns.trim() || undefined,
          recommendation: evaluationForm.recommendation.trim() || undefined,
          comments: evaluationForm.comments.trim() || undefined,
        };
        await recruitmentService.updateEvaluation(
          application.id,
          selectedEvaluation.id,
          payload,
        );
      }

      if (action === "offer") {
        const payload: OfferPayload = {
          departmentId: offerForm.departmentId,
          proposedSalary: Number(offerForm.proposedSalary),
          proposedHireDate: offerForm.proposedHireDate,
          notes: offerForm.notes.trim() || undefined,
        };
        await recruitmentService.sendOffer(application.id, payload);
      }

      if (action === "offerResponse") {
        await recruitmentService.respondOffer(application.id, {
          decision: offerResponseForm.decision,
          note: offerResponseForm.note.trim() || undefined,
        });
      }

      setAction(null);
      await onRefresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể thực hiện thao tác"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        title="Chi tiết đơn ứng tuyển"
        width={1100}
        onCancel={onClose}
        centered
        styles={{ body: { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: '8px' } }}
        footer={null}
      >
        <div className="mt-4 flex items-start gap-6 max-[900px]:flex-col">
          <aside className="sticky top-0 w-[320px] shrink-0 max-[900px]:static max-[900px]:w-full grid gap-4 content-start">
            <div className="rounded-2xl border border-[#d0d5dd] bg-white p-6 text-center shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
              <div className="relative mx-auto mb-4 h-20 w-20">
                <Avatar
                  src={candidate.avatar}
                  alt={candidate.name}
                  sizeClass="h-20 w-20"
                  className="ring-4 ring-[#f9fafb]"
                />
              </div>
              <div className="mb-2">
                <ApplicationStatusBadge status={application.status} />
              </div>
              <h3 className="mb-1 text-lg font-bold text-[#101828] break-words w-full">{candidate.name}</h3>
              <div className="flex flex-col items-center gap-1.5 text-sm text-[#475467] w-full">
                <span className="truncate w-full">{candidate.email}</span>
                {candidate.phone && <span className="truncate w-full">{candidate.phone}</span>}
              </div>
              
              <div className="mt-6 flex flex-col gap-2">
                {canManage && !isFinal ? (
                  <>
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-[#067647] hover:bg-[#d1fadf] transition-colors"
                      type="button"
                      onClick={() => setAction("interview")}
                    >
                      <CalendarPlus className="h-4 w-4" />
                      Lên lịch phỏng vấn
                    </button>
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#eef7ff] px-4 py-2 text-sm font-semibold text-[#006fd5] hover:bg-[#d1e9ff] transition-colors"
                      type="button"
                      onClick={() => setAction("evaluation")}
                    >
                      <FileCheck2 className="h-4 w-4" />
                      Thêm đánh giá
                    </button>
                    {canOffer ? (
                      <button
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0055a8] transition-colors"
                        type="button"
                        onClick={() => setAction("offer")}
                      >
                        <Gift className="h-4 w-4" />
                        Gửi offer
                      </button>
                    ) : null}
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#fef3f2] px-4 py-2 text-sm font-semibold text-[#b42318] hover:bg-[#fee4e2] transition-colors"
                      type="button"
                      onClick={() =>
                        Modal.confirm({
                          title: "Từ chối ứng viên",
                          content: "Bạn có chắc chắn muốn từ chối ứng viên này?",
                          okText: "Từ chối",
                          cancelText: "Hủy",
                          okButtonProps: { danger: true },
                          onOk: async () => {
                            await recruitmentService.rejectApplication(application.id);
                            await onRefresh();
                          },
                        })
                      }
                    >
                      <XCircle className="h-4 w-4" />
                      Từ chối
                    </button>
                  </>
                ) : null}
                {isCandidate && application.status === "OFFER_SENT" ? (
                  <button
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0055a8] transition-colors"
                    type="button"
                    onClick={() => setAction("offerResponse")}
                  >
                    Phản hồi offer
                  </button>
                ) : null}
                {isCandidate && !isFinal ? (
                  <button
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#fecdca] bg-white px-4 py-2 text-sm font-semibold text-[#b42318] hover:bg-[#fef3f2] transition-colors"
                    type="button"
                    onClick={() =>
                      Modal.confirm({
                        title: "Hủy đơn ứng tuyển",
                        content: "Bạn có chắc chắn muốn hủy đơn ứng tuyển này?",
                        okText: "Hủy đơn",
                        cancelText: "Đóng",
                        okButtonProps: { danger: true },
                        onOk: async () => {
                          await recruitmentService.cancelApplication(application.id);
                          await onRefresh();
                        },
                      })
                    }
                  >
                    Hủy đơn
                  </button>
                ) : null}
              </div>
            </div>
          </aside>

          <section className="grid min-w-0 flex-1 content-start gap-5">
            <div className="flex border-b border-[#d0d5dd] bg-transparent overflow-x-auto">
              <button
                className={`inline-flex min-h-14 shrink-0 items-center justify-center gap-2 border-b-2 px-6 text-sm font-semibold transition-all duration-300 ${
                  activeTab === "info"
                    ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5] shadow-[inset_0_-2px_0_0_#006fd5]"
                    : "border-transparent text-[#667085] hover:bg-slate-50 hover:text-[#344054]"
                }`}
                type="button"
                onClick={() => setActiveTab("info")}
              >
                Hồ sơ
              </button>
              <button
                className={`inline-flex min-h-14 shrink-0 items-center justify-center gap-2 border-b-2 px-6 text-sm font-semibold transition-all duration-300 ${
                  activeTab === "interviews"
                    ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5] shadow-[inset_0_-2px_0_0_#006fd5]"
                    : "border-transparent text-[#667085] hover:bg-slate-50 hover:text-[#344054]"
                }`}
                type="button"
                onClick={() => setActiveTab("interviews")}
              >
                Phỏng vấn
              </button>
              <button
                className={`inline-flex min-h-14 shrink-0 items-center justify-center gap-2 border-b-2 px-6 text-sm font-semibold transition-all duration-300 ${
                  activeTab === "evaluations"
                    ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5] shadow-[inset_0_-2px_0_0_#006fd5]"
                    : "border-transparent text-[#667085] hover:bg-slate-50 hover:text-[#344054]"
                }`}
                type="button"
                onClick={() => setActiveTab("evaluations")}
              >
                Đánh giá
              </button>
              <button
                className={`inline-flex min-h-14 shrink-0 items-center justify-center gap-2 border-b-2 px-6 text-sm font-semibold transition-all duration-300 ${
                  activeTab === "offer"
                    ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5] shadow-[inset_0_-2px_0_0_#006fd5]"
                    : "border-transparent text-[#667085] hover:bg-slate-50 hover:text-[#344054]"
                }`}
                type="button"
                onClick={() => setActiveTab("offer")}
              >
                Offer
              </button>
            </div>

            {activeTab === "info" ? (
              <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <DetailCard title="Thông tin cá nhân & Liên hệ">
                  <InfoRow
                    label="CV"
                    value={
                      candidate.cvUrl ? (
                        <a
                          className="font-medium text-[#006fd5] hover:underline"
                          href={candidate.cvUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Xem CV đính kèm
                        </a>
                      ) : (
                        "-"
                      )
                    }
                  />
                  <InfoRow label="Số điện thoại" value={candidate.phone ?? "-"} />
                  <InfoRow label="Email" value={candidate.email ?? "-"} />
                </DetailCard>

                <DetailCard title="Thông tin ứng tuyển">
                  <InfoRow
                    label="Tin tuyển dụng"
                    value={application.recruitmentJob?.title ?? "-"}
                  />
                  <InfoRow label="Chức vụ" value={application.position?.name ?? "-"} />
                  <InfoRow label="Bộ phận" value={application.department?.name ?? "-"} />
                  <InfoRow
                    label="Hạn ứng tuyển"
                    value={formatDate(application.recruitmentJob?.deadline)}
                  />
                  <InfoRow
                    label="Ngày ứng tuyển"
                    value={formatDateTime(application.appliedAt)}
                  />
                  <InfoRow label="Cover letter" value={application.coverLetter ?? "-"} />
                  <InfoRow label="Ghi chú" value={application.notes ?? "-"} />
                </DetailCard>
              </div>
            ) : activeTab === "interviews" ? (
              <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <DetailCard title="Lịch phỏng vấn">
                  {application.interviewSchedules?.length ? (
                    <div className="grid gap-3">
                      {application.interviewSchedules.map((item) => (
                        <div
                          className="flex items-center justify-between gap-3 rounded-xl border border-[#eaecf0] bg-[#f9fafb] p-4 text-sm max-[640px]:flex-col max-[640px]:items-stretch"
                          key={item.id}
                        >
                          <div className="min-w-0">
                            <strong className="block text-base text-[#101828] mb-1">{item.title}</strong>
                            <span className="flex flex-wrap gap-x-3 gap-y-1 text-[#475467]">
                              <span>Lúc: <strong className="text-[#344054]">{formatDateTime(item.scheduledAt)}</strong></span>
                              <span>Hình thức: <strong className="text-[#344054]">{item.type}</strong></span>
                              <span>Tại: <strong className="text-[#344054]">{item.location || "-"}</strong></span>
                              <span>Trạng thái: <strong className="text-[#344054]">{item.status}</strong></span>
                            </span>
                          </div>
                          {isCandidate && item.status === "INVITED" ? (
                            <button
                              className="shrink-0 rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0055a8]"
                              type="button"
                              onClick={() => {
                                setSelectedInterview(item);
                                setInterviewResponseForm({
                                  decision: "CONFIRMED",
                                  note: "",
                                });
                                setAction("interviewResponse");
                              }}
                            >
                              Phản hồi
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#d0d5dd] bg-[#fcfcfd] px-4 py-6 text-center text-sm text-[#667085]">
                      Chưa có lịch phỏng vấn
                    </div>
                  )}
                </DetailCard>
              </div>
            ) : activeTab === "evaluations" ? (
              <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <DetailCard title="Đánh giá từ người phỏng vấn">
                  {application.evaluations?.length ? (
                    <div className="grid gap-3">
                      {application.evaluations.map((item) => (
                        <div
                          className="flex items-center justify-between gap-3 rounded-xl border border-[#eaecf0] bg-[#f9fafb] p-4 text-sm max-[680px]:flex-col max-[680px]:items-stretch"
                          key={item.id}
                        >
                          <div className="min-w-0">
                            <strong className="block text-base text-[#101828] mb-1">{item.title}</strong>
                            <div className="grid gap-1 text-[#475467]">
                              <span>Người đánh giá: <strong className="text-[#344054]">{item.evaluator?.name ?? "-"}</strong></span>
                              <span>Điểm: <strong className="text-[#006fd5]">{item.score ?? "-"} / 10</strong></span>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <button
                              className="rounded-lg border border-[#d0d5dd] bg-white px-3 py-1.5 text-sm font-semibold text-[#344054] hover:bg-slate-50"
                              type="button"
                              onClick={async () => {
                                const detail =
                                  await recruitmentService.getEvaluationById(
                                    application.id,
                                    item.id,
                                  );
                                setSelectedEvaluation(detail);
                                setAction("evaluationDetail");
                              }}
                            >
                              Chi tiết
                            </button>
                            {canManage ? (
                              <>
                                <button
                                  className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-[#067647] hover:bg-[#d1fadf] transition-colors"
                                  type="button"
                                  onClick={async () => {
                                    const detail =
                                      await recruitmentService.getEvaluationById(
                                        application.id,
                                        item.id,
                                      );
                                    setSelectedEvaluation(detail);
                                    setEvaluationForm({
                                      title: detail.title ?? "",
                                      score:
                                        detail.score != null ? String(detail.score) : "",
                                      strengths: detail.strengths ?? "",
                                      concerns: detail.concerns ?? "",
                                      recommendation: detail.recommendation ?? "",
                                      comments: detail.comments ?? "",
                                    });
                                    setAction("evaluationEdit");
                                  }}
                                >
                                  Sửa
                                </button>
                                <button
                                  className="rounded-lg bg-[#fef3f2] px-3 py-1.5 text-sm font-semibold text-[#b42318] hover:bg-[#fee4e2] transition-colors"
                                  type="button"
                                  onClick={() =>
                                    Modal.confirm({
                                      title: "Xóa đánh giá",
                                      content:
                                        "Bạn có chắc chắn muốn xóa đánh giá này?",
                                      okText: "Xóa",
                                      cancelText: "Hủy",
                                      okButtonProps: { danger: true },
                                      onOk: async () => {
                                        await recruitmentService.deleteEvaluation(
                                          application.id,
                                          item.id,
                                        );
                                        await onRefresh();
                                      },
                                    })
                                  }
                                >
                                  Xóa
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#d0d5dd] bg-[#fcfcfd] px-4 py-6 text-center text-sm text-[#667085]">
                      Chưa có đánh giá
                    </div>
                  )}
                </DetailCard>
              </div>
            ) : activeTab === "offer" ? (
              <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <DetailCard title="Đề xuất & Offer">
                  {latestOffer ? (
                    <div className="grid gap-0">
                      <InfoRow label="Trạng thái Offer" value={<span className="font-bold text-[#006fd5]">{latestOffer.status}</span>} />
                      <InfoRow
                        label="Lương đề xuất"
                        value={<span className="text-lg font-bold text-[#067647]">{formatMoney(latestOffer.proposedSalary)}</span>}
                      />
                      <InfoRow
                        label="Ngày vào làm dự kiến"
                        value={formatDate(latestOffer.proposedHireDate)}
                      />
                      <InfoRow label="Ghi chú thêm" value={latestOffer.notes ?? "-"} />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#d0d5dd] bg-[#fcfcfd] px-4 py-6 text-center text-sm text-[#667085]">
                      Chưa có Offer nào được gửi.
                    </div>
                  )}
                </DetailCard>
              </div>
            ) : null}
          </section>
        </div>
      </Modal>

      <ActionFormModal
        open={action === "interview"}
        title="Lên lịch phỏng vấn"
        error={error}
        isSubmitting={isSubmitting}
        submitText="Tạo lịch"
        onClose={() => setAction(null)}
        onSubmit={submitAction}
      >
        <label>
          <span className={labelClass}>Tiêu đề</span>
          <input
            className={fieldClass}
            value={interviewForm.title}
            onChange={(event) =>
              setInterviewForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
        </label>
        <label>
          <span className={labelClass}>Thời gian</span>
          <input
            className={fieldClass}
            type="datetime-local"
            value={interviewForm.scheduledAt}
            onChange={(event) =>
              setInterviewForm((current) => ({
                ...current,
                scheduledAt: event.target.value,
              }))
            }
          />
        </label>
        <label>
          <span className={labelClass}>Hình thức</span>
          <input
            className={fieldClass}
            value={interviewForm.type}
            onChange={(event) =>
              setInterviewForm((current) => ({
                ...current,
                type: event.target.value,
              }))
            }
          />
        </label>
        <label>
          <span className={labelClass}>Địa điểm/link</span>
          <input
            className={fieldClass}
            value={interviewForm.location}
            onChange={(event) =>
              setInterviewForm((current) => ({
                ...current,
                location: event.target.value,
              }))
            }
          />
        </label>
      </ActionFormModal>

      <ActionFormModal
        open={action === "interviewResponse"}
        title={
          selectedInterview
            ? `Phản hồi phỏng vấn: ${selectedInterview.title}`
            : "Phản hồi phỏng vấn"
        }
        error={error}
        isSubmitting={isSubmitting}
        submitText="Gửi phản hồi"
        onClose={() => setAction(null)}
        onSubmit={submitAction}
      >
        <label>
          <span className={labelClass}>Quyết định</span>
          <select
            className={fieldClass}
            value={interviewResponseForm.decision}
            onChange={(event) =>
              setInterviewResponseForm((current) => ({
                ...current,
                decision: event.target.value as "CONFIRMED" | "DECLINED",
              }))
            }
          >
            <option value="CONFIRMED">Xác nhận tham gia</option>
            <option value="DECLINED">Từ chối</option>
          </select>
        </label>
        <label>
          <span className={labelClass}>Ghi chú</span>
          <textarea
            className={`${fieldClass} min-h-20 resize-y`}
            value={interviewResponseForm.note}
            onChange={(event) =>
              setInterviewResponseForm((current) => ({
                ...current,
                note: event.target.value,
              }))
            }
          />
        </label>
      </ActionFormModal>

      <ActionFormModal
        open={action === "evaluation"}
        title="Đánh giá ứng viên"
        error={error}
        isSubmitting={isSubmitting}
        submitText="Lưu đánh giá"
        onClose={() => setAction(null)}
        onSubmit={submitAction}
      >
        <label>
          <span className={labelClass}>Tiêu đề</span>
          <input
            className={fieldClass}
            value={evaluationForm.title}
            onChange={(event) =>
              setEvaluationForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
        </label>
        <label>
          <span className={labelClass}>Điểm</span>
          <input
            className={fieldClass}
            type="number"
            min={1}
            max={10}
            value={evaluationForm.score}
            onChange={(event) =>
              setEvaluationForm((current) => ({
                ...current,
                score: event.target.value,
              }))
            }
          />
        </label>
        {(["strengths", "concerns", "recommendation", "comments"] as const).map(
          (key) => (
            <label key={key}>
              <span className={labelClass}>
                {key === "strengths"
                  ? "Điểm mạnh"
                  : key === "concerns"
                    ? "Điểm cần lưu ý"
                    : key === "recommendation"
                      ? "Đề xuất"
                      : "Nhận xét"}
              </span>
              <textarea
                className={`${fieldClass} min-h-20 resize-y`}
                value={evaluationForm[key]}
                onChange={(event) =>
                  setEvaluationForm((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
              />
            </label>
          ),
        )}
      </ActionFormModal>

      <Modal
        open={action === "evaluationDetail"}
        title="Chi tiết đánh giá"
        footer={null}
        width={680}
        onCancel={() => setAction(null)}
        centered
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '8px' } }}
      >
        {selectedEvaluation ? (
          <div className="grid gap-4">
            <DetailCard title={selectedEvaluation.title || "Đánh giá"}>
              <InfoRow
                label="Người đánh giá"
                value={
                  selectedEvaluation.evaluator
                    ? `${selectedEvaluation.evaluator.name} | ${selectedEvaluation.evaluator.email}`
                    : "-"
                }
              />
              <InfoRow label="Điểm" value={selectedEvaluation.score ?? "-"} />
              <InfoRow
                label="Điểm mạnh"
                value={selectedEvaluation.strengths ?? "-"}
              />
              <InfoRow
                label="Điểm cần lưu ý"
                value={selectedEvaluation.concerns ?? "-"}
              />
              <InfoRow
                label="Đề xuất"
                value={selectedEvaluation.recommendation ?? "-"}
              />
              <InfoRow
                label="Nhận xét"
                value={selectedEvaluation.comments ?? "-"}
              />
              <InfoRow
                label="Ngày tạo"
                value={formatDateTime(selectedEvaluation.createdAt)}
              />
            </DetailCard>
          </div>
        ) : (
          <div className="py-10 text-center text-[#667085]">Không có dữ liệu</div>
        )}
      </Modal>

      <ActionFormModal
        open={action === "evaluationEdit"}
        title="Chỉnh sửa đánh giá"
        error={error}
        isSubmitting={isSubmitting}
        submitText="Lưu thay đổi"
        onClose={() => setAction(null)}
        onSubmit={submitAction}
      >
        <label>
          <span className={labelClass}>Tiêu đề</span>
          <input
            className={fieldClass}
            value={evaluationForm.title}
            onChange={(event) =>
              setEvaluationForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
        </label>
        <label>
          <span className={labelClass}>Điểm</span>
          <input
            className={fieldClass}
            type="number"
            min={1}
            max={10}
            value={evaluationForm.score}
            onChange={(event) =>
              setEvaluationForm((current) => ({
                ...current,
                score: event.target.value,
              }))
            }
          />
        </label>
        {(["strengths", "concerns", "recommendation", "comments"] as const).map(
          (key) => (
            <label key={key}>
              <span className={labelClass}>
                {key === "strengths"
                  ? "Điểm mạnh"
                  : key === "concerns"
                    ? "Điểm cần lưu ý"
                    : key === "recommendation"
                      ? "Đề xuất"
                      : "Nhận xét"}
              </span>
              <textarea
                className={`${fieldClass} min-h-20 resize-y`}
                value={evaluationForm[key]}
                onChange={(event) =>
                  setEvaluationForm((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
              />
            </label>
          ),
        )}
      </ActionFormModal>

      <ActionFormModal
        open={action === "offer"}
        title="Gửi offer"
        error={error}
        isSubmitting={isSubmitting}
        submitText="Gửi offer"
        onClose={() => setAction(null)}
        onSubmit={submitAction}
      >
        <label>
          <span className={labelClass}>Bộ phận nhận việc</span>
          <SearchableSelect
            value={offerForm.departmentId}
            onChange={(value) =>
              setOfferForm((current) => ({
                ...current,
                departmentId: value,
              }))
            }
            options={[
              { value: "", label: "Chọn bộ phận" },
              ...departments.map((department) => ({ value: department.id, label: department.name }))
            ]}
          />
        </label>
        <label>
          <span className={labelClass}>Lương đề xuất</span>
          <input
            className={fieldClass}
            type="number"
            min={0}
            value={offerForm.proposedSalary}
            onChange={(event) =>
              setOfferForm((current) => ({
                ...current,
                proposedSalary: event.target.value,
              }))
            }
          />
        </label>
        <label>
          <span className={labelClass}>Ngày vào làm</span>
          <input
            className={fieldClass}
            type="date"
            value={offerForm.proposedHireDate}
            onChange={(event) =>
              setOfferForm((current) => ({
                ...current,
                proposedHireDate: event.target.value,
              }))
            }
          />
        </label>
        <label>
          <span className={labelClass}>Ghi chú</span>
          <textarea
            className={`${fieldClass} min-h-20 resize-y`}
            value={offerForm.notes}
            onChange={(event) =>
              setOfferForm((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
          />
        </label>
      </ActionFormModal>

      <ActionFormModal
        open={action === "offerResponse"}
        title="Phản hồi offer"
        error={error}
        isSubmitting={isSubmitting}
        submitText="Gửi phản hồi"
        onClose={() => setAction(null)}
        onSubmit={submitAction}
      >
        <label>
          <span className={labelClass}>Quyết định</span>
          <select
            className={fieldClass}
            value={offerResponseForm.decision}
            onChange={(event) =>
              setOfferResponseForm((current) => ({
                ...current,
                decision: event.target.value as "ACCEPTED" | "DECLINED",
              }))
            }
          >
            <option value="ACCEPTED">Chấp nhận</option>
            <option value="DECLINED">Từ chối</option>
          </select>
        </label>
        <label>
          <span className={labelClass}>Ghi chú</span>
          <textarea
            className={`${fieldClass} min-h-20 resize-y`}
            value={offerResponseForm.note}
            onChange={(event) =>
              setOfferResponseForm((current) => ({
                ...current,
                note: event.target.value,
              }))
            }
          />
        </label>
      </ActionFormModal>
    </>
  );
}

export function RecruitmentApplicationListPage({
  mine = false,
}: {
  mine?: boolean;
}) {
  const { user } = useAuth();
  const isCandidate = user?.role === "CANDIDATE";
  const manageApplications = canManageApplications(user);
  const offerAllowed = canSendOffer(user);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<JobApplicationStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [meta, setMeta] = useState(
    initialData.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
  );
  const [departments, setDepartments] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const rowOffset = useMemo(
    () => (currentPage - 1) * pageSize,
    [currentPage, pageSize],
  );

  const loadApplications = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = mine
        ? await recruitmentService.getMyApplications()
        : await recruitmentService.getApplications({
            page: currentPage,
            limit: pageSize,
            search: searchTerm,
            status: status || undefined,
          });

      setApplications(result.items ?? []);
      setMeta(result.meta ?? {
        page: 1,
        limit: result.items?.length ?? 0,
        total: result.items?.length ?? 0,
        totalPages: 1,
      });
    } catch (error) {
      setApplications([]);
      setMeta({ page: 1, limit: 10, total: 0, totalPages: 1 });
      setErrorMessage(
        getErrorMessage(error, "Không tải được danh sách ứng tuyển"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, [currentPage, pageSize, searchTerm, status, mine]);

  useEffect(() => {
    employeeService
      .getDepartments()
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, []);

  const openDetail = async (application: JobApplication) => {
    setSelectedApplication(application);
    setDetailOpen(true);
    try {
      setSelectedApplication(
        await recruitmentService.getApplicationById(application.id, mine),
      );
    } catch {
      setSelectedApplication(application);
    }
  };

  const refreshDetail = async () => {
    if (selectedApplication) {
      setSelectedApplication(
        await recruitmentService.getApplicationById(selectedApplication.id, mine),
      );
    }
    await loadApplications();
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden">
        <div className="flex h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          <div>
            <h1 className="text-2xl font-bold text-[#243247]">
              {mine ? "Đơn ứng tuyển của tôi" : "Danh sách ứng tuyển"}
            </h1>
            <p className="text-sm text-[#667085]">
              {mine
                ? "Theo dõi trạng thái các vị trí bạn đã ứng tuyển"
                : "Quản lý hồ sơ ứng viên trong quy trình tuyển dụng"}
            </p>
          </div>

          {!mine ? (
            <div className="flex gap-3 overflow-x-auto rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d0d5dd]">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" />
                <input
                  className="w-full rounded-lg border border-[#d0d5dd] bg-white py-2 pl-10 pr-4 text-sm text-[#344054] placeholder-[#98a2b3] focus:border-[#006fd5] focus:outline-none focus:ring-2 focus:ring-[#006fd5]/10"
                  value={searchTerm}
                  placeholder="Tìm kiếm ứng viên..."
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <select
                className="min-w-[160px] flex-1 rounded-lg border border-[#d0d5dd] bg-white px-4 py-2 text-sm text-[#344054] focus:border-[#006fd5] focus:outline-none focus:ring-2 focus:ring-[#006fd5]/10"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as JobApplicationStatus | "");
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                {statusOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <button
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#d0d5dd] text-[#344054] hover:bg-[#f9fafb]"
                type="button"
                title="Tải lại"
                onClick={() => void loadApplications()}
              >
                <RefreshCcw className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
              {errorMessage}
            </div>
          ) : null}

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#ebedf2] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-12 text-[#667085]">
                Đang tải dữ liệu...
              </div>
            ) : applications.length === 0 ? (
              <div className="flex h-full items-center justify-center py-12 text-[#667085]">
                {mine
                  ? "Bạn chưa ứng tuyển công việc nào"
                  : "Không có đơn ứng tuyển"}
              </div>
            ) : (
              <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                <table className="w-full min-w-230">
                  <thead className="sticky top-0 z-1">
                    <tr className="border-b border-[#ebedf2] bg-[#f9fafb]">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        {mine ? "Tin tuyển dụng" : "Ứng viên"}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Vị trí
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Ngày ứng tuyển
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-[#344054]">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application, index) => {
                      const candidate = applicationCandidate(application);

                      return (
                        <tr
                          className="border-b border-[#ebedf2] hover:bg-[#f9fafb]"
                          key={application.id}
                        >
                          <td className="px-4 py-3 text-sm text-[#344054]">
                            {rowOffset + index + 1}
                          </td>
                          <td className="px-4 py-3">
                            {mine ? (
                              <div>
                                <strong className="block max-w-80 truncate text-sm text-[#344054]">
                                  {application.recruitmentJob?.title ?? "-"}
                                </strong>
                                <span className="block truncate text-xs text-[#667085]">
                                  {application.department?.name ?? "-"}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <Avatar
                                  src={candidate.avatar}
                                  alt={candidate.name}
                                  sizeClass="h-9 w-9"
                                />
                                <div className="min-w-0">
                                  <strong className="block max-w-64 truncate text-sm text-[#344054]">
                                    {candidate.name}
                                  </strong>
                                  <span className="block truncate text-xs text-[#667085]">
                                    {candidate.email}
                                  </span>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#344054]">
                            {application.position?.name ?? "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#344054]">
                            {formatDate(application.appliedAt)}
                          </td>
                          <td className="px-4 py-3">
                            <ApplicationStatusBadge status={application.status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <button
                                className="rounded-lg bg-[#006fd5] px-3 py-1.5 text-sm font-semibold text-white! hover:bg-[#0055a8]"
                                type="button"
                                onClick={() => void openDetail(application)}
                              >
                                Chi tiết
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#ebedf2] px-4 py-3 max-[720px]:flex-col max-[720px]:items-stretch">
              <span className="text-sm text-[#667085]">
                Hiển thị {applications.length === 0 ? 0 : rowOffset + 1}-
                {Math.min(rowOffset + applications.length, meta.total)} /{" "}
                {meta.total} đơn
              </span>
              {!mine ? (
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={meta.total}
                  showSizeChanger
                  pageSizeOptions={[10, 20, 50]}
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  }}
                />
              ) : null}
            </div>
          </section>
        </div>
      </main>

      <ApplicationDetailModal
        open={detailOpen}
        application={selectedApplication}
        isCandidate={isCandidate || mine}
        canManage={manageApplications && !mine}
        canOffer={offerAllowed && !mine}
        departments={departments}
        onClose={() => setDetailOpen(false)}
        onRefresh={refreshDetail}
      />
    </AppLayout>
  );
}
