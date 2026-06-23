import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Banknote,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileClock,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { attendanceService } from "../../attendance/services/attendanceService";
import type { AttendanceTimesheetDay } from "../../attendance/types/attendance.types";
import { departmentService } from "../../departments/services/departmentService";
import type { Department } from "../../departments/types/department.types";
import { employeeService } from "../../employees/services/employeeService";
import type { Employee } from "../../employees/types/employee.types";
import { payrollService } from "../../payroll/services/payrollService";
import type { PayrollPeriodOverview } from "../../payroll/types/payroll.types";
import { recruitmentService } from "../../recruitment/services/recruitmentService";
import type {
  JobApplication,
  RecruitmentJob,
} from "../../recruitment/types/recruitment.types";
import { requestService } from "../../requests/services/requestService";
import type { RequestItem } from "../../requests/types/request.types";

type DashboardState = {
  employees: Employee[];
  departments: Department[];
  pendingRequests: RequestItem[];
  payrollOverview: PayrollPeriodOverview | null;
  payrollFallback: { status: string; expected: number; paid: number } | null;
  recruitmentJobs: RecruitmentJob[];
  applications: JobApplication[];
  disconnectedDevices: number;
  missingScheduleEmployees: number;
  todayAttendance: {
    present: number;
    absent: number;
    late: number;
    early: number;
  };
  weeklyAttendance: Array<{
    label: string;
    late: number;
    early: number;
    absent: number;
  }>;
  payrollByMonth: Array<{ label: string; value: number }>;
};

const emptyState: DashboardState = {
  employees: [],
  departments: [],
  pendingRequests: [],
  payrollOverview: null,
  payrollFallback: null,
  recruitmentJobs: [],
  applications: [],
  disconnectedDevices: 0,
  missingScheduleEmployees: 0,
  todayAttendance: { present: 0, absent: 0, late: 0, early: 0 },
  weeklyAttendance: [],
  payrollByMonth: [],
};

const departmentColors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed"];

const requestTypeLabels: Record<string, string> = {
  LEAVE: "Nghỉ phép",
  LATE_EARLY: "Đi muộn/về sớm",
  ATTENDANCE_CORRECTION: "Bổ sung công",
  OVERTIME: "Tăng ca",
  SCHEDULE_APPROVAL: "Lịch làm việc",
  PAYROLL_APPROVAL: "Duyệt lương",
  TERMINATION: "Nghỉ việc",
};

const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("vi-VN");

const toNumber = (value: string | number | null | undefined) =>
  value == null ? 0 : Number(value) || 0;

const toMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const formatMoney = (value: number) =>
  value > 0 ? moneyFormatter.format(value) : "0 đ";

const getDateParts = (dateKey: string) => {
  const [year, month] = dateKey.split("-").map(Number);
  return { month, year };
};

const isInMonth = (value: string | null | undefined, monthKey: string) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return toMonthKey(date) === monthKey;
};

