import { CheckCircle2, Eye, XCircle, Inbox } from "lucide-react";
import { Pagination } from "antd";
import { RequestStatusBadge } from "./RequestStatusBadge";
import type { RequestItem, RequestType, RequestApprovalStatus } from "../types/request.types";

const typeLabels: Record<RequestType, string> = {
  LEAVE: "Nghỉ phép",
  LATE_EARLY: "Đi muộn/về sớm",
  ATTENDANCE_CORRECTION: "Bổ sung chấm công",
  OVERTIME: "Tăng ca",
  SCHEDULE_APPROVAL: "Duyệt lịch",
  PAYROLL_APPROVAL: "Duyệt kỳ lương",
  BONUS_PENALTY: "Yêu cầu thưởng phạt",
  TERMINATION: "Nghỉ việc",
};

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

function requesterLabel(request: RequestItem) {
  return request.requester?.email ?? request.requesterId ?? "-";
}

type RequestTableProps = {
  requests: RequestItem[];
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, size: number) => void;
  onOpenDetail: (request: RequestItem) => void;
  onDecide?: (request: RequestItem, decision: RequestApprovalStatus) => void;
  onCancel?: (request: RequestItem) => void;
  canDecide?: (request: RequestItem) => boolean;
  canCancel?: (request: RequestItem) => boolean;
};

export function RequestTable({
  requests,
  isLoading,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onOpenDetail,
  onDecide,
  onCancel,
  canDecide = () => false,
  canCancel = () => false,
}: RequestTableProps) {
  const rowOffset = (currentPage - 1) * pageSize;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#d0d5dd] bg-white shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
      {isLoading ? (
        <div className="flex h-full items-center justify-center py-16 text-[#667085]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#006fd5] border-r-transparent"></div>
            <p className="text-sm font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex h-full items-center justify-center py-16 text-[#667085]">
          <div className="flex flex-col items-center gap-3 opacity-60">
            <Inbox className="h-12 w-12 text-[#98a2b3]" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[#667085]">Không có yêu cầu nào</p>
          </div>
        </div>
      ) : (
        <div className="min-h-0 min-w-0 flex-1 overflow-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#d0d5dd] bg-[#f9fafb]/90 backdrop-blur-md">
                <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                  #
                </th>
                <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                  Yêu cầu
                </th>
                <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                  Người gửi
                </th>
                <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-5 py-3.5 text-center text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d5dd]">
              {requests.map((request, index) => {
                const decidable = canDecide(request);
                const cancelable = canCancel(request);

                return (
                  <tr
                    className="group transition-colors hover:bg-[#f8faff]"
                    key={request.id}
                  >
                    <td className="px-5 py-4 text-sm text-[#667085]">
                      {rowOffset + index + 1}
                    </td>
                    <td className="px-5 py-4">
                      <strong className="block max-w-[280px] truncate text-sm font-semibold text-[#243247] group-hover:text-[#006fd5] transition-colors">
                        {request.title}
                      </strong>
                      <span className="line-clamp-1 text-xs text-[#667085] mt-0.5">
                        {request.description || "Không có mô tả"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#344054]">
                      {requesterLabel(request)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md bg-[#f2f4f7] px-2 py-1 text-xs font-medium text-[#344054]">
                        {typeLabels[request.type] || request.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#344054]">
                      {formatDateTime(request.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <RequestStatusBadge status={request.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-[#006fd5] transition-all hover:bg-[#006fd5] hover:text-white hover:shadow-md hover:shadow-blue-500/20 active:scale-95"
                          type="button"
                          title="Xem chi tiết"
                          onClick={() => onOpenDetail(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {decidable && onDecide ? (
                          <>
                            <button
                              className="grid h-8 w-8 place-items-center rounded-lg bg-[#ecfdf3] text-[#027a48] transition-all hover:bg-[#027a48] hover:text-white hover:shadow-md hover:shadow-emerald-500/20 active:scale-95"
                              type="button"
                              title="Duyệt"
                              onClick={() => onDecide(request, "APPROVED")}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              className="grid h-8 w-8 place-items-center rounded-lg bg-[#fef3f2] text-[#b42318] transition-all hover:bg-[#b42318] hover:text-white hover:shadow-md hover:shadow-rose-500/20 active:scale-95"
                              type="button"
                              title="Từ chối"
                              onClick={() => onDecide(request, "REJECTED")}
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        ) : null}
                        {cancelable && onCancel ? (
                          <button
                            className="grid h-8 w-8 place-items-center rounded-lg border border-[#fecdca] bg-white text-[#b42318] transition-all hover:bg-[#b42318] hover:text-white hover:shadow-md hover:shadow-rose-500/20 active:scale-95"
                            type="button"
                            title="Hủy yêu cầu"
                            onClick={() => onCancel(request)}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#d0d5dd] bg-[#fcfcfd] px-5 py-3.5 max-[720px]:flex-col max-[720px]:items-stretch">
        <span className="text-sm font-medium text-[#667085]">
          Hiển thị {requests.length === 0 ? 0 : rowOffset + 1}-
          {Math.min(rowOffset + requests.length, total)} / {total} yêu cầu
        </span>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={[10, 20, 50]}
          onChange={onPageChange}
        />
      </div>
    </section>
  );
}
