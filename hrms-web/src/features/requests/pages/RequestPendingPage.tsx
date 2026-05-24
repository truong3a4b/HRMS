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
import type { RequestItem, RequestApprovalStatus, RequestStatus } from "../types/request.types";

const finalStatuses = new Set<RequestStatus>(["APPROVED", "REJECTED", "CANCELLED", "FAILED"]);

export function RequestPendingPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
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
  } = useRequests("pending", isAdmin);

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
      (approval) => approval.approverId === user?.id && approval.status === "PENDING",
    ) && !finalStatuses.has(request.status);

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden bg-[#f4f7fa]">
        <div className="flex h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4 max-[640px]:gap-4">
          <RequestHeader 
            title="Chờ tôi duyệt" 
            description="Quản lý và phê duyệt các yêu cầu được giao cho bạn" 
          />

          <RequestFilters
            searchTerm={searchTerm}
            status={status}
            type={type}
            onSearchChange={handleSearch}
            onStatusChange={handleStatusChange}
            onTypeChange={handleTypeChange}
            onRefresh={reload}
          />

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
