import {
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  FileText,
} from "lucide-react";
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
    <section className="rounded-[10px] border border-[#ebedf2] bg-white p-5 shadow-[0_18px_38px_rgba(17,24,39,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="m-0 text-xl font-bold text-[#172033]">{title}</h2>
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

function AdminHome({ data }: HomeRoleContentProps) {
  return (
    <main className="flex flex-1 flex-col overflow-y-auto">
      <HomeDashboard />
      {data.pendingApprovals.length ? (
        <div className="px-6 pb-6">
          <Section title="Đơn cần duyệt">
            <div className="grid grid-cols-2 gap-4 max-[1180px]:grid-cols-1">
              {data.pendingApprovals.map((request) => (
                <ApprovalCard request={request} key={request.id} />
              ))}
            </div>
          </Section>
        </div>
      ) : null}
    </main>
  );
}

export function HomeRoleContent({ data }: HomeRoleContentProps) {
  if (data.role === "CANDIDATE") {
    return <CandidateHome data={data} />;
  }

  if (data.role === "ADMIN") {
    return <AdminHome data={data} />;
  }

  return <EmployeeHome data={data} />;
}
