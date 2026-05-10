import { useState } from "react";
import { HomeDrawer, HomeHeader, HomeRoleContent } from "../components";
import { useHomeData } from "../services/useHomeData";

export function HomePage() {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { data, isLoading, error } = useHomeData();

  return (
    <div className="min-h-svh w-full bg-[#f7f7f7] text-[#243247] zoom-80">
      <HomeHeader
        notificationOpen={notificationOpen}
        onToggleNotifications={() => {
          setAccountOpen(false);
          setNotificationOpen((open) => !open);
        }}
        onCloseNotifications={() => setNotificationOpen(false)}
        accountOpen={accountOpen}
        onToggleAccount={() => {
          setNotificationOpen(false);
          setAccountOpen((open) => !open);
        }}
        onCloseAccount={() => setAccountOpen(false)}
      />
      <div className="grid min-h-[calc(100svh-68px)] grid-cols-[312px_minmax(0,1fr)] max-[1180px]:grid-cols-[248px_minmax(0,1fr)]">
        <HomeDrawer />
        {isLoading ? (
          <main className="grid place-items-center px-6 py-6">
            <div className="rounded-lg border border-[#ebedf2] bg-white px-6 py-4 text-[#667085] shadow-[0_18px_38px_rgba(17,24,39,0.04)]">
              Đang tải dữ liệu trang chủ...
            </div>
          </main>
        ) : error ? (
          <main className="grid place-items-center px-6 py-6">
            <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-6 py-4 text-[#b42318]">
              {error}
            </div>
          </main>
        ) : data ? (
          <HomeRoleContent data={data} />
        ) : null}
      </div>
    </div>
  );
}
