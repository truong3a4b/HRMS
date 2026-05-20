import { useEffect, useMemo, useState } from "react";
import { Modal, Pagination } from "antd";
import {
  CheckCircle2,
  Eye,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { useAuth } from "../../auth/services/useAuth";
import { RequestDetailModal } from "../components/RequestDetailModal";
import { requestService } from "../services/requestService";
import type {
  RequestApprovalStatus,
  RequestItem,
  RequestListResponse,
  RequestStatus,
  RequestType,
} from "../types/request.types";

type RequestTab = "mine" | "pending" | "all";

const statusLabels: Record<RequestStatus, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
  FAILED: "Thất bại",
};

const statusClasses: Record<RequestStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
  CANCELLED: "bg-slate-100 text-slate-700",
  FAILED: "bg-rose-50 text-rose-700",
};

const typeLabels: Record<RequestType, string> = {
  LEAVE: "Nghỉ phép",
  ATTENDANCE_CORRECTION: "Bổ sung chấm công",
  OVERTIME: "Tăng ca",
  SCHEDULE_APPROVAL: "Duyệt lịch",
  TERMINATION: "Nghỉ việc",
};

const initialData: RequestListResponse = {
  items: [],
  meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
};

const finalStatuses = new Set<RequestStatus>([
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "FAILED",
]);

const requestTabs: Array<{ key: RequestTab; label: string }> = [
  { key: "mine", label: "Yêu cầu của tôi" },
  { key: "pending", label: "Chờ tôi duyệt" },
  { key: "all", label: "Tất cả yêu cầu" },
];

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string };

    if (data.message) {
      return data.message;
    }
  }

  return fallback;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function requesterLabel(request: RequestItem) {
  return request.requester?.email ?? request.requesterId ?? "-";
}

