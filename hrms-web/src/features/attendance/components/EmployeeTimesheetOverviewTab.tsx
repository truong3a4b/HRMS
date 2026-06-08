import { Pagination, Spin } from "antd";
import { AlertTriangle, CalendarDays, Clock3, Eye, Search, Timer } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Employee } from "../../employees/types/employee.types";
import { buildMonthGrid } from "../../schedules/utils/scheduleDateUtils";
import { attendanceService } from "../services/attendanceService";
import type { AttendanceTimesheetData, AttendanceTimesheetDay } from "../types/attendance.types";
import { AttendanceMonthPicker } from "./AttendanceMonthPicker";

type EmployeeTimesheetOverviewTabProps = {
  employees: Employee[];
  month: string;
  refreshKey: number;
  onMonthChange: (value: string) => void;
  onViewDetail: (employeeId: string) => void;
};

type TimesheetRow = {
  employee: Employee;
  timesheet: AttendanceTimesheetData | null;
  error?: string;
};

function formatNumber(value: number | string | null | undefined) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(parsed);
}

function getDayUnits(day?: AttendanceTimesheetDay) {
  if (!day) return null;
  return (
    Number(day.actualWorkUnits ?? day.workedUnits ?? 0) +
    Number(day.overtimeUnits ?? 0) +
    Number(day.bonusUnits ?? 0)
  );
}

function getTotalWorkUnits(timesheet: AttendanceTimesheetData | null | undefined) {
  if (!timesheet) return 0;

  return (
    Number(timesheet.totals.actualWorkUnits ?? timesheet.totals.workedUnits ?? 0) +
    Number(timesheet.totals.overtimeUnits ?? 0) +
    Number(timesheet.totals.bonusUnits ?? 0)
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748b]">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff] text-[#006fd5]">
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-[#1e293b]">{formatNumber(value)}</div>
    </div>
  );
}

