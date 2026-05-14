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
  const drawerItems = getDrawerItems(user?.role);
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
      className={`relative flex max-h-full shrink-0 flex-col overflow-visible border-r border-[#e6e9ef] bg-white py-4 transition-all duration-300 ${
        isOpen
          ? "w-[280px] px-3.5 max-[1180px]:w-[232px] max-[860px]:w-[216px]"
          : "w-[64px] items-center px-2"
      }`}
    >
      {/* Toggle Button */}
      <div className="pointer-events-none absolute -right-5 top-[44%] z-10 h-14 w-10 -translate-y-1/2 rounded-l-full bg-[#f7f7f7]" />
      <button
        onClick={onToggle}
        className="absolute -right-4 top-[44%] z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-[#d7deea] bg-white text-[#667085] shadow-[0_4px_12px_rgba(16,24,40,0.14)] transition-colors hover:border-[#006fd5] hover:bg-[#f0f7ff] hover:text-[#006fd5] active:bg-[#dbeafe]"
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
                className={`grid min-h-12 w-full grid-cols-[22px_1fr_auto] items-center gap-2.5 text-left leading-tight transition-colors rounded-lg ${
                  active
                    ? "font-bold text-[#006fd5]!"
                    : "text-[#34445b] bg-transparent hover:bg-[#f5f5f5]"
                } active:bg-[#e8e8e8]`}
                type="button"
                onClick={handleClick}
              >
                <span className={active ? "text-[#006fd5]" : "text-[#7a7f88]"}>
                  {item.icon}
                </span>
                <span className="min-w-0 truncate text-[14px] leading-tight">
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="min-w-9 rounded-full bg-[#ff9f25] px-2 py-0.5 text-center text-xs font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
                {item.expandable ? (
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-[#243247] transition-transform ${
                      expanded ? "rotate-180" : ""
                    }`}
                  />
                ) : null}
              </button>
              {item.children?.length && expanded ? (
                <div className="mb-1 ml-7 grid gap-1 border-l border-[#e6e9ef] pl-3">
                  {item.children.map((child) => {
                    const childSelected = location.pathname.startsWith(
                      child.path,
                    );

                    return (
                      <button
                        className={`min-h-9 rounded-lg px-3 text-left text-[14px]! transition-colors ${
                          childSelected
                            ? "font-semibold text-[#006fd5]!"
                            : "text-[#667085] hover:bg-[#f5f5f5]"
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
              className={`grid h-12 w-10 place-items-center rounded-lg transition-colors ${
                active
                  ? "text-[#006fd5] bg-[#f0f7ff]"
                  : "text-[#7a7f88] hover:bg-[#f5f5f5]"
              } active:bg-[#e8e8e8]`}
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
