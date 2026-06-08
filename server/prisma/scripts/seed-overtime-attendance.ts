import "dotenv/config";
import { AttendanceStatus, Prisma } from "../../generated/prisma/client";
import { prisma } from "../../src/config/prisma";

const rawArgs = new Map(
  process.argv
    .slice(2)
    .map((arg) => arg.replace(/^--/, "").split("="))
    .filter(([key, value]) => key && value)
    .map(([key, value]) => [key, value]),
);

const employeesArg = rawArgs.get("employees") ?? rawArgs.get("employee");
const countArg = rawArgs.get("count") ?? "5";
const shiftsArg = rawArgs.get("shifts") ?? rawArgs.get("shift");
const statusArg = (rawArgs.get("status") ?? "present").toLowerCase();

const parseCodes = (value: string | undefined) =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseDateOnly = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    throw new Error(`Invalid date "${value}". Use YYYY-MM-DD, for example 2026-06-08`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date "${value}". Use YYYY-MM-DD, for example 2026-06-08`);
  }

  return date;
};

const addUtcDays = (date: Date, days: number) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const getTargetDates = () => {
  const datesArg = rawArgs.get("dates") ?? rawArgs.get("date");
  const fromArg = rawArgs.get("from");
  const toArg = rawArgs.get("to");

  if (datesArg) {
    const dates = datesArg.split(",").map(parseDateOnly);
    const seen = new Set<string>();

    return dates.filter((date) => {
      const key = toDateKey(date);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }

  if (fromArg && toArg) {
    const from = parseDateOnly(fromArg);
    const to = parseDateOnly(toArg);

    if (from.getTime() > to.getTime()) {
      throw new Error("--from must be before or equal to --to");
    }

    const dates: Date[] = [];

    for (let date = from; date <= to; date = addUtcDays(date, 1)) {
      dates.push(date);
    }

    return dates;
  }

  throw new Error(
    "--date/--dates or --from and --to is required. Example: --date=2026-06-08",
  );
};

const parseClockToMinutes = (clock: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(clock);

  if (!match) {
    throw new Error(`Invalid shift clock: ${clock}`);
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour > 23 || minute > 59) {
    throw new Error(`Invalid shift clock: ${clock}`);
  }

  return hour * 60 + minute;
};

const clockOnDate = (date: Date, clock: string, dayOffset = 0) => {
  const minutes = parseClockToMinutes(clock);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + dayOffset,
      hour,
      minute,
    ),
  );
};

const offsetClockOnDate = (date: Date, clock: string, offsetMinutes: number, dayOffset = 0) => {
  const base = clockOnDate(date, clock, dayOffset);
  return new Date(base.getTime() + offsetMinutes * 60_000);
};

const shuffle = <T>(items: T[]) => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
};

const getRandomOvertimeStatus = () => {
  if (statusArg === "present") {
    return AttendanceStatus.PRESENT;
  }

  if (statusArg !== "random") {
    throw new Error('--status must be "present" or "random"');
  }

  const value = Math.random();

  if (value < 0.85) {
    return AttendanceStatus.PRESENT;
  }

  const statuses = [
    AttendanceStatus.LATE,
    AttendanceStatus.EARLY_LEAVE,
    AttendanceStatus.LATE_AND_EARLY_LEAVE,
  ];

  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getCheckTimes = (
  date: Date,
  shift: {
    startTime: string;
    endTime: string;
    isOvernight: boolean;
  },
  status: AttendanceStatus,
) => {
  const isLate =
    status === AttendanceStatus.LATE || status === AttendanceStatus.LATE_AND_EARLY_LEAVE;
  const isEarly =
    status === AttendanceStatus.EARLY_LEAVE ||
    status === AttendanceStatus.LATE_AND_EARLY_LEAVE;
  const checkoutDayOffset = shift.isOvernight ? 1 : 0;

  return {
    checkInTime: offsetClockOnDate(date, shift.startTime, isLate ? 15 : -3),
    checkOutTime: offsetClockOnDate(date, shift.endTime, isEarly ? -15 : 3, checkoutDayOffset),
  };
};

type EmployeeSeedInfo = {
  id: string;
  employeeId: string;
  name: string;
};

type WorkShiftSeedInfo = Prisma.WorkShiftGetPayload<{}>;

async function getRandomEmployees() {
  const employeeCodes = parseCodes(employeesArg);
  const employees = await prisma.employee.findMany({
    where: {
      status: "WORKING",
      ...(employeeCodes?.length ? { employeeId: { in: employeeCodes } } : {}),
    },
    select: { id: true, employeeId: true, name: true },
    orderBy: { employeeId: "asc" },
  });

  if (employeeCodes?.length) {
    const foundCodes = new Set(employees.map((employee) => employee.employeeId));
    const missingCodes = employeeCodes.filter((code) => !foundCodes.has(code));

    if (missingCodes.length > 0) {
      throw new Error(`Working employee not found: ${missingCodes.join(", ")}`);
    }
  }

  if (employees.length === 0) {
    throw new Error("No working employees found");
  }

  const count = countArg.toLowerCase() === "all" ? employees.length : Number(countArg);

  if (!Number.isInteger(count) || count < 1) {
    throw new Error("--count must be a positive integer or all");
  }

  return shuffle(employees).slice(0, Math.min(count, employees.length));
}

async function getOvertimeWorkShifts() {
  const shiftCodes = parseCodes(shiftsArg);
  const shifts = await prisma.workShift.findMany({
    where: {
      isActive: true,
      isOvertime: true,
      ...(shiftCodes?.length ? { code: { in: shiftCodes } } : {}),
    },
    orderBy: { startTime: "asc" },
  });

  if (shiftCodes?.length) {
    const foundCodes = new Set(shifts.map((shift) => shift.code));
    const missingCodes = shiftCodes.filter((code) => !foundCodes.has(code));

    if (missingCodes.length > 0) {
      throw new Error(`Active overtime work shift not found: ${missingCodes.join(", ")}`);
    }

    return shiftCodes.map((code) => shifts.find((shift) => shift.code === code)!);
  }

  if (shifts.length === 0) {
    throw new Error("No active overtime work shifts found. Pass --shifts=OT_CODE if needed.");
  }

  return shifts;
}

async function seedOvertimeDay(
  employee: EmployeeSeedInfo,
  date: Date,
  shifts: WorkShiftSeedInfo[],
) {
  const schedule = await prisma.workSchedule.upsert({
    where: {
      employeeId_date: {
        employeeId: employee.id,
        date,
      },
    },
    update: {},
    create: {
      employeeId: employee.id,
      date,
    },
  });

  const attendanceRecord = await prisma.attendanceRecord.upsert({
    where: {
      employeeId_date: {
        employeeId: employee.id,
        date,
      },
    },
    update: {},
    create: {
      employeeId: employee.id,
      date,
    },
  });

  for (const shift of shifts) {
    await prisma.workScheduleShift.upsert({
      where: {
        workScheduleId_workShiftId: {
          workScheduleId: schedule.id,
          workShiftId: shift.id,
        },
      },
      update: {},
      create: {
        workScheduleId: schedule.id,
        workShiftId: shift.id,
      },
    });

    const status = getRandomOvertimeStatus();
    const { checkInTime, checkOutTime } = getCheckTimes(date, shift, status);
    const shiftEndDayOffset = shift.isOvernight ? 1 : 0;

    await prisma.attendanceRecordDetail.upsert({
      where: {
        attendanceRecordId_workShiftId: {
          attendanceRecordId: attendanceRecord.id,
          workShiftId: shift.id,
        },
      },
      update: {
        checkInTime,
        checkOutTime,
        status,
        shiftIsOvertime: true,
      },
      create: {
        attendanceRecordId: attendanceRecord.id,
        workShiftId: shift.id,
        workShiftCode: shift.code,
        workShiftName: shift.name,
        shiftStartClock: shift.startTime,
        shiftEndClock: shift.endTime,
        shiftStartTime: clockOnDate(date, shift.startTime),
        shiftEndTime: clockOnDate(date, shift.endTime, shiftEndDayOffset),
        shiftBreakStartTime: shift.breakStartTime,
        shiftBreakEndTime: shift.breakEndTime,
        shiftLateGracePeriod: shift.lateGracePeriod,
        shiftEarlyLeaveGracePeriod: shift.earlyLeaveGracePeriod,
        shiftCheckInStartTime: shift.checkInStartTime,
        shiftCheckInEndTime: shift.checkInEndTime,
        shiftCheckOutStartTime: shift.checkOutStartTime,
        shiftCheckOutEndTime: shift.checkOutEndTime,
        shiftIsOvernight: shift.isOvernight,
        shiftIsOvertime: true,
        shiftWorkUnits: shift.workUnits,
        shiftOvertimeMultiplier: shift.overtimeMultiplier,
        checkInTime,
        checkOutTime,
        status,
      },
    });
  }
}

async function main() {
  const [dates, employees, shifts] = await Promise.all([
    Promise.resolve(getTargetDates()),
    getRandomEmployees(),
    getOvertimeWorkShifts(),
  ]);

  console.log(
    `Seeding OT on ${dates.map(toDateKey).join(", ")} for ${employees.length} random employees with shifts ${shifts.map((shift) => shift.code).join(", ")}`,
  );

  for (const date of dates) {
    for (const employee of employees) {
      await seedOvertimeDay(employee, date, shifts);
    }

    console.log(
      `${toDateKey(date)}: ${employees
        .map((employee) => `${employee.employeeId} - ${employee.name}`)
        .join("; ")}`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