export function EmployeeTimesheetOverviewTab({
  employees,
  month,
  refreshKey,
  onMonthChange,
  onViewDetail,
}: EmployeeTimesheetOverviewTabProps) {
  const [rows, setRows] = useState<TimesheetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { days: monthDays } = useMemo(() => buildMonthGrid(month), [month]);

  useEffect(() => {
    let cancelled = false;

    async function loadTimesheets() {
      setLoading(true);
      const targetEmployees = employees;

      try {
        const results = await Promise.allSettled(
          targetEmployees.map((employee) =>
            attendanceService.getEmployeeTimesheet(employee.id, month),
          ),
        );

        if (cancelled) return;

        setRows(
          targetEmployees.map((employee, index) => {
            const result = results[index];
            return {
              employee,
              timesheet: result.status === "fulfilled" ? result.value : null,
              error: result.status === "rejected" ? "Không tải được" : undefined,
            };
          }),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadTimesheets();

    return () => {
      cancelled = true;
    };
  }, [employees, month, refreshKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, month]);

  const filteredRows = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter(({ employee }) =>
      [
        employee.employeeId,
        employee.name,
        employee.department?.name,
        employee.position?.name,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword)),
    );
  }, [rows, searchTerm]);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [currentPage, filteredRows, pageSize]);

  const summary = useMemo(
    () =>
      filteredRows.reduce(
        (total, row) => {
          const timesheet = row.timesheet;
          if (!timesheet) return total;

          return {
            employees: total.employees + 1,
            actualWorkUnits:
              total.actualWorkUnits +
              getTotalWorkUnits(timesheet),
            standardWorkUnits:
              total.standardWorkUnits + Number(timesheet.totals.standardWorkUnits ?? 0),
            overtimeUnits: total.overtimeUnits + Number(timesheet.totals.overtimeUnits ?? 0),
            lateEarlyCount:
              total.lateEarlyCount + Number(timesheet.totals.lateEarlyCount ?? 0),
            leaveOrAbsentDays:
              total.leaveOrAbsentDays +
              Number(timesheet.totals.leaveOrAbsentDays ?? timesheet.totals.leaveDays ?? 0),
          };
        },
        {
          employees: 0,
          actualWorkUnits: 0,
          standardWorkUnits: 0,
          overtimeUnits: 0,
          lateEarlyCount: 0,
          leaveOrAbsentDays: 0,
        },
      ),
    [filteredRows],
  );

  const visibleStart = filteredRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const visibleEnd = Math.min(currentPage * pageSize, filteredRows.length);

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <AttendanceMonthPicker value={month} onChange={onMonthChange} />
        <div className="relative min-w-[280px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#94a3b8]" />
          <input
            className="w-full rounded-full border border-[#e2e8f0] bg-[#f8fafc] py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#006fd5] focus:bg-white focus:ring-2 focus:ring-[#006fd5]/10"
            placeholder="Tìm theo mã, tên, phòng ban, chức vụ..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <div className="hidden">
        <SummaryCard icon={<CalendarDays className="h-4 w-4" />} label="Nhân viên" value={summary.employees} />
        <SummaryCard icon={<Clock3 className="h-4 w-4" />} label="Tổng công" value={summary.actualWorkUnits} />
        <SummaryCard icon={<CalendarDays className="h-4 w-4" />} label="Công chuẩn" value={summary.standardWorkUnits} />
        <SummaryCard icon={<Timer className="h-4 w-4" />} label="Tăng ca" value={summary.overtimeUnits} />
        <SummaryCard icon={<AlertTriangle className="h-4 w-4" />} label="Muộn/sớm" value={summary.lateEarlyCount} />
      </div>

      <section className="relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
        <Spin spinning={loading}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1900px] text-sm">
              <thead className="bg-[#f8fafc] text-xs uppercase tracking-wider text-[#64748b]">
                <tr>
                  <th className="sticky left-0 z-20 w-[220px] bg-[#f8fafc] px-4 py-3.5 text-left font-bold shadow-[1px_0_0_0_#e2e8f0]">
                    Nhân viên
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold">Phòng ban</th>
                  <th className="px-4 py-3.5 text-left font-semibold">Chức vụ</th>
                  {monthDays.map((day) => (
                    <th key={day.key} className="w-14 px-2 py-3.5 text-center font-semibold">
                      {day.day}
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-right font-semibold">Tổng công</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Công chuẩn</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Tăng ca</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Muộn/sớm</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Nghỉ/vắng</th>
                  <th className="sticky right-0 z-20 bg-[#f8fafc] px-4 py-3.5 text-center font-bold shadow-[-1px_0_0_0_#e2e8f0]">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {pagedRows.map(({ employee, timesheet, error }) => {
                  const dayByDate = new Map(timesheet?.days.map((day) => [day.date, day]));

                  return (
                    <tr className="group transition-colors hover:bg-[#f8fafc]" key={employee.id}>
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 shadow-[1px_0_0_0_#e2e8f0] transition-colors group-hover:bg-[#f8fafc]">
                        <div className="font-bold text-[#1e293b]">{employee.name}</div>
                        <div className="text-xs font-medium text-[#64748b]">{employee.employeeId}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#475569]">{employee.department?.name ?? "-"}</td>
                      <td className="px-4 py-3 font-medium text-[#475569]">{employee.position?.name ?? "-"}</td>
                      {monthDays.map((day) => {
                        const dayData = dayByDate.get(day.key);
                        const units = getDayUnits(dayData);
                        const isProblem =
                          (dayData?.lateEarlyCount ?? 0) > 0 ||
                          (dayData?.leaveCount ?? 0) > 0 ||
                          (dayData?.absentCount ?? 0) > 0;

                        return (
                          <td
                            key={day.key}
                            className={`px-2 py-3 text-center font-semibold ${
                              isProblem ? "text-amber-700" : "text-[#1e293b]"
                            }`}
                          >
                            {units == null ? "-" : formatNumber(units)}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-right font-bold text-[#1e293b]">
                        {error
                          ? "-"
                          : formatNumber(getTotalWorkUnits(timesheet))}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#475569]">
                        {error ? "-" : formatNumber(timesheet?.totals.standardWorkUnits)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#0ea5e9]">
                        {error ? "-" : formatNumber(timesheet?.totals.overtimeUnits)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#f59e0b]">
                        {error ? "-" : formatNumber(timesheet?.totals.lateEarlyCount)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#ef4444]">
                        {error
                          ? "-"
                          : formatNumber(timesheet?.totals.leaveOrAbsentDays ?? timesheet?.totals.leaveDays)}
                      </td>
                      <td className="sticky right-0 z-10 bg-white px-4 py-3 shadow-[-1px_0_0_0_#e2e8f0] transition-colors group-hover:bg-[#f8fafc]">
                        <button
                          className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff] text-[#006fd5] transition-all hover:-translate-y-0.5 hover:bg-[#006fd5] hover:text-white hover:shadow-md active:scale-95"
                          type="button"
                          title="Xem chi tiết"
                          onClick={() => onViewDetail(employee.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Spin>

        {!loading && filteredRows.length === 0 ? (
          <div className="border-t border-[#e2e8f0] px-5 py-10 text-center text-sm text-[#64748b]">
            Không có nhân viên phù hợp.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] bg-[#f8fafc] px-5 py-3">
          <span className="text-sm text-[#64748b]">
            Hiển thị <strong className="text-[#1e293b]">{visibleStart}-{visibleEnd}</strong> /{" "}
            <strong className="text-[#1e293b]">{filteredRows.length}</strong> nhân viên
          </span>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredRows.length}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        </div>
      </section>
    </section>
  );
}
