import { apiClient } from "../../../services/http/apiClient";
import type { ApiResponse } from "../../auth/types/auth.types";
import type {
  NotificationListData,
  NotificationRecipient,
} from "../types/notification.types";

export const notificationService = {
  async getMine(params: { page?: number; limit?: number } = {}) {
    const response = await apiClient.get<ApiResponse<NotificationListData>>(
      "/notifications/me",
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
        },
      },
    );

    return response.data.data;
  },

  async getUnreadCount() {
    const response = await apiClient.get<
      ApiResponse<{ unreadCount: number }>
    >("/notifications/me/unread-count");

    return response.data.data?.unreadCount ?? 0;
  },

  async markAsRead(notificationId: string) {
    const response = await apiClient.patch<ApiResponse<NotificationRecipient>>(
      `/notifications/me/${notificationId}/read`,
    );

    return response.data.data;
  },

  async markAllAsRead() {
    const response = await apiClient.patch<
      ApiResponse<{ count: number }>
    >("/notifications/me/read-all");

    return response.data.data;
  },
};
