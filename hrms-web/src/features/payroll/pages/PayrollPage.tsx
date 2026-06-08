import { Modal } from "antd";
import {
  BadgeCheck,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Eye,
  FileCheck2,
  FilePlus2,
  FileText,
  MinusCircle,
  PlusCircle,
  RefreshCcw,
  Receipt,
  Search,
  Send,
  ShieldAlert,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState, Fragment, type FormEvent } from "react";
import { AppLayout } from "../../../app/layouts";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import { useAuth } from "../../auth/services/useAuth";
import { employeeService } from "../../employees/services/employeeService";
import type { EmployeeOption } from "../../employees/types/employee.types";
import { payrollService } from "../services/payrollService";
import type {
  CreatePayrollByTargetsPayload,
  PayrollDetail,
  PayrollQuery,
  PayrollStatus,
  PayrollSummary,
} from "../types/payroll.types";

type PayrollPageMode = "management" | "mine";
type PeriodKey = `${number}-${number}`;

type PeriodSummary = {
  key: PeriodKey;
  month: number;
  year: number;
  count: number;
  grossSalary: number;
  netSalary: number;
  totalDeduction: number;
  paidAmount: number;
  remainingAmount: number;
  statuses: Partial<Record<PayrollStatus, number>>;
};

type CreatePayrollModalProps = {
  open: boolean;
  departments: EmployeeOption[];
  positions: EmployeeOption[];
  defaultMonth: number;
  defaultYear: number;
  onClose: () => void;
  onSubmit: (payload: CreatePayrollByTargetsPayload) => Promise<void>;
};

