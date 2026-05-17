import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Modal } from "antd";
import {
  Clock,
  Clock3,
  Edit2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { workShiftService } from "../services/workShiftService";
import type { WorkShift, WorkShiftFormPayload } from "../types/workShift.types";

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";

const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

const emptyForm = {
  code: "",
  name: "",
  startTime: "",
  endTime: "",
  breakStartTime: "",
  breakEndTime: "",
  lateGracePeriod: "",
  earlyLeaveGracePeriod: "",
  checkInStartTime: "",
  checkInEndTime: "",
  checkOutStartTime: "",
  checkOutEndTime: "",
  isOvernight: false,
  isOvertime: false,
  workUnits: "1",
  overtimeMultiplier: "",
};

type WorkShiftFormState = typeof emptyForm;

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as {
      message?: string;
      errors?: {
        fieldErrors?: Record<string, string[] | undefined>;
        formErrors?: string[];
      };
    };

    const fieldErrors = data.errors?.fieldErrors;
    if (fieldErrors) {
      const messages = Object.values(fieldErrors)
        .flatMap((items) => items ?? [])
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }

    if (data.errors?.formErrors?.length) {
      return data.errors.formErrors.join("\n");
    }

    if (data.message) {
      return data.message;
    }
  }

  return fallback;
}

function formatDecimal(value: number | string | null | undefined) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return "-";
  }

  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(parsed);
}

function numberOrUndefined(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  return Number(value);
}

function stringOrUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function parseClockToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return hours * 60 + minutes;
}

function isNonOvernightTimeRangeValid(startTime: string, endTime: string) {
  return parseClockToMinutes(endTime) > parseClockToMinutes(startTime);
}