function getWeekDays(selectedDate: string) {
  const today = new Date(`${selectedDate}T00:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      key: toDateKey(date),
      label: date.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
      }),
    };
  });
}

function hasAttendance(day?: AttendanceTimesheetDay) {
  if (!day) return false;
  return day.workedUnits > 0 || (day.actualWorkUnits ?? 0) > 0;
}

function getTodayAttendance(
  employees: Employee[],
  dayMapByEmployee: Map<string, Map<string, AttendanceTimesheetDay>>,
  selectedDate: string,
) {
  const workingEmployees = employees.filter((employee) => employee.status !== "RESIGNED");

  return workingEmployees.reduce(
    (totals, employee) => {
      const day = dayMapByEmployee.get(employee.id)?.get(selectedDate);

      if (hasAttendance(day)) totals.present += 1;
      if ((day?.absentCount ?? 0) > 0) totals.absent += 1;
      if ((day?.lateCount ?? 0) > 0) totals.late += 1;
      if ((day?.earlyLeaveCount ?? 0) > 0) totals.early += 1;

      return totals;
    },
    { present: 0, absent: 0, late: 0, early: 0 },
  );
}

function getWeeklyAttendance(
  dayMapByEmployee: Map<string, Map<string, AttendanceTimesheetDay>>,
  selectedDate: string,
) {
  return getWeekDays(selectedDate).map((day) => {
    let late = 0;
    let early = 0;
    let absent = 0;

    for (const days of dayMapByEmployee.values()) {
      const item = days.get(day.key);
      late += item?.lateCount ?? 0;
      early += item?.earlyLeaveCount ?? 0;
      absent += item?.absentCount ?? 0;
    }

    return { label: day.label, late, early, absent };
  });
}

async function settle<T>(promise: Promise<T>, fallback: T) {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

async function loadPayrollByMonth(selectedDate: string) {
  const baseDate = new Date(`${selectedDate}T00:00:00`);
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - (5 - index), 1);
    return { month: date.getMonth() + 1, year: date.getFullYear() };
  });

  const results = await Promise.all(
    months.map(async ({ month, year }) => {
      const payrolls = await settle(payrollService.getPayrolls({ month, year }), []);
      return {
        label: `${String(month).padStart(2, "0")}/${year}`,
        value: payrolls.reduce((total, payroll) => total + toNumber(payroll.netSalary), 0),
      };
    }),
  );

  return results;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgb(0,0,0,0.12)] border border-slate-100/80">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-sm font-semibold text-slate-500 group-hover:text-slate-600 transition-colors">{title}</p>
          <strong className="block text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </strong>
          {subtitle ? (
            <span className="mt-2 block text-xs font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
              {subtitle}
            </span>
          ) : null}
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm *:h-5 *:w-5`}>
          {icon}
        </div>
      </div>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
    </article>
  );
}