const statusOptions: Array<{ value: PayrollStatus; label: string }> = [
  { value: "DRAFT", label: "Nháp" },
  { value: "WAITING_APPROVAL", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const statusClass: Partial<Record<PayrollStatus, string>> = {
  DRAFT: "bg-slate-100 text-slate-700",
  WAITING_APPROVAL: "bg-amber-50 text-amber-700",
  APPROVED: "bg-blue-50 text-blue-700",
  PAID: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

function formatNumber(value?: string | number | null) {
  return toNumber(value).toLocaleString("vi-VN");
}

function getInsuranceTotal(payroll: PayrollSummary) {
  return (
    toNumber(payroll.socialInsurance) +
    toNumber(payroll.healthInsurance) +
    toNumber(payroll.unemploymentInsurance)
  );
}

function getRemainingAmount(payroll: PayrollSummary) {
  if (payroll.remainingAmount !== undefined && payroll.remainingAmount !== null) {
    return toNumber(payroll.remainingAmount);
  }

  return Math.max(0, toNumber(payroll.netSalary) - toNumber(payroll.paidAmount));
}

function getStatusLabel(status: PayrollStatus) {
  return statusOptions.find((item) => item.value === status)?.label ?? status;
}

function formatPercent(value?: string | number | null) {
  if (value === undefined || value === null) return "";
  return ` (${formatNumber(value)}%)`;
}

function getTaxableIncome(payroll: PayrollDetail) {
  const profile = payroll.employee?.payrollProfile;
  const policy = profile?.taxPolicy;
  if (!profile?.isTaxApplicable || !policy) return 0;

  const insuranceDeduction =
    toNumber(payroll.socialInsurance) +
    toNumber(payroll.healthInsurance) +
    toNumber(payroll.unemploymentInsurance);

  return Math.max(
    0,
    toNumber(payroll.grossSalary) -
      insuranceDeduction -
      toNumber(policy.personalDeduction) -
      profile.dependentCount * toNumber(policy.dependentDeduction),
  );
}

function getCurrentTaxRate(payroll: PayrollDetail) {
  const brackets = payroll.employee?.payrollProfile?.taxPolicy?.brackets ?? [];
  const taxableIncome = getTaxableIncome(payroll);
  if (taxableIncome <= 0) return 0;

  const bracket = brackets.find((item) => {
    const from = toNumber(item.fromAmount);
    const to = item.toAmount == null ? Number.POSITIVE_INFINITY : toNumber(item.toAmount);
    return taxableIncome > from && taxableIncome <= to;
  });

  return bracket?.rate;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string };
    if (data.message) return data.message;
  }

  return fallback;
}

function StatusBadge({ status }: { status: PayrollStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[status] ?? "bg-slate-100 text-slate-700"}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid min-h-56 place-items-center text-sm text-[#667085]">
      {text}
    </div>
  );
}

function buildPeriods(payrolls: PayrollSummary[]) {
  const map = new Map<PeriodKey, PeriodSummary>();

  payrolls.forEach((payroll) => {
    const key: PeriodKey = `${payroll.year}-${payroll.month}`;
    const current =
      map.get(key) ??
      ({
        key,
        month: payroll.month,
        year: payroll.year,
        count: 0,
        grossSalary: 0,
        netSalary: 0,
        totalDeduction: 0,
        paidAmount: 0,
        remainingAmount: 0,
        statuses: {
          DRAFT: 0,
          WAITING_APPROVAL: 0,
          APPROVED: 0,
          PARTIALLY_PAID: 0,
          PAID: 0,
          CANCELLED: 0,
        },
      } satisfies PeriodSummary);

    current.count += 1;
    current.grossSalary += toNumber(payroll.grossSalary);
    current.netSalary += toNumber(payroll.netSalary);
    current.totalDeduction += toNumber(payroll.totalDeduction);
    current.paidAmount += toNumber(payroll.paidAmount);
    current.remainingAmount += getRemainingAmount(payroll);
    current.statuses[payroll.status] = (current.statuses[payroll.status] ?? 0) + 1;
    map.set(key, current);
  });

  return [...map.values()].sort((a, b) =>
    a.year === b.year ? b.month - a.month : b.year - a.year,
  );
}

function CreatePayrollModal({
  open,
  departments,
  positions,
  defaultMonth,
  defaultYear,
  onClose,
  onSubmit,
}: CreatePayrollModalProps) {
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [positionIds, setPositionIds] = useState<string[]>([]);
  const [skipExisting, setSkipExisting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMonth(defaultMonth);
    setYear(defaultYear);
    setDepartmentIds(departments.map((item) => item.id));
    setPositionIds(positions.map((item) => item.id));
    setSkipExisting(true);
    setErrorMessage(null);
  }, [defaultMonth, defaultYear, departments, open, positions]);

  const toggleValue = (
    current: string[],
    value: string,
    setter: (next: string[]) => void,
  ) => {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!departmentIds.length || !positionIds.length) {
      setErrorMessage("Vui lòng chọn ít nhất một bộ phận và một chức vụ.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit({ month, year, departmentIds, positionIds, skipExisting });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tạo bảng lương."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Tạo bảng lương kỳ mới"
      onCancel={onClose}
      width={760}
      footer={null}
      centered
    >
      <form className="grid gap-5" onSubmit={submit}>
        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">
              Tháng
            </span>
            <input
              className="w-full rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm outline-none focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
              min={1}
              max={12}
              type="number"
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">
              Năm
            </span>
            <input
              className="w-full rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm outline-none focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
              min={1900}
              max={9999}
              type="number"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#243247]">
                Bộ phận
              </span>
              <button
                className="text-xs font-semibold text-[#006fd5]"
                type="button"
                onClick={() =>
                  setDepartmentIds(
                    departmentIds.length === departments.length
                      ? []
                      : departments.map((item) => item.id),
                  )
                }
              >
                {departmentIds.length === departments.length
                  ? "Bỏ chọn"
                  : "Chọn tất cả"}
              </button>
            </div>
            <div className="grid max-h-52 gap-2 overflow-auto rounded-lg border border-[#e2e8f0] p-3">
              {departments.map((department) => (
                <label
                  className="flex items-center gap-2 text-sm text-[#344054]"
                  key={department.id}
                >
                  <input
                    checked={departmentIds.includes(department.id)}
                    className="h-4 w-4 accent-[#006fd5]"
                    type="checkbox"
                    onChange={() =>
                      toggleValue(departmentIds, department.id, setDepartmentIds)
                    }
                  />
                  {department.name}
                </label>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#243247]">
                Chức vụ
              </span>
              <button
                className="text-xs font-semibold text-[#006fd5]"
                type="button"
                onClick={() =>
                  setPositionIds(
                    positionIds.length === positions.length
                      ? []
                      : positions.map((item) => item.id),
                  )
                }
              >
                {positionIds.length === positions.length
                  ? "Bỏ chọn"
                  : "Chọn tất cả"}
              </button>
            </div>
            <div className="grid max-h-52 gap-2 overflow-auto rounded-lg border border-[#e2e8f0] p-3">
              {positions.map((position) => (
                <label
                  className="flex items-center gap-2 text-sm text-[#344054]"
                  key={position.id}
                >
                  <input
                    checked={positionIds.includes(position.id)}
                    className="h-4 w-4 accent-[#006fd5]"
                    type="checkbox"
                    onChange={() =>
                      toggleValue(positionIds, position.id, setPositionIds)
                    }
                  />
                  {position.name}
                </label>
              ))}
            </div>
          </section>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-[#344054]">
          <input
            checked={skipExisting}
            className="h-4 w-4 accent-[#006fd5]"
            type="checkbox"
            onChange={(event) => setSkipExisting(event.target.checked)}
          />
          Bỏ qua nhân viên đã có bảng lương trong kỳ
        </label>

        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button
            className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-semibold text-[#344054]"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white! disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Đang tạo..." : "Tạo bảng lương"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PayrollDetailModal({
  payroll,
  open,
  onClose,
  onRequestApproval,
  onApprove,
  onPay,
  canManage,
  canApprove,
  canPay,
}: {
  payroll: PayrollDetail | null;
  open: boolean;
  onClose: () => void;
  onRequestApproval: (id: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onPay: (id: string) => Promise<void>;
  canManage: boolean;
  canApprove: boolean;
  canPay: boolean;
}) {
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);

  const runAction = async (action: string, callback: () => Promise<void>) => {
    setSubmittingAction(action);
    try {
      await callback();
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <Modal
      open={open}
      title={
        payroll
          ? `Bảng lương ${payroll.employee?.name ?? ""} - ${payroll.month}/${payroll.year}`
          : "Chi tiết bảng lương"
      }
      onCancel={onClose}
      width={980}
      footer={null}
      centered
      styles={{ body: { maxHeight: "calc(100vh - 170px)", overflowY: "auto" } }}
    >
      {!payroll ? (
        <EmptyState text="Đang tải chi tiết..." />
      ) : (
        <div className="grid gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <div>
              <div className="text-lg font-bold text-[#243247]">
                {payroll.employee?.name}
              </div>
              <div className="text-sm text-[#667085]">
                {payroll.employee?.employeeId} ·{" "}
                {payroll.employee?.department?.name ?? "-"} ·{" "}
                {payroll.employee?.position?.name ?? "-"}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={payroll.status} />
              {canManage && payroll.status === "DRAFT" ? (
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white!"
                  disabled={submittingAction === "request"}
                  type="button"
                  onClick={() =>
                    runAction("request", () => onRequestApproval(payroll.id))
                  }
                >
                  <Send className="h-4 w-4" />
                  Yêu cầu duyệt
                </button>
              ) : null}
              {canApprove && payroll.status === "WAITING_APPROVAL" ? (
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-[#006fd5] px-3 py-2 text-sm font-semibold text-white!"
                  disabled={submittingAction === "approve"}
                  type="button"
                  onClick={() =>
                    runAction("approve", () => onApprove(payroll.id))
                  }
                >
                  <FileCheck2 className="h-4 w-4" />
                  Duyệt
                </button>
              ) : null}
              {canPay && payroll.status === "APPROVED" ? (
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white!"
                  disabled={submittingAction === "pay"}
                  type="button"
                  onClick={() => runAction("pay", () => onPay(payroll.id))}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Thanh toán
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 max-[860px]:grid-cols-2 max-[520px]:grid-cols-1">
            {[
              ["Lương thực tế", payroll.actualSalary],
              ["Lương nghỉ lễ", payroll.holidayPay],
              ["OT", payroll.totalOvertimePay],
              ["Phụ cấp + thưởng", toNumber(payroll.totalAllowance) + toNumber(payroll.totalBonus)],
              ["Thực nhận", payroll.netSalary],
            ].map(([label, value]) => (
              <div className="rounded-lg border border-[#e2e8f0] p-4" key={label}>
                <div className="text-xs font-semibold uppercase text-[#667085]">
                  {label}
                </div>
                <div className="mt-1 text-lg font-bold text-[#243247]">
                  {formatMoney(value)}
                </div>
              </div>
            ))}
          </div>

          <section className="grid gap-3">
            <h3 className="text-base font-bold text-[#243247]">Tổng hợp</h3>
            <div className="overflow-auto rounded-lg border border-[#e2e8f0]">
              <table className="w-full min-w-[640px] text-sm">
                <tbody className="divide-y divide-[#e2e8f0]">
                  {[
                    ["Lương cơ bản", payroll.baseSalary],
                    ["Công chuẩn", `${formatNumber(payroll.standardWorkDays)} ngày`],
                    ["Công thực tế", `${formatNumber(payroll.actualWorkDays)} ngày`],
                    ["Tổng lương gross", payroll.grossSalary],
                    ["BHXH", payroll.socialInsurance],
                    ["BHYT", payroll.healthInsurance],
                    ["BHTN", payroll.unemploymentInsurance],
                    ["Thuế TNCN", payroll.personalIncomeTax],
                    ["Tổng phạt", payroll.totalPenalty],
                    ["Tổng khấu trừ", payroll.totalDeduction],
                    ["Thực nhận", payroll.netSalary],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="w-1/2 px-4 py-2.5 text-[#667085]">
                        {label}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-[#243247]">
                        {typeof value === "string" && value.includes("ngày")
                          ? value
                          : formatMoney(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-3">
            <h3 className="text-base font-bold text-[#243247]">Dòng chi tiết</h3>
            <div className="grid gap-3">
              <div className="overflow-auto rounded-lg border border-[#e2e8f0]">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
                    <tr>
                      <th className="px-4 py-3 text-left">Loại</th>
                      <th className="px-4 py-3 text-left">Nội dung</th>
                      <th className="px-4 py-3 text-right">Số lượng</th>
                      <th className="px-4 py-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {payroll.overtimeLines.map((line) => (
                      <tr key={`ot-${line.id}`}>
                        <td className="px-4 py-3 font-medium text-[#344054]">
                          Tăng ca
                        </td>
                        <td className="px-4 py-3 text-[#344054]">
                          {line.workShiftName}
                        </td>
                        <td className="px-4 py-3 text-right text-[#667085]">
                          {formatNumber(line.hours)} giờ · x{formatNumber(line.multiplier)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatMoney(line.amount)}
                        </td>
                      </tr>
                    ))}
                    {payroll.allowanceLines.map((line) => (
                      <tr key={`allowance-${line.id}`}>
                        <td className="px-4 py-3 font-medium text-[#344054]">
                          Phụ cấp
                        </td>
                        <td className="px-4 py-3 text-[#344054]">
                          {line.allowanceName}
                        </td>
                        <td className="px-4 py-3 text-right text-[#667085]">-</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                          {formatMoney(line.amount)}
                        </td>
                      </tr>
                    ))}
                    {payroll.bonusPenaltyLines.map((line) => (
                      <tr key={`bonus-${line.id}`}>
                        <td className="px-4 py-3 font-medium text-[#344054]">
                          {line.isBonus ? "Thưởng" : "Phạt"}
                        </td>
                        <td className="px-4 py-3 text-[#344054]">
                          {line.reason ?? line.autoPenaltyPolicy?.name ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-[#667085]">-</td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            line.isBonus ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {line.isBonus ? "+" : "-"}
                          {formatMoney(line.amount)}
                        </td>
                      </tr>
                    ))}
                    {!payroll.overtimeLines.length &&
                    !payroll.allowanceLines.length &&
                    !payroll.bonusPenaltyLines.length ? (
                      <tr>
                        <td
                          className="px-4 py-8 text-center text-[#667085]"
                          colSpan={4}
                        >
                          Không có dòng chi tiết
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </Modal>
  );
}

type MineDetailDialog = "overtime" | "allowance" | "bonus" | "penalty" | null;

function MineSummaryRow({
  label,
  value,
  icon: Icon,
  variant = "default",
  onClick,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  variant?: "default" | "income" | "deduction" | "total";
  onClick?: () => void;
}) {
  const valueColor =
    variant === "income"
      ? "text-emerald-600"
      : variant === "deduction"
        ? "text-rose-600"
        : variant === "total"
          ? "text-[#006fd5] font-extrabold text-lg"
          : "text-[#1e293b]";
  return (
    <tr
      className={`group transition-colors ${onClick ? "cursor-pointer hover:bg-[#f8fafc]" : ""}`}
      onClick={onClick}
    >
      <td className="px-5 py-3.5 text-[#475569]">
        <div className="flex items-center gap-2.5">
          {Icon ? (
            <Icon
              className={`h-4.5 w-4.5 ${
                variant === "income"
                  ? "text-emerald-500"
                  : variant === "deduction"
                    ? "text-rose-500"
                    : "text-[#94a3b8]"
              }`}
            />
          ) : null}
          <span className="font-medium">{label}</span>
        </div>
      </td>
      <td className={`px-5 py-3.5 text-right font-semibold ${valueColor}`}>
        <span className="inline-flex items-center justify-end gap-2">
          <span>{value}</span>
          {onClick ? <ChevronRight className="h-4 w-4 text-[#94a3b8]" /> : null}
        </span>
      </td>
    </tr>
  );
}

function MineDetailModal({
  payroll,
  dialog,
  onClose,
}: {
  payroll: PayrollDetail;
  dialog: MineDetailDialog;
  onClose: () => void;
}) {
  const bonusLines = payroll.bonusPenaltyLines.filter((line) => line.isBonus);
  const penaltyLines = payroll.bonusPenaltyLines.filter((line) => !line.isBonus);
  const moneyRows =
    dialog === "allowance"
      ? payroll.allowanceLines.map((line) => ({
          id: line.id,
          name: line.allowanceName,
          amount: line.amount,
        }))
      : (dialog === "bonus" ? bonusLines : penaltyLines).map((line) => ({
          id: line.id,
          name:
            line.autoPenaltyPolicy?.name ||
            line.payrollBonusPenalty?.reason ||
            line.reason ||
            "-",
          amount: line.amount,
        }));

  const config = {
    overtime: {
      title: "Chi tiết tăng ca",
      total: payroll.totalOvertimePay,
      countLabel: "Tổng công OT",
      countValue: `${formatNumber(payroll.totalOvertimeWorkDays)} công`,
      subLabel: "Tổng giờ OT",
      subValue: `${formatNumber(payroll.totalOvertimeHours)} giờ`,
      rows: payroll.overtimeLines,
    },
    allowance: {
      title: "Chi tiết phụ cấp",
      total: payroll.totalAllowance,
      rows: payroll.allowanceLines,
    },
    bonus: {
      title: "Chi tiết thưởng",
      total: payroll.totalBonus,
      rows: bonusLines,
    },
    penalty: {
      title: "Chi tiết phạt",
      total: payroll.totalPenalty,
      rows: penaltyLines,
    },
  }[dialog ?? "overtime"];

  return (
    <Modal open={dialog !== null} title={config.title} onCancel={onClose} footer={null} width={860} centered>
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Tổng tiền</div>
            <div className="mt-1 text-2xl font-extrabold text-[#1e293b]">
              {formatMoney(config.total)}
            </div>
          </div>
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
              {"countLabel" in config ? config.countLabel : "Số dòng"}
            </div>
            <div className="mt-1 text-2xl font-extrabold text-[#1e293b]">
              {"countValue" in config ? config.countValue : config.rows.length.toLocaleString("vi-VN")}
            </div>
          </div>
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
              {"subLabel" in config ? config.subLabel : "Bình quân"}
            </div>
            <div className="mt-1 text-2xl font-extrabold text-[#1e293b]">
              {"subValue" in config
                ? config.subValue
                : formatMoney(config.rows.length ? toNumber(config.total) / config.rows.length : 0)}
            </div>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-auto rounded-xl border border-[#e2e8f0] shadow-sm">
          {dialog === "overtime" ? (
            <table className="relative w-full min-w-[760px] text-sm">
              <thead className="sticky top-0 z-10 bg-[#f8fafc] text-xs font-bold uppercase tracking-wider text-[#64748b] after:absolute after:bottom-0 after:left-0 after:right-0 after:border-b after:border-[#e2e8f0]">
                <tr>
                  <th className="px-5 py-3 text-left">Loại ca OT</th>
                  <th className="px-5 py-3 text-right">Công OT</th>
                  <th className="px-5 py-3 text-right">Giờ OT</th>
                  <th className="px-5 py-3 text-right">Đơn giá giờ</th>
                  <th className="px-5 py-3 text-right">Hệ số</th>
                  <th className="px-5 py-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] bg-white">
                {payroll.overtimeLines.map((line) => (
                  <tr key={line.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-[#1e293b]">{line.workShiftName}</div>
                      <div className="text-xs text-[#64748b]">{line.workShiftCode ?? "-"}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-[#475569]">{formatNumber(line.workDays)}</td>
                    <td className="px-5 py-3 text-right font-medium text-[#475569]">{formatNumber(line.hours)}</td>
                    <td className="px-5 py-3 text-right font-medium text-[#475569]">{formatMoney(line.baseHourlyRate)}</td>
                    <td className="px-5 py-3 text-right font-medium text-[#475569]">{formatNumber(line.multiplier)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-[#1e293b]">{formatMoney(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="relative w-full min-w-[620px] text-sm">
              <thead className="sticky top-0 z-10 bg-[#f8fafc] text-xs font-bold uppercase tracking-wider text-[#64748b] after:absolute after:bottom-0 after:left-0 after:right-0 after:border-b after:border-[#e2e8f0]">
                <tr>
                  <th className="px-5 py-3 text-left">Nội dung</th>
                  <th className="px-5 py-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] bg-white">
                {moneyRows.map((line) => (
                  <tr key={line.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-[#1e293b]">{line.name}</td>
                    <td className="px-5 py-3 text-right font-semibold text-[#1e293b]">{formatMoney(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
}

function MinePayrollDetailSection({
  payroll: payrollInput,
  loading,
}: {
  payroll: PayrollDetail | null;
  loading: boolean;
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [dialog, setDialog] = useState<MineDetailDialog>(null);

  const labels = useMemo(() => {
    const profile = payrollInput?.employee?.payrollProfile;
    const insurance = profile?.insurancePolicy;
    const taxRate = payrollInput ? getCurrentTaxRate(payrollInput) : null;

    return {
      social: `BHXH${formatPercent(insurance?.employeeSocialRate)}`,
      health: `BHYT${formatPercent(insurance?.employeeHealthRate)}`,
      unemployment: `BHTN${formatPercent(insurance?.employeeUnemploymentRate)}`,
      tax: `Thuế TNCN${profile?.taxPolicy ? formatPercent(taxRate ?? 0) : ""}`,
    };
  }, [payrollInput]);

  if (loading) {
    return (
      <section className="rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
        <EmptyState text="Đang tải chi tiết bảng lương..." />
      </section>
    );
  }

  if (!payrollInput) {
    return (
      <section className="rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
        <EmptyState text="Chưa có bảng lương phù hợp." />
      </section>
    );
  }
  const payroll = payrollInput;

  return (
    <section className="grid gap-5">
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-[#1e293b] p-6 shadow-lg">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 rounded-full border-2 border-white/20 shadow-inner">
              <Avatar alt={payroll.employee?.name ?? "NV"} sizeClass="h-full w-full" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white">{payroll.employee?.name}</div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm">
                  {payroll.employee?.employeeId}
                </span>
                <span>·</span>
                <span>{payroll.employee?.department?.name ?? "-"}</span>
                <span>·</span>
                <span>{payroll.employee?.position?.name ?? "-"}</span>
              </div>
            </div>
          </div>
          <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-1.5 text-sm font-bold text-blue-200 backdrop-blur-md">
            {getStatusLabel(payroll.status)}
          </span>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500 opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-20 h-20 w-20 rounded-full bg-emerald-500 opacity-20 blur-2xl" />
      </section>

      <div className="grid grid-cols-4 gap-4 max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
        {[
          { label: "Lương công thực tế", value: payroll.actualSalary, icon: Banknote, color: "blue" },
          { label: "Lương nghỉ lễ", value: payroll.holidayPay, icon: CalendarDays, color: "blue" },
          { label: "Tổng Gross", value: payroll.grossSalary, icon: Coins, color: "blue" },
          { label: "Khấu trừ", value: payroll.totalDeduction, icon: MinusCircle, color: "rose" },
          { label: "Thực nhận", value: payroll.netSalary, icon: WalletCards, color: "emerald" },
        ].map((item) => {
          const Icon = item.icon;
          const colorClasses = {
            blue: "bg-[#f0f7ff] text-[#006fd5] border-[#006fd5]/10",
            emerald: "bg-emerald-50 text-emerald-600 border-emerald-600/10",
            rose: "bg-rose-50 text-rose-600 border-rose-600/10",
          }[item.color as "blue" | "emerald" | "rose"];

          return (
            <div className="group relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]" key={item.label}>
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#64748b]">{item.label}</div>
                  <div className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#1e293b]">{formatMoney(item.value)}</div>
                </div>
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${colorClasses} transition-transform group-hover:scale-110`}>
                  <Icon className="h-6 w-6" />
                </span>
              </div>
              <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40 ${item.color === "blue" ? "bg-[#006fd5]" : item.color === "emerald" ? "bg-emerald-500" : "bg-rose-500"}`} />
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-5 py-4">
          <Receipt className="h-5 w-5 text-[#64748b]" />
          <h2 className="text-lg font-extrabold text-[#1e293b]">Bảng lương chi tiết</h2>
        </div>
        <div className="border-b border-[#e2e8f0] bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">Thu nhập</div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#e2e8f0]">
            <MineSummaryRow icon={FileText} label="Lương cơ bản" value={formatMoney(payroll.baseSalary)} />
            <MineSummaryRow icon={Clock} label="Công chuẩn" value={formatNumber(payroll.standardWorkDays)} />
            <MineSummaryRow icon={Clock} label="Công thực tế" value={formatNumber(payroll.actualWorkDays)} />
            <MineSummaryRow icon={CalendarDays} label="Lương nghỉ lễ" variant="income" value={formatMoney(payroll.holidayPay)} />
            <MineSummaryRow icon={CalendarDays} label="Công nghỉ lễ" value={formatNumber(payroll.holidayWorkDays)} />
            <MineSummaryRow icon={Clock} label="Tăng ca (OT)" variant="income" value={formatMoney(payroll.totalOvertimePay)} onClick={() => setDialog("overtime")} />
            <MineSummaryRow icon={PlusCircle} label="Phụ cấp" variant="income" value={formatMoney(payroll.totalAllowance)} onClick={() => setDialog("allowance")} />
            <MineSummaryRow icon={PlusCircle} label="Thưởng" variant="income" value={formatMoney(payroll.totalBonus)} onClick={() => setDialog("bonus")} />
          </tbody>
        </table>
        <div className="border-y border-[#e2e8f0] bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#64748b]">Khấu trừ</div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#e2e8f0]">
            <MineSummaryRow icon={MinusCircle} label="Phạt" variant="deduction" value={formatMoney(payroll.totalPenalty)} onClick={() => setDialog("penalty")} />
            <MineSummaryRow icon={ShieldAlert} label={labels.social} variant="deduction" value={formatMoney(payroll.socialInsurance)} />
            <MineSummaryRow icon={ShieldAlert} label={labels.health} variant="deduction" value={formatMoney(payroll.healthInsurance)} />
            <MineSummaryRow icon={ShieldAlert} label={labels.unemployment} variant="deduction" value={formatMoney(payroll.unemploymentInsurance)} />
            <MineSummaryRow icon={MinusCircle} label={labels.tax} variant="deduction" value={formatMoney(payroll.personalIncomeTax)} />
          </tbody>
        </table>
        <div className="border-y border-[#006fd5]/10 bg-[#f0f7ff] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#006fd5]">Tổng kết</div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#006fd5]/10 bg-[#f8fbff]">
            <MineSummaryRow icon={WalletCards} label="Thực nhận" variant="total" value={formatMoney(payroll.netSalary)} />
            <MineSummaryRow icon={BadgeCheck} label="Đã trả" value={formatMoney(payroll.paidAmount ?? 0)} />
          </tbody>
        </table>
      </section>

      <MineDetailModal payroll={payroll} dialog={dialog} onClose={() => setDialog(null)} />
    </section>
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const isClickable = (label: string) =>
    ["Tăng ca", "Phụ cấp", "Thưởng", "Tổng phạt"].includes(label);

  const renderDetailedLines = (label: string) => {
    if (label === "Tăng ca") {
      if (!payroll.overtimeLines.length) return <div className="text-center text-[#667085] py-4">Không có dòng chi tiết</div>;
      return (
        <div className="overflow-auto rounded-lg border border-[#e2e8f0]">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
              <tr>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-left">Nội dung</th>
                <th className="px-4 py-3 text-right">Số lượng</th>
                <th className="px-4 py-3 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {payroll.overtimeLines.map((line) => (
                <tr key={`ot-${line.id}`}>
                  <td className="px-4 py-3 font-medium text-[#344054]">Tăng ca</td>
                  <td className="px-4 py-3 text-[#344054]">{line.workShiftName}</td>
                  <td className="px-4 py-3 text-right text-[#667085]">
                    {formatNumber(line.hours)} giờ · x{formatNumber(line.multiplier)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(line.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (label === "Phụ cấp") {
      if (!payroll.allowanceLines.length) return <div className="text-center text-[#667085] py-4">Không có dòng chi tiết</div>;
      return (
        <div className="overflow-auto rounded-lg border border-[#e2e8f0]">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
              <tr>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-left">Nội dung</th>
                <th className="px-4 py-3 text-right">Số lượng</th>
                <th className="px-4 py-3 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {payroll.allowanceLines.map((line) => (
                <tr key={`allowance-${line.id}`}>
                  <td className="px-4 py-3 font-medium text-[#344054]">Phụ cấp</td>
                  <td className="px-4 py-3 text-[#344054]">{line.allowanceName}</td>
                  <td className="px-4 py-3 text-right text-[#667085]">-</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">{formatMoney(line.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (label === "Thưởng") {
      const bonusLines = payroll.bonusPenaltyLines.filter((l) => l.isBonus);
      if (!bonusLines.length) return <div className="text-center text-[#667085] py-4">Không có dòng chi tiết</div>;
      return (
        <div className="overflow-auto rounded-lg border border-[#e2e8f0]">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
              <tr>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-left">Nội dung</th>
                <th className="px-4 py-3 text-right">Số lượng</th>
                <th className="px-4 py-3 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {bonusLines.map((line) => (
                <tr key={`bonus-${line.id}`}>
                  <td className="px-4 py-3 font-medium text-[#344054]">Thưởng</td>
                  <td className="px-4 py-3 text-[#344054]">
                    {line.reason ?? line.autoPenaltyPolicy?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-[#667085]">-</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">+{formatMoney(line.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (label === "Tổng phạt") {
      const penaltyLines = payroll.bonusPenaltyLines.filter((l) => !l.isBonus);
      if (!penaltyLines.length) return <div className="text-center text-[#667085] py-4">Không có dòng chi tiết</div>;
      return (
        <div className="overflow-auto rounded-lg border border-[#e2e8f0]">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
              <tr>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-left">Nội dung</th>
                <th className="px-4 py-3 text-right">Số lượng</th>
                <th className="px-4 py-3 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {penaltyLines.map((line) => (
                <tr key={`penalty-${line.id}`}>
                  <td className="px-4 py-3 font-medium text-[#344054]">Phạt</td>
                  <td className="px-4 py-3 text-[#344054]">
                    {line.reason ?? line.autoPenaltyPolicy?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-[#667085]">-</td>
                  <td className="px-4 py-3 text-right font-semibold text-rose-700">-{formatMoney(line.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-[#243247]">
              Tháng {payroll.month}/{payroll.year}
            </div>
            <div className="text-sm text-[#667085]">
              {payroll.employee?.name ?? "-"} · {payroll.employee?.employeeId ?? "-"}
            </div>
          </div>
          <StatusBadge status={payroll.status} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
        {[
          ["Lương thực tế", payroll.actualSalary],
          ["Lương nghỉ lễ", payroll.holidayPay],
          ["Gross", payroll.grossSalary],
          ["Khấu trừ", payroll.totalDeduction],
          ["Thực nhận", payroll.netSalary],
        ].map(([label, value]) => (
          <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm" key={label as string}>
            <div className="text-xs font-semibold uppercase text-[#667085]">{label as string}</div>
            <div className="mt-1 text-xl font-bold text-[#243247]">{formatMoney(value as any)}</div>
          </div>
        ))}
      </div>

      <section className="grid gap-3">
        <h3 className="text-base font-bold text-[#243247]">Tổng hợp</h3>
        <div className="overflow-auto rounded-lg border border-[#e2e8f0] bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <tbody className="divide-y divide-[#e2e8f0]">
              {[
                ["Lương cơ bản", payroll.baseSalary],
                ["Công chuẩn", `${formatNumber(payroll.standardWorkDays)} ngày`],
                ["Công thực tế", `${formatNumber(payroll.actualWorkDays)} ngày`],
                ["Tăng ca", payroll.totalOvertimePay],
                ["Phụ cấp", payroll.totalAllowance],
                ["Thưởng", payroll.totalBonus],
                ["Tổng lương gross", payroll.grossSalary],
                ["BHXH", payroll.socialInsurance],
                ["BHYT", payroll.healthInsurance],
                ["BHTN", payroll.unemploymentInsurance],
                ["Thuế TNCN", payroll.personalIncomeTax],
                ["Tổng phạt", payroll.totalPenalty],
                ["Tổng khấu trừ", payroll.totalDeduction],
                ["Thực nhận", payroll.netSalary],
              ].map(([label, value]) => {
                const clickable = typeof label === "string" && isClickable(label);
                return (
                  <Fragment key={label as string}>
                    <tr 
                      className={clickable ? "cursor-pointer hover:bg-[#f8fafc] group" : ""}
                      onClick={() => clickable && toggleSection(label as string)}
                    >
                      <td className="w-1/2 px-4 py-2.5 text-[#667085]">
                        <div className="flex items-center gap-2">
                          {label as string}
                          {clickable && (
                            <ChevronDown 
                              className={`h-4 w-4 text-[#006fd5] transition-transform ${expandedSection === label ? 'rotate-180' : 'opacity-0 group-hover:opacity-100'}`} 
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-[#243247]">
                        {typeof value === "string" && value.includes("ngày") ? value : formatMoney(value as any)}
                      </td>
                    </tr>
                    {clickable && expandedSection === label && (
                      <tr className="bg-[#f8fafc]">
                        <td colSpan={2} className="px-4 py-3">
                          <div className="rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-sm">
                            {renderDetailedLines(label as string)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export function PayrollPage({ mode }: { mode: PayrollPageMode }) {
  const { user } = useAuth();
  const permissions = new Set(user?.permissions ?? []);
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const hasPermission = (permission: string) =>
    isAdmin || permissions.has(permission);

  const canManage = hasPermission("PAYROLL_MANAGE");
  const canApprove = hasPermission("PAYROLL_APPROVE");
  const canPay = hasPermission("PAYROLL_PAY");
  const isMine = mode === "mine";

  const [payrolls, setPayrolls] = useState<PayrollSummary[]>([]);
  const [departments, setDepartments] = useState<EmployeeOption[]>([]);
  const [positions, setPositions] = useState<EmployeeOption[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [status, setStatus] = useState<PayrollStatus | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey | "">("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<PayrollDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPeriodData = useMemo(() => {
    if (!selectedPeriod) return null;
    const [year, month] = selectedPeriod.split("-").map(Number);
    return { year, month };
  }, [selectedPeriod]);

  const query = useMemo<PayrollQuery>(
    () => ({
      month: selectedPeriodData?.month,
      year: selectedPeriodData?.year,
      departmentId: isMine ? undefined : departmentId,
      positionId: isMine ? undefined : positionId,
      status: isMine ? undefined : status,
    }),
    [departmentId, isMine, positionId, selectedPeriodData, status],
  );

  const loadPayrolls = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = isMine
        ? await payrollService.getMine({})
        : await payrollService.getPayrolls(query);
      setPayrolls(result);
    } catch (error) {
      setPayrolls([]);
      setErrorMessage(getErrorMessage(error, "Không tải được bảng lương."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    Promise.allSettled([
      employeeService.getDepartments(),
      employeeService.getPositions(),
    ]).then(([departmentResult, positionResult]) => {
      if (ignore) return;
      if (departmentResult.status === "fulfilled") {
        setDepartments(departmentResult.value);
      }
      if (positionResult.status === "fulfilled") {
        setPositions(positionResult.value);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    void loadPayrolls();
  }, [isMine, query, selectedPeriodData]);

  const periods = useMemo(() => buildPeriods(payrolls), [payrolls]);
  const mineYearOptions = useMemo(
    () => [...new Set(payrolls.map((payroll) => payroll.year))].sort((a, b) => b - a),
    [payrolls],
  );
  const mineSelectedMonth = selectedPeriodData?.month ?? payrolls[0]?.month ?? currentMonth;
  const mineSelectedYear = selectedPeriodData?.year ?? payrolls[0]?.year ?? currentYear;

  const changeMinePeriod = (month: number, year: number) => {
    setSelectedPeriod(`${year}-${month}`);
  };

  const filteredPayrolls = useMemo(() => {
    if (isMine) {
      if (!selectedPeriodData) return payrolls;
      return payrolls.filter(
        (payroll) =>
          payroll.month === selectedPeriodData.month &&
          payroll.year === selectedPeriodData.year,
      );
    }

    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return payrolls;

    return payrolls.filter((payroll) =>
      [
        payroll.employee?.name,
        payroll.employee?.employeeId,
        payroll.employee?.email,
        payroll.employee?.department?.name,
        payroll.employee?.position?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [isMine, payrolls, searchTerm, selectedPeriodData]);

  const totals = useMemo(
    () => ({
      gross: filteredPayrolls.reduce(
        (total, payroll) => total + toNumber(payroll.grossSalary),
        0,
      ),
      deduction: filteredPayrolls.reduce(
        (total, payroll) => total + toNumber(payroll.totalDeduction),
        0,
      ),
      net: filteredPayrolls.reduce(
        (total, payroll) => total + toNumber(payroll.netSalary),
        0,
      ),
      paid: filteredPayrolls.reduce(
        (total, payroll) => total + toNumber(payroll.paidAmount),
        0,
      ),
      remaining: filteredPayrolls.reduce(
        (total, payroll) => total + getRemainingAmount(payroll),
        0,
      ),
    }),
    [filteredPayrolls],
  );

  const selectedMinePayroll = useMemo(
    () => (isMine ? filteredPayrolls[0] ?? null : null),
    [filteredPayrolls, isMine],
  );

  useEffect(() => {
    if (!isMine) return;

    if (!selectedMinePayroll) {
      setSelectedDetail(null);
      return;
    }

    let ignore = false;
    setDetailLoading(true);
    payrollService
      .getById(selectedMinePayroll.id)
      .then((detail) => {
        if (!ignore) setSelectedDetail(detail);
      })
      .catch((error) => {
        if (!ignore) {
          setSelectedDetail(null);
          setErrorMessage(getErrorMessage(error, "Không tải được chi tiết lương."));
        }
      })
      .finally(() => {
        if (!ignore) setDetailLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [isMine, selectedMinePayroll]);

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setSelectedDetail(null);
    try {
      setSelectedDetail(await payrollService.getById(id));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không tải được chi tiết lương."));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshDetail = async (id: string) => {
    setSelectedDetail(await payrollService.getById(id));
    await loadPayrolls();
  };

  const submitCreatePayroll = async (payload: CreatePayrollByTargetsPayload) => {
    const result = await payrollService.createByTargets(payload);
    setCreateOpen(false);
    if (payload.year && payload.month) {
      setSelectedPeriod(`${payload.year}-${payload.month}`);
    }
    await loadPayrolls();
    Modal.success({
      title: "Đã tạo bảng lương",
      content: `Tạo ${result.createdCount} bảng lương, bỏ qua ${result.skippedCount} nhân viên đã có dữ liệu.`,
    });
  };

  const requestApproval = async (id: string) => {
    await payrollService.requestApproval(id);
    await refreshDetail(id);
  };

  const approve = async (id: string) => {
    await payrollService.approve(id);
    await refreshDetail(id);
  };

  const pay = async (id: string) => {
    await payrollService.pay(id);
    await refreshDetail(id);
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden bg-[#f1f5f9]">
        <div className="flex h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">
                {isMine ? "Bảng lương của tôi" : "Bảng lương"}
              </h1>
            </div>
            {!isMine && canManage ? (
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#006fd5] px-4 text-sm font-semibold text-white! shadow-sm hover:bg-[#0055a8]"
                type="button"
                onClick={() => setCreateOpen(true)}
              >
                <FilePlus2 className="h-4 w-4" />
                Tạo bảng lương
              </button>
            ) : null}
          </div>

          {!isMine ? (
          <div className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2 max-[620px]:grid-cols-1">
            {(isMine
              ? [
                  {
                    label: "Kỳ lương",
                    value: filteredPayrolls.length.toLocaleString("vi-VN"),
                    icon: WalletCards,
                  },
                  {
                    label: "Thực nhận",
                    value: formatMoney(totals.net),
                    icon: BadgeCheck,
                  },
                  {
                    label: "Đã trả",
                    value: formatMoney(totals.paid),
                    icon: Banknote,
                  },
                  {
                    label: "Còn phải trả",
                    value: formatMoney(totals.remaining),
                    icon: FileCheck2,
                  },
                ]
              : [
                  {
                    label: "Nhân viên",
                    value: filteredPayrolls.length.toLocaleString("vi-VN"),
                    icon: WalletCards,
                  },
                  {
                    label: "Tổng gross",
                    value: formatMoney(totals.gross),
                    icon: Banknote,
                  },
                  {
                    label: "Khấu trừ",
                    value: formatMoney(totals.deduction),
                    icon: FileCheck2,
                  },
                  {
                    label: "Thực nhận",
                    value: formatMoney(totals.net),
                    icon: BadgeCheck,
                  },
                ]).map((item) => {
              const Icon = item.icon;
              return (
                <div
                  className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm"
                  key={item.label}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase text-[#667085]">
                        {item.label}
                      </div>
                      <div className="mt-1 text-xl font-bold text-[#243247]">
                        {item.value}
                      </div>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f0f7ff] text-[#006fd5]">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          ) : null}

          <section className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#243247]">
                <CalendarDays className="h-4 w-4 text-[#006fd5]" />
                Kỳ lương
              </div>
              {isMine ? (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="h-10 rounded-lg border border-[#d0d5dd] px-3 text-sm outline-none focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
                    value={mineSelectedMonth}
                    onChange={(event) =>
                      changeMinePeriod(Number(event.target.value), mineSelectedYear)
                    }
                  >
                    {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                      <option key={month} value={month}>
                        Tháng {month}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-10 rounded-lg border border-[#d0d5dd] px-3 text-sm outline-none focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
                    value={mineSelectedYear}
                    onChange={(event) =>
                      changeMinePeriod(mineSelectedMonth, Number(event.target.value))
                    }
                  >
                    {(mineYearOptions.length ? mineYearOptions : [currentYear]).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <button
                  className="text-sm font-semibold text-[#006fd5]"
                  type="button"
                  onClick={() => setSelectedPeriod("")}
                >
                  Tất cả kỳ
                </button>
              )}
            </div>
            {!isMine ? (
              periods.length ? (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                  {periods.map((period) => (
                    <button
                      className={`min-w-[220px] rounded-lg border p-3 text-left transition-colors ${
                        selectedPeriod === period.key
                          ? "border-[#006fd5] bg-[#f0f7ff]"
                          : "border-[#e2e8f0] hover:border-[#006fd5]"
                      }`}
                      key={period.key}
                      type="button"
                      onClick={() => setSelectedPeriod(period.key)}
                    >
                      <div className="text-sm font-bold text-[#243247]">
                        Tháng {period.month}/{period.year}
                      </div>
                      <div className="mt-1 text-xs text-[#667085]">
                        {period.count} bảng lương · {period.statuses.PAID} đã trả
                      </div>
                      <div className="mt-2 text-sm font-semibold text-[#006fd5]">
                        {formatMoney(period.netSalary)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-sm text-[#667085]">Chưa có kỳ lương.</div>
              )
            ) : null}
          </section>

          {!isMine ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm">
            {!isMine ? (
              <>
                <div className="relative min-w-[240px] flex-1">
                  <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#667085]" />
                  <input
                    className="w-full rounded-lg border border-[#d0d5dd] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
                    placeholder="Tìm theo nhân viên, mã, phòng ban..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
                <SearchableSelect
                  className="min-w-[180px]"
                  value={departmentId}
                  onChange={setDepartmentId}
                  options={[
                    { value: "", label: "Tất cả bộ phận" },
                    ...departments.map((department) => ({
                      value: department.id,
                      label: department.name,
                    })),
                  ]}
                />
                <SearchableSelect
                  className="min-w-[180px]"
                  value={positionId}
                  onChange={setPositionId}
                  options={[
                    { value: "", label: "Tất cả chức vụ" },
                    ...positions.map((position) => ({
                      value: position.id,
                      label: position.name,
                    })),
                  ]}
                />
                <select
                  className="min-w-[160px] rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm outline-none focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as PayrollStatus | "")
                  }
                >
                  <option value="">Tất cả trạng thái</option>
                  {statusOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <div className="min-w-0 flex-1 text-sm font-semibold text-[#243247]">
                {selectedPeriodData
                  ? `Tháng ${selectedPeriodData.month}/${selectedPeriodData.year}`
                  : "Tất cả kỳ lương"}
              </div>
            )}
            <button
              className="grid h-10 w-10 place-items-center rounded-lg border border-[#d0d5dd] text-[#344054] hover:bg-[#f8fafc]"
              title="Tải lại"
              type="button"
              onClick={() => void loadPayrolls()}
            >
              <RefreshCcw className="h-4.5 w-4.5" />
            </button>
          </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          {isMine ? (
            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              <MinePayrollDetailSection
                payroll={selectedDetail}
                loading={loading || detailLoading}
              />
            </div>
          ) : (
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
            {loading ? (
              <EmptyState text="Đang tải bảng lương..." />
            ) : filteredPayrolls.length ? (
              <div className="min-h-0 flex-1 overflow-auto">
                <table className={`w-full text-sm ${isMine ? "min-w-[1760px]" : "min-w-[1180px]"}`}>
                  <thead className="sticky top-0 z-1 bg-[#f8fafc] text-xs uppercase text-[#667085]">
                    {isMine ? (
                      <tr>
                        <th className="px-4 py-3 text-left">Kỳ lương</th>
                        <th className="px-4 py-3 text-right">Lương cơ bản</th>
                        <th className="px-4 py-3 text-right">Công chuẩn</th>
                        <th className="px-4 py-3 text-right">Công thực tế</th>
                        <th className="px-4 py-3 text-right">Lương thực tế</th>
                        <th className="px-4 py-3 text-right">Lương nghỉ lễ</th>
                        <th className="px-4 py-3 text-right">Tăng ca</th>
                        <th className="px-4 py-3 text-right">Phụ cấp</th>
                        <th className="px-4 py-3 text-right">Thưởng</th>
                        <th className="px-4 py-3 text-right">Phạt</th>
                        <th className="px-4 py-3 text-right">Bảo hiểm</th>
                        <th className="px-4 py-3 text-right">Thuế</th>
                        <th className="px-4 py-3 text-right">Gross</th>
                        <th className="px-4 py-3 text-right">Khấu trừ</th>
                        <th className="px-4 py-3 text-right">Thực nhận</th>
                        <th className="px-4 py-3 text-right">Đã trả</th>
                        <th className="px-4 py-3 text-right">Còn lại</th>
                        <th className="px-4 py-3 text-left">Trạng thái</th>
                        <th className="px-4 py-3 text-center">Thao tác</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="px-4 py-3 text-left">Nhân viên</th>
                        <th className="px-4 py-3 text-left">Kỳ</th>
                        <th className="px-4 py-3 text-right">Công</th>
                        <th className="px-4 py-3 text-right">Gross</th>
                        <th className="px-4 py-3 text-right">Thưởng/PC</th>
                        <th className="px-4 py-3 text-right">Phạt</th>
                        <th className="px-4 py-3 text-right">Khấu trừ</th>
                        <th className="px-4 py-3 text-right">Thực nhận</th>
                        <th className="px-4 py-3 text-left">Trạng thái</th>
                        <th className="px-4 py-3 text-center">Thao tác</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {filteredPayrolls.map((payroll) => (
                      <tr className="hover:bg-[#f8fafc]" key={payroll.id}>
                        {isMine ? (
                          <>
                            <td className="px-4 py-3 font-semibold text-[#243247]">
                              Tháng {payroll.month}/{payroll.year}
                            </td>
                            <td className="px-4 py-3 text-right">{formatMoney(payroll.baseSalary)}</td>
                            <td className="px-4 py-3 text-right">{formatNumber(payroll.standardWorkDays)}</td>
                            <td className="px-4 py-3 text-right">{formatNumber(payroll.actualWorkDays)}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(payroll.actualSalary)}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(payroll.holidayPay)}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(payroll.totalOvertimePay)}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(payroll.totalAllowance)}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(payroll.totalBonus)}</td>
                            <td className="px-4 py-3 text-right text-rose-700">{formatMoney(payroll.totalPenalty)}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(getInsuranceTotal(payroll))}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(payroll.personalIncomeTax)}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(payroll.grossSalary)}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(payroll.totalDeduction)}</td>
                            <td className="px-4 py-3 text-right font-bold text-[#243247]">{formatMoney(payroll.netSalary)}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(payroll.paidAmount)}</td>
                            <td className="px-4 py-3 text-right">{formatMoney(getRemainingAmount(payroll))}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={payroll.status} />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-[#243247]">
                                {payroll.employee?.name ?? "-"}
                              </div>
                              <div className="text-xs text-[#667085]">
                                {payroll.employee?.employeeId ?? "-"} ·{" "}
                                {payroll.employee?.department?.name ?? "-"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[#344054]">
                              {payroll.month}/{payroll.year}
                            </td>
                            <td className="px-4 py-3 text-right text-[#344054]">
                              {formatNumber(payroll.actualWorkDays)}/
                              {formatNumber(payroll.standardWorkDays)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-[#344054]">
                              {formatMoney(payroll.grossSalary)}
                            </td>
                            <td className="px-4 py-3 text-right text-emerald-700">
                              {formatMoney(
                                toNumber(payroll.totalAllowance) +
                                  toNumber(payroll.totalBonus),
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-rose-700">
                              {formatMoney(payroll.totalPenalty)}
                            </td>
                            <td className="px-4 py-3 text-right text-[#344054]">
                              {formatMoney(payroll.totalDeduction)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-[#243247]">
                              {formatMoney(payroll.netSalary)}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={payroll.status} />
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff] text-[#006fd5] hover:bg-[#006fd5] hover:text-white!"
                              title="Xem chi tiết"
                              type="button"
                              onClick={() => void openDetail(payroll.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState text="Không có bảng lương phù hợp." />
            )}
            <div className="border-t border-[#e2e8f0] px-4 py-3 text-sm text-[#667085]">
              Hiển thị {filteredPayrolls.length} bảng lương
            </div>
          </section>
          )}
        </div>
      </main>

      <CreatePayrollModal
        open={createOpen}
        departments={departments}
        positions={positions}
        defaultMonth={selectedPeriodData?.month ?? currentMonth}
        defaultYear={selectedPeriodData?.year ?? currentYear}
        onClose={() => setCreateOpen(false)}
        onSubmit={submitCreatePayroll}
      />

      <PayrollDetailModal
        open={detailOpen}
        payroll={detailLoading ? null : selectedDetail}
        onClose={() => setDetailOpen(false)}
        onRequestApproval={requestApproval}
        onApprove={approve}
        onPay={pay}
        canManage={!isMine && canManage}
        canApprove={!isMine && canApprove}
        canPay={!isMine && canPay}
      />
    </AppLayout>
  );
}
