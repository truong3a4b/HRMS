export type NotificationType =
  | "GENERAL"
  | "SYSTEM"
  | "RECRUITMENT"
  | "EMPLOYEE"
  | "AUTH"
  | "CUSTOM";

export type NotificationSender = {
  id: string;
  email: string;
  role: string;
} | null;

export type NotificationDetail = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: unknown;
  senderId?: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: NotificationSender;
};

export type NotificationRecipient = {
  id: string;
  notificationId: string;
  userId: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  notification: NotificationDetail;
};

export type NotificationListData = {
  items: NotificationRecipient[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
};
