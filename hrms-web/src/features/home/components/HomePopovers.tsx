import { useMemo } from "react";
import { Bell, ChevronRight, X } from "lucide-react";
import { useAuth } from "../../auth/services/useAuth";
import { getAccountActions, getNotifications } from "../data/home.data";

export function NotificationPopover({ onClose }: { onClose: () => void }) {
  return (
    <section
      className="zoom-110 absolute top-[calc(100%+14px)] right-[-46px] z-30 w-95 rounded-lg border border-[#e4e8f0] bg-white p-3.5 text-[#172033] shadow-[0_18px_45px_rgba(15,23,42,0.18)] before:absolute before:top-[-8px] before:right-14.5 before:h-4 before:w-4 before:rotate-45 before:border-t before:border-l before:border-[#e4e8f0] before:bg-white"
      role="dialog"
      aria-label="Thông báo"
    >
      <div className="relative z-[1] mb-3 flex items-center justify-between">
        <strong className="text-lg text-[#172033]">Thông báo</strong>
        <button
          className="grid h-7.5 w-7.5 place-items-center rounded-md text-[#667085]"
          type="button"
          onClick={onClose}
          aria-label="Đóng thông báo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {getNotifications().map((item) => (
          <article
            className="grid grid-cols-[42px_1fr] gap-3 rounded-lg border border-[#edf0f5] bg-[#fbfcff] p-3.5"
            key={item.key}
          >
            <div className="grid h-10.5 w-10.5 place-items-center rounded-full bg-[#e9f3ff] text-[#0e67a7]">
              <Bell className="h-4.5 w-4.5" />
            </div>
            <div>
              <strong className="block text-base text-[#172033]">
                {item.title}
              </strong>
              <p className="my-1 text-[#5f6b7c]">{item.message}</p>
              <span className="text-xs text-[#8a94a6]">{item.time}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AccountPopover({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const actions = useMemo(
    () =>
      getAccountActions(() => {
        void logout();
        onClose();
      }),
    [logout, onClose],
  );

  return (
    <section
      className="zoom-110 absolute top-[calc(100%+14px)] right-0 z-30 w-107.5 rounded-lg border border-[#e4e8f0] bg-white p-3.5 text-[#172033] shadow-[0_18px_45px_rgba(15,23,42,0.18)] before:absolute before:top-[-8px] before:right-3 before:h-4 before:w-4 before:rotate-45 before:border-t before:border-l before:border-[#e4e8f0] before:bg-white"
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
        >
          <img
            className="h-12.5 w-12.5 rounded-full object-cover"
            src="/hrms-assets/profile.png"
            alt=""
          />
          <span>
            <strong className="block text-base text-[#172033]">
              {user?.email ?? "Người dùng"}
            </strong>
            <small className="text-xs text-[#8a94a6]">
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
              onClick={action.onClick}
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
