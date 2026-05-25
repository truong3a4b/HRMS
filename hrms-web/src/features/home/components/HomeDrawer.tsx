import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/services/useAuth";
import { getDrawerItems } from "../data/home.data";

type HomeDrawerProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function HomeDrawer({ isOpen, onToggle }: HomeDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const drawerItems = getDrawerItems(user?.role, user?.permissions ?? []);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>();

    for (const item of drawerItems) {
      const hasActiveChild = item.children?.some((child) =>
        location.pathname.startsWith(child.path),
      );

      if (hasActiveChild) {
        initial.add(item.key);
      }
    }

    return initial;
  });

  return (
    <aside
      className={`relative z-30 flex max-h-full shrink-0 flex-col overflow-visible border-r border-[#1e293b] bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] py-4 transition-all duration-300 text-white! ${
        isOpen
          ? "w-[280px] px-3.5 max-[1180px]:w-[232px] max-[860px]:w-[216px]"
          : "w-[64px] items-center px-2"
      }`}
    >
      {/* Toggle Button */}
      <div className="pointer-events-none absolute -right-5 top-[44%] z-10 h-14 w-10 -translate-y-1/2 rounded-l-full bg-slate-50" />
      <button
        onClick={onToggle}
        className="absolute -right-4 top-[44%] z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-slate-300 bg-white text-[#006fd5]! shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all hover:border-[#006fd5] hover:bg-[#006fd5] hover:text-white! active:bg-[#0055a8]"
        aria-label="Toggle drawer"
        title={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
        type="button"
      >
        {isOpen ? (
          <ChevronRight className="h-4.5 w-4.5" />
        ) : (
          <ChevronRight className="h-4.5 w-4.5 rotate-180" />
        )}
      </button>

      {/* Menu Items */}
      <div
        className={`scrollbar-hidden flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden ${
          isOpen ? "w-full" : "items-center"
        }`}
      >
        {drawerItems.map((item) => {
          const childActive = item.children?.some((child) =>
            location.pathname.startsWith(child.path),
          );
          const hasChildren = Boolean(item.children?.length);
          const expanded = expandedKeys.has(item.key);
          const active = item.path
            ? location.pathname === item.path
            : item.key === "overview" || childActive;

          const handleClick = () => {
            if (hasChildren) {
              setExpandedKeys((current) => {
                const next = new Set(current);

                if (next.has(item.key)) {
                  next.delete(item.key);
                } else {
                  next.add(item.key);
                }

                return next;
              });
              return;
            }

            if (item.path) {
              navigate(item.path);
            }
          };

          return isOpen ? (
            <Fragment key={item.key}>
              <button
                className={`grid min-h-12 w-full grid-cols-[22px_1fr_auto] items-center gap-2.5 text-left leading-tight transition-all duration-200 rounded-xl px-3 ${
                  active
                    ? "font-bold text-white! bg-gradient-to-r from-blue-600 to-blue-500 shadow-md shadow-blue-500/20"
                    : "text-white! bg-transparent hover:bg-white/15"
                } active:scale-[0.98]`}
                type="button"
                onClick={handleClick}
              >
                <span className={active ? "text-white!" : "text-white/80! group-hover:text-white!"}>
                  {item.icon}
                </span>
                <span className="min-w-0 truncate text-[14px] leading-tight font-medium text-white!">
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="min-w-9 rounded-full bg-amber-500 px-2 py-0.5 text-center text-xs font-bold text-white! shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
                {item.expandable ? (
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      active ? "text-white!" : "text-white/80!"
                    } ${expanded ? "rotate-180" : ""}`}
                  />
                ) : null}
              </button>
              {item.children?.length && expanded ? (
                <div className="my-1.5 ml-7 grid gap-1 border-l border-slate-700/80 pl-3">
                  {item.children.map((child) => {
                    const childSelected = location.pathname.startsWith(
                      child.path,
                    );

                    return (
                      <button
                        className={`min-h-9 rounded-lg px-3 text-left text-[14px]! transition-all duration-200 ${
                          childSelected
                            ? "font-semibold text-[#60a5fa]! bg-blue-500/15"
                            : "text-white/80! hover:bg-white/15 hover:text-white!"
                        }`}
                        key={child.key}
                        type="button"
                        onClick={() => navigate(child.path)}
                      >
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </Fragment>
          ) : (
            <button
              className={`grid h-12 w-12 place-items-center rounded-xl transition-all duration-200 ${
                active
                  ? "text-white! bg-gradient-to-r from-blue-600 to-blue-500 shadow-md shadow-blue-500/20"
                  : "text-white/80! hover:bg-white/15 hover:text-white!"
              } active:scale-[0.98]`}
              key={item.key}
              type="button"
              onClick={handleClick}
              title={item.label}
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
