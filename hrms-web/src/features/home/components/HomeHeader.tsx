import { Bell } from "lucide-react";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { useAuth } from "../../auth/services/useAuth";
import { useNotifications } from "../../notifications/services/useNotifications";
import { AccountPopover, NotificationPopover } from "./HomePopovers";

type HomeHeaderProps = {
  notificationOpen: boolean;
  onToggleNotifications: () => void;
  onCloseNotifications: () => void;
  accountOpen: boolean;
  onToggleAccount: () => void;
  onCloseAccount: () => void;
};

export function HomeHeader({
  notificationOpen,
  onToggleNotifications,
  onCloseNotifications,
  accountOpen,
  onToggleAccount,
  onCloseAccount,
}: HomeHeaderProps) {
  const { user } = useAuth();
  const { unreadCount, connected } = useNotifications();
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <header className="sticky top-0 z-10 flex min-h-15 items-center justify-between bg-[#293145] px-6 text-white shadow-[0_1px_0_rgba(255,255,255,0.08)] max-[640px]:px-4">
      <div className="flex flex-col leading-none">
        <div className="text-[30px] font-extrabold">HRMS</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative inline-flex items-center ">
          <button
            className="relative grid h-9.5 w-8.5 place-items-center bg-transparent text-white transition-colors hover:text-[#e0e0e0] active:text-[#b0b0b0]"
            type="button"
            onClick={onToggleNotifications}
            title={connected ? "Thông báo realtime đang kết nối" : "Thông báo"}
          >
            <Bell className="h-6.5 w-6.5" />
            {unreadCount > 0 ? (
              <span className="absolute top-0 -right-0.75 min-w-5.5 rounded-full bg-[#ff9aa0] px-1.5 text-center text-xs font-extrabold leading-5.5 text-[#c52933]">
                {badgeLabel}
              </span>
            ) : null}
          </button>
          {notificationOpen ? (
            <NotificationPopover onClose={onCloseNotifications} />
          ) : null}
        </div>
        <div className="relative inline-flex items-center">
          <button
            className="grid h-9 w-9 place-items-center rounded-full transition-opacity hover:opacity-90 active:opacity-80"
            type="button"
            onClick={onToggleAccount}
          >
            <Avatar alt={user?.email ?? "Tài khoản"} sizeClass="h-9 w-9" />
          </button>
          {accountOpen ? <AccountPopover onClose={onCloseAccount} /> : null}
        </div>
      </div>
    </header>
  );
}
