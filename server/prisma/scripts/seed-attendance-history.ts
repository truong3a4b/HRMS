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

const employeeArg =
  rawArgs.get("employees") ?? rawArgs.get("employee") ?? "all";
const monthsArg = rawArgs.get("months") ?? "3";
const shiftsArg = rawArgs.get("shifts") ?? rawArgs.get("shift");

const utcDateOnly = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day));

const addUtcDays = (date: Date, days: number) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
    ),
  );

const isWeekend = (date: Date) => {
  const day = date.getUTCDay();
  return day === 0;
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

const offsetClockOnDate = (
  date: Date,
  clock: string,
  offsetMinutes: number,
  dayOffset = 0,
) => {
  const base = clockOnDate(date, clock, dayOffset);
  return new Date(base.getTime() + offsetMinutes * 60_000);
};

const parseMonthValue = (month: string) => {
  const match = /^(\d{4})-(\d{2})$/.exec(month.trim());

  if (!match) {
    throw new Error(
      `Invalid month "${month}". Use YYYY-MM, for example 2026-05`,
    );
  }

  const year = Number(match[1]);
  const monthNumber = Number(match[2]);

  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error(
      `Invalid month "${month}". Use YYYY-MM, for example 2026-05`,
    );
  }

  return {
    year,
    month: monthNumber - 1,
    key: `${year}-${String(monthNumber).padStart(2, "0")}`,
  };
};

const getTargetMonths = () => {
  if (/^\d+$/.test(monthsArg)) {
    const count = Number(monthsArg);

    if (count < 1) {
      throw new Error("--months must be a positive integer or a YYYY-MM list");
    }

    const now = new Date();
    return Array.from({ length: count }, (_, index) => {
      const offset = count - index;
      const target = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1),
      );
      const year = target.getUTCFullYear();
      const month = target.getUTCMonth();

      return {
        year,
        month,
        key: `${year}-${String(month + 1).padStart(2, "0")}`,
      };
    });
  }

  const months = monthsArg.split(",").map(parseMonthValue);
  const seen = new Set<string>();

  return months.filter((month) => {
    if (seen.has(month.key)) {
      return false;
    }

    seen.add(month.key);
    return true;
  });
};

const parseCodes = (value: string | undefined, label: string) => {
  const codes = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!codes?.length) {
    throw new Error(`--${label} is required. Example: --${label}=HC,OT1`);
  }

  return [...new Set(codes)];
};

const getRandomStatus = () => {
  const value = Math.random();

  if (value < 0.8) {
    return AttendanceStatus.PRESENT;
  }

  if (value < 0.95) {
    const lateEarlyStatuses = [
      AttendanceStatus.LATE,
      AttendanceStatus.EARLY_LEAVE,
      AttendanceStatus.LATE_AND_EARLY_LEAVE,
    ];
    return lateEarlyStatuses[
      Math.floor(Math.random() * lateEarlyStatuses.length)
    ];
  }

  const leaveOrAbsentStatuses = [
    AttendanceStatus.PAID_LEAVE,
    AttendanceStatus.UNPAID_LEAVE,
    AttendanceStatus.ABSENT,
  ];
  return leaveOrAbsentStatuses[
    Math.floor(Math.random() * leaveOrAbsentStatuses.length)
  ];
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
  if (
    status === AttendanceStatus.ABSENT ||
    status === AttendanceStatus.ON_LEAVE ||
    status === AttendanceStatus.PAID_LEAVE ||
    status === AttendanceStatus.UNPAID_LEAVE
  ) {
    return { checkInTime: null, checkOutTime: null };
  }

  const isLate =
    status === AttendanceStatus.LATE ||
    status === AttendanceStatus.LATE_AND_EARLY_LEAVE;
  const isEarly =
    status === AttendanceStatus.EARLY_LEAVE ||
    status === AttendanceStatus.LATE_AND_EARLY_LEAVE;
  const checkoutDayOffset = shift.isOvernight ? 1 : 0;

  return {
    checkInTime: offsetClockOnDate(date, shift.startTime, isLate ? 25 : -4),
    checkOutTime: offsetClockOnDate(
      date,
      shift.endTime,
      isEarly ? -25 : 4,
      checkoutDayOffset,
    ),
  };
};

type WorkShiftSeedInfo = Prisma.WorkShiftGetPayload<{}>;

