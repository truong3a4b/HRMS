import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "antd";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCcw,
  Save,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import { useAuth } from "../../auth/services/useAuth";
import { employeeService } from "../../employees/services/employeeService";
import type { Employee } from "../../employees/types/employee.types";
import { workShiftService } from "../../work-shifts/services/workShiftService";
import type { WorkShift } from "../../work-shifts/types/workShift.types";
import { scheduleService } from "../services/scheduleService";
import type { WorkScheduleItem } from "../types/schedule.types";
import { getScheduleErrorMessage } from "../utils/scheduleErrorMessages";
import {
  buildMonthGrid,
  currentMonthKey,
  toDateKey,
} from "../utils/scheduleDateUtils";

const weekDayLabels = [
  { label: "T2", isSunday: false },
  { label: "T3", isSunday: false },
  { label: "T4", isSunday: false },
  { label: "T5", isSunday: false },
  { label: "T6", isSunday: false },
  { label: "T7", isSunday: false },
  { label: "CN", isSunday: true },
];

const shiftColors = [
  {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    dot: "bg-cyan-500",
  },
  {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  {
    bg: "bg-lime-50",
    text: "text-lime-800",
    border: "border-lime-200",
    dot: "bg-lime-500",
  },
  {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
];

type ScheduleWeeklyPageProps = {
  scope?: "self" | "employees";
};

type ScheduleShift = WorkScheduleItem["workShifts"][number];

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  return `Tháng ${Number.parseInt(month, 10)}, ${year}`;
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
}

function prevMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getColorForShift(shiftId: string, workShifts: ScheduleShift[]) {
  const foundIndex = workShifts.findIndex((shift) => shift.id === shiftId);
  const index = foundIndex >= 0 ? foundIndex : 0;
  return shiftColors[index % shiftColors.length];
}

function sortShifts<T extends ScheduleShift>(shifts: T[]) {
  return [...shifts].sort((left, right) =>
    `${left.startTime ?? ""}-${left.code}`.localeCompare(
      `${right.startTime ?? ""}-${right.code}`,
    ),
  );
}

const todayKey = toDateKey(new Date().toISOString().slice(0, 10));

export function ScheduleWeeklyPage({
  scope = "employees",
}: ScheduleWeeklyPageProps) {
  const { user } = useAuth();
  const isSelfSchedule = scope === "self";
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const canManageSchedule =
    !isSelfSchedule &&
    (isAdmin || Boolean(user?.permissions?.includes("WORK_SCHEDULE_MANAGE")));

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState(
    isSelfSchedule ? "" : (user?.employeeId ?? ""),
  );
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [month, setMonth] = useState(currentMonthKey());
  const [schedules, setSchedules] = useState<WorkScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingShiftIds, setEditingShiftIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sortedWorkShifts = useMemo(() => sortShifts(workShifts), [workShifts]);

  const displayWorkShifts = useMemo(() => {
    const shiftsById = new Map<string, ScheduleShift>();

    for (const shift of sortedWorkShifts) {
      shiftsById.set(shift.id, shift);
    }

    for (const schedule of schedules) {
      for (const shift of schedule.workShifts ?? []) {
        if (!shiftsById.has(shift.id)) {
          shiftsById.set(shift.id, shift);
        }
      }
    }

    return sortShifts(Array.from(shiftsById.values()));
  }, [schedules, sortedWorkShifts]);

  const workShiftById = useMemo(
    () => new Map(displayWorkShifts.map((shift) => [shift.id, shift])),
    [displayWorkShifts],
  );

  const scheduleByDate = useMemo(() => {
    return schedules.reduce<Record<string, WorkScheduleItem>>((items, item) => {
      items[toDateKey(item.date)] = item;
      return items;
    }, {});
  }, [schedules]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === employeeId),
    [employees, employeeId],
  );

  const selectedShifts = useMemo(() => {
    if (!selectedDate) return [];
    const ids = new Set(editingShiftIds);
    return displayWorkShifts.filter((shift) => ids.has(shift.id));
  }, [displayWorkShifts, editingShiftIds, selectedDate]);

  const { days, leadingBlankDays } = useMemo(
    () => buildMonthGrid(month),
    [month],
  );

  const totalShifts = schedules.reduce(
    (sum, schedule) => sum + (schedule.workShifts?.length ?? 0),
    0,
  );
  const workingDays = schedules.filter(
    (schedule) => (schedule.workShifts?.length ?? 0) > 0,
  ).length;

  useEffect(() => {
    workShiftService
      .getWorkShifts()
      .then(setWorkShifts)
      .catch(() => setWorkShifts([]));
  }, []);

  useEffect(() => {
    if (isSelfSchedule) {
      return;
    }

    employeeService
      .getEmployees({ page: 1, limit: -1, search: "" })
      .then((result) => {
        const items = result.items ?? [];
        setEmployees(items);
        setEmployeeId((current) => current || items[0]?.id || "");
      })
      .catch(() => setEmployees([]));
  }, [isSelfSchedule]);

  const loadSchedule = useCallback(async () => {
    if (!isSelfSchedule && !employeeId) {
      setSchedules([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = isSelfSchedule
        ? await scheduleService.getMySchedule(month)
        : await scheduleService.getEmployeeSchedule(employeeId, month);
      setSchedules(result);
    } catch (error) {
      setSchedules([]);
      setErrorMessage(
        getScheduleErrorMessage(error, "Không tải được lịch làm việc"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, isSelfSchedule, month]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSchedule();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSchedule]);

  const getShiftDetail = (shift: ScheduleShift) => {
    return workShiftById.get(shift.id) ?? shift;
  };

  const openDayDetail = (dateKey: string) => {
    const schedule = scheduleByDate[dateKey];
    setSelectedDate(dateKey);
    setEditingShiftIds(schedule?.workShifts?.map((shift) => shift.id) ?? []);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const toggleEditingShift = (shiftId: string) => {
    setEditingShiftIds((current) =>
      current.includes(shiftId)
        ? current.filter((id) => id !== shiftId)
        : [...current, shiftId],
    );
  };

  const handleSaveDaySchedule = async () => {
    if (!selectedDate || !employeeId) return;

    if (selectedDate <= todayKey) {
      setErrorMessage(
        "Chỉ có thể chỉnh sửa lịch cho các ngày trong tương lai.",
      );
      return;
    }

    if (editingShiftIds.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất một ca làm việc.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await scheduleService.applyEmployeeSchedule(employeeId, [
        {
          date: selectedDate,
          workShiftIds: editingShiftIds,
        },
      ]);
      setSuccessMessage(
        `Đã cập nhật lịch ngày ${formatDateLabel(selectedDate)}.`,
      );
      await loadSchedule();
    } catch (error) {
      setErrorMessage(
        getScheduleErrorMessage(error, "Không thể cập nhật lịch"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedDate(null);
    setEditingShiftIds([]);
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden">
        <div className="flex h-full min-w-0 flex-col gap-6 px-5 py-5 max-[1024px]:overflow-y-auto lg:flex-row lg:px-6">
          <div className="scrollbar-hidden flex w-full shrink-0 flex-col gap-5 lg:w-[320px] lg:overflow-y-auto lg:pr-2 xl:w-[340px]">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {isSelfSchedule
                    ? "Lịch làm việc của tôi"
                    : "Lịch làm việc nhân viên"}
                </h1>
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700"
                  type="button"
                  title="Tải lại"
                  onClick={() => void loadSchedule()}
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
            {!isSelfSchedule && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Tìm kiếm nhân viên
                </h3>
                <div>
                  <SearchableSelect
                    className="w-full"
                    value={employeeId}
                    onChange={(value) => setEmployeeId(value)}
                    options={[
                      { value: "", label: "-- Chọn nhân viên --" },
                      ...employees.map((employee) => ({
                        value: employee.id,
                        label: `${employee.employeeId} - ${employee.name}`,
                      })),
                    ]}
                  />
                </div>
              </div>
            )}

            {!isSelfSchedule && selectedEmployee && (
              <div className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
                    {selectedEmployee.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {selectedEmployee.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {selectedEmployee.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-blue-100 pt-3">
                  <div className="flex-1 text-center">
                    <p className="text-xl font-bold text-blue-600">
                      {workingDays}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      Ngày làm
                    </p>
                  </div>
                  <div className="w-px bg-blue-100" />
                  <div className="flex-1 text-center">
                    <p className="text-xl font-bold text-blue-600">
                      {totalShifts}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      Lượt ca
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isSelfSchedule && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-600 text-white">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Tổng quan tháng này
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Chọn một ngày trên lịch để xem danh sách ca, giờ làm và
                      ghi chú chi tiết.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <div className="rounded-lg bg-slate-50 p-3 text-center">
                    <p className="text-xl font-bold text-blue-600">
                      {workingDays}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      Ngày làm
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-center">
                    <p className="text-xl font-bold text-blue-600">
                      {totalShifts}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      Lượt ca
                    </p>
                  </div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <span>!</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                {successMessage}
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-slate-800">
                Chú thích ca
              </h3>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {displayWorkShifts.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Chưa có danh sách ca.
                  </p>
                ) : (
                  displayWorkShifts.map((shift) => {
                    const color = getColorForShift(shift.id, displayWorkShifts);
                    return (
                      <div
                        className="flex items-start gap-2 rounded-lg border border-slate-100 p-2"
                        key={shift.id}
                      >
                        <span
                          className={`mt-1 h-3 w-3 shrink-0 rounded-full ${color.dot}`}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-700">
                            {shift.code} - {shift.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {shift.startTime && shift.endTime
                              ? `${shift.startTime} - ${shift.endTime}`
                              : "Ca từ lịch cũ"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <section className="flex min-h-[500px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3">
              <h2 className="text-base font-bold text-slate-800">
                Lịch làm việc chi tiết
              </h2>
              <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-1 shadow-sm">
                <button
                  type="button"
                  className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                  onClick={() => setMonth(prevMonth(month))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[140px] text-center text-sm font-semibold text-slate-700">
                  {formatMonthLabel(month)}
                </span>
                <button
                  type="button"
                  className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                  onClick={() => setMonth(nextMonth(month))}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-800">
              {weekDayLabels.map(({ label, isSunday }) => (
                <div
                  key={label}
                  className={`py-2.5 text-center text-[11px] font-bold uppercase tracking-wider ${
                    isSunday ? "text-rose-400" : "text-slate-200"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {isLoading ? (
                <div className="grid flex-1 auto-rows-[minmax(110px,1fr)] grid-cols-7 gap-px bg-slate-200 p-px">
                  {Array.from({ length: 35 }).map((_, index) => (
                    <div key={index} className="animate-pulse bg-white p-2">
                      <div className="mb-2 h-5 w-5 rounded-full bg-slate-100" />
                      <div className="mb-1 h-3 rounded bg-slate-100" />
                      <div className="h-3 w-3/4 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid flex-1 auto-rows-[minmax(110px,1fr)] grid-cols-7 gap-px bg-slate-200 p-px">
                  {Array.from({ length: leadingBlankDays }).map((_, index) => (
                    <div className="bg-slate-50/50" key={`blank-${index}`} />
                  ))}
                  {days.map((day, index) => {
                    const schedule = scheduleByDate[day.key];
                    const isToday = day.key === todayKey;
                    const colIndex = (leadingBlankDays + index) % 7;
                    const isSunday = colIndex === 6;
                    const hasShifts = (schedule?.workShifts?.length ?? 0) > 0;

                    return (
                      <button
                        key={day.key}
                        type="button"
                        className="relative flex flex-col bg-white p-2 text-left transition-colors hover:bg-blue-50/40"
                        onClick={() => openDayDetail(day.key)}
                      >
                        {isToday && (
                          <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-600" />
                        )}

                        <div className="mb-2 flex items-center justify-between">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              isToday
                                ? "bg-blue-600 text-white"
                                : isSunday
                                  ? "text-red-500"
                                  : "text-slate-700"
                            }`}
                          >
                            {day.day}
                          </span>
                          {hasShifts && (
                            <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                          )}
                        </div>

                        <div className="grid gap-1 overflow-y-auto pr-1">
                          {schedule?.workShifts?.map((shift) => {
                            const detail = getShiftDetail(shift);
                            const color = getColorForShift(
                              shift.id,
                              displayWorkShifts,
                            );
                            return (
                              <span
                                key={shift.id}
                                title={`${detail.name} - ${detail.startTime ?? ""} ${detail.endTime ?? ""}`}
                                className={`block truncate rounded-md border px-1.5 py-0.5 text-[11px] font-semibold shadow-sm ${color.bg} ${color.text} ${color.border}`}
                              >
                                {detail.name}
                                {detail.startTime && detail.endTime ? (
                                  <span className="ml-1 font-normal">
                                    {detail.startTime}-{detail.endTime}
                                  </span>
                                ) : null}
                              </span>
                            );
                          })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        <Modal
          title={
            selectedDate
              ? `Chi tiết lịch ngày ${formatDateLabel(selectedDate)}`
              : "Chi tiết lịch"
          }
          open={Boolean(selectedDate)}
          onCancel={closeDetailModal}
          width={620}
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
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={closeDetailModal}
              >
                Đóng
              </button>
              {canManageSchedule ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={
                    isSaving ||
                    !selectedDate ||
                    selectedDate <= todayKey ||
                    editingShiftIds.length === 0
                  }
                  onClick={() => void handleSaveDaySchedule()}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              ) : null}
            </div>
          }
        >
          <div className="grid gap-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Ca đang áp dụng
              </p>
              <div className="mt-3 grid gap-2">
                {selectedShifts.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Ngày này chưa có ca làm việc.
                  </p>
                ) : (
                  selectedShifts.map((shift) => {
                    const color = getColorForShift(shift.id, displayWorkShifts);
                    return (
                      <div
                        key={shift.id}
                        className={`rounded-lg border px-3 py-2 ${color.bg} ${color.border}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className={`font-semibold ${color.text}`}>
                            {shift.code} - {shift.name}
                          </p>
                          {shift.startTime && shift.endTime ? (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                              <Clock3 className="h-3.5 w-3.5" />
                              {shift.startTime} - {shift.endTime}
                            </span>
                          ) : null}
                        </div>
                        {shift.breakStartTime && shift.breakEndTime ? (
                          <p className="mt-1 text-xs text-slate-500">
                            Nghỉ giữa ca: {shift.breakStartTime} -{" "}
                            {shift.breakEndTime}
                          </p>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {canManageSchedule ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Chỉnh sửa ca trong ngày
                </p>
                <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1">
                  {sortedWorkShifts.map((shift) => {
                    const checked = editingShiftIds.includes(shift.id);
                    const color = getColorForShift(shift.id, displayWorkShifts);
                    return (
                      <label
                        key={shift.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                          checked
                            ? `${color.bg} ${color.border}`
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEditingShift(shift.id)}
                        />
                        <span className={`h-3 w-3 rounded-full ${color.dot}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-700">
                            {shift.code} - {shift.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {shift.startTime} - {shift.endTime}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {selectedDate && selectedDate <= todayKey ? (
                  <p className="mt-2 text-right text-xs text-slate-500">
                    Chỉ có thể chỉnh sửa các ngày trong tương lai.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-500">
                {isSelfSchedule
                  ? "Lịch cá nhân chỉ hỗ trợ xem chi tiết. Muốn thay đổi lịch, hãy dùng chức năng đăng ký lịch."
                  : "Bạn không có quyền chỉnh sửa lịch làm việc."}
              </div>
            )}
          </div>
        </Modal>
      </main>
    </AppLayout>
  );
}
