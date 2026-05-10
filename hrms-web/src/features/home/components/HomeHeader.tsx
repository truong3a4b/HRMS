import { Bell, Menu } from "lucide-react";
import { useAuth } from "../../auth/services/useAuth";
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
  const initial = user?.email?.trim().charAt(0).toUpperCase() || "T";

  return (
    <header className="sticky top-0 z-10 grid min-h-17 grid-cols-[260px_44px_1fr_auto] items-center bg-[#293145] pr-8 pl-16 text-white shadow-[0_1px_0_rgba(255,255,255,0.08)] max-[1180px]:grid-cols-[180px_44px_1fr_auto] max-[1180px]:pl-6">
      <div className="flex flex-col leading-none">
        <div className="text-[39px] font-extrabold">HRMS</div>
      </div>
      <button
        className="grid h-11 w-11 place-items-center text-white"
        type="button"
        aria-label="Mở menu"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>
      <h1 className="m-0 ml-3 text-[22px] font-bold text-white ">
        Tổng quan hôm nay
      </h1>
      <div className="flex items-center gap-6">
        <div className="relative inline-flex items-center ">
          <button
            className="relative grid h-9.5 w-8.5 place-items-center bg-transparent text-white"
            type="button"
            onClick={onToggleNotifications}
          >
            <Bell className="h-6.5 w-6.5 text-white" />
            <span className="absolute top-0 -right-0.75 min-w-5.5 rounded-full bg-[#ff9aa0] px-1.5 text-center text-xs font-extrabold leading-5.5 text-[#c52933]">
              8
            </span>
          </button>
          {notificationOpen ? (
            <NotificationPopover onClose={onCloseNotifications} />
          ) : null}
        </div>
        <div className="relative inline-flex items-center">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg bg-[#4e6371] text-lg font-bold text-white"
            type="button"
            onClick={onToggleAccount}
          >
            {initial}
          </button>
          {accountOpen ? <AccountPopover onClose={onCloseAccount} /> : null}
        </div>
      </div>
    </header>
  );
}
