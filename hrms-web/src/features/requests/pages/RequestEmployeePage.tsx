import { useState } from "react";
import { Modal } from "antd";
import { AppLayout } from "../../../app/layouts";
import { useAuth } from "../../auth/services/useAuth";
import { requestService } from "../services/requestService";
import { useRequests } from "../hooks/useRequests";
import { RequestHeader } from "../components/RequestHeader";
import { RequestFilters } from "../components/RequestFilters";
import { RequestTable } from "../components/RequestTable";
import { RequestDetailModal } from "../components/RequestDetailModal";
import type { RequestApprovalStatus, RequestItem, RequestStatus } from "../types/request.types";

const finalStatuses = new Set<RequestStatus>(["APPROVED", "REJECTED", "CANCELLED", "FAILED"]);
type EmployeeRequestTab = "watching" | "pending" | "reviewed";

const tabs: Array<{ key: EmployeeRequestTab; label: string; description: string }> = [
  {
    key: "watching",
    label: "Theo dõi",
    description: "Các yêu cầu bạn được thêm vào danh sách theo dõi",
  },
  {
    key: "pending",
    label: "Chờ tôi duyệt",
    description: "Các yêu cầu đang chờ bạn xử lý",
  },
  {
    key: "reviewed",
    label: "Tôi đã duyệt",
    description: "Các yêu cầu bạn đã duyệt hoặc từ chối",
  },
];

export function RequestEmployeePage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const [activeTab, setActiveTab] = useState<EmployeeRequestTab>("pending");
  const {
    requests,
    meta,
    searchTerm,
    status,
    type,
    currentPage,
    pageSize,
    isLoading,
    errorMessage,
    setPage,
    changePageSize,
    handleSearch,
    handleStatusChange,
    handleTypeChange,
    reload,
  } = useRequests(activeTab, isAdmin);

  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const handleDecision = async (request: RequestItem, decision: RequestApprovalStatus, note?: string) => {
    const updated = await requestService.decideRequest(request.id, { decision, note });
    setSelectedRequest(updated);
    await reload();
  };

  const confirmDecision = (request: RequestItem, decision: RequestApprovalStatus) => {
    Modal.confirm({
      title: decision === "APPROVED" ? "Duyệt yêu cầu" : "Từ chối yêu cầu",
      content: decision === "APPROVED" ? "Bạn có chắc chắn muốn duyệt yêu cầu này?" : "Bạn có chắc chắn muốn từ chối yêu cầu này?",
      okText: decision === "APPROVED" ? "Duyệt" : "Từ chối",
      cancelText: "Hủy",
      okButtonProps: { danger: decision === "REJECTED" },
      onOk: () => handleDecision(request, decision),
    });
  };

  const handleCancelRequest = async (request: RequestItem) => {
    const updated = await requestService.cancelRequest(request.id);
    setSelectedRequest(updated);
    await reload();
  };

  const confirmCancel = (request: RequestItem) => {
    Modal.confirm({
      title: "Hủy yêu cầu",
      content: "Bạn có chắc chắn muốn hủy yêu cầu này?",
      okText: "Hủy yêu cầu",
      cancelText: "Đóng",
      okButtonProps: { danger: true },
      onOk: () => handleCancelRequest(request),
    });
  };

  const canCancelRequest = (request: RequestItem) =>
    request.requesterId === user?.id && !finalStatuses.has(request.status);

  const canDecideRequest = (request: RequestItem) =>
    request.approvals.some(
      (approval) =>
        approval.approverId === user?.id &&
        approval.status === "PENDING" &&
        (request.approvalMode !== "SEQUENTIAL" ||
          approval.stepOrder === request.currentStep),
    ) && !finalStatuses.has(request.status);

  const activeDescription =
    tabs.find((tab) => tab.key === activeTab)?.description ??
    "Quản lý các yêu cầu liên quan đến bạn";

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden bg-[#f4f7fa]">
        <div className="flex h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:gap-4 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <RequestHeader
              title="Yêu cầu của nhân viên"
              description={activeDescription}
              hideCreateButton={true}
            />
          </div>

          <RequestFilters
            searchTerm={searchTerm}
            status={status}
            type={type}
            onSearchChange={handleSearch}
            onStatusChange={handleStatusChange}
            onTypeChange={handleTypeChange}
            onRefresh={reload}
          >
            <div className="flex shrink-0 items-center gap-1 rounded-xl bg-[#f4f7fa] p-1 border border-[#e2e8f0]">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`rounded-lg px-4 py-2 text-sm transition-all duration-300 ease-out ${
                    activeTab === tab.key
                      ? "bg-white text-[#006fd5] shadow-[0_2px_8px_rgba(0,111,213,0.15)] ring-1 ring-[#006fd5]/20 scale-[1.02] font-semibold"
                      : "text-[#64748b] font-medium hover:bg-white/60 hover:text-[#006fd5] hover:scale-[1.01]"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </RequestFilters>

          {errorMessage ? (
            <div className="rounded-xl border border-[#fecdca] bg-[#fffbfa] px-4 py-3.5 text-sm font-medium text-[#b42318] shadow-sm">
              {errorMessage}
            </div>
          ) : null}

          <RequestTable
            requests={requests}
            isLoading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={meta.total}
            onPageChange={(page, size) => {
              if (size !== pageSize) {
                changePageSize(size);
              } else {
                setPage(page);
              }
            }}
            onOpenDetail={openDetail}
            onDecide={confirmDecision}
            onCancel={confirmCancel}
            canDecide={canDecideRequest}
            canCancel={canCancelRequest}
          />
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
