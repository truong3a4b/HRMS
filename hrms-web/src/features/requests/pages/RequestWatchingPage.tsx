import { useState } from "react";
import { AppLayout } from "../../../app/layouts";
import { useAuth } from "../../auth/services/useAuth";
import { requestService } from "../services/requestService";
import { useRequests } from "../hooks/useRequests";
import { RequestHeader } from "../components/RequestHeader";
import { RequestFilters } from "../components/RequestFilters";
import { RequestTable } from "../components/RequestTable";
import { RequestDetailModal } from "../components/RequestDetailModal";
import type { RequestApprovalStatus, RequestItem } from "../types/request.types";

export function RequestWatchingPage() {
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
  } = useRequests("watching", isAdmin);

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
    await reload();
  };

  const handleCancelRequest = async (request: RequestItem) => {
    const updated = await requestService.cancelRequest(request.id);
    setSelectedRequest(updated);
    await reload();
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden bg-[#f4f7fa]">
        <div className="flex h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:gap-4 max-[640px]:px-4">
          <RequestHeader
            title="Yêu cầu tôi theo dõi"
            description="Theo dõi tiến trình các yêu cầu mà bạn được thêm vào danh sách theo dõi"
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
