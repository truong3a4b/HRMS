import { Modal, Spin, Tag } from "antd";
import dayjs from "dayjs";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Timer,
  Umbrella,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import type { Employee } from "../../employees/types/employee.types";
import { buildMonthGrid, todayKey } from "../../schedules/utils/scheduleDateUtils";
import type {
  AttendanceRecordDetail,
  AttendanceTimesheetData,
  AttendanceTimesheetDay,
} from "../types/attendance.types";
import { AttendanceMonthPicker } from "./AttendanceMonthPicker";

type AttendanceTimesheetTabProps = {
  data: AttendanceTimesheetData | null;
  loading: boolean;
  employeeScoped: boolean;
  employees: Employee[];
  employeeId: string;
  month: string;
  onEmployeeChange: (value: string) => void;
  onMonthChange: (value: string) => void;
};

type CalendarCell = {
  date: string;
  inMonth: boolean;
  day?: AttendanceTimesheetDay;
};

const weekDayLabels = [
  { label: "T2", isSunday: false },
  { label: "T3", isSunday: false },
  { label: "T4", isSunday: false },
  { label: "T5", isSunday: false },
  { label: "T6", isSunday: false },
  { label: "T7", isSunday: false },
  { label: "CN", isSunday: true },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  PRESENT: { label: "Đủ công", color: "green" },
  LATE: { label: "Đi muộn", color: "gold" },
  EARLY_LEAVE: { label: "Về sớm", color: "orange" },
  LATE_AND_EARLY_LEAVE: { label: "Muộn/về sớm", color: "volcano" },
  ABSENT: { label: "Vắng", color: "red" },
  ON_LEAVE: { label: "Nghỉ", color: "blue" },
  PAID_LEAVE: { label: "Nghỉ phép", color: "blue" },
  UNPAID_LEAVE: { label: "Nghỉ không lương", color: "default" },
};

function formatNumber(value: number | string | null | undefined) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(
    parsed,
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : "-";
}

function formatTime(value?: string | null) {
  if (!value) return "-";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("HH:mm") : "-";
}

function getStatusConfig(status: string) {
  return statusConfig[status] ?? { label: status, color: "default" };
}

function getCellTone(day?: AttendanceTimesheetDay) {
  if (!day || !day.recordDetails?.length) {
    return "bg-white text-slate-700";
  }

  if ((day.absentCount ?? 0) > 0 || (day.leaveCount ?? 0) > 0) {
    return "bg-[#fffbeb] text-[#7a2e0e]";
  }

  if ((day.lateEarlyCount ?? 0) > 0) {
    return "bg-[#fff5f5] text-[#912018]";
  }

  if (day.overtimeUnits > 0) {
    return "bg-[#eff8ff] text-[#175cd3]";
  }

  return "bg-[#f6fef9] text-[#067647]";
}

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string | null | undefined;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </span>
        <span className="min-w-0 truncate">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-extrabold text-slate-800">
        {formatNumber(value)}
      </div>
    </div>
  );
}

function ShiftStatusList({ details }: { details: AttendanceRecordDetail[] }) {
  if (details.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 w-full space-y-1.5 overflow-y-auto pr-1">
      {details.slice(0, 3).map((detail) => {
        const status = getStatusConfig(detail.status);
        return (
          <div
            key={detail.id}
            className="flex min-w-0 flex-col gap-0.5 rounded-md border border-slate-200/80 bg-white/90 p-1.5 shadow-2xs"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="min-w-0 truncate text-[11px] font-bold text-slate-800">
                {detail.workShiftCode ? `${detail.workShiftCode} - ` : ""}
                {detail.workShiftName}
              </span>
              <Tag
                className="m-0 shrink-0 text-[10px] leading-3 py-0.5 px-1"
                color={status.color}
              >
                {status.label}
              </Tag>
            </div>
            <div className="text-[10px] font-medium text-slate-500">
              {detail.shiftStartClock ?? formatTime(detail.shiftStartTime)}
              {" - "}
              {detail.shiftEndClock ?? formatTime(detail.shiftEndTime)}
            </div>
          </div>
        );
      })}
      {details.length > 3 ? (
        <div className="text-[11px] font-semibold text-blue-600">
          +{details.length - 3} ca khác
        </div>
      ) : null}
    </div>
  );
}