function WorkShiftFormModal({
  open,
  workShift,
  onClose,
  onSubmit,
}: {
  open: boolean;
  workShift: WorkShift | null;
  onClose: () => void;
  onSubmit: (form: WorkShiftFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<WorkShiftFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        code: workShift?.code ?? "",
        name: workShift?.name ?? "",
        startTime: workShift?.startTime ?? "",
        endTime: workShift?.endTime ?? "",
        breakStartTime: workShift?.breakStartTime ?? "",
        breakEndTime: workShift?.breakEndTime ?? "",
        lateGracePeriod: workShift?.lateGracePeriod?.toString() ?? "",
        earlyLeaveGracePeriod:
          workShift?.earlyLeaveGracePeriod?.toString() ?? "",
        checkInStartTime: workShift?.checkInStartTime ?? "",
        checkInEndTime: workShift?.checkInEndTime ?? "",
        checkOutStartTime: workShift?.checkOutStartTime ?? "",
        checkOutEndTime: workShift?.checkOutEndTime ?? "",
        isOvernight: workShift?.isOvernight ?? false,
        isOvertime: workShift?.isOvertime ?? false,
        workUnits: workShift?.workUnits?.toString() ?? "1",
        overtimeMultiplier: workShift?.overtimeMultiplier?.toString() ?? "",
      });
      setError(null);
    }
  }, [open, workShift]);

  const [hasBreak, setHasBreak] = useState(false);

  useEffect(() => {
    if (open) {
      const hasBreakTime = !!(
        workShift?.breakStartTime || workShift?.breakEndTime
      );
      setHasBreak(hasBreakTime);
    }
  }, [open, workShift]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.code.trim() || !form.name.trim()) {
      setError("Vui lòng nhập mã ca và tên ca.");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError("Vui lòng nhập giờ bắt đầu và giờ kết thúc.");
      return;
    }

    if (
      !form.isOvernight &&
      form.startTime &&
      form.endTime &&
      !isNonOvernightTimeRangeValid(form.startTime, form.endTime)
    ) {
      setError("Gio ket thuc phai lon hon gio bat dau neu ca khong qua dem.");
      return;
    }

    if (hasBreak && (!form.breakStartTime || !form.breakEndTime)) {
      setError("Vui lòng nhập đủ thời gian bắt đầu và kết thúc nghỉ giữa ca.");
      return;
    }

    if (
      !form.checkInStartTime ||
      !form.checkInEndTime ||
      !form.checkOutStartTime ||
      !form.checkOutEndTime
    ) {
      setError("Vui long nhap du thoi gian check-in va check-out.");
      return;
    }

    const workUnits = Number(form.workUnits);
    if (!Number.isFinite(workUnits) || workUnits <= 0) {
      setError("Đơn vị công phải là số không âm.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const submitForm = hasBreak
        ? form
        : { ...form, breakStartTime: "", breakEndTime: "" };
      await onSubmit(submitForm);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu ca làm việc"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeInputClass =
    "w-full rounded-lg border border-[#d0d5dd] bg-white pl-9 pr-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10 [color-scheme:light]";

  const sectionTitle = (title: string, subtitle?: string) => (
    <div className="col-span-2 max-[680px]:col-span-1 mt-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
        <span className="text-sm font-semibold text-[#243247]">{title}</span>
        {subtitle && <span className="text-xs text-[#667085]">{subtitle}</span>}
      </div>
      <div className="border-t border-[#edf0f5]" />
    </div>
  );

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff]">
            <Clock className="h-4 w-4 text-[#006fd5]" />
          </span>
          <span>
            {workShift ? "Chỉnh sửa ca làm việc" : "Thêm ca làm việc"}
          </span>
        </div>
      }
      onCancel={onClose}
      width={820}
      centered
      styles={{
        body: {
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          paddingRight: "8px",
        },
      }}
      footer={
        <div className="flex justify-end gap-3 pt-4 border-t border-[#edf0f5]">
          <button
            className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            form="workShiftForm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : workShift ? "Cập nhật" : "Thêm ca"}
          </button>
        </div>
      }
    >
      <style>{`
        input[type="time"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
      `}</style>
      <form id="workShiftForm" onSubmit={handleSubmit}>
        {error ? (
          <div className="mb-4 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318] flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-base">⚠️</span>
            <span>{error}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-x-4 gap-y-4 max-[680px]:grid-cols-1">
          {/* Section: Thông tin cơ bản */}
          {sectionTitle("Thông tin ca")}
          <label>
            <span className={labelClass}>
              Mã ca <span className="text-[#f04438]">*</span>
            </span>
            <input
              className={fieldClass}
              value={form.code}
              placeholder="VD: HC, SANG, OT01"
              onChange={(event) =>
                setForm((current) => ({ ...current, code: event.target.value }))
              }
            />
          </label>
          <label>
            <span className={labelClass}>
              Tên ca <span className="text-[#f04438]">*</span>
            </span>
            <input
              className={fieldClass}
              value={form.name}
              placeholder="VD: Ca hành chính"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>

          {/* Section: Thời gian làm việc */}
          {sectionTitle("Thời gian làm việc", "(bắt buộc)")}
          <label>
            <span className={labelClass}>
              Giờ bắt đầu <span className="text-[#f04438]">*</span>
            </span>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                className={timeInputClass}
                type="time"
                step="300"
                value={form.startTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
              />
            </div>
          </label>
          <label>
            <span className={labelClass}>
              Giờ kết thúc <span className="text-[#f04438]">*</span>
            </span>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                className={timeInputClass}
                type="time"
                step="300"
                value={form.endTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    endTime: event.target.value,
                  }))
                }
              />
            </div>
          </label>

          <label className="col-span-2 flex cursor-pointer items-center gap-3 rounded-lg border border-[#edf0f5] bg-[#fbfcff] px-4 py-3 transition-colors hover:bg-[#f0f7ff] max-[680px]:col-span-1">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-[#006fd5]"
              checked={form.isOvernight}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isOvernight: event.target.checked,
                }))
              }
            />
            <div>
              <span className="block text-sm font-medium text-[#344054]">
                Ca qua đêm
              </span>
              <span className="block text-xs text-[#667085]">
                Lịch làm việc lưu ngày bắt đầu ca, giờ kết thúc có thể sang ngày sau.
              </span>
            </div>
          </label>

          {/* Section: Nghỉ giữa ca */}
          <div className="col-span-2 max-[680px]:col-span-1 mt-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
                <span className="text-sm font-semibold text-[#243247]">
                  Nghỉ giữa ca
                </span>
                <span className="text-xs text-[#667085]">(không bắt buộc)</span>
              </div>
              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={hasBreak}
                onClick={() => {
                  setHasBreak((v) => !v);
                  if (hasBreak) {
                    setForm((f) => ({
                      ...f,
                      breakStartTime: "",
                      breakEndTime: "",
                    }));
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  hasBreak ? "bg-[#006fd5]" : "bg-[#d0d5dd]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    hasBreak ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="border-t border-[#edf0f5]" />
          </div>

          {hasBreak ? (
            <>
              <label>
                <span className={labelClass}>Bắt đầu nghỉ</span>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                  <input
                    className={timeInputClass}
                    type="time"
                    step="300"
                    value={form.breakStartTime}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        breakStartTime: event.target.value,
                      }))
                    }
                  />
                </div>
              </label>
              <label>
                <span className={labelClass}>Kết thúc nghỉ</span>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                  <input
                    className={timeInputClass}
                    type="time"
                    step="300"
                    value={form.breakEndTime}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        breakEndTime: event.target.value,
                      }))
                    }
                  />
                </div>
              </label>
            </>
          ) : (
            <div className="col-span-2 max-[680px]:col-span-1 rounded-lg border border-dashed border-[#d0d5dd] bg-[#f9fafb] px-4 py-3 text-sm text-[#667085] text-center">
              Không có giờ nghỉ giữa ca — bật toggle để thêm
            </div>
          )}

          {/* Section: Dung sai chấm công */}
          {sectionTitle("Dung sai chấm công", "(để trống nếu không áp dụng)")}
          <label>
            <span className={labelClass}>Bắt đầu check-in</span>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                className={timeInputClass}
                type="time"
                step="300"
                value={form.checkInStartTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    checkInStartTime: event.target.value,
                  }))
                }
              />
            </div>
          </label>
          <label>
            <span className={labelClass}>Kết thúc check-in</span>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                className={timeInputClass}
                type="time"
                step="300"
                value={form.checkInEndTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    checkInEndTime: event.target.value,
                  }))
                }
              />
            </div>
          </label>
          <label>
            <span className={labelClass}>Bắt đầu check-out</span>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                className={timeInputClass}
                type="time"
                step="300"
                value={form.checkOutStartTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    checkOutStartTime: event.target.value,
                  }))
                }
              />
            </div>
          </label>
          <label>
            <span className={labelClass}>Kết thúc check-out</span>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                className={timeInputClass}
                type="time"
                step="300"
                value={form.checkOutEndTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    checkOutEndTime: event.target.value,
                  }))
                }
              />
            </div>
          </label>
          <label>
            <span className={labelClass}>Cho phép đi muộn (phút)</span>
            <input
              className={fieldClass}
              min={0}
              type="number"
              placeholder="VD: 5"
              value={form.lateGracePeriod}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  lateGracePeriod: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span className={labelClass}>Cho phép về sớm (phút)</span>
            <input
              className={fieldClass}
              min={0}
              type="number"
              placeholder="VD: 5"
              value={form.earlyLeaveGracePeriod}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  earlyLeaveGracePeriod: event.target.value,
                }))
              }
            />
          </label>

          {/* Section: Công và hệ số */}
          {sectionTitle("Đơn vị công & tăng ca")}
          <label>
            <span className={labelClass}>Đơn vị công</span>
            <input
              className={fieldClass}
              min={0}
              step="0.25"
              type="number"
              placeholder="VD: 1"
              value={form.workUnits}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  workUnits: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span className={labelClass}>Hệ số làm thêm</span>
            <input
              className={fieldClass}
              min={0}
              step="0.1"
              type="number"
              placeholder="VD: 1.5"
              value={form.overtimeMultiplier}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  overtimeMultiplier: event.target.value,
                }))
              }
            />
          </label>

          {/* Checkbox overtime */}
          <label className="col-span-2 flex cursor-pointer items-center gap-3 rounded-lg border border-[#edf0f5] bg-[#fbfcff] px-4 py-3 transition-colors hover:bg-[#f0f7ff] max-[680px]:col-span-1">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-[#006fd5]"
              checked={form.isOvertime}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isOvertime: event.target.checked,
                }))
              }
            />
            <div>
              <span className="block text-sm font-medium text-[#344054]">
                Đây là ca làm thêm giờ
              </span>
              <span className="block text-xs text-[#667085]">
                Áp dụng hệ số lương tăng ca cho ca này
              </span>
            </div>
          </label>
        </div>
      </form>
    </Modal>
  );
}

