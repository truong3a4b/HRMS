import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCcw, Search } from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { useAuth } from "../../auth/services/useAuth";
import { employeeService } from "../../employees/services/employeeService";
import type { Employee } from "../../employees/types/employee.types";
import { scheduleService } from "../services/scheduleService";
import type { WorkScheduleItem } from "../types/schedule.types";
import {
  buildMonthGrid,
  currentMonthKey,
  toDateKey,
} from "../utils/scheduleDateUtils";

const weekDayLabels = [
  { label: "T2", isWeekend: false },
  { label: "T3", isWeekend: false },
  { label: "T4", isWeekend: false },
  { label: "T5", isWeekend: false },
  { label: "T6", isWeekend: false },
  { label: "T7", isWeekend: true },
  { label: "CN", isWeekend: true },
];

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string };
    if (data.message) return data.message;
  }
  return fallback;
}

/** Format "2025-05" → "Tháng 5, 2025" */
function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  return `Tháng ${parseInt(month)}, ${year}`;
}

function prevMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const todayKey = toDateKey(new Date().toISOString().slice(0, 10));

export function ScheduleWeeklyPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState(user?.employeeId ?? "");
  const [month, setMonth] = useState(currentMonthKey());
  const [schedules, setSchedules] = useState<WorkScheduleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scheduleByDate = useMemo(() => {
    return schedules.reduce<Record<string, WorkScheduleItem>>((items, item) => {
      items[toDateKey(item.date)] = item;
      return items;
    }, {});
  }, [schedules]);

  const filteredEmployees = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return employees;
    return employees.filter((employee) =>
      [employee.name, employee.email, employee.employeeId]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [employees, searchTerm]);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId],
  );

  const { days, leadingBlankDays } = useMemo(() => buildMonthGrid(month), [month]);

  useEffect(() => {
    employeeService
      .getEmployees({ page: 1, limit: 100, search: "" })
      .then((result) => {
        const items = result.items ?? [];
        setEmployees(items);
        if (!employeeId && items[0]) {
          setEmployeeId(items[0].id);
        }
      })
      .catch(() => setEmployees([]));
  }, [employeeId]);

  const loadSchedule = async () => {
    if (!employeeId) { setSchedules([]); return; }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await scheduleService.getEmployeeSchedule(employeeId, month);
      setSchedules(result);
    } catch (error) {
      setSchedules([]);
      setErrorMessage(getErrorMessage(error, "Không tải được lịch làm việc"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadSchedule(); }, [employeeId, month]);

  const totalShifts = schedules.reduce((sum, s) => sum + (s.workShifts?.length ?? 0), 0);
  const workingDays = schedules.filter((s) => s.workShifts?.length > 0).length;

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden">
        <div className="flex h-full min-w-0 flex-col gap-4 px-5 py-5 max-[640px]:px-4">

          {/* ── Header ── */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">Lịch làm việc</h1>
              <p className="text-sm text-[#667085]">Xem ca làm việc theo nhân viên và tháng</p>
            </div>
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#d0d5dd] bg-white text-[#667085] transition-colors hover:bg-[#f9fafb] hover:text-[#344054]"
              type="button"
              title="Tải lại"
              onClick={() => void loadSchedule()}
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>

          {/* ── Filter bar ── */}
          <div className="flex flex-wrap gap-3 rounded-xl border border-[#ebedf2] bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
            <div className="relative min-w-[180px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
              <input
                className="h-9 w-full rounded-lg border border-[#d0d5dd] bg-white pl-9 pr-3 text-sm text-[#344054] outline-none placeholder-[#98a2b3] transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
                value={searchTerm}
                placeholder="Tìm nhân viên..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-9 min-w-[240px] flex-1 rounded-lg border border-[#d0d5dd] bg-white px-3 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">Chọn nhân viên</option>
              {filteredEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} — {employee.email}
                </option>
              ))}
            </select>

            {/* Month navigator */}
            <div className="flex items-center gap-1 rounded-lg border border-[#d0d5dd] bg-white px-1">
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-md text-[#667085] transition-colors hover:bg-[#f9fafb] hover:text-[#344054]"
                onClick={() => setMonth(prevMonth(month))}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[140px] text-center text-sm font-semibold text-[#243247]">
                {formatMonthLabel(month)}
              </span>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-md text-[#667085] transition-colors hover:bg-[#f9fafb] hover:text-[#344054]"
                onClick={() => setMonth(nextMonth(month))}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Employee info strip ── */}
          {selectedEmployee && (
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#e0ecff] bg-[#f0f7ff] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#006fd5] text-xs font-bold text-white">
                  {selectedEmployee.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#243247]">{selectedEmployee.name}</p>
                  <p className="text-xs text-[#667085]">{selectedEmployee.email}</p>
                </div>
              </div>
              <div className="ml-auto flex gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#006fd5]">{workingDays}</p>
                  <p className="text-xs text-[#667085]">Ngày làm</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#006fd5]">{totalShifts}</p>
                  <p className="text-xs text-[#667085]">Lượt ca</p>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
              <span>⚠️</span><span>{errorMessage}</span>
            </div>
          )}

          {/* ── Calendar ── */}
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#ebedf2] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
            {/* Weekday header */}
            <div className="grid grid-cols-7 border-b border-[#ebedf2]">
              {weekDayLabels.map(({ label, isWeekend }) => (
                <div
                  key={label}
                  className={`py-2.5 text-center text-xs font-bold uppercase tracking-wider ${
                    isWeekend ? "text-[#f04438]" : "text-[#344054]"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              {isLoading ? (
                /* Loading skeleton */
                <div className="grid grid-cols-7 gap-px bg-[#ebedf2] p-px">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="min-h-28 animate-pulse bg-white p-2">
                      <div className="mb-2 h-5 w-5 rounded-full bg-[#f3f4f6]" />
                      <div className="mb-1 h-3 rounded bg-[#f3f4f6]" />
                      <div className="h-3 w-3/4 rounded bg-[#f3f4f6]" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-px bg-[#ebedf2] p-px">
                  {Array.from({ length: leadingBlankDays }).map((_, index) => (
                    <div className="min-h-28 bg-[#fafafa]" key={`blank-${index}`} />
                  ))}
                  {days.map((day, i) => {
                    const schedule = scheduleByDate[day.key];
                    const isToday = day.key === todayKey;
                    const colIndex = (leadingBlankDays + i) % 7;
                    const isWeekend = colIndex === 5 || colIndex === 6;
                    const hasShifts = (schedule?.workShifts?.length ?? 0) > 0;

                    return (
                      <div
                        key={day.key}
                        className={`relative min-h-28 bg-white p-2 transition-colors hover:bg-[#fafcff] ${
                          isWeekend ? "bg-[#fffbfb]" : ""
                        }`}
                      >
                        {/* Today highlight bar */}
                        {isToday && (
                          <div className="absolute inset-x-0 top-0 h-0.5 bg-[#006fd5]" />
                        )}

                        {/* Day number */}
                        <div className="mb-2 flex items-center justify-between">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              isToday
                                ? "bg-[#006fd5] text-white"
                                : isWeekend
                                ? "text-[#f04438]"
                                : "text-[#344054]"
                            }`}
                          >
                            {day.day}
                          </span>
                          {hasShifts && (
                            <CalendarDays className="h-3.5 w-3.5 text-[#006fd5]" />
                          )}
                        </div>

                        {/* Shifts */}
                        <div className="grid gap-1">
                          {schedule?.workShifts?.map((shift) => (
                            <span
                              key={shift.id}
                              title={`${shift.name} • ${shift.startTime}–${shift.endTime}`}
                              className="block truncate rounded-md bg-[#f0f7ff] px-1.5 py-0.5 text-[11px] font-semibold text-[#006fd5]"
                            >
                              {shift.code}
                              <span className="ml-1 font-normal text-[#3b82f6]">
                                {shift.startTime}–{shift.endTime}
                              </span>
                            </span>
                          ))}
                          {!hasShifts && (
                            <span className="text-[11px] text-[#c9cdd4]">—</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center gap-4 border-t border-[#ebedf2] px-4 py-2.5">
              <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#006fd5]" />
                Hôm nay
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#f0f7ff]" />
                Có ca làm việc
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#fffbfb]" />
                Cuối tuần
              </div>
              <span className="ml-auto text-xs text-[#98a2b3]">
                {formatMonthLabel(month)}
              </span>
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
