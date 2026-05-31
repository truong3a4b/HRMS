import type { ReactNode } from "react";
import type {
  JobApplication,
  JobApplicationStatus,
  RecruitmentJob,
  RecruitmentJobStatus,
} from "../types/recruitment.types";

export const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";

export const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

export const statusLabels: Record<JobApplicationStatus, string> = {
  APPLIED: "Đã ứng tuyển",
  INTERVIEWING: "Đang xét duyệt",
  OFFER_SENT: "Đã gửi offer",
  OFFER_DECLINED: "Từ chối offer",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã hủy",
  ONBOARDED: "Đã onboard",
};

export const jobStatusLabels: Record<RecruitmentJobStatus, string> = {
  OPEN: "Đang mở",
  CLOSED: "Đã đóng",
  CANCELLED: "Đã hủy",
};

const applicationStatusClass: Record<JobApplicationStatus, string> = {
  APPLIED: "bg-[#eff6ff] text-[#1d4ed8]",
  INTERVIEWING: "bg-[#fff7ed] text-[#c2410c]",
  OFFER_SENT: "bg-[#ecfdf5] text-[#047857]",
  OFFER_DECLINED: "bg-[#fef2f2] text-[#b42318]",
  REJECTED: "bg-[#fef2f2] text-[#b42318]",
  CANCELLED: "bg-[#f1f5f9] text-[#475569]",
  ONBOARDED: "bg-[#ecfdf5] text-[#047857]",
};

const jobStatusClass: Record<RecruitmentJobStatus, string> = {
  OPEN: "bg-[#ecfdf5] text-[#047857]",
  CLOSED: "bg-[#f1f5f9] text-[#475569]",
  CANCELLED: "bg-[#fef2f2] text-[#b42318]",
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string; errors?: unknown };

    if (data.message) {
      return data.message;
    }
  }

  return fallback;
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(value?: string | null) {
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

export function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export function formatMoney(value?: string | number | null) {
  if (value == null || value === "") {
    return "-";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function salaryText(job: RecruitmentJob) {
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${formatMoney(job.salaryMin)} - ${formatMoney(job.salaryMax)}`;
  }

  if (job.salaryMin != null) {
    return `Từ ${formatMoney(job.salaryMin)}`;
  }

  if (job.salaryMax != null) {
    return `Đến ${formatMoney(job.salaryMax)}`;
  }

  return "Thỏa thuận";
}

export function applicationCandidate(application: JobApplication) {
  return {
    name: application.candidateName || "Ứng viên",
    email: application.candidateEmail || "-",
    phone: application.candidatePhone || null,
    avatar: application.candidateAvatar || null,
    cvUrl: application.candidateCvUrl || null,
  };
}

export function ApplicationStatusBadge({
  status,
}: {
  status: JobApplicationStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${applicationStatusClass[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function JobStatusBadge({ status }: { status: RecruitmentJobStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${jobStatusClass[status]}`}
    >
      {jobStatusLabels[status]}
    </span>
  );
}

export function DetailCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#edf0f5] bg-white p-4">
      <h3 className="mb-3 text-base font-bold text-[#243247]">{title}</h3>
      {children}
    </section>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-3 border-b border-[#edf0f5] py-2 text-sm last:border-b-0 max-[560px]:grid-cols-1 max-[560px]:gap-1">
      <span className="text-[#667085]">{label}</span>
      <strong className="font-semibold text-[#344054]">{value || "-"}</strong>
    </div>
  );
}