async function getEmployees() {
  if (employeeArg.toLowerCase() === "all") {
    return prisma.employee.findMany({
      where: { status: "WORKING" },
      select: { id: true, employeeId: true, name: true },
      orderBy: { employeeId: "asc" },
    });
  }

  const employeeCodes = parseCodes(employeeArg, "employees");
  const employees = await prisma.employee.findMany({
    where: {
      employeeId: { in: employeeCodes },
    },
    select: { id: true, employeeId: true, name: true },
    orderBy: { employeeId: "asc" },
  });
  const foundCodes = new Set(employees.map((employee) => employee.employeeId));
  const missingCodes = employeeCodes.filter((code) => !foundCodes.has(code));

  if (missingCodes.length > 0) {
    throw new Error(`Employee not found: ${missingCodes.join(", ")}`);
  }

  return employees;
}

async function getRequiredWorkShifts() {
  const shiftCodes = parseCodes(shiftsArg, "shifts");
  const shifts = await prisma.workShift.findMany({
    where: {
      code: { in: shiftCodes },
      isActive: true,
    },
    orderBy: { startTime: "asc" },
  });
  const foundCodes = new Set(shifts.map((shift) => shift.code));
  const missingCodes = shiftCodes.filter((code) => !foundCodes.has(code));

  if (missingCodes.length > 0) {
    throw new Error(`Active work shift not found: ${missingCodes.join(", ")}`);
  }

  return shiftCodes.map((code) => shifts.find((shift) => shift.code === code)!);
}

async function seedDay(
  employeeId: string,
  date: Date,
  shifts: WorkShiftSeedInfo[],
) {
  const schedule = await prisma.workSchedule.upsert({
    where: {
      employeeId_date: {
        employeeId,
        date,
      },
    },
    update: {},
    create: {
      employeeId,
      date,
    },
  });

  const attendanceRecord = await prisma.attendanceRecord.upsert({
    where: {
      employeeId_date: {
        employeeId,
        date,
      },
    },
    update: {},
    create: {
      employeeId,
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

    const status = getRandomStatus();
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
        shiftIsOvertime: shift.isOvertime,
        shiftWorkUnits: shift.workUnits,
        shiftOvertimeMultiplier: shift.overtimeMultiplier,
        checkInTime,
        checkOutTime,
        status,
      },
    });
  }
}

async function seedMonth(
  employeeId: string,
  year: number,
  month: number,
  shifts: WorkShiftSeedInfo[],
) {
  const firstDay = utcDateOnly(year, month, 1);
  const nextMonth = utcDateOnly(year, month + 1, 1);
  let standardWorkUnits = 0;

  for (let date = firstDay; date < nextMonth; date = addUtcDays(date, 1)) {
    if (isWeekend(date)) {
      continue;
    }

    standardWorkUnits += shifts.reduce(
      (total, shift) =>
        shift.isOvertime ? total : total + Number(shift.workUnits),
      0,
    );

    await seedDay(employeeId, date, shifts);
  }

  await prisma.employeeStandardWorkDay.upsert({
    where: {
      employeeId_month_year: {
        employeeId,
        month: month + 1,
        year,
      },
    },
    update: {
      standardWorkDays: standardWorkUnits,
      note: "Generated random test attendance data",
    },
    create: {
      employeeId,
      month: month + 1,
      year,
      standardWorkDays: standardWorkUnits,
      note: "Generated random test attendance data",
    },
  });

  return standardWorkUnits;
}

async function main() {
  const targetMonths = getTargetMonths();
  const [employees, shifts] = await Promise.all([
    getEmployees(),
    getRequiredWorkShifts(),
  ]);

  if (employees.length === 0) {
    throw new Error("No working employees found");
  }

  console.log(
    `Seeding ${targetMonths.map((month) => month.key).join(", ")} for ${employees.length} employees with shifts ${shifts.map((shift) => shift.code).join(", ")}`,
  );

  for (const employee of employees) {
    const seeded: string[] = [];

    for (const targetMonth of targetMonths) {
      const standardWorkUnits = await seedMonth(
        employee.id,
        targetMonth.year,
        targetMonth.month,
        shifts,
      );
      seeded.push(`${targetMonth.key} (${standardWorkUnits} units)`);
    }

    console.log(
      `${employee.employeeId} - ${employee.name}: ${seeded.join(", ")}`,
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