export function WorkShiftListPage() {
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedWorkShift, setSelectedWorkShift] = useState<WorkShift | null>(
    null,
  );

  const filteredWorkShifts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return workShifts;
    }

    return workShifts.filter((workShift) =>
      [
        workShift.code,
        workShift.name,
        workShift.startTime,
        workShift.endTime,
      ].some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [searchTerm, workShifts]);

  const loadWorkShifts = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await workShiftService.getWorkShifts();
      setWorkShifts(result);
    } catch (error) {
      setWorkShifts([]);
      setErrorMessage(
        getErrorMessage(error, "Không tải được danh sách ca làm việc"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkShifts();
  }, []);

  const openAdd = () => {
    setSelectedWorkShift(null);
    setFormOpen(true);
  };

  const openEdit = async (workShift: WorkShift) => {
    setSelectedWorkShift(workShift);
    setFormOpen(true);

    try {
      const detail = await workShiftService.getWorkShiftById(workShift.id);
      setSelectedWorkShift(detail);
    } catch {
      setSelectedWorkShift(workShift);
    }
  };

  const buildPayload = (form: WorkShiftFormState): WorkShiftFormPayload => ({
    code: form.code.trim(),
    name: form.name.trim(),
    startTime: form.startTime,
    endTime: form.endTime,
    breakStartTime: stringOrUndefined(form.breakStartTime),
    breakEndTime: stringOrUndefined(form.breakEndTime),
    lateGracePeriod: numberOrUndefined(form.lateGracePeriod),
    earlyLeaveGracePeriod: numberOrUndefined(form.earlyLeaveGracePeriod),
    checkInStartTime: form.checkInStartTime,
    checkInEndTime: form.checkInEndTime,
    checkOutStartTime: form.checkOutStartTime,
    checkOutEndTime: form.checkOutEndTime,
    isOvernight: form.isOvernight,
    isOvertime: form.isOvertime,
    workUnits: Number(form.workUnits),
    overtimeMultiplier: numberOrUndefined(form.overtimeMultiplier),
  });

  const handleSubmit = async (form: WorkShiftFormState) => {
    const payload = buildPayload(form);

    if (selectedWorkShift) {
      await workShiftService.updateWorkShift(selectedWorkShift.id, payload);
    } else {
      await workShiftService.createWorkShift(payload);
    }

    setFormOpen(false);
    setSelectedWorkShift(null);
    await loadWorkShifts();
  };

  const handleDelete = (workShift: WorkShift) => {
    Modal.confirm({
      title: "Xóa ca làm việc",
      content: `Bạn có chắc chắn muốn xóa ${workShift.name}?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        await workShiftService.deleteWorkShift(workShift.id);
        await loadWorkShifts();
      },
    });
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden">
        <div className="flex h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">
                Danh sách ca làm việc
              </h1>
              <p className="text-sm text-[#667085]">
                Quản lý giờ làm, đơn vị công và cấu hình chấm công theo ca
              </p>
            </div>
            <button
              className="flex shrink-0 items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-white! transition-colors hover:bg-[#0055a8] active:bg-[#003f7a] [&_*]:!text-white"
              type="button"
              onClick={openAdd}
            >
              <Plus className="h-5 w-5" />
              Thêm ca
            </button>
          </div>

          <div className="flex flex-wrap gap-3 rounded-xl border border-[#ebedf2] bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã, tên hoặc giờ làm..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-9 w-full rounded-lg border border-[#d0d5dd] bg-white pl-9 pr-4 text-sm text-[#344054] placeholder-[#98a2b3] transition-colors focus:border-[#006fd5] focus:outline-none focus:ring-2 focus:ring-[#006fd5]/10"
              />
            </div>
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#d0d5dd] text-[#667085] transition-colors hover:bg-[#f9fafb] hover:text-[#344054]"
              type="button"
              onClick={() => void loadWorkShifts()}
              title="Tải lại"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>

          {errorMessage ? (
            <div className="flex items-center gap-2 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#ebedf2] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
            {isLoading ? (
              <div className="min-h-0 flex-1 overflow-auto p-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl border border-[#ebedf2] p-4"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-[#f3f4f6]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-[#f3f4f6]" />
                          <div className="h-3 w-1/2 rounded bg-[#f3f4f6]" />
                        </div>
                      </div>
                      <div className="mb-3 h-16 rounded-lg bg-[#f3f4f6]" />
                      <div className="flex gap-2">
                        <div className="h-7 flex-1 rounded-lg bg-[#f3f4f6]" />
                        <div className="h-7 w-9 rounded-lg bg-[#f3f4f6]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredWorkShifts.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f0f7ff]">
                  <Clock3 className="h-8 w-8 text-[#006fd5]" />
                </span>
                <div className="text-center">
                  <p className="font-semibold text-[#243247]">
                    {searchTerm
                      ? "Không tìm thấy ca làm việc"
                      : "Chưa có ca làm việc nào"}
                  </p>
                  <p className="mt-1 text-sm text-[#667085]">
                    {searchTerm
                      ? "Thử tìm với từ khoá khác"
                      : 'Nhấn "Thêm ca" để tạo ca làm việc đầu tiên'}
                  </p>
                </div>
                {!searchTerm && (
                  <button
                    className="mt-1 flex items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! hover:bg-[#0055a8] [&_*]:!text-white"
                    type="button"
                    onClick={openAdd}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm ca làm việc
                  </button>
                )}
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-auto p-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredWorkShifts.map((workShift) => (
                    <div
                      key={workShift.id}
                      className="group flex flex-col rounded-2xl border border-slate-300 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-4 shadow-[0_12px_26px_-20px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-[0_18px_36px_-22px_rgba(37,99,235,0.45)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">
                              {workShift.name}
                            </h3>
                            <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                              {workShift.code}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                            <Clock3 className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-slate-800">
                              {workShift.startTime} - {workShift.endTime}
                            </span>
                            {workShift.breakStartTime &&
                              workShift.breakEndTime && (
                                <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                  (Nghỉ: {workShift.breakStartTime}-
                                  {workShift.breakEndTime})
                                </span>
                              )}
                          </div>
                        </div>
                        {workShift.isOvertime && (
                          <span className="shrink-0 rounded-full border border-orange-300 bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800">
                            Tăng ca
                          </span>
                        )}
                        {workShift.isOvernight && (
                          <span className="shrink-0 rounded-full border border-indigo-300 bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800">
                            Qua đêm
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-md border border-blue-200 bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                          {formatDecimal(workShift.workUnits)} công
                        </span>
                        {workShift.lateGracePeriod != null && (
                          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            Muộn ≤{workShift.lateGracePeriod}p
                          </span>
                        )}
                        {workShift.earlyLeaveGracePeriod != null && (
                          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            Sớm ≤{workShift.earlyLeaveGracePeriod}p
                          </span>
                        )}
                        {workShift.isOvertime &&
                          workShift.overtimeMultiplier != null && (
                            <span className="rounded-md border border-orange-200 bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">
                              Hệ số x
                              {formatDecimal(workShift.overtimeMultiplier)}
                            </span>
                          )}
                      </div>

                      <div className="mt-5 flex gap-2 border-t border-slate-200 pt-3 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                          type="button"
                          onClick={() => void openEdit(workShift)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Sửa
                        </button>
                        <button
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                          type="button"
                          onClick={() => handleDelete(workShift)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="shrink-0 border-t border-[#ebedf2] px-4 py-3 text-sm text-[#667085]">
              {"Hiển thị " +
                filteredWorkShifts.length +
                " / " +
                workShifts.length +
                " ca làm việc"}
            </div>
          </section>
        </div>
      </main>
      <WorkShiftFormModal
        open={formOpen}
        workShift={selectedWorkShift}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </AppLayout>
  );
}
