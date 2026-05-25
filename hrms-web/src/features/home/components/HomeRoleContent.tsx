import {
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  FileText,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { attendanceService } from "../../attendance/services/attendanceService";
import type { AttendanceTimesheetData } from "../../attendance/types/attendance.types";
import { payrollService } from "../../payroll/services/payrollService";
import type { PayrollSummary } from "../../payroll/types/payroll.types";
import { requestService } from "../../requests/services/requestService";
import type { RequestItem } from "../../requests/types/request.types";
import { scheduleService } from "../../schedules/services/scheduleService";
import type { WorkScheduleItem } from "../../schedules/types/schedule.types";
import type {
  ApprovalRequest,
  HomeData,
  JobApplication,
  RecruitmentJob,
  WorkSchedule,
} from "../types/homeApi.types";
import { HomeDashboard } from "./HomeDashboard";

type HomeRoleContentProps = {
  data: HomeData;
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="m-0 text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 inline-block"></span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-[#d7dde8] bg-[#fbfcff] text-[#667085]">
      {text}
    </div>
  );
}

function CandidateJobCard({ job }: { job: RecruitmentJob }) {
  return (
    <article className="rounded-lg border border-[#edf0f5] bg-[#fbfcff] p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e9f3ff] text-[#0e67a7]">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <strong className="block truncate text-base text-[#172033]">
            {job.title ?? "Vị trí tuyển dụng"}
          </strong>
          <span className="text-sm text-[#667085]">
            {[job.position?.name, job.department?.name]
              .filter(Boolean)
              .join(" | ") || "-"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-[#667085]">
        <span>Hạn: {formatDate(job.deadline)}</span>
        <span className="rounded-full bg-[#e9f3ff] px-2.5 py-1 font-semibold text-[#0e67a7]">
          {job.applied ? "Đã ứng tuyển" : (job.status ?? "OPEN")}
        </span>
      </div>
    </article>
  );
}

function ApplicationCard({ application }: { application: JobApplication }) {
  const job = application.job ?? application.recruitmentJob;

  return (
    <article className="rounded-lg border border-[#edf0f5] bg-white p-4">
      <div className="mb-2 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#fff4e5] text-[#f79009]">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <strong className="block truncate text-base text-[#172033]">
            {job?.title ??
              application.candidate?.name ??
              application.candidate?.fullName ??
              "Đơn ứng tuyển"}
          </strong>
          <span className="text-sm text-[#667085]">
            {[application.position?.name, application.department?.name]
              .filter(Boolean)
              .join(" | ") || "Ứng tuyển"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-[#667085]">
        <span>{formatDate(application.appliedAt)}</span>
        <span className="rounded-full bg-[#f2f4f7] px-2.5 py-1 font-semibold text-[#344054]">
          {application.status ?? "PENDING"}
        </span>
      </div>
    </article>
  );
}

function ScheduleCard({ schedule }: { schedule: WorkSchedule }) {
  const shifts =
    schedule.shifts ??
    schedule.shiftLinks?.map((item) => item.workShift ?? {}) ??
    [];

  return (
    <article className="rounded-lg border border-[#edf0f5] bg-[#fbfcff] p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#ecfdf3] text-[#039855]">
          <CalendarDays className="h-5 w-5" />
        </div>
        <strong className="text-base text-[#172033]">
          {formatDate(schedule.date)}
        </strong>
      </div>
      <div className="space-y-2 text-sm text-[#667085]">
        {shifts.length > 0 ? (
          shifts.map((shift, index) => (
            <div
              className="flex justify-between gap-4"
              key={`${shift.name ?? "shift"}-${index}`}
            >
              <span>{shift.name ?? "Ca làm việc"}</span>
              <span>
                {[shift.startTime, shift.endTime].filter(Boolean).join(" - ") ||
                  "-"}
              </span>
            </div>
          ))
        ) : (
          <span>Chưa có ca làm việc</span>
        )}
      </div>
    </article>
  );
}

function ApprovalCard({ request }: { request: ApprovalRequest }) {
  return (
    <article className="rounded-lg border border-[#edf0f5] bg-white p-4">
      <div className="mb-2 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#f4ebff] text-[#7f56d9]">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <strong className="block truncate text-base text-[#172033]">
            {request.title ?? "Yêu cầu cần duyệt"}
          </strong>
          <span className="text-sm text-[#667085]">
            {request.requester?.name ??
              request.requester?.fullName ??
              request.type ??
              "-"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-[#667085]">
        <span>{formatDate(request.createdAt)}</span>
        <span className="rounded-full bg-[#fff4e5] px-2.5 py-1 font-semibold text-[#b54708]">
          {request.status ?? "PENDING"}
        </span>
      </div>
    </article>
  );
}

const toLocalDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const monthPartsFromKey = (monthKey: string) => {
  const [year, month] = monthKey.split("-").map(Number);
  return { month, year };
};

const todayKey = () => toLocalDateInputValue(new Date());

const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const toNumber = (value: string | number | null | undefined) =>
  value == null ? 0 : Number(value) || 0;

function formatMoney(value: string | number | null | undefined) {
  return moneyFormatter.format(toNumber(value));
}

function formatTime(value?: string | null) {
  if (!value) {
    return "--";
  }

  if (/^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
}

function toDateKey(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value.slice(0, 10)
    : date.toISOString().slice(0, 10);
}

const attendanceStatusLabels: Record<string, string> = {
  PRESENT: "Đang làm việc",
  LATE: "Đi muộn",
  EARLY_LEAVE: "Về sớm",
  LATE_AND_EARLY_LEAVE: "Đi muộn/về sớm",
  ABSENT: "Vắng",
  ON_LEAVE: "Nghỉ phép",
  PAID_LEAVE: "Nghỉ phép",
  UNPAID_LEAVE: "Nghỉ không lương",
};

const payrollStatusLabels: Record<string, string> = {
  DRAFT: "Nháp",
  WAITING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  PARTIALLY_PAID: "Thanh toán một phần",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã hủy",
};

const requestStatusLabels: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
  FAILED: "Lỗi",
};

const requestTypeLabels: Record<string, string> = {
  LEAVE: "Nghỉ phép",
  LATE_EARLY: "Đi muộn/về sớm",
  ATTENDANCE_CORRECTION: "Bổ sung công",
  OVERTIME: "Tăng ca",
  SCHEDULE_APPROVAL: "Đăng ký lịch",
  PAYROLL_APPROVAL: "Duyệt lương",
  TERMINATION: "Nghỉ việc",
};

function EmployeeMetricCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgb(0,0,0,0.08)] border border-slate-100/80">
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1.5 text-sm font-semibold text-slate-500 group-hover:text-slate-600 transition-colors">{title}</p>
          <strong className="block text-2xl font-extrabold tracking-tight text-slate-900">
            {value}
          </strong>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm *:h-5 *:w-5`}>
          {icon}
        </span>
      </div>
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
    </article>
  );
}

function CandidateHome({ data }: HomeRoleContentProps) {
  return (
    <main className="flex flex-1 flex-col space-y-6 overflow-y-auto px-6 py-6">
      <Section title="Việc làm đang tuyển">
        {data.jobs.length ? (
          <div className="grid grid-cols-2 gap-4 max-[1180px]:grid-cols-1">
            {data.jobs.map((job) => (
              <CandidateJobCard job={job} key={job.id} />
            ))}
          </div>
        ) : (
          <EmptyState text="Chưa có việc làm đang tuyển" />
        )}
      </Section>
      <Section title="Đơn đang ứng tuyển">
        {data.applications.length ? (
          <div className="grid grid-cols-2 gap-4 max-[1180px]:grid-cols-1">
            {data.applications.map((application) => (
              <ApplicationCard application={application} key={application.id} />
            ))}
          </div>
        ) : (
          <EmptyState text="Bạn chưa có đơn ứng tuyển" />
        )}
      </Section>
    </main>
  );
}

function EmployeeHome({ data }: HomeRoleContentProps) {
  return (
    <main className="flex flex-1 flex-col space-y-6 overflow-y-auto px-6 py-6">
      <Section title="Lịch làm việc tháng này">
        {data.schedules.length ? (
          <div className="grid grid-cols-2 gap-4 max-[1180px]:grid-cols-1">
            {data.schedules.map((schedule) => (
              <ScheduleCard schedule={schedule} key={schedule.id} />
            ))}
          </div>
        ) : (
          <EmptyState text="Tháng này chưa có lịch làm việc" />
        )}
      </Section>
      {data.pendingApprovals.length ? (
        <Section title="Đơn cần duyệt">
          <div className="grid grid-cols-2 gap-4 max-[1180px]:grid-cols-1">
            {data.pendingApprovals.map((request) => (
              <ApprovalCard request={request} key={request.id} />
            ))}
          </div>
        </Section>
      ) : null}
    </main>
  );
}

void EmployeeHome;

function EmployeeDashboardHome({ data }: HomeRoleContentProps) {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const selectedMonth = selectedDate.slice(0, 7);
  const [timesheet, setTimesheet] = useState<AttendanceTimesheetData | null>(
    null,
  );
  const [schedules, setSchedules] = useState<WorkScheduleItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [payroll, setPayroll] = useState<PayrollSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage("");
      setTimesheet(null);
      setSchedules([]);
      setPayroll(null);

      const { month, year } = monthPartsFromKey(selectedMonth);
      const [timesheetResult, schedulesResult, requestsResult, payrollResult] =
        await Promise.allSettled([
          attendanceService.getMyTimesheet(selectedMonth),
          scheduleService.getMySchedule(selectedMonth),
          requestService.getMyRequests({ page: 1, limit: 5 }),
          payrollService.getMine({ month, year }),
        ]);

      if (!isMounted) {
        return;
      }

      if (timesheetResult.status === "fulfilled") {
        setTimesheet(timesheetResult.value ?? null);
      }

      if (schedulesResult.status === "fulfilled") {
        setSchedules(schedulesResult.value ?? []);
      }

      if (requestsResult.status === "fulfilled") {
        setRequests(requestsResult.value?.items ?? []);
      }

      if (payrollResult.status === "fulfilled") {
        setPayroll(payrollResult.value?.[0] ?? null);
      }

      if (
        timesheetResult.status === "rejected" ||
        schedulesResult.status === "rejected" ||
        requestsResult.status === "rejected" ||
        payrollResult.status === "rejected"
      ) {
        setErrorMessage("Một số dữ liệu dashboard chưa tải được.");
      }

      setIsLoading(false);
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [selectedMonth]);

  const todaySchedule = useMemo(
    () => schedules.find((schedule) => toDateKey(schedule.date) === selectedDate),
    [schedules, selectedDate],
  );
  const todayShifts = todaySchedule?.workShifts ?? [];
  const selectedDay = timesheet?.days.find(
    (day) => toDateKey(day.date) === selectedDate,
  );
  const selectedDayDetails =
    selectedDay?.recordDetails?.filter((detail) => !detail.shiftIsOvertime) ??
    [];
  const displayShifts = todayShifts.length
    ? todayShifts.map((shift) => ({
        id: shift.id,
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        detail: selectedDayDetails.find(
          (detail) => detail.workShiftId === shift.id,
        ),
      }))
    : selectedDayDetails.map((detail) => ({
        id: detail.workShiftId,
        name: detail.workShiftName,
        startTime: detail.shiftStartTime,
        endTime: detail.shiftEndTime,
        detail,
      }));
  const employeeName = data.profile?.name ?? data.profile?.fullName ?? "Nhân viên";
  const totals = timesheet?.totals;
  const payrollStatus = payroll
    ? payrollStatusLabels[payroll.status] ?? payroll.status
    : "Chưa có kỳ lương";
  const monthLabel = `${selectedMonth.slice(5, 7)}/${selectedMonth.slice(0, 4)}`;

  return (
    <main className="flex flex-1 flex-col space-y-6 overflow-y-auto bg-[#f8fafc] px-8 py-8 max-[720px]:px-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Dashboard nhân viên
          </p>
          <h1 className="m-0 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight">
            Xin chào, {employeeName}!
          </h1>
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 hover:bg-white cursor-pointer">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          <span>Ngày xem</span>
          <input
            className="h-7 w-[125px] bg-transparent text-sm text-slate-900 outline-none font-bold cursor-pointer"
            max={todayKey()}
            onChange={(event) => setSelectedDate(event.target.value)}
            type="date"
            value={selectedDate}
          />
        </label>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-5 max-[1100px]:grid-cols-1">
        <article className="rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgb(0,0,0,0.05)] border border-slate-100/80 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-500">
                Ca trong ngày
              </p>
              <h2 className="m-0 text-xl font-bold text-slate-950">
                {displayShifts.length
                  ? `${displayShifts.length} ca làm việc`
                  : "Không có ca"}
              </h2>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700 shadow-sm">
              <Clock3 className="h-6 w-6" />
            </span>
          </div>
          {displayShifts.length ? (
            <div className="space-y-3">
              {displayShifts.map((shift) => {
                const detail = shift.detail;
                const status = detail
                  ? attendanceStatusLabels[detail.status] ?? detail.status
                  : "Chưa check-in";

                return (
                  <div
                    className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr] gap-3 rounded-xl bg-slate-50/70 border border-slate-100 p-4 text-sm max-[760px]:grid-cols-2 max-[520px]:grid-cols-1 hover:bg-slate-50 transition-colors"
                    key={shift.id}
                  >
                    <div>
                      <span className="block font-medium text-slate-500">Ca</span>
                      <strong className="mt-1 block text-base text-slate-900">
                        {shift.name}
                      </strong>
                      <span className="text-slate-500">
                        {[formatTime(shift.startTime), formatTime(shift.endTime)].join(
                          " - ",
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="block font-medium text-slate-500">Trạng thái</span>
                      <strong className="mt-1 block text-base text-slate-900">
                        {status}
                      </strong>
                    </div>
                    <div>
                      <span className="block font-medium text-slate-500">Check-in</span>
                      <strong className="mt-1 block text-base text-slate-900">
                        {formatTime(detail?.checkInTime)}
                      </strong>
                    </div>
                    <div>
                      <span className="block font-medium text-slate-500">Check-out</span>
                      <strong className="mt-1 block text-base text-slate-900">
                        {formatTime(detail?.checkOutTime)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="Ngày này không có ca làm việc" />
          )}
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgb(0,0,0,0.05)] border border-slate-100/80 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-500">
                Kỳ lương tháng {monthLabel}
              </p>
              <h2 className="m-0 text-2xl font-bold text-slate-950">
                Net: {payroll ? formatMoney(payroll.netSalary) : "--"}
              </h2>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700 shadow-sm">
              <WalletCards className="h-6 w-6" />
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50/70 border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
              <span className="font-medium text-slate-500">Trạng thái</span>
              <strong className="text-base text-slate-900">{payrollStatus}</strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50/70 border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
              <span className="font-medium text-slate-500">Đã thanh toán</span>
              <strong className="text-base text-emerald-600">
                {payroll ? formatMoney(payroll.paidAmount) : "--"}
              </strong>
            </div>
          </div>
        </article>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="m-0 text-lg font-bold text-slate-950 flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 inline-block"></span>
            Thống kê chấm công tháng {monthLabel}
          </h2>
          {isLoading ? (
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg animate-pulse">
              Đang tải...
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-6 gap-4 max-[1280px]:grid-cols-3 max-[760px]:grid-cols-2 max-[520px]:grid-cols-1">
          <EmployeeMetricCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="Công chuẩn"
            tone="bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-md shadow-slate-500/20"
            value={totals?.standardWorkUnits ?? 0}
          />
          <EmployeeMetricCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="Ngày công"
            tone="bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-md shadow-blue-500/20"
            value={totals?.actualWorkUnits ?? totals?.workedUnits ?? 0}
          />
          <EmployeeMetricCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Đi muộn"
            tone="bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md shadow-amber-500/20"
            value={totals?.lateCount ?? 0}
          />
          <EmployeeMetricCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Về sớm"
            tone="bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md shadow-orange-500/20"
            value={totals?.earlyLeaveCount ?? 0}
          />
          <EmployeeMetricCard
            icon={<FileText className="h-5 w-5" />}
            title="Nghỉ/vắng"
            tone="bg-gradient-to-br from-violet-400 to-violet-500 text-white shadow-md shadow-violet-500/20"
            value={totals?.leaveOrAbsentDays ?? totals?.leaveDays ?? 0}
          />
          <EmployeeMetricCard
            icon={<BriefcaseBusiness className="h-5 w-5" />}
            title="OT"
            tone="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-md shadow-emerald-500/20"
            value={totals?.overtimeUnits ?? 0}
          />
        </div>
      </section>

      <Section title="Đơn từ của tôi">
        {requests.length ? (
          <div className="grid grid-cols-2 gap-4 max-[960px]:grid-cols-1">
            {requests.map((request) => (
              <article
                className="group rounded-xl border border-slate-100/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-0.5 cursor-pointer"
                key={request.id}
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <strong className="block truncate text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      {request.title}
                    </strong>
                    <span className="text-sm font-medium text-slate-500">
                      {requestTypeLabels[request.type] ?? request.type}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                    {requestStatusLabels[request.status] ?? request.status}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-400">
                  Ngày tạo: {formatDate(request.createdAt)}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState text="Bạn chưa có đơn từ nào" />
        )}
      </Section>
    </main>
  );
}

function AdminHome({ data }: HomeRoleContentProps) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-[#f8fafc]">
      <HomeDashboard />
      {data.pendingApprovals.length ? (
        <div className="px-8 pb-8 max-[720px]:px-4">
          <Section title="Đơn cần duyệt">
            <div className="grid grid-cols-2 gap-5 max-[1180px]:grid-cols-1">
              {data.pendingApprovals.map((request) => (
                <ApprovalCard request={request} key={request.id} />
              ))}
            </div>
          </Section>
        </div>
      ) : null}
    </div>
  );
}

export function HomeRoleContent({ data }: HomeRoleContentProps) {
  if (data.role === "CANDIDATE") {
    return <CandidateHome data={data} />;
  }

  if (data.role === "ADMIN") {
    return <AdminHome data={data} />;
  }

  return <EmployeeDashboardHome data={data} />;
}
