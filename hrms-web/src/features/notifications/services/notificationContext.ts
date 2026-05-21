import { createContext } from "react";
import type { NotificationRecipient } from "../types/notification.types";

export type NotificationContextValue = {
  items: NotificationRecipient[];
  unreadCount: number;
  loading: boolean;
  connected: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

export const NotificationContext =
  createContext<NotificationContextValue | null>(null);