export function RequestListPage({ defaultTab }: { defaultTab: RequestTab }) {
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const availableTabs = useMemo(
    () => requestTabs.filter((tab) => tab.key !== "all" || isAdmin),
    [isAdmin],
  );
  const [activeTab, setActiveTab] = useState<RequestTab>(
    defaultTab === "all" && !isAdmin ? "mine" : defaultTab,
  );
  const [requests, setRequests] = useState<RequestItem[]>(initialData.items);
  const [meta, setMeta] = useState(initialData.meta);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<RequestStatus | "">("");
  const [type, setType] = useState<RequestType | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const rowOffset = useMemo(
    () => (currentPage - 1) * pageSize,
    [currentPage, pageSize],
  );

  useEffect(() => {
    if (defaultTab === "all" && !isAdmin) {
      setActiveTab("mine");
      return;
    }

    setActiveTab(defaultTab);
  }, [defaultTab, isAdmin]);

  const loadRequests = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const filters = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        status,
        type,
      };
      const result =
        activeTab === "pending"
          ? await requestService.getMyPendingApprovals(filters)
          : activeTab === "all" && isAdmin
            ? await requestService.getAllRequests(filters)
            : await requestService.getMyRequests(filters);

      setRequests(result.items ?? []);
      setMeta(result.meta ?? initialData.meta);
    } catch (error) {
      setRequests([]);
      setMeta(initialData.meta);
      setErrorMessage(
        getErrorMessage(error, "Không tải được danh sách yêu cầu"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, [activeTab, currentPage, pageSize, searchTerm, status, type, isAdmin]);

  const openDetail = async (request: RequestItem) => {
    setSelectedRequest(request);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      setSelectedRequest(await requestService.getRequestById(request.id));
    } catch {
      setSelectedRequest(request);
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshSelectedRequest = async (requestId: string) => {
    try {
      setSelectedRequest(await requestService.getRequestById(requestId));
    } catch {
      setSelectedRequest(null);
    }
  };

  const handleDecision = async (
    request: RequestItem,
    decision: RequestApprovalStatus,
    note?: string,
  ) => {
    const updated = await requestService.decideRequest(request.id, {
      decision,
      note,
    });
    setSelectedRequest(updated);
    await loadRequests();
  };

  const confirmDecision = (
    request: RequestItem,
    decision: RequestApprovalStatus,
  ) => {
    Modal.confirm({
      title: decision === "APPROVED" ? "Duyệt yêu cầu" : "Từ chối yêu cầu",
      content:
        decision === "APPROVED"
          ? "Bạn có chắc chắn muốn duyệt yêu cầu này?"
          : "Bạn có chắc chắn muốn từ chối yêu cầu này?",
      okText: decision === "APPROVED" ? "Duyệt" : "Từ chối",
      cancelText: "Hủy",
      okButtonProps: { danger: decision === "REJECTED" },
      onOk: async () => {
        await handleDecision(request, decision);
      },
    });
  };

  const handleCancelRequest = async (request: RequestItem) => {
    const updated = await requestService.cancelRequest(request.id);
    setSelectedRequest(updated);
    await loadRequests();
  };

  const confirmCancel = (request: RequestItem) => {
    Modal.confirm({
      title: "Hủy yêu cầu",
      content: "Bạn có chắc chắn muốn hủy yêu cầu này?",
      okText: "Hủy yêu cầu",
      cancelText: "Đóng",
      okButtonProps: { danger: true },
      onOk: async () => {
        await handleCancelRequest(request);
      },
    });
  };

  const canCancelRequest = (request: RequestItem) =>
    request.requesterId === user?.id && !finalStatuses.has(request.status);

  const canDecideRequest = (request: RequestItem) =>
    request.approvals.some(
      (approval) =>
        approval.approverId === user?.id && approval.status === "PENDING",
    ) && !finalStatuses.has(request.status);

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden">
        <div className="flex h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          <div>
            <h1 className="text-2xl font-bold text-[#243247]">
              Quản lý yêu cầu
            </h1>
            <p className="text-sm text-[#667085]">
              Theo dõi yêu cầu cá nhân, yêu cầu cần duyệt và toàn bộ yêu cầu
              trong hệ thống
            </p>
          </div>

          <div className="flex flex-wrap gap-2 rounded-lg bg-white p-2 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
            {availableTabs.map((tab) => (
              <button
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#006fd5] text-white!"
                    : "text-[#344054] hover:bg-[#f9fafb]"
                }`}
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3 overflow-x-auto rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d0d5dd]">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" />
              <input
                className="w-full rounded-lg border border-[#d0d5dd] bg-white py-2 pl-10 pr-4 text-sm text-[#344054] placeholder-[#98a2b3] focus:border-[#006fd5] focus:outline-none focus:ring-2 focus:ring-[#006fd5]/10"
                value={searchTerm}
                placeholder="Tìm theo tiêu đề, mô tả..."
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              className="min-w-[160px] rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] focus:border-[#006fd5] focus:outline-none focus:ring-2 focus:ring-[#006fd5]/10"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as RequestStatus | "");
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="min-w-[170px] rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] focus:border-[#006fd5] focus:outline-none focus:ring-2 focus:ring-[#006fd5]/10"
              value={type}
              onChange={(event) => {
                setType(event.target.value as RequestType | "");
                setCurrentPage(1);
              }}
            >
              <option value="">Tất cả loại yêu cầu</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#d0d5dd] text-[#344054] hover:bg-[#f9fafb]"
              type="button"
              title="Tải lại"
              onClick={() => void loadRequests()}
            >
              <RefreshCcw className="h-4.5 w-4.5" />
            </button>
          </div>

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
            ) : requests.length === 0 ? (
              <div className="flex h-full items-center justify-center py-12 text-[#667085]">
                Không có yêu cầu nào
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
                        Yêu cầu
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Người gửi
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Loại
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Ngày tạo
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
                    {requests.map((request, index) => (
                      <tr
                        className="border-b border-[#ebedf2] hover:bg-[#f9fafb]"
                        key={request.id}
                      >
                        <td className="px-4 py-3 text-sm text-[#344054]">
                          {rowOffset + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <strong className="block max-w-80 truncate text-sm text-[#344054]">
                            {request.title}
                          </strong>
                          <span className="line-clamp-1 text-xs text-[#667085]">
                            {request.description || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#344054]">
                          {requesterLabel(request)}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#344054]">
                          {typeLabels[request.type]}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#344054]">
                          {formatDateTime(request.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={request.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#006fd5] text-white! hover:bg-[#0055a8]"
                              type="button"
                              title="Xem chi tiết"
                              onClick={() => void openDetail(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {canDecideRequest(request) ? (
                              <>
                                <button
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#ecfdf3] text-[#027a48] hover:bg-[#d1fadf]"
                                  type="button"
                                  title="Duyệt"
                                  onClick={() =>
                                    confirmDecision(request, "APPROVED")
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3f2] text-[#b42318] hover:bg-[#fee4e2]"
                                  type="button"
                                  title="Từ chối"
                                  onClick={() =>
                                    confirmDecision(request, "REJECTED")
                                  }
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            ) : null}
                            {canCancelRequest(request) ? (
                              <button
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#fecdca] text-[#b42318] hover:bg-[#fffbfa]"
                                type="button"
                                title="Hủy yêu cầu"
                                onClick={() => confirmCancel(request)}
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#ebedf2] px-4 py-3 max-[720px]:flex-col max-[720px]:items-stretch">
              <span className="text-sm text-[#667085]">
                Hiển thị {requests.length === 0 ? 0 : rowOffset + 1}-
                {Math.min(rowOffset + requests.length, meta.total)} /{" "}
                {meta.total} yêu cầu
              </span>
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
            </div>
          </section>
        </div>
      </main>

      <RequestDetailModal
        open={detailOpen}
        request={detailLoading ? null : selectedRequest}
        onClose={() => setDetailOpen(false)}
        onDecision={async (decision, note) => {
          if (!selectedRequest) return;
          await handleDecision(selectedRequest, decision, note);
          await refreshSelectedRequest(selectedRequest.id);
        }}
        onCancelRequest={async () => {
          if (!selectedRequest) return;
          await handleCancelRequest(selectedRequest);
        }}
      />
    </AppLayout>
  );
}
