import type { ScheduleDetailPayload } from "../types/schedule.types";

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const currentMonthKey = () => new Date().toISOString().slice(0, 7);

export const toDateKey = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
};

export function getMonthDays(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = new Date(Date.UTC(year, monthNumber - 1, day));

    return {
      key: date.toISOString().slice(0, 10),
      day,
      weekDay: date.getUTCDay(),
    };
  });
}

export function buildMonthGrid(month: string) {
  const days = getMonthDays(month);
  const firstWeekDay = days[0]?.weekDay ?? 0;
  const leadingBlankDays = firstWeekDay === 0 ? 6 : firstWeekDay - 1;

  return {
    days,
    leadingBlankDays,
  };
}

export function buildSundayCalendarCells(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const currentDays = getMonthDays(month);
  const leadingDays = currentDays[0]?.weekDay ?? 0;
  const previousMonthDays = new Date(year, monthNumber - 1, 0).getDate();
  const cells: Array<{
    key: string;
    day: number;
    inMonth: boolean;
    isFuture: boolean;
    weekDay: number;
  }> = [];

  for (let index = leadingDays - 1; index >= 0; index -= 1) {
    const day = previousMonthDays - index;
    const date = new Date(Date.UTC(year, monthNumber - 2, day));
    const key = date.toISOString().slice(0, 10);
    cells.push({
      key,
      day,
      inMonth: false,
      isFuture: key > todayKey(),
      weekDay: date.getUTCDay(),
    });
  }

  for (const day of currentDays) {
    cells.push({
      key: day.key,
      day: day.day,
      inMonth: true,
      isFuture: day.key > todayKey(),
      weekDay: day.weekDay,
    });
  }

  const nextMonthDayCount = 42 - cells.length;
  for (let day = 1; day <= nextMonthDayCount; day += 1) {
    const date = new Date(Date.UTC(year, monthNumber, day));
    const key = date.toISOString().slice(0, 10);
    cells.push({
      key,
      day,
      inMonth: false,
      isFuture: key > todayKey(),
      weekDay: date.getUTCDay(),
    });
  }

  return cells;
}

export function detailsFromDateShiftMap(
  dateShiftMap: Record<string, string[]>,
) {
  return Object.entries(dateShiftMap)
    .filter(([, workShiftIds]) => workShiftIds.length > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map<ScheduleDetailPayload>(([date, workShiftIds]) => ({
      date,
      workShiftIds,
    }));
}

export function buildScheduleDetails(
  month: string,
  selectedWeekDays: number[],
  workShiftIds: string[],
) {
  const minDate = todayKey();

  return getMonthDays(month)
    .filter(
      (day) =>
        selectedWeekDays.includes(day.weekDay) &&
        day.key > minDate &&
        workShiftIds.length > 0,
    )
    .map<ScheduleDetailPayload>((day) => ({
      date: day.key,
      workShiftIds,
    }));
}
