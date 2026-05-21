import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { tokenStorage } from "../../../services/http/tokenStorage";
import { useAuth } from "../../auth/services/useAuth";
import { notificationService } from "./notificationService";
import { NotificationContext } from "./notificationContext";
import type { NotificationRecipient } from "../types/notification.types";

const notificationEvents = {
  created: "notification:created",
  read: "notification:read",
  readAll: "notification:read-all",
  connected: "notification:connected",
} as const;

const getSocketUrl = () => {
  const explicitUrl = import.meta.env.VITE_SOCKET_URL;

  if (typeof explicitUrl === "string" && explicitUrl.trim()) {
    return explicitUrl.trim();
  }

  const apiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000/api";
  return String(apiUrl).replace(/\/api\/?$/, "");
};

const mergeNotification = (
  items: NotificationRecipient[],
  nextItem: NotificationRecipient,
) => {
  const existingIndex = items.findIndex((item) => item.id === nextItem.id);

  if (existingIndex >= 0) {
    const nextItems = [...items];
    nextItems[existingIndex] = nextItem;
    return nextItems;
  }

  return [nextItem, ...items].slice(0, 20);
};

export function NotificationProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, refreshSession } = useAuth();
  const [items, setItems] = useState<NotificationRecipient[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const retryingAuthRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const data = await notificationService.getMine({ page: 1, limit: 20 });
      setItems(data?.items ?? []);
      setUnreadCount(data?.meta.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const token = tokenStorage.getAccessToken();

    if (!token) {
      return;
    }

    const socket = io(getSocketUrl(), {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      retryingAuthRef.current = false;
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on(notificationEvents.connected, () => {
      setConnected(true);
    });

    socket.on(notificationEvents.created, (payload: NotificationRecipient) => {
      setItems((current) => {
        const existing = current.find((item) => item.id === payload.id);

        if (!existing && !payload.isRead) {
          setUnreadCount((count) => count + 1);
        }

        return mergeNotification(current, payload);
      });
    });

    socket.on(
      notificationEvents.read,
      (payload: {
        notificationId: string;
        isRead: boolean;
        readAt: string | null;
      }) => {
        setItems((current) => {
          const existing = current.find(
            (item) => item.notificationId === payload.notificationId,
          );

          if (existing && !existing.isRead && payload.isRead) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }

          return current.map((item) =>
            item.notificationId === payload.notificationId
              ? { ...item, isRead: payload.isRead, readAt: payload.readAt }
              : item,
          );
        });
      },
    );

    socket.on(notificationEvents.readAll, () => {
      setItems((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    });

    socket.on("connect_error", async (error) => {
      if (error.message !== "Unauthorized" || retryingAuthRef.current) {
        return;
      }

      retryingAuthRef.current = true;
      const user = await refreshSession();
      const nextToken = tokenStorage.getAccessToken();

      if (!user || !nextToken) {
        return;
      }

      socket.auth = { token: nextToken };
      socket.connect();
    });

    return () => {
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, refreshSession]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const existing = items.find((item) => item.notificationId === notificationId);

    if (existing?.isRead) {
      return;
    }

    const updated = await notificationService.markAsRead(notificationId);

    if (updated) {
      setItems((current) => {
        const existing = current.find(
          (item) => item.notificationId === notificationId,
        );

        if (existing && !existing.isRead && updated.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }

        return current.map((item) =>
          item.notificationId === notificationId ? updated : item,
        );
      });
    }
  }, [items]);

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    setItems((current) =>
      current.map((item) => ({
        ...item,
        isRead: true,
        readAt: item.readAt ?? new Date().toISOString(),
      })),
    );
    setUnreadCount(0);
  }, []);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      loading,
      connected,
      refresh,
      markAsRead,
      markAllAsRead,
    }),
    [
      connected,
      items,
      loading,
      markAllAsRead,
      markAsRead,
      refresh,
      unreadCount,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
