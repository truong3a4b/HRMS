import { useState, type ReactNode } from "react";
import { HomeHeader, HomeDrawer } from "../../features/home/components";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden min-w-0 flex-col bg-[#f7f7f7] text-[#243247]">
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
      <div className="flex min-h-0 flex-1 overflow-y-hidden overflow-x-visible">
        <HomeDrawer
          isOpen={drawerOpen}
          onToggle={() => setDrawerOpen((open) => !open)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
