import { useEffect, useState, useCallback } from "react";
import { requestService } from "../services/requestService";
import type {
  RequestItem,
  RequestStatus,
  RequestType,
  RequestListResponse,
} from "../types/request.types";

type RequestTab = "mine" | "pending" | "watching" | "all";

export function useRequests(tab: RequestTab, isAdmin: boolean) {
  const initialMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [meta, setMeta] = useState(initialMeta);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<RequestStatus | "">("");
  const [type, setType] = useState<RequestType | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
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
      
      let result: RequestListResponse;
      if (tab === "pending") {
        result = await requestService.getMyPendingApprovals(filters);
      } else if (tab === "watching") {
        result = await requestService.getMyWatchingRequests(filters);
      } else if (tab === "all" && isAdmin) {
        result = await requestService.getAllRequests(filters);
      } else {
        result = await requestService.getMyRequests(filters);
      }

      setRequests(result.items ?? []);
      setMeta(result.meta ?? initialMeta);
    } catch (error: any) {
      setRequests([]);
      setMeta(initialMeta);
      const msg = error?.response?.data?.message || "Không tải được danh sách yêu cầu";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [tab, isAdmin, currentPage, pageSize, searchTerm, status, type]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const setPage = (page: number) => setCurrentPage(page);
  const changePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };
  const handleStatusChange = (newStatus: RequestStatus | "") => {
    setStatus(newStatus);
    setCurrentPage(1);
  };
  const handleTypeChange = (newType: RequestType | "") => {
    setType(newType);
    setCurrentPage(1);
  };

  return {
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
    reload: loadRequests,
  };
}
