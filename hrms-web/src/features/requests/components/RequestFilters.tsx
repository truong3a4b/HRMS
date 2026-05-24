import { RefreshCcw, Search } from "lucide-react";
import type { RequestStatus, RequestType } from "../types/request.types";

const statusLabels: Record<RequestStatus, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
  FAILED: "Thất bại",
};

const typeLabels: Record<RequestType, string> = {
  LEAVE: "Nghỉ phép",
  LATE_EARLY: "Đi muộn/về sớm",
  ATTENDANCE_CORRECTION: "Bổ sung chấm công",
  OVERTIME: "Tăng ca",
  SCHEDULE_APPROVAL: "Duyệt lịch",
  PAYROLL_APPROVAL: "Duyệt kỳ lương",
  TERMINATION: "Nghỉ việc",
};

type RequestFiltersProps = {
  searchTerm: string;
  status: RequestStatus | "";
  type: RequestType | "";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: RequestStatus | "") => void;
  onTypeChange: (value: RequestType | "") => void;
  onRefresh: () => void;
  children?: React.ReactNode;
};

const filterFieldClass =
  "min-w-[170px] rounded-xl border border-[#d0d5dd] bg-white px-3.5 py-2.5 text-sm text-[#344054] shadow-sm transition-all focus:border-[#006fd5] focus:outline-none focus:ring-4 focus:ring-[#006fd5]/10 hover:border-[#98a2b3]";

export function RequestFilters({
  searchTerm,
  status,
  type,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onRefresh,
  children,
}: RequestFiltersProps) {
  return (
    <div className="flex gap-3 overflow-x-auto rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(16,24,40,0.06)] border border-[#d0d5dd] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d0d5dd]">
      {children}
      <div className="relative min-w-[240px] flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#667085]" />
        <input
          className="w-full rounded-xl border border-[#d0d5dd] bg-white py-2.5 pl-10 pr-4 text-sm text-[#344054] shadow-sm transition-all placeholder-[#98a2b3] focus:border-[#006fd5] focus:outline-none focus:ring-4 focus:ring-[#006fd5]/10 hover:border-[#98a2b3]"
          value={searchTerm}
          placeholder="Tìm theo tiêu đề, mô tả..."
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <select
        className={filterFieldClass}
        value={status}
        onChange={(event) => onStatusChange(event.target.value as RequestStatus | "")}
      >
        <option value="">Tất cả trạng thái</option>
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        className={filterFieldClass}
        value={type}
        onChange={(event) => onTypeChange(event.target.value as RequestType | "")}
      >
        <option value="">Tất cả loại yêu cầu</option>
        {Object.entries(typeLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button
        className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-[#d0d5dd] bg-white text-[#667085] shadow-sm transition-all hover:bg-[#f9fafb] hover:text-[#344054] active:scale-95"
        type="button"
        title="Tải lại"
        onClick={onRefresh}
      >
        <RefreshCcw className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