export function AttendanceTimesheetTab({
  data,
  loading,
  employeeScoped,
  employees,
  employeeId,
  month,
  onEmployeeChange,
  onMonthChange,
}: AttendanceTimesheetTabProps) {
  const [selectedCell, setSelectedCell] = useState<CalendarCell | null>(null);
  const currentTodayKey = todayKey();

  const { days: monthDays, leadingBlankDays } = useMemo(
    () => buildMonthGrid(month),
    [month],
  );

  const dayByDate = useMemo(
    () => new Map(data?.days?.map((day) => [day.date, day])),
    [data?.days],
  );

  const selectedDetails = selectedCell?.day?.recordDetails ?? [];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {employeeScoped ? (
          <div className="min-w-[260px] flex-1">
            <SearchableSelect
              value={employeeId}
              onChange={onEmployeeChange}
              options={[
                { value: "", label: "Chọn nhân viên" },
                ...employees.map((employee) => ({
                  value: employee.id,
                  label: `${employee.employeeId} - ${employee.name}`,
                })),
              ]}
            />
          </div>
        ) : null}
        <AttendanceMonthPicker value={month} onChange={onMonthChange} />
      </div>

      <div className="grid grid-cols-5 gap-4 max-[1180px]:grid-cols-3 max-[720px]:grid-cols-2">
        <SummaryMetric
          icon={<CalendarDays className="h-4 w-4" />}
          label="Công chuẩn"
          value={data?.totals.standardWorkUnits}
        />
        <SummaryMetric
          icon={<Clock3 className="h-4 w-4" />}
          label="Công thực tế"
          value={data?.totals.actualWorkUnits ?? data?.totals.workedUnits}
        />
        <SummaryMetric
          icon={<Timer className="h-4 w-4" />}
          label="Tăng ca"
          value={data?.totals.overtimeUnits}
        />
        <SummaryMetric
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Đi muộn/về sớm"
          value={data?.totals.lateEarlyCount}
        />
        <SummaryMetric
          icon={<Umbrella className="h-4 w-4" />}
          label="Nghỉ hoặc vắng"
          value={data?.totals.leaveOrAbsentDays ?? data?.totals.leaveDays}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <Spin spinning={loading}>
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
          <div className="grid auto-rows-[minmax(120px,1fr)] grid-cols-7 gap-px bg-slate-200 p-px">
            {Array.from({ length: leadingBlankDays }).map((_, index) => (
              <div className="bg-slate-50/50" key={`blank-${index}`} />
            ))}
            {monthDays.map((monthDay, index) => {
              const dayData = dayByDate.get(monthDay.key);
              const isToday = monthDay.key === currentTodayKey;
              const colIndex = (leadingBlankDays + index) % 7;
              const isSunday = colIndex === 6;
              const details = dayData?.recordDetails ?? [];
              const tone = getCellTone(dayData);

              return (
                <button
                  key={monthDay.key}
                  type="button"
                  className={`relative flex min-h-[120px] flex-col p-2 text-left transition-colors hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 ${tone}`}
                  onClick={() =>
                    setSelectedCell({
                      date: monthDay.key,
                      inMonth: true,
                      day: dayData,
                    })
                  }
                >
                  {isToday && (
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-600" />
                  )}

                  <div className="mb-2 flex w-full items-center justify-between gap-1">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isToday
                          ? "bg-blue-600 text-white"
                          : isSunday
                            ? "text-red-500"
                            : "text-slate-700"
                      }`}
                    >
                      {monthDay.day}
                    </span>
                    {dayData ? (
                      <span className="text-[11px] font-semibold text-slate-600">
                        {formatNumber(
                          dayData.actualWorkUnits ?? dayData.workedUnits,
                        )}
                        /{formatNumber(dayData.standardWorkUnits)}
                      </span>
                    ) : null}
                  </div>
                  <ShiftStatusList details={details} />
                </button>
              );
            })}
          </div>
        </Spin>
      </div>

      <Modal
        title={
          selectedCell
            ? `Chi tiết ngày ${dayjs(selectedCell.date).format("DD/MM/YYYY")}`
            : "Chi tiết ngày"
        }
        open={Boolean(selectedCell)}
        onCancel={() => setSelectedCell(null)}
        footer={null}
        width={760}
      >
        <div className="space-y-3">
          {selectedCell?.day ? (
            <div className="grid grid-cols-4 gap-2 rounded-lg border border-[#e4e7ec] bg-[#f8fafc] p-3 text-sm max-[640px]:grid-cols-2">
              <div>
                <div className="text-xs text-[#667085]">Công chuẩn</div>
                <div className="font-bold text-[#243247]">
                  {formatNumber(selectedCell.day.standardWorkUnits)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#667085]">Công thực tế</div>
                <div className="font-bold text-[#243247]">
                  {formatNumber(
                    selectedCell.day.actualWorkUnits ??
                      selectedCell.day.workedUnits,
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#667085]">Tăng ca</div>
                <div className="font-bold text-[#243247]">
                  {formatNumber(selectedCell.day.overtimeUnits)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#667085]">Muộn/về sớm</div>
                <div className="font-bold text-[#243247]">
                  {formatNumber(selectedCell.day.lateEarlyCount)}
                </div>
              </div>
            </div>
          ) : null}

          {selectedDetails.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#d0d5dd] p-6 text-center text-sm text-[#667085]">
              Chưa có ca chấm công nào trong ngày này.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDetails.map((detail) => {
                const status = getStatusConfig(detail.status);
                return (
                  <div
                    key={detail.id}
                    className="rounded-lg border border-[#e4e7ec] p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-[#243247]">
                          {detail.workShiftCode
                            ? `${detail.workShiftCode} - `
                            : ""}
                          {detail.workShiftName}
                        </div>
                        <div className="text-xs text-[#667085]">
                          {detail.shiftStartClock ??
                            formatDateTime(detail.shiftStartTime)}
                          {" - "}
                          {detail.shiftEndClock ??
                            formatDateTime(detail.shiftEndTime)}
                        </div>
                      </div>
                      <Tag color={status.color}>{status.label}</Tag>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2 text-sm max-[640px]:grid-cols-2">
                      <div>
                        <div className="text-xs text-[#667085]">Check-in</div>
                        <div className="font-medium text-[#243247]">
                          {formatDateTime(detail.checkInTime)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#667085]">Check-out</div>
                        <div className="font-medium text-[#243247]">
                          {formatDateTime(detail.checkOutTime)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#667085]">Công tính</div>
                        <div className="font-medium text-[#243247]">
                          {formatNumber(detail.countedWorkUnits)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#667085]">Tăng ca</div>
                        <div className="font-medium text-[#243247]">
                          {formatNumber(detail.countedOvertimeUnits)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </section>
  );
}
