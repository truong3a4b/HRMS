import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Modal } from "antd";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { useAuth } from "../../auth/services/useAuth";
import { employeeService } from "../../employees/services/employeeService";
import type { Employee } from "../../employees/types/employee.types";
import { workShiftService } from "../../work-shifts/services/workShiftService";
import type { WorkShift } from "../../work-shifts/types/workShift.types";
import {
  ScheduleDateShiftPicker,
  type DateShiftMap,
} from "../components/ScheduleDateShiftPicker";
import { scheduleService } from "../services/scheduleService";
import { getScheduleErrorMessage } from "../utils/scheduleErrorMessages";
import {
  currentMonthKey,
  detailsFromDateShiftMap,
} from "../utils/scheduleDateUtils";

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";

const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

/* ── Custom multi-select dropdown ─────────────────────────── */
interface MultiSelectOption {
  id: string;
  label: string;
}

function MultiSelectDropdown({
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
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((v) => v !== id)
        : [...selected, id],
    );
  };

  const allSelected = options.length > 0 && selected.length === options.length;

  const toggleAll = () => {
    onChange(allSelected ? [] : options.map((o) => o.id));
  };

  const selectedLabels = selected
    .map((id) => options.find((o) => o.id === id)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <div ref={ref} className="relative min-w-0 max-w-full">
      <span className={labelClass}>{label}</span>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex min-h-[36px] w-full min-w-0 max-w-full items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
          open
            ? "border-[#006fd5] ring-2 ring-[#006fd5]/10"
            : "border-[#d0d5dd] hover:border-[#b0bec8]"
        } bg-white`}
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
            className={`h-4 w-4 text-[#667085] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 min-w-0 overflow-y-auto rounded-xl border border-[#ebedf2] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.12)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d0d5dd] hover:[&::-webkit-scrollbar-thumb]:bg-[#98a2b3]">
          {options.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[#98a2b3]">Không có dữ liệu</p>
          ) : (
            <>
              {/* Select all */}
              <button
                type="button"
                onClick={toggleAll}
                className="flex w-full items-center gap-2 border-b border-[#f3f4f6] px-3 py-2.5 text-sm font-semibold text-[#006fd5] hover:bg-[#f0f7ff]"
              >
                <span
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                    allSelected
                      ? "border-[#006fd5] bg-[#006fd5]"
                      : "border-[#d0d5dd]"
                  }`}
                >
                  {allSelected && <Check className="h-3 w-3 text-white" />}
                </span>
                {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>

              {options.map((option) => {
                const checked = selected.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggle(option.id)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      checked
                        ? "bg-[#f0f7ff] text-[#006fd5]"
                        : "text-[#344054] hover:bg-[#f9fafb]"
                    }`}
                  >
                    <span
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                        checked
                          ? "border-[#006fd5] bg-[#006fd5]"
                          : "border-[#d0d5dd]"
                      }`}
                    >
                      {checked && <Check className="h-3 w-3 text-white" />}
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
      )}
    </div>
  );
}

/* ── Selected tags display ─────────────────────────────────── */
function SelectedTags({
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
    <div className="flex max-w-full min-w-0 flex-wrap gap-1 overflow-hidden">
      {ids.map((id) => {
        const label = options.find((o) => o.id === id)?.label ?? id;
        return (
          <span
            key={id}
            className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#f0f7ff] py-0.5 pl-2 pr-1 text-xs font-medium text-[#006fd5]"
          >
            <span className="truncate">{label}</span>
            <button
              type="button"
              onClick={() => onRemove(id)}
              className="ml-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full hover:bg-[#bbd6f5]"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        );
      })}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export function ScheduleRegisterPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonthKey());
  const [selectedDate, setSelectedDate] = useState("");
  const [dateShiftMap, setDateShiftMap] = useState<DateShiftMap>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [approverIds, setApproverIds] = useState<string[]>([]);
  const [watcherIds, setWatcherIds] = useState<string[]>([]);
  const [approvalMode, setApprovalMode] = useState<"PARALLEL" | "SEQUENTIAL">(
    "PARALLEL",
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const scheduleDetails = useMemo(
    () => detailsFromDateShiftMap(dateShiftMap),
    [dateShiftMap],
  );

  const userOptions: MultiSelectOption[] = useMemo(
    () =>
      employees
        .map((employee) => ({
          id: employee.user?.id,
          label: `${employee.name} - ${employee.email}`,
        }))
        .filter(
          (item): item is { id: string; label: string } =>
            Boolean(item.id) && item.id !== user?.id,
        ),
    [employees, user?.id],
  );

  useEffect(() => {
    void Promise.all([
      workShiftService.getWorkShifts().then(setWorkShifts),
      employeeService
        .getEmployees({ page: 1, limit: 100, search: "" })
        .then((result) => setEmployees(result.items ?? [])),
    ]).catch(() => {
      setErrorMessage("Không tải được dữ liệu đăng ký lịch làm việc");
    });
  }, []);

  const validateForm = () => {
    if (!title.trim()) return "Vui lòng nhập tiêu đề yêu cầu.";
    if (scheduleDetails.length === 0)
      return "Vui lòng chọn ít nhất một ngày và một ca làm việc.";
    if (approverIds.length === 0)
      return "Vui lòng chọn ít nhất một người duyệt.";
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setSuccessMessage(null);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await scheduleService.registerSchedule({
        title: title.trim(),
        description: description.trim() || undefined,
        month,
        approvalMode,
        approverIds,
        watcherIds,
        scheduleDetails,
      });
      setSuccessMessage("Đã gửi yêu cầu đăng ký lịch làm việc.");
    } catch (error) {
      setErrorMessage(
        getScheduleErrorMessage(error, "Không thể gửi yêu cầu đăng ký lịch"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSchedule = () => {
    Modal.confirm({
      title: "Xóa lịch đang chọn",
      content: "Toàn bộ ngày và ca đã chọn trên lịch sẽ được đặt lại.",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        setSelectedDate("");
        setDateShiftMap({});
      },
    });
  };

  return (
    <AppLayout>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <form
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 max-[640px]:px-4"
          onSubmit={handleSubmit}
        >
          {/* Header */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">
                Đăng ký lịch làm việc
              </h1>
              <p className="text-sm text-[#667085]">
                Nhân viên tự chọn ngày, chọn ca và gửi yêu cầu phê duyệt
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-4 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
                type="button"
                onClick={clearSchedule}
              >
                <Trash2 className="h-4 w-4" />
                Xóa chọn
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:cursor-not-allowed disabled:opacity-60 [&_*]:!text-white"
                type="submit"
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Đang gửi..." : "Gửi duyệt"}
              </button>
            </div>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="shrink-0 flex items-start gap-2 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
              <span className="shrink-0">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="shrink-0 flex items-center gap-2 rounded-lg border border-[#abefc6] bg-[#f6fef9] px-4 py-3 text-sm font-medium text-[#067647]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Main grid — form rộng (560px), calendar tự động chia phần còn lại */}
          <div className="grid gap-5 lg:grid-cols-[minmax(380px,0.9fr)_minmax(0,1.1fr)]">
            {/* ── Left panel: cấu hình ── */}
            <section className="grid content-start gap-4 rounded-xl border border-[#ebedf2] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
              <div className="grid content-start gap-4">
                {/* Section title */}
                <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-3">
                  <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
                  <span className="text-sm font-bold text-[#243247]">
                    Thông tin yêu cầu
                  </span>
                </div>

                <label>
                  <span className={labelClass}>
                    Tiêu đề yêu cầu <span className="text-[#f04438]">*</span>
                  </span>
                  <input
                    className={fieldClass}
                    value={title}
                    placeholder="VD: Đăng ký lịch tháng 06"
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </label>

                <label>
                  <span className={labelClass}>Mô tả</span>
                  <textarea
                    className={`${fieldClass} min-h-[72px] resize-y`}
                    placeholder="Ghi chú thêm về yêu cầu này..."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </label>

                {/* Divider */}
                <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-3 mt-2">
                  <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
                  <span className="text-sm font-bold text-[#243247]">
                    Luồng phê duyệt
                  </span>
                </div>

                <label>
                  <span className={labelClass}>Cách duyệt</span>
                  <div className="relative">
                    <select
                      className={`${fieldClass} appearance-none pr-8`}
                      value={approvalMode}
                      onChange={(event) =>
                        setApprovalMode(
                          event.target.value as "PARALLEL" | "SEQUENTIAL",
                        )
                      }
                    >
                      <option value="PARALLEL">Duyệt song song</option>
                      <option value="SEQUENTIAL">Duyệt tuần tự</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                  </div>
                </label>

                {/* Người duyệt dropdown */}
                <div>
                  <MultiSelectDropdown
                    label="Người duyệt *"
                    placeholder="Chọn người duyệt..."
                    options={userOptions}
                    selected={approverIds}
                    onChange={setApproverIds}
                  />
                  {approverIds.length > 0 && (
                    <div className="mt-2 min-w-0 max-w-full">
                      <SelectedTags
                        ids={approverIds}
                        options={userOptions}
                        onRemove={(id) =>
                          setApproverIds((cur) => cur.filter((v) => v !== id))
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Người theo dõi dropdown */}
                <div>
                  <MultiSelectDropdown
                    label="Người theo dõi"
                    placeholder="Chọn người theo dõi..."
                    options={userOptions}
                    selected={watcherIds}
                    onChange={setWatcherIds}
                  />
                  {watcherIds.length > 0 && (
                    <div className="mt-2 min-w-0 max-w-full">
                      <SelectedTags
                        ids={watcherIds}
                        options={userOptions}
                        onRemove={(id) =>
                          setWatcherIds((cur) => cur.filter((v) => v !== id))
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Info note */}
                <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#e0ecff] bg-[#f0f7ff] px-3 py-2.5 text-xs text-[#3b6ab5]">
                  <span className="mt-0.5 shrink-0">ℹ️</span>
                  <span>
                    Yêu cầu sẽ được tạo cho chính tài khoản đang đăng nhập. Lịch
                    chỉ nhận các ngày tương lai.
                  </span>
                </div>
              </div>
            </section>

            {/* ── Right panel: calendar picker ── */}
            <ScheduleDateShiftPicker
              month={month}
              selectedDate={selectedDate}
              dateShiftMap={dateShiftMap}
              workShifts={workShifts}
              onMonthChange={setMonth}
              onSelectedDateChange={setSelectedDate}
              onDateShiftMapChange={setDateShiftMap}
            />
          </div>
        </form>
      </main>
    </AppLayout>
  );
}