function Section({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgb(0,0,0,0.05)] border border-slate-100/80 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col ${className}`}>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 inline-block"></span>
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 ml-[14px] text-sm font-medium text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>
    </section>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0">
      <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">{label}</span>
      <strong className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">{value}</strong>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-64 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-500">
      Chưa có dữ liệu
    </div>
  );
}

export function HomeDashboard() {
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [state, setState] = useState<DashboardState>(emptyState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const { month, year } = getDateParts(selectedDate);
        const monthKey = selectedDate.slice(0, 7);

        const [
          employeesData,
          departments,
          pendingRequestsData,
          devicesData,
          jobsData,
          applicationsData,
          periods,
          payrolls,
          standardWorkDays,
        ] = await Promise.all([
          settle(
            employeeService.getEmployees({ page: 1, limit: -1, view: "summary" }),
            { items: [], meta: { page: 1, limit: -1, total: 0, totalPages: 0 } },
          ),
          settle(departmentService.getDepartments(), []),
          settle(requestService.getAllRequests({ page: 1, limit: 100, status: "PENDING" }), {
            items: [],
            meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
          }),
          settle(attendanceService.getDevices({ page: 1, limit: 100 }), {
            devices: [],
            total: 0,
            page: 1,
            limit: 100,
            totalPages: 0,
          }),
          settle(recruitmentService.getJobs({ page: 1, limit: 100 }), {
            items: [],
            meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
          }),
          settle(recruitmentService.getApplications({ page: 1, limit: 100 }), {
            items: [],
            meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
          }),
          settle(payrollService.getPeriods({ month, year }), []),
          settle(payrollService.getPayrolls({ month, year }), []),
          settle(attendanceService.getStandardWorkDays({ month, year }), []),
        ]);

        const employees = employeesData.items ?? [];
        const workingEmployees = employees.filter(
          (employee) => employee.status !== "RESIGNED",
        );
        const timesheetOverview = await settle(
          attendanceService.getEmployeesTimesheetOverview(monthKey),
          { month: monthKey, rows: [] },
        );
        const dayMapByEmployee = new Map<string, Map<string, AttendanceTimesheetDay>>();

        timesheetOverview.rows.forEach((timesheet) => {
          dayMapByEmployee.set(
            timesheet.employee.id,
            new Map(timesheet.days.map((day) => [day.date, day])),
          );
        });

        const currentPeriod = periods[0];
        const payrollOverview = currentPeriod
          ? await settle(payrollService.getPeriodOverview(currentPeriod.id), null)
          : null;
        const payrollFallback = payrollOverview
          ? null
          : {
              status: currentPeriod?.status ?? "Chưa tạo kỳ lương",
              expected: payrolls.reduce(
                (total, payroll) => total + toNumber(payroll.netSalary),
                0,
              ),
              paid: payrolls.reduce(
                (total, payroll) => total + toNumber(payroll.paidAmount),
                0,
              ),
            };

        if (!alive) return;

        setState({
          employees,
          departments,
          pendingRequests: pendingRequestsData.items ?? [],
          payrollOverview,
          payrollFallback,
          recruitmentJobs: jobsData.items ?? [],
          applications: applicationsData.items ?? [],
          disconnectedDevices: devicesData.devices.filter(
            (device) => device.isActive && !device.isConnected,
          ).length,
          missingScheduleEmployees: workingEmployees.filter(
            (employee) =>
              !standardWorkDays.some((item) => item.employeeId === employee.id),
          ).length,
          todayAttendance: getTodayAttendance(employees, dayMapByEmployee, selectedDate),
          weeklyAttendance: getWeeklyAttendance(dayMapByEmployee, selectedDate),
          payrollByMonth: await loadPayrollByMonth(selectedDate),
        });
      } catch (loadError) {
        if (alive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải dữ liệu dashboard",
          );
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    }

    void load();

    return () => {
      alive = false;
    };
  }, [selectedDate]);

  const employeeOverview = useMemo(() => {
    const selectedMonth = selectedDate.slice(0, 7);
    const working = state.employees.filter((employee) => employee.status === "WORKING").length;
    const onLeave = state.employees.filter((employee) => employee.status === "ON_LEAVE").length;
    const resigned = state.employees.filter((employee) => employee.status === "RESIGNED").length;

    return {
      total: state.employees.length,
      working,
      onLeave,
      resigned,
      newThisMonth: state.employees.filter((employee) =>
        isInMonth(employee.hireDate, selectedMonth),
      ).length,
    };
  }, [selectedDate, state.employees]);

  const pendingByType = useMemo(() => {
    const counts = new Map<string, number>();
    state.pendingRequests.forEach((request) => {
      counts.set(request.type, (counts.get(request.type) ?? 0) + 1);
    });

    return Array.from(counts.entries()).map(([type, count]) => ({
      type,
      label: requestTypeLabels[type] ?? type,
      count,
    }));
  }, [state.pendingRequests]);

  const departmentData = useMemo(
    () =>
      state.departments.map((department) => ({
        name: department.name,
        value:
          department.employeeCount ??
          state.employees.filter((employee) => employee.departmentId === department.id).length,
      })),
    [state.departments, state.employees],
  );

  const recruitment = useMemo(() => {
    const selectedMonth = selectedDate.slice(0, 7);

    return {
      openJobs: state.recruitmentJobs.filter((job) => job.status === "OPEN").length,
      newApplications: state.applications.filter((application) =>
        isInMonth(application.appliedAt, selectedMonth),
      ).length,
      interviewsToday: state.applications.reduce(
        (total, application) =>
          total +
          (application.interviewSchedules?.filter(
            (schedule) => toDateKey(new Date(schedule.scheduledAt)) === selectedDate,
          ).length ?? 0),
        0,
      ),
      pendingOffers: state.applications.reduce(
        (total, application) =>
          total +
          (application.offers?.filter((offer) => offer.status === "SENT").length ?? 0),
        0,
      ),
      appliedThisMonth: state.applications.filter((application) =>
        isInMonth(application.appliedAt, selectedMonth),
      ).length,
    };
  }, [selectedDate, state.applications, state.recruitmentJobs]);

  const payrollStatus =
    state.payrollOverview?.period.status ?? state.payrollFallback?.status ?? "Chưa tạo";
  const expectedPayroll = state.payrollOverview
    ? toNumber(state.payrollOverview.summary.netSalary)
    : state.payrollFallback?.expected ?? 0;
  const paidPayroll = state.payrollOverview
    ? toNumber(state.payrollOverview.summary.paidAmount)
    : state.payrollFallback?.paid ?? 0;
  const selectedDateLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
    "vi-VN",
  );
  const selectedMonthLabel = selectedDate.slice(0, 7).split("-").reverse().join("/");

  const weekStart = new Date(`${selectedDate}T00:00:00`);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekStartDateLabel = weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const weekEndDateLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const weeklySubtitle = `Từ ngày ${weekStartDateLabel} đến ngày ${weekEndDateLabel}`;

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] px-8 py-8 max-[720px]:px-4">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight">
            Tổng quan quản trị
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Cập nhật theo dữ liệu nhân sự, chấm công, đơn từ, payroll và tuyển dụng.
          </p>
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 hover:bg-white cursor-pointer">
          <CalendarClock className="h-5 w-5 text-blue-600" />
          Ngày xem
          <input
            className="h-7 w-[125px] bg-transparent text-sm text-slate-900 outline-none font-bold cursor-pointer"
            max={toDateKey(new Date())}
            onChange={(event) => {
              if (event.target.value) {
                setSelectedDate(event.target.value);
              }
            }}
            type="date"
            value={selectedDate}
          />
        </label>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800 flex items-center gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            <p className="text-sm font-medium text-slate-500">Đang tải dữ liệu dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-5 max-[1280px]:grid-cols-3 max-[760px]:grid-cols-1">
            <StatCard
              title="Tổng nhân viên"
              value={numberFormatter.format(employeeOverview.total)}
              subtitle={`${employeeOverview.newThisMonth} nhân viên mới trong tháng`}
              icon={<Users className="h-6 w-6" />}
              tone="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
            />
            <StatCard
              title="Đang làm việc"
              value={numberFormatter.format(employeeOverview.working)}
              icon={<CheckCircle2 className="h-6 w-6" />}
              tone="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/30"
            />
            <StatCard
              title="Đang nghỉ phép"
              value={numberFormatter.format(employeeOverview.onLeave)}
              icon={<CalendarClock className="h-6 w-6" />}
              tone="bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/30"
            />
            <StatCard
              title="Đã nghỉ việc"
              value={numberFormatter.format(employeeOverview.resigned)}
              icon={<Users className="h-6 w-6" />}
              tone="bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-lg shadow-rose-500/30"
            />
            <StatCard
              title="Đơn chờ xử lý"
              value={numberFormatter.format(state.pendingRequests.length)}
              icon={<FileClock className="h-6 w-6" />}
              tone="bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/30"
            />
          </div>

          <div className="grid grid-cols-[1.05fr_1fr_1fr] gap-6 max-[1280px]:grid-cols-1">
            <Section title={`Chấm công ngày ${selectedDateLabel}`}>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Có mặt"
                  value={state.todayAttendance.present}
                  icon={<CheckCircle2 className="h-6 w-6" />}
                  tone="bg-emerald-50 text-emerald-700 border border-emerald-100"
                />
                <StatCard
                  title="Vắng mặt"
                  value={state.todayAttendance.absent}
                  icon={<AlertTriangle className="h-6 w-6" />}
                  tone="bg-rose-50 text-rose-700 border border-rose-100"
                />
                <StatCard
                  title="Đi muộn"
                  value={state.todayAttendance.late}
                  icon={<Clock3 className="h-6 w-6" />}
                  tone="bg-amber-50 text-amber-700 border border-amber-100"
                />
                <StatCard
                  title="Về sớm"
                  value={state.todayAttendance.early}
                  icon={<Clock3 className="h-6 w-6" />}
                  tone="bg-sky-50 text-sky-700 border border-sky-100"
                />
              </div>
            </Section>

            <Section title={`Payroll tháng ${selectedMonthLabel}`}>
              <div className="flex flex-col h-full justify-evenly">
                <MetricRow label="Trạng thái" value={payrollStatus} />
                <MetricRow label="Tổng lương dự kiến" value={formatMoney(expectedPayroll)} />
                <MetricRow label="Đã thanh toán" value={formatMoney(paidPayroll)} />
                <MetricRow
                  label="Còn lại"
                  value={formatMoney(Math.max(expectedPayroll - paidPayroll, 0))}
                />
              </div>
            </Section>

            <Section title="Cảnh báo hệ thống">
              <div className="flex flex-col h-full justify-evenly">
                <MetricRow
                  label="Thiết bị chấm công mất kết nối"
                  value={state.disconnectedDevices}
                />
                <MetricRow
                  label="Nhân viên chưa có lịch làm việc"
                  value={state.missingScheduleEmployees}
                />
              </div>
            </Section>
          </div>

          <div className="grid grid-cols-2 gap-6 max-[1080px]:grid-cols-1">
            <Section title="Đơn từ chờ xử lý">
              {pendingByType.length ? (
                <div className="grid gap-2">
                  {pendingByType.map((item) => (
                    <MetricRow key={item.type} label={item.label} value={item.count} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50/80 px-4 py-12 text-center text-sm font-medium text-slate-500 border border-dashed border-slate-200">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-3" />
                  Không có đơn từ chờ xử lý
                </div>
              )}
            </Section>

            <Section title="Tuyển dụng">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 max-[520px]:grid-cols-1">
                <MetricRow label="Tin đang mở" value={recruitment.openJobs} />
                <MetricRow label="Ứng viên mới" value={recruitment.newApplications} />
                <MetricRow label="Phỏng vấn hôm nay" value={recruitment.interviewsToday} />
                <MetricRow label="Offer chờ phản hồi" value={recruitment.pendingOffers} />
                <MetricRow label="Apply trong tháng" value={recruitment.appliedThisMonth} />
              </div>
            </Section>
          </div>

          <div className="grid grid-cols-3 gap-6 max-[1280px]:grid-cols-1">
            <Section title="Nhân sự theo phòng ban">
              {departmentData.some((item) => item.value > 0) ? (
                <div className="h-72 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={departmentData} dataKey="value" nameKey="name" outerRadius={96} innerRadius={60} paddingAngle={2}>
                        {departmentData.map((_, index) => (
                          <Cell
                            fill={departmentColors[index % departmentColors.length]}
                            key={index}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                        itemStyle={{ fontWeight: 600 }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle" 
                        wrapperStyle={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart />
              )}
            </Section>

            <Section title="Đi muộn, về sớm, vắng theo tuần" subtitle={weeklySubtitle}>
                <div className="h-72 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={state.weeklyAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle" 
                        wrapperStyle={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }} 
                      />
                      <Bar dataKey="late" name="Đi muộn" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} />
                      <Bar dataKey="early" name="Về sớm" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={12} />
                      <Bar dataKey="absent" name="Vắng" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            </Section>

            <Section title="Chi phí lương theo tháng">
              {state.payrollByMonth.some((item) => item.value > 0) ? (
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={state.payrollByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip formatter={(value) => formatMoney(Number(value))} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Chi phí lương"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 7, strokeWidth: 0, fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart />
              )}
            </Section>
          </div>

          <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
            <StatCard
              title="Tổng lương dự kiến"
              value={formatMoney(expectedPayroll)}
              icon={<Banknote className="h-7 w-7" />}
              tone="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
            />
            <StatCard
              title="Ứng viên apply trong tháng"
              value={recruitment.appliedThisMonth}
              icon={<BriefcaseBusiness className="h-7 w-7" />}
              tone="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
            />
            <StatCard
              title="Cảnh báo cần xử lý"
              value={state.disconnectedDevices + state.missingScheduleEmployees}
              icon={<AlertTriangle className="h-7 w-7" />}
              tone="bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30"
            />
          </div>
        </div>
      )}
    </main>
  );
}
