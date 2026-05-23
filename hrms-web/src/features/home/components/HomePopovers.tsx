import { useMemo } from "react";
import dayjs from "dayjs";
import { Bell, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../../app/router/paths";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { useAuth } from "../../auth/services/useAuth";
import { useNotifications } from "../../notifications/services/useNotifications";
import type { NotificationRecipient } from "../../notifications/types/notification.types";
import { getAccountActions } from "../data/home.data";

export function NotificationPopover({ onClose }: { onClose: () => void }) {
  const { items, loading, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const handleItemClick = (item: NotificationRecipient) => {
    if (!item.isRead) {
      void markAsRead(item.notificationId);
    }
  };

  return (
    <section
      className="absolute top-[calc(100%+12px)] right-[-44px] z-30 w-[min(380px,calc(100vw-24px))] rounded-lg border border-[#e4e8f0] bg-white p-3 text-[#172033] shadow-[0_18px_45px_rgba(15,23,42,0.18)] before:absolute before:top-[-8px] before:right-14 before:h-4 before:w-4 before:rotate-45 before:border-t before:border-l before:border-[#e4e8f0] before:bg-white max-[520px]:right-[-54px]"
      role="dialog"
      aria-label="Thông báo"
    >
      <div className="relative z-[1] mb-3 flex items-center justify-between gap-3">
        <div>
          <strong className="text-lg text-[#172033]">Thông báo</strong>
          <div className="text-xs text-[#8a94a6]">
            {unreadCount > 0
              ? `${unreadCount} thông báo chưa đọc`
              : "Không có thông báo chưa đọc"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <button
              className="rounded-md px-2 py-1 text-xs font-semibold text-[#0e67a7] hover:bg-[#e9f3ff]"
              type="button"
              onClick={() => void markAllAsRead()}
            >
              Đọc tất cả
            </button>
          ) : null}
          <button
            className="grid h-7.5 w-7.5 place-items-center rounded-md text-[#667085]"
            type="button"
            onClick={onClose}
            aria-label="Đóng thông báo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
        {loading ? (
          <div className="rounded-lg border border-[#edf0f5] bg-[#fbfcff] px-4 py-6 text-center text-sm text-[#667085]">
            Đang tải thông báo...
          </div>
        ) : null}
        {!loading && items.length === 0 ? (
          <div className="rounded-lg border border-[#edf0f5] bg-[#fbfcff] px-4 py-6 text-center text-sm text-[#667085]">
            Chưa có thông báo.
          </div>
        ) : null}
        {items.map((item) => (
          <article
            className={`grid cursor-pointer grid-cols-[42px_1fr] gap-3 rounded-lg border p-3.5 transition-colors ${
              item.isRead
                ? "border-[#edf0f5] bg-white"
                : "border-[#b8dbff] bg-[#f4f9ff]"
            }`}
            key={item.id}
            onClick={() => handleItemClick(item)}
          >
            <div className="grid h-10.5 w-10.5 place-items-center rounded-full bg-[#e9f3ff] text-[#0e67a7]">
              <Bell className="h-4.5 w-4.5" />
            </div>
            <div>
              <strong className="block text-base text-[#172033]">
                {item.notification.title}
              </strong>
              <p className="my-1 text-[#5f6b7c]">{item.notification.message}</p>
              <span className="text-xs text-[#8a94a6]">
                {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AccountPopover({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const actions = useMemo(
    () =>
      getAccountActions(() => {
        void logout();
        onClose();
      }),
    [logout, onClose],
  );

  const handleActionClick = (action: (typeof actions)[number]) => {
    if (action.key === "profile") {
      navigate(paths.profile);
      onClose();
      return;
    }

    if (action.key === "security") {
      navigate(paths.changePassword);
      onClose();
      return;
    }

    action.onClick?.();
  };

  return (
    <section
      className="absolute top-[calc(100%+12px)] right-0 z-30 w-[min(430px,calc(100vw-24px))] rounded-lg border border-[#e4e8f0] bg-white p-3 text-[#172033] shadow-[0_18px_45px_rgba(15,23,42,0.18)] before:absolute before:top-[-8px] before:right-3 before:h-4 before:w-4 before:rotate-45 before:border-t before:border-l before:border-[#e4e8f0] before:bg-white"
      role="dialog"
      aria-label="Tài khoản"
    >
      <div className="relative z-[1] mb-3 flex items-center justify-between">
        <strong className="text-lg text-[#172033]">Tài khoản</strong>
        <button
          className="grid h-7.5 w-7.5 place-items-center rounded-md text-[#667085]"
          type="button"
          onClick={onClose}
          aria-label="Đóng tài khoản"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#edf0f5]">
        <button
          className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3.5 border-b border-[#edf0f5] bg-white px-4 py-3.5 text-left"
          type="button"
          onClick={() => {
            navigate(paths.profile);
            onClose();
          }}
        >
          <Avatar alt={user?.email ?? "Tài khoản"} sizeClass="h-12.5 w-12.5" />
          <span className="min-w-0">
            <strong className="block truncate text-base text-[#172033]">
              {user?.email ?? "Người dùng"}
            </strong>
            <small className="block truncate text-xs text-[#8a94a6]">
              Chỉnh sửa thông tin cá nhân
            </small>
          </span>
          <ChevronRight className="h-5 w-5 text-[#8a94a6]" />
        </button>
        <div className="flex flex-col">
          {actions.map((action) => (
            <button
              className={`grid min-h-17 w-full grid-cols-[28px_1fr_auto] items-center gap-3.5 border-b border-[#edf0f5] bg-white px-4 py-3 text-left last:border-b-0 ${
                action.danger ? "text-[#ff3b30]" : "text-[#172033]"
              }`}
              key={action.key}
              type="button"
              onClick={() => handleActionClick(action)}
            >
              <span
                className={action.danger ? "text-[#ff3b30]" : "text-[#7a7a7a]"}
              >
                {action.icon}
              </span>
              <span>
                <strong className="block text-base">{action.title}</strong>
                {action.subtitle ? (
                  <small className="text-xs text-[#8a94a6]">
                    {action.subtitle}
                  </small>
                ) : null}
              </span>
              <ChevronRight className="h-5 w-5 text-[#8a94a6]" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
