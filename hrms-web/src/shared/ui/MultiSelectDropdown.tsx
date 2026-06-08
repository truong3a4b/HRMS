import { useEffect, useMemo, useState, useRef } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

export interface MultiSelectOption {
  id: string;
  label: string;
}

const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

export function MultiSelectDropdown({
  label,
  placeholder,
  options,
  selected,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) setSearchQuery("");
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter((o) =>
      o.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery]);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((v) => v !== id)
        : [...selected, id],
    );
  };

  const allSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((o) => selected.includes(o.id));

  const toggleAll = () => {
    if (allSelected) {
      const filteredIds = new Set(filteredOptions.map((o) => o.id));
      onChange(selected.filter((id) => !filteredIds.has(id)));
    } else {
      const currentSet = new Set(selected);
      filteredOptions.forEach((o) => currentSet.add(o.id));
      onChange(Array.from(currentSet));
    }
  };

  const selectedLabels =
    selected.length > 1
      ? `Đã chọn ${selected.length} người`
      : selected
          .map((id) => options.find((o) => o.id === id)?.label)
          .filter(Boolean)
          .join(", ");

  return (
    <div ref={ref} className="relative min-w-0 max-w-full">
      <span className={labelClass}>{label}</span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex min-h-[44px] w-full min-w-0 max-w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
          open
            ? "border-[#006fd5] ring-4 ring-[#006fd5]/10"
            : "border-[#d0d5dd] hover:border-[#98a2b3]"
        } bg-white shadow-sm`}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedLabels ? (
            <span className="text-[#344054]">{selectedLabels}</span>
          ) : (
            <span className="text-[#98a2b3]">{placeholder}</span>
          )}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {selected.length > 0 && (
            <span className="rounded-full bg-[#006fd5] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {selected.length}
            </span>
          )}
          <ChevronDown
            className={`h-4.5 w-4.5 text-[#667085] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 flex max-h-64 flex-col min-w-0 rounded-xl border border-[#ebedf2] bg-white shadow-lg">
          <div className="p-2 border-b border-[#f3f4f6]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#98a2b3]" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                className="w-full rounded-lg border border-[#d0d5dd] py-2 pl-9 pr-3 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
              />
            </div>
          </div>
          <div className="min-w-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d0d5dd] hover:[&::-webkit-scrollbar-thumb]:bg-[#98a2b3]">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-3 text-sm text-[#98a2b3]">Không có dữ liệu</p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex w-full items-center gap-2 border-b border-[#f3f4f6] px-3 py-2.5 text-sm font-semibold text-[#006fd5] hover:bg-[#f0f7ff]"
                >
                  <span
                    className={`grid h-4.5 w-4.5 shrink-0 place-items-center rounded border transition-colors ${
                      allSelected
                        ? "border-[#006fd5] bg-[#006fd5]"
                        : "border-[#d0d5dd]"
                    }`}
                  >
                    {allSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </span>
                  {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </button>

                {filteredOptions.map((option) => {
                  const checked = selected.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggle(option.id)}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                        checked
                          ? "bg-[#f0f7ff] text-[#006fd5]"
                          : "text-[#344054] hover:bg-[#f9fafb]"
                      }`}
                    >
                      <span
                        className={`grid h-4.5 w-4.5 shrink-0 place-items-center rounded border transition-colors ${
                          checked
                            ? "border-[#006fd5] bg-[#006fd5]"
                            : "border-[#d0d5dd]"
                        }`}
                      >
                        {checked && <Check className="h-3.5 w-3.5 text-white" />}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-left">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SelectedTags({
  ids,
  options,
  onRemove,
}: {
  ids: string[];
  options: MultiSelectOption[];
  onRemove: (id: string) => void;
}) {
  if (ids.length === 0) return null;
  return (
    <div className="flex max-w-full min-w-0 flex-wrap gap-1.5 overflow-hidden">
      {ids.map((id) => {
        const label = options.find((o) => o.id === id)?.label ?? id;
        return (
          <span
            key={id}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#f0f7ff] py-1 pl-3 pr-1.5 text-sm font-medium text-[#006fd5] border border-[#d6e8ff]"
          >
            <span className="truncate">{label}</span>
            <button
              type="button"
              onClick={() => onRemove(id)}
              className="grid h-4 w-4 shrink-0 place-items-center rounded-full transition-colors hover:bg-[#bbd6f5]"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
