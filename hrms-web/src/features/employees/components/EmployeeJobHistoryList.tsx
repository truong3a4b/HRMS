import type { EmployeeJobHistory, EmployeeStatus } from "../types/employee.types";

const statusLabels: Record<EmployeeStatus, string> = {
  WORKING: "Đang làm việc",
  ON_LEAVE: "Đang nghỉ phép",
  RESIGNED: "Đã nghỉ việc",
};

function display(value?: string | number | null) {
  return value == null || value === "" ? "-" : String(value);
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(value?: string | number | null) {
  if (value == null || value === "") return "-";

  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPeriod(from?: string | null, to?: string | null) {
  return `${formatDate(from)} - ${to ? formatDate(to) : "Hiện tại"}`;
}

export function EmployeeJobHistoryList({
  histories,
}: {
  histories: EmployeeJobHistory[];
}) {
  if (histories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#d0d5dd] bg-[#fbfcfe] px-4 py-8 text-center text-sm font-medium text-[#667085]">
        Chưa có lịch sử thay đổi công việc
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {histories.map((history) => (
        <article
          className="rounded-lg border border-[#edf0f5] bg-[#fbfcfe] p-4"
          key={history.id}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#243247]">
                {display(history.position?.name)}
              </h3>
              <p className="mt-1 text-sm font-medium text-[#475467]">
                {display(history.department?.name)}
              </p>
            </div>
            <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-xs font-bold text-[#006fd5]">
              {statusLabels[history.status] ?? history.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-sm max-[760px]:grid-cols-1">
            <div>
              <span className="block text-xs font-medium uppercase text-[#667085]">
                Thời gian áp dụng
              </span>
              <strong className="mt-1 block font-semibold text-[#243247]">
                {formatPeriod(history.effectiveFrom, history.effectiveTo)}
              </strong>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase text-[#667085]">
                Ngày vào làm
              </span>
              <strong className="mt-1 block font-semibold text-[#243247]">
                {formatDate(history.hireDate)}
              </strong>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase text-[#667085]">
                Lương cơ bản
              </span>
              <strong className="mt-1 block font-semibold text-[#243247]">
                {formatCurrency(history.salary)}
              </strong>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
