import { useMemo } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import type { WorkShift } from "../../work-shifts/types/workShift.types";
import {
  buildSundayCalendarCells,
  currentMonthKey,
  detailsFromDateShiftMap,
  todayKey,
} from "../utils/scheduleDateUtils";

const weekDayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export type DateShiftMap = Record<string, string[]>;

type ScheduleDateShiftPickerProps = {
  month: string;
  selectedDate: string;
  dateShiftMap: DateShiftMap;
  workShifts: WorkShift[];
  onMonthChange: (month: string) => void;
  onSelectedDateChange: (date: string) => void;
  onDateShiftMapChange: (value: DateShiftMap) => void;
};

export function ScheduleDateShiftPicker({
  month,
  selectedDate,
  dateShiftMap,
  workShifts,
  onMonthChange,
  onSelectedDateChange,
  onDateShiftMapChange,
}: ScheduleDateShiftPickerProps) {
  const cells = useMemo(() => buildSundayCalendarCells(month), [month]);
  const selectedShiftIds = dateShiftMap[selectedDate] ?? [];
  const scheduleDetails = useMemo(
    () => detailsFromDateShiftMap(dateShiftMap),
    [dateShiftMap],
  );

  const toggleShiftForSelectedDate = (workShiftId: string) => {
    if (!selectedDate || selectedDate <= todayKey()) {
      return;
    }

    const currentShiftIds = dateShiftMap[selectedDate] ?? [];
    const nextShiftIds = currentShiftIds.includes(workShiftId)
      ? currentShiftIds.filter((id) => id !== workShiftId)
      : [...currentShiftIds, workShiftId];

    const nextMap = { ...dateShiftMap };
    if (nextShiftIds.length > 0) {
      nextMap[selectedDate] = nextShiftIds;
    } else {
      delete nextMap[selectedDate];
    }

    onDateShiftMapChange(nextMap);
  };

  const clearSelectedDate = () => {
    const nextMap = { ...dateShiftMap };
    delete nextMap[selectedDate];
    onDateShiftMapChange(nextMap);
  };

  const applySelectedShiftsToAllMonthDays = () => {
    if (selectedShiftIds.length === 0) {
      return;
    }

    const nextMap = { ...dateShiftMap };

    for (const cell of cells) {
      if (cell.inMonth && cell.isFuture) {
        nextMap[cell.key] = [...selectedShiftIds];
      }
    }

    onDateShiftMapChange(nextMap);
  };

  const handlePrevMonth = () => {
    const [yearStr, monthStr] = month.split("-");
    const d = new Date(parseInt(yearStr), parseInt(monthStr) - 2, 1);
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (newMonth >= currentMonthKey()) {
      onMonthChange(newMonth);
      onSelectedDateChange("");
      onDateShiftMapChange({});
    }
  };

  const handleNextMonth = () => {
    const [yearStr, monthStr] = month.split("-");
    const d = new Date(parseInt(yearStr), parseInt(monthStr), 1);
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    onMonthChange(newMonth);
    onSelectedDateChange("");
    onDateShiftMapChange({});
  };

  return (
    <section className="grid content-start gap-4 rounded-xl border border-[#ebedf2] bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] 2xl:p-5">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f7ff] text-[#006fd5]">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#243247]">
              Chọn ngày áp dụng
            </h2>
            <p className="text-xs text-[#667085]">
              Chọn ngày trên lịch, sau đó đánh dấu ca làm việc
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-1 rounded-lg border border-[#d0d5dd] bg-white p-1 shadow-sm">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded text-[#667085] hover:bg-[#f9fafb] hover:text-[#344054] disabled:opacity-30 disabled:hover:bg-transparent"
            onClick={handlePrevMonth}
            disabled={month <= currentMonthKey()}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            className="min-w-[110px] bg-transparent text-center text-sm font-semibold text-[#243247] outline-none [color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden"
            type="month"
            min={currentMonthKey()}
            value={month}
            onChange={(event) => {
              onMonthChange(event.target.value);
              onSelectedDateChange("");
              onDateShiftMapChange({});
            }}
          />
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded text-[#667085] hover:bg-[#f9fafb] hover:text-[#344054]"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-xl border border-[#ebedf2]">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-[#ebedf2] bg-[#f9fafb]">
          {weekDayLabels.map((label, index) => (
            <div
              className={`py-2.5 text-center text-[11px] font-bold uppercase tracking-wide ${
                index === 0 || index === 6 ? "text-[#f04438]" : "text-[#667085]"
              }`}
              key={label}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 gap-px bg-[#ebedf2] p-px">
          {cells.map((cell) => {
            const shiftCount = dateShiftMap[cell.key]?.length ?? 0;
            const isSelected = selectedDate === cell.key;
            const disabled = !cell.inMonth || !cell.isFuture;
            const hasShift = shiftCount > 0;
            const isToday = cell.key === todayKey();

            let cellClasses =
              "relative min-h-[52px] bg-white p-1.5 transition-colors outline-none 2xl:min-h-[64px]";
            let numberClasses =
              "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold";

            if (disabled) {
              cellClasses += " bg-[#fafafa] cursor-not-allowed";
              numberClasses += " text-[#c9cdd4]";
            } else {
              cellClasses += " cursor-pointer hover:bg-[#f0f7ff]";

              if (isSelected) {
                cellClasses += " ring-2 ring-inset ring-[#006fd5] bg-[#f8fbff]";
                numberClasses += " bg-[#006fd5] text-white";
              } else if (hasShift) {
                cellClasses += " bg-[#f0f7ff]";
                numberClasses += " text-[#006fd5]";
              } else if (isToday) {
                numberClasses += " text-[#006fd5] border border-[#006fd5]";
              } else {
                numberClasses += " text-[#344054]";
              }
            }

            return (
              <button
                className={cellClasses}
                disabled={disabled}
                key={cell.key}
                type="button"
                onClick={() => onSelectedDateChange(cell.key)}
              >
                <div className={numberClasses}>{cell.day}</div>

                {/* Status Indicator */}
                {!disabled && (
                  <div className="mt-1 flex flex-col items-center gap-0.5">
                    {hasShift ? (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#006fd5] px-1 text-[10px] font-bold text-white shadow-sm">
                        {shiftCount}
                      </span>
                    ) : isSelected ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#d0d5dd]" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shifts Configuration Section */}
      <div className="overflow-hidden rounded-xl border border-[#ebedf2] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f5] bg-[#f9fafb] px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-[#243247]">
              {selectedDate
                ? `Ca làm việc ngày ${selectedDate.split("-").reverse().join("/")}`
                : "Chưa chọn ngày"}
            </h3>
            <p className="text-xs text-[#667085]">
              {selectedDate
                ? `${selectedShiftIds.length} ca đã chọn`
                : "Chọn một ngày trên lịch để cấu hình ca"}
            </p>
          </div>
          {selectedShiftIds.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                className="rounded-lg border border-[#b9d9ff] bg-[#f0f7ff] px-3 py-1.5 text-xs font-semibold text-[#006fd5] transition-colors hover:bg-[#dcebff]"
                type="button"
                onClick={applySelectedShiftsToAllMonthDays}
              >
                Áp dụng cả tháng
              </button>
              <button
                className="rounded-lg border border-[#fecdca] bg-white px-3 py-1.5 text-xs font-semibold text-[#b42318] transition-colors hover:bg-[#fffbfa]"
                type="button"
                onClick={clearSelectedDate}
              >
                Xóa ngày này
              </button>
            </div>
          )}
        </div>

        {!selectedDate ? (
          <div className="m-4 rounded-lg border border-dashed border-[#d0d5dd] bg-[#fbfcff] py-8 text-center text-sm text-[#98a2b3]">
            Nhấp vào một ngày hợp lệ trên lịch để chọn ca
          </div>
        ) : (
          <div className="grid gap-2 p-3">
            {workShifts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#d0d5dd] bg-[#fbfcff] py-8 text-center text-sm text-[#98a2b3]">
                Chưa có ca làm việc nào trên hệ thống
              </div>
            ) : (
              workShifts.map((shift) => {
                const isChecked = selectedShiftIds.includes(shift.id);
                return (
                  <label
                    className={`group flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition-all ${
                      isChecked
                        ? "border-[#006fd5] bg-[#f0f7ff] shadow-[0_1px_2px_rgba(0,111,213,0.12)]"
                        : "border-[#e4e7ec] bg-white hover:border-[#b9d9ff] hover:bg-[#fbfdff]"
                    }`}
                    key={shift.id}
                  >
                    <input
                      type="checkbox"
                      className="absolute h-0 w-0 opacity-0"
                      checked={isChecked}
                      onChange={() => toggleShiftForSelectedDate(shift.id)}
                    />
                    <div
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
                        isChecked
                          ? "border-[#006fd5] bg-[#006fd5]"
                          : "border-[#d0d5dd] bg-white group-hover:border-[#006fd5]"
                      }`}
                    >
                      {isChecked && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className="grid min-w-0 flex-1 gap-1">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                            isChecked
                              ? "bg-[#006fd5] text-white"
                              : "bg-[#eef2f6] text-[#475467]"
                          }`}
                        >
                          {shift.code}
                        </span>
                        <span
                          className={`truncate text-sm font-semibold ${isChecked ? "text-[#006fd5]" : "text-[#344054]"}`}
                        >
                          {shift.name}
                        </span>
                      </span>
                      <span
                        className={`text-xs ${isChecked ? "text-[#3b6ab5]" : "text-[#667085]"}`}
                      >
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-[#e0ecff] bg-[#f0f7ff] px-4 py-3 text-sm font-medium text-[#006fd5]">
        <CheckCircle2 className="h-4 w-4" />
        Đã cấu hình {scheduleDetails.length} ngày áp dụng.
      </div>
    </section>
  );
}
