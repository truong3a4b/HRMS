import { Modal, Pagination } from "antd";
import { ArrowLeft, BadgeCheck, Banknote, Calculator, Coins, CreditCard, Eye, FilePlus2, RefreshCcw, Search, Send, Trash2, WalletCards, XCircle } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { paths } from "../../../app/router/paths";
import { AppLayout } from "../../../app/layouts";
import { useAuth } from "../../auth/services/useAuth";
import { employeeService } from "../../employees/services/employeeService";
import type { Employee, EmployeeOption } from "../../employees/types/employee.types";
import type { ApprovalMode } from "../../requests/types/request.types";
import { payrollService } from "../services/payrollService";
import type { PayrollPaymentMode, PayrollPeriodOverview, PayrollSummary } from "../types/payroll.types";
import { MultiSelectDropdown, SelectedTags } from "../../../shared/ui/MultiSelectDropdown";

const statusLabel: Record<string, string> = {
  DRAFT: "Nháp",
  WAITING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  PARTIALLY_PAID: "Trả một phần",
  PAID: "Đã trả",
  CANCELLED: "Đã hủy",
};

const statusClass: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  WAITING_APPROVAL: "bg-amber-50 text-amber-700",
  APPROVED: "bg-blue-50 text-blue-700",
  PARTIALLY_PAID: "bg-cyan-50 text-cyan-700",
  PAID: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";
const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

function formatNumber(value?: string | number | null) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

function todayInputValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function getInsuranceTotal(payroll: {
  socialInsurance?: string | number | null;
  healthInsurance?: string | number | null;
  unemploymentInsurance?: string | number | null;
}) {
  return (
    toNumber(payroll.socialInsurance) +
    toNumber(payroll.healthInsurance) +
    toNumber(payroll.unemploymentInsurance)
  );
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

function PayrollApprovalRequestModal({
  open,
  overview,
  employees,
  currentUserId,
  onClose,
  onSubmit,
}: {
  open: boolean;
  overview: PayrollPeriodOverview | null;
  employees: Employee[];
  currentUserId?: string;
  onClose: () => void;
  onSubmit: (payload: {
    title?: string;
    description?: string;
    approvalMode: ApprovalMode;
    approverIds: string[];
    watcherIds: string[];
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>("PARALLEL");
  const [approverIds, setApproverIds] = useState<string[]>([]);
  const [watcherIds, setWatcherIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userOptions = useMemo(
    () =>
      employees
        .map((employee) => ({
          id: employee.user?.id,
          label: `${employee.employeeId} - ${employee.name} - ${employee.email}`,
        }))
        .filter((option): option is { id: string; label: string } =>
          Boolean(option.id && option.id !== currentUserId),
        ),
    [employees, currentUserId],
  );

  useEffect(() => {
    if (!open || !overview) return;
    setTitle(
      overview.period.name ||
        `Duyệt kỳ lương tháng ${overview.month}/${overview.year}`,
    );
    setDescription(overview.period.note ?? "");
    setApprovalMode("PARALLEL");
    setApproverIds([]);
    setWatcherIds([]);
    setErrorMessage(null);
  }, [open, overview]);


  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (approverIds.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất một người duyệt.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        approvalMode,
        approverIds,
        watcherIds,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể gửi yêu cầu duyệt kỳ lương."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      destroyOnClose
      title={
        <h2 className="text-xl font-bold tracking-tight text-[#243247]">
          Gửi yêu cầu duyệt kỳ lương
        </h2>
      }
    >
      <form onSubmit={submit} className="mt-4 flex flex-col h-[70vh]">
        {errorMessage ? (
          <div className="shrink-0 mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto pr-3 flex flex-col gap-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d0d5dd] hover:[&::-webkit-scrollbar-thumb]:bg-[#98a2b3]">
          <label>
            <span className={labelClass}>Tiêu đề <span className="text-[#f04438]">*</span></span>
            <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            <span className={labelClass}>Mô tả</span>
            <textarea className={fieldClass} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label>
            <span className={labelClass}>Cách duyệt</span>
            <select className={fieldClass} value={approvalMode} onChange={(event) => setApprovalMode(event.target.value as ApprovalMode)}>
              <option value="PARALLEL">Duyệt song song</option>
              <option value="SEQUENTIAL">Duyệt tuần tự</option>
            </select>
          </label>
          <div>
            <MultiSelectDropdown
              label="Người duyệt *"
              placeholder="Chọn người duyệt..."
              options={userOptions}
              selected={approverIds}
              onChange={setApproverIds}
            />
            {approverIds.length > 0 && (
              <div className="mt-2 min-w-0 max-w-full">
                <SelectedTags
                  ids={approverIds}
                  options={userOptions}
                  onRemove={(id) =>
                    setApproverIds((cur) => cur.filter((v) => v !== id))
                  }
                />
              </div>
            )}
          </div>
          <div>
            <MultiSelectDropdown
              label="Người theo dõi"
              placeholder="Chọn người theo dõi..."
              options={userOptions}
              selected={watcherIds}
              onChange={setWatcherIds}
            />
            {watcherIds.length > 0 && (
              <div className="mt-2 min-w-0 max-w-full">
                <SelectedTags
                  ids={watcherIds}
                  options={userOptions}
                  onRemove={(id) =>
                    setWatcherIds((cur) => cur.filter((v) => v !== id))
                  }
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex shrink-0 items-center justify-end gap-3 border-t border-[#e2e8f0] pt-4">
          <button className="rounded-xl border border-[#d0d5dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] shadow-sm transition-all hover:bg-[#f9fafb] hover:text-[#101828]" type="button" onClick={onClose} disabled={submitting}>
            Đóng
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#006fd5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0055a8] active:scale-95 disabled:opacity-60" type="submit" disabled={submitting || !title.trim()}>
            <Send className="h-4.5 w-4.5" />
            {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddPayrollsModal({
  open,
  title,
  submitText,
  submittingText,
  errorFallback,
  departments,
  positions,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  submitText: string;
  submittingText: string;
  errorFallback: string;
  departments: EmployeeOption[];
  positions: EmployeeOption[];
  onClose: () => void;
  onSubmit: (payload: { departmentIds: string[]; positionIds: string[] }) => Promise<void>;
}) {
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [positionIds, setPositionIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDepartmentIds(departments.map((item) => item.id));
    setPositionIds(positions.map((item) => item.id));
    setErrorMessage(null);
  }, [departments, open, positions]);

  const toggle = (list: string[], value: string, setter: (next: string[]) => void) =>
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!departmentIds.length || !positionIds.length) {
      setErrorMessage("Vui lòng chọn bộ phận và chức vụ.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit({ departmentIds, positionIds });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, errorFallback));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={title} onCancel={onClose} footer={null} width={760} centered>
      <form className="grid gap-4" onSubmit={submit}>
        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
          <section>
            <div className="mb-2 text-sm font-semibold text-[#243247]">Bộ phận</div>
            <div className="grid max-h-52 gap-2 overflow-auto rounded-lg border border-[#e2e8f0] p-3">
              {departments.map((department) => (
                <label className="flex items-center gap-2 text-sm" key={department.id}>
                  <input checked={departmentIds.includes(department.id)} type="checkbox" onChange={() => toggle(departmentIds, department.id, setDepartmentIds)} />
                  {department.name}
                </label>
              ))}
            </div>
          </section>
          <section>
            <div className="mb-2 text-sm font-semibold text-[#243247]">Chức vụ</div>
            <div className="grid max-h-52 gap-2 overflow-auto rounded-lg border border-[#e2e8f0] p-3">
              {positions.map((position) => (
                <label className="flex items-center gap-2 text-sm" key={position.id}>
                  <input checked={positionIds.includes(position.id)} type="checkbox" onChange={() => toggle(positionIds, position.id, setPositionIds)} />
                  {position.name}
                </label>
              ))}
            </div>
          </section>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-semibold" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white!" disabled={submitting} type="submit">
            {submitting ? submittingText : submitText}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddSinglePayrollModal({
  open,
  employees,
  existingEmployeeIds,
  onClose,
  onSubmit,
}: {
  open: boolean;
  employees: Employee[];
  existingEmployeeIds: Set<string>;
  onClose: () => void;
  onSubmit: (employeeId: string) => Promise<void>;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEmployeeId("");
    setErrorMessage(null);
  }, [open]);

  const availableEmployees = employees.filter(
    (employee) => !existingEmployeeIds.has(employee.id),
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!employeeId) {
      setErrorMessage("Vui lòng chọn nhân viên.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit(employeeId);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể thêm nhân viên vào kỳ lương."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Thêm nhân viên vào kỳ lương" onCancel={onClose} footer={null} width={560} centered>
      <form className="grid gap-4" onSubmit={submit}>
        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}
        <label>
          <span className="mb-1.5 block text-sm font-medium text-[#344054]">Nhân viên</span>
          <select className="w-full rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
            <option value="">Chọn nhân viên</option>
            {availableEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} - {employee.employeeId}
                {employee.department?.name ? ` - ${employee.department.name}` : ""}
              </option>
            ))}
          </select>
        </label>
        {!availableEmployees.length ? <div className="text-sm text-[#667085]">Không còn nhân viên phù hợp để thêm.</div> : null}
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-semibold" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white!" disabled={submitting || !availableEmployees.length} type="submit">
            {submitting ? "Đang thêm..." : "Thêm nhân viên"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PayrollPaymentModal({
  open,
  overview,
  payrolls,
  initialEmployeeIds,
  onClose,
  onSubmit,
}: {
  open: boolean;
  overview: PayrollPeriodOverview | null;
  payrolls: PayrollSummary[];
  initialEmployeeIds: string[];
  onClose: () => void;
  onSubmit: (payload: {
    employeeIds: string[];
    mode: PayrollPaymentMode;
    amount?: string;
    percent?: string;
    paymentDate: string;
    note?: string | null;
  }) => Promise<void>;
}) {
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [mode, setMode] = useState<PayrollPaymentMode>("REMAINING");
  const [amount, setAmount] = useState("");
  const [percent, setPercent] = useState("100");
  const [paymentDate, setPaymentDate] = useState(todayInputValue());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEmployeeIds(initialEmployeeIds);
    setMode("REMAINING");
    setAmount("");
    setPercent("100");
    setPaymentDate(todayInputValue());
    setNote("");
    setErrorMessage(null);
  }, [initialEmployeeIds, open]);

  const selectedPayrolls = payrolls.filter((payroll) =>
    employeeIds.includes(payroll.employeeId),
  );
  const selectedRemaining = selectedPayrolls.reduce(
    (total, payroll) =>
      total +
      Math.max(
        toNumber(payroll.remainingAmount) ||
          toNumber(payroll.netSalary) - toNumber(payroll.paidAmount),
        0,
      ),
    0,
  );
  const allSelected = payrolls.length > 0 && employeeIds.length === payrolls.length;

  const toggleEmployee = (employeeId: string) => {
    setEmployeeIds((current) =>
      current.includes(employeeId)
        ? current.filter((value) => value !== employeeId)
        : [...current, employeeId],
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!overview) return;
    const normalizedAmount = amount.replace(/[^\d]/g, "");
    const normalizedPercent = percent.replace(",", ".");
    if (employeeIds.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất một nhân viên để chi trả.");
      return;
    }
    if (mode === "AMOUNT" && toNumber(normalizedAmount) <= 0) {
      setErrorMessage("Vui lòng nhập số tiền chi trả lớn hơn 0.");
      return;
    }
    if (mode === "PERCENT" && (toNumber(normalizedPercent) <= 0 || toNumber(normalizedPercent) > 100)) {
      setErrorMessage("Tỷ lệ chi trả phải nằm trong khoảng 1-100%.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit({
        employeeIds,
        mode,
        amount: mode === "AMOUNT" ? String(toNumber(normalizedAmount)) : undefined,
        percent: mode === "PERCENT" ? String(toNumber(normalizedPercent)) : undefined,
        paymentDate,
        note: note.trim() || null,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tạo đợt chi trả lương."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Chi trả lương" onCancel={onClose} footer={null} width={820} centered>
      <form className="grid gap-4" onSubmit={submit}>
        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
          <label>
            <span className={labelClass}>Phương thức trả</span>
            <select className={fieldClass} value={mode} onChange={(event) => setMode(event.target.value as PayrollPaymentMode)}>
              <option value="REMAINING">Trả toàn bộ còn lại</option>
              <option value="AMOUNT">Trả số tiền cố định</option>
              <option value="PERCENT">Trả theo tỷ lệ</option>
            </select>
          </label>
          {mode === "AMOUNT" ? (
            <label>
              <span className={labelClass}>Số tiền mỗi nhân viên</span>
              <input className={fieldClass} inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="VD: 5000000" />
            </label>
          ) : null}
          {mode === "PERCENT" ? (
            <label>
              <span className={labelClass}>Tỷ lệ trả (%)</span>
              <input className={fieldClass} inputMode="decimal" value={percent} onChange={(event) => setPercent(event.target.value)} placeholder="VD: 50" />
            </label>
          ) : null}
          <label>
            <span className={labelClass}>Ngày chi trả</span>
            <input className={fieldClass} type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
          </label>
        </div>

        <label>
          <span className={labelClass}>Ghi chú</span>
          <textarea className={fieldClass} rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Nội dung chuyển khoản, ghi chú đợt trả..." />
        </label>

        <section className="rounded-lg border border-[#e2e8f0]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#344054]">
              <input checked={allSelected} type="checkbox" onChange={(event) => setEmployeeIds(event.target.checked ? payrolls.map((payroll) => payroll.employeeId) : [])} />
              Chọn tất cả nhân viên còn lương
            </label>
            <div className="text-sm font-semibold text-[#1e293b]">
              Đã chọn {employeeIds.length}/{payrolls.length} · Còn phải trả {formatMoney(selectedRemaining)} ₫
            </div>
          </div>
          <div className="max-h-72 overflow-auto">
            {payrolls.length ? (
              payrolls.map((payroll) => {
                const remaining =
                  toNumber(payroll.remainingAmount) ||
                  Math.max(toNumber(payroll.netSalary) - toNumber(payroll.paidAmount), 0);

                return (
                  <label className="flex items-center justify-between gap-3 border-b border-[#f1f5f9] px-4 py-3 text-sm last:border-b-0" key={payroll.id}>
                    <span className="flex min-w-0 items-center gap-3">
                      <input checked={employeeIds.includes(payroll.employeeId)} type="checkbox" onChange={() => toggleEmployee(payroll.employeeId)} />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-[#1e293b]">{payroll.employee?.name ?? "-"}</span>
                        <span className="block text-xs text-[#64748b]">{payroll.employee?.employeeId ?? "-"}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-bold text-[#006fd5]">{formatMoney(remaining)} ₫</span>
                      <span className="text-xs text-[#64748b]">đã trả {formatMoney(payroll.paidAmount)} ₫</span>
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-[#667085]">
                Không có bảng lương nào đủ điều kiện chi trả.
              </div>
            )}
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-semibold" type="button" onClick={onClose}>
            Đóng
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white!" disabled={submitting || !payrolls.length} type="submit">
            <CreditCard className="h-4 w-4" />
            {submitting ? "Đang chi trả..." : "Tạo đợt chi trả"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function PayrollPeriodOverviewPage() {
  const { periodId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const permissions = user?.permissions ?? [];
  const canManage = isAdmin || permissions.includes("PAYROLL_MANAGE");
  const canApprove = isAdmin || permissions.includes("PAYROLL_APPROVE");
  const canPay = isAdmin || permissions.includes("PAYROLL_PAY");
  const [overview, setOverview] = useState<PayrollPeriodOverview | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<EmployeeOption[]>([]);
  const [positions, setPositions] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculateOpen, setRecalculateOpen] = useState(false);
  const [singleAddOpen, setSingleAddOpen] = useState(false);
  const [approvalRequestOpen, setApprovalRequestOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentEmployeeIds, setPaymentEmployeeIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const canEditPeriod = overview?.period.status === "DRAFT" || overview?.period.status === "CANCELLED";
  const payrollModalMode = recalculateOpen ? "recalculate" : null;
  const setPayrollModalMode = (mode: "recalculate" | null) => setRecalculateOpen(mode === "recalculate");

  const loadData = async () => {
    if (!periodId) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      setOverview(await payrollService.getPeriodOverview(periodId));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không tải được kỳ lương."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [periodId]);

  useEffect(() => {
    if (!canManage) return;
    void employeeService
      .getEmployees({ page: 1, limit: -1, search: "" })
      .then((employeeResult) => {
        setEmployees(employeeResult?.items ?? []);
      })
      .catch(() => {
        setEmployees([]);
      });

    void Promise.all([
      employeeService.getDepartments(),
      employeeService.getPositions(),
    ])
      .then(([departmentResult, positionResult]) => {
        setDepartments(departmentResult);
        setPositions(positionResult);
      })
      .catch(() => {
        setDepartments([]);
        setPositions([]);
      });
  }, [canManage]);

  const filteredPayrolls = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!overview || !keyword) return overview?.payrolls ?? [];
    return overview.payrolls.filter((payroll) =>
      [
        payroll.employee?.name,
        payroll.employee?.employeeId,
        payroll.employee?.department?.name,
        payroll.employee?.position?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [overview, searchTerm]);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const pagedPayrolls = filteredPayrolls.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const visibleStart = filteredPayrolls.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const visibleEnd = Math.min(currentPage * pageSize, filteredPayrolls.length);

  const existingPayrollEmployeeIds = useMemo(
    () => new Set((overview?.payrolls ?? []).map((payroll) => payroll.employeeId)),
    [overview?.payrolls],
  );

  const payablePayrolls = useMemo(
    () =>
      (overview?.payrolls ?? []).filter(
        (payroll) =>
          (payroll.status === "APPROVED" || payroll.status === "PARTIALLY_PAID") &&
          Math.max(
            toNumber(payroll.remainingAmount) ||
              toNumber(payroll.netSalary) - toNumber(payroll.paidAmount),
            0,
          ) > 0,
      ),
    [overview?.payrolls],
  );

  const openPaymentModal = (employeeIds?: string[]) => {
    setPaymentEmployeeIds(employeeIds?.length ? employeeIds : payablePayrolls.map((payroll) => payroll.employeeId));
    setPaymentOpen(true);
  };

  const requestPeriodApproval = async (payload: {
    title?: string;
    description?: string;
    approvalMode: ApprovalMode;
    approverIds: string[];
    watcherIds: string[];
  }) => {
    if (!overview) return;
    try {
      const next = await payrollService.requestPeriodApproval(
        overview.period.id,
        payload,
      );
      setOverview(next);
      setApprovalRequestOpen(false);
      Modal.success({
        title: "Đã gửi yêu cầu duyệt kỳ lương",
        content: "Người duyệt sẽ xử lý trong mục yêu cầu chờ duyệt.",
      });
    } catch (error) {
      Modal.error({
        title: "Không thể gửi yêu cầu duyệt",
        content: getErrorMessage(error, "Thao tác thất bại."),
      });
    }
  };

  const createPayrollsForPeriod = async (payload: { departmentIds: string[]; positionIds: string[] }) => {
    if (!overview) return;

    try {
      const result = await payrollService.createByTargets({
        periodId: overview.period.id,
        departmentIds: payload.departmentIds,
        positionIds: payload.positionIds,
      });
      setOverview(await payrollService.getPeriodOverview(overview.period.id));
      setRecalculateOpen(false);
      Modal.success({
        title: "Đã tính lại kỳ lương",
        content: `Đã thêm ${result.createdCount} bảng lương mới và cập nhật ${result.updatedCount ?? 0} bảng lương đã có.`,
      });
    } catch (error) {
      Modal.error({
        title: "Không thể tính lại kỳ lương",
        content: getErrorMessage(error, "Thao tác thất bại."),
      });
    }
  };

  const addPayrollsToPeriod = async (payload: { departmentIds: string[]; positionIds: string[] }) => {
    if (!overview) return;

    const created = await payrollService.createByTargets({
      periodId: overview.period.id,
      departmentIds: payload.departmentIds,
      positionIds: payload.positionIds,
    });
    setOverview(await payrollService.getPeriodOverview(overview.period.id));
    setPayrollModalMode(null);
    Modal.success({
      title: "Đã cập nhật kỳ lương",
      content: `Đã thêm ${created.createdCount} bảng lương mới và cập nhật ${created.updatedCount ?? 0} bảng lương đã có.`,
    });
  };

  const addSingleEmployeeToPeriod = async (employeeId: string) => {
    if (!overview) return;

    await payrollService.create({
      periodId: overview.period.id,
      employeeId,
    });
    setOverview(await payrollService.getPeriodOverview(overview.period.id));
    setSingleAddOpen(false);
    Modal.success({
      title: "Đã thêm nhân viên",
      content: "Bảng lương của nhân viên đã được thêm vào kỳ.",
    });
  };

  const removeEmployeeFromPeriod = (employeeId: string, employeeName?: string) => {
    if (!overview) return;

    Modal.confirm({
      title: "Xóa nhân viên khỏi kỳ lương?",
      content: `Bảng lương của ${employeeName || "nhân viên này"} sẽ bị xóa khỏi kỳ.`,
      okText: "Xóa",
      cancelText: "Đóng",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setOverview(
            await payrollService.removeEmployeeFromPeriod(
              overview.period.id,
              employeeId,
            ),
          );
        } catch (error) {
          Modal.error({
            title: "Không thể xóa nhân viên",
            content: getErrorMessage(error, "Thao tác thất bại."),
          });
        }
      },
    });
  };

  const cancelPeriod = () => {
    if (!overview) return;

    Modal.confirm({
      title: "Hủy kỳ lương đã duyệt?",
      content: "Kỳ lương sẽ chuyển sang trạng thái đã hủy. Khi tính lại, kỳ lương sẽ quay về nháp.",
      okText: "Hủy kỳ lương",
      cancelText: "Đóng",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setOverview(await payrollService.cancelPeriod(overview.period.id));
        } catch (error) {
          Modal.error({
            title: "Không thể hủy kỳ lương",
            content: getErrorMessage(error, "Thao tác thất bại."),
          });
        }
      },
    });
  };

  const createPaymentBatch = async (payload: {
    employeeIds: string[];
    mode: PayrollPaymentMode;
    amount?: string;
    percent?: string;
    paymentDate: string;
    note?: string | null;
  }) => {
    if (!overview) return;

    const batch = await payrollService.createPaymentBatch({
      periodId: overview.period.id,
      ...payload,
    });
    setOverview(await payrollService.getPeriodOverview(overview.period.id));
    setPaymentOpen(false);
    Modal.success({
      title: "Đã tạo đợt chi trả lương",
      content: `Đã chi trả ${formatMoney(batch?.totalAmount)} ₫ cho ${batch?.payments?.length ?? payload.employeeIds.length} nhân viên.`,
    });
  };

  return (
    <AppLayout>
      <main className="h-full overflow-y-auto bg-[#f1f5f9]">
        <div className="grid gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-full border border-[#e2e8f0] bg-white text-[#64748b] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#f8fafc] hover:text-[#006fd5] hover:shadow-md active:scale-95" type="button" title="Quay lại" onClick={() => navigate(paths.payrollManagement)}>
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-[#1e293b]">
                  {overview?.period.name || "Tổng quan kỳ lương"}
                </h1>
                <p className="text-sm font-medium text-[#64748b]">
                  {overview ? `Tháng ${overview.month}/${overview.year}` : "Đang tải dữ liệu..."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button className="grid h-10 w-10 place-items-center rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#f8fafc] hover:text-[#006fd5] hover:shadow-md active:scale-95" type="button" title="Tải lại" onClick={() => void loadData()}>
                <RefreshCcw className="h-4.5 w-4.5" />
              </button>
              {canEditPeriod && canManage ? (
                <>
                  <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 text-sm font-semibold text-[#475569] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#f8fafc] hover:shadow-md active:scale-95" type="button" onClick={() => setSingleAddOpen(true)}>
                    <FilePlus2 className="h-4 w-4 text-[#006fd5]" />
                    Thêm nhân viên
                  </button>
                  <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 text-sm font-semibold text-[#475569] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#f8fafc] hover:shadow-md active:scale-95" type="button" onClick={() => setPayrollModalMode("recalculate")}>
                    <Calculator className="h-4 w-4 text-[#006fd5]" />
                    Tính lại
                  </button>
                  {overview?.period.status === "DRAFT" ? (
                    <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:from-amber-600 hover:to-amber-700 hover:shadow-lg active:scale-95" type="button" onClick={() => setApprovalRequestOpen(true)}>
                      <Send className="h-4 w-4" />
                      Gửi duyệt
                    </button>
                  ) : null}
                </>
              ) : null}
              {overview?.period.status === "APPROVED" && canApprove ? (
                <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-md active:scale-95" type="button" onClick={cancelPeriod}>
                  <XCircle className="h-4 w-4" />
                  Hủy kỳ lương
                </button>
              ) : null}
              {overview?.period.status === "APPROVED" && canPay ? (
                <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={!payablePayrolls.length} onClick={() => openPaymentModal()}>
                  <CreditCard className="h-4 w-4" />
                  Chi trả lương
                </button>
              ) : null}
            </div>
          </div>

          {errorMessage ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

          {overview ? (
            <>
              <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[620px]:grid-cols-1">
                {[
                  { label: "Tổng nhân sự", value: overview.totalEmployees.toLocaleString("vi-VN"), icon: BadgeCheck, color: "blue" },
                  { label: "Thực nhận", value: formatMoney(overview.summary.netSalary), icon: WalletCards, color: "emerald" },
                  { label: "Đã trả", value: formatMoney(overview.summary.paidAmount), icon: Banknote, color: "emerald" },
                  { label: "Còn phải trả", value: formatMoney(overview.summary.remainingAmount), icon: Coins, color: "amber" },
                ].map((item) => {
                  const Icon = item.icon;
                  const colorClasses = {
                    blue: "bg-[#f0f7ff] text-[#006fd5] border-[#006fd5]/10",
                    emerald: "bg-emerald-50 text-emerald-600 border-emerald-600/10",
                    amber: "bg-amber-50 text-amber-600 border-amber-600/10",
                  }[item.color as "blue" | "emerald" | "amber"];

                  return (
                    <div className="group relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-0.5" key={item.label}>
                      <div className="flex items-center justify-between gap-3 relative">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#64748b]">{item.label}</div>
                          <div className="mt-1.5 flex items-baseline text-2xl font-extrabold tracking-tight text-[#1e293b]">
                            {item.value}
                            {item.label !== "Tổng nhân sự" && <span className="ml-1 text-base font-semibold text-[#94a3b8]">₫</span>}
                          </div>
                        </div>
                        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${colorClasses} transition-transform group-hover:scale-110`}>
                          <Icon className="h-6 w-6" />
                        </span>
                      </div>
                      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40 ${item.color === "blue" ? "bg-[#006fd5]" : item.color === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="relative min-w-[320px] flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#94a3b8]" />
                  <input className="w-full rounded-full border border-[#e2e8f0] bg-[#f8fafc] py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#006fd5] focus:bg-white focus:ring-2 focus:ring-[#006fd5]/10" placeholder="Tìm kiếm theo mã, tên NV, phòng ban..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                </div>
              </div>

              <section className="relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1800px] text-sm">
                    <thead className="bg-[#f8fafc] text-xs uppercase tracking-wider text-[#64748b]">
                      <tr>
                        <th className="sticky left-0 z-10 bg-[#f8fafc] px-4 py-3.5 text-left font-bold shadow-[1px_0_0_0_#e2e8f0]">Nhân viên</th>
                        <th className="px-4 py-3.5 text-left font-semibold">Phòng ban</th>
                        <th className="px-4 py-3.5 text-left font-semibold">Chức vụ</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Lương cơ bản</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Công (Thực tế/Chuẩn)</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Lương thực tế</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Lương nghỉ lễ</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Tăng ca</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Phụ cấp</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Thưởng</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Phạt</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Bảo hiểm</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Thuế</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Gross</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Khấu trừ</th>
                        <th className="px-4 py-3.5 text-right font-bold text-[#1e293b]">Thực nhận</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Đã trả</th>
                        <th className="px-4 py-3.5 text-right font-semibold">Còn lại</th>
                        <th className="px-4 py-3.5 text-left font-semibold">Trạng thái</th>
                        <th className="sticky right-0 z-10 bg-[#f8fafc] px-4 py-3.5 text-center font-bold shadow-[-1px_0_0_0_#e2e8f0]">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {pagedPayrolls.map((payroll) => (
                        <tr className="group transition-colors hover:bg-[#f8fafc]" key={payroll.id}>
                          <td className="sticky left-0 z-10 bg-white px-4 py-3 shadow-[1px_0_0_0_#e2e8f0] transition-colors group-hover:bg-[#f8fafc]">
                            <div className="font-bold text-[#1e293b]">{payroll.employee?.name ?? "-"}</div>
                            <div className="text-xs font-medium text-[#64748b]">{payroll.employee?.employeeId ?? "-"}</div>
                          </td>
                          <td className="px-4 py-3 font-medium text-[#475569]">{payroll.employee?.department?.name ?? "-"}</td>
                          <td className="px-4 py-3 font-medium text-[#475569]">{payroll.employee?.position?.name ?? "-"}</td>
                          <td className="px-4 py-3 text-right font-medium text-[#475569]">{formatMoney(payroll.baseSalary)}</td>
                          <td className="px-4 py-3 text-right font-medium text-[#475569]">
                            <span className="text-[#1e293b] font-bold">{formatNumber(payroll.actualWorkDays)}</span> / {formatNumber(payroll.standardWorkDays)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-[#1e293b]">{formatMoney(payroll.actualSalary)}</td>
                          <td className="px-4 py-3 text-right font-medium text-[#0ea5e9]">{formatMoney(payroll.holidayPay)}</td>
                          <td className="px-4 py-3 text-right font-medium text-[#0ea5e9]">{formatMoney(payroll.totalOvertimePay)}</td>
                          <td className="px-4 py-3 text-right font-medium text-[#10b981]">{formatMoney(payroll.totalAllowance)}</td>
                          <td className="px-4 py-3 text-right font-medium text-[#10b981]">{formatMoney(payroll.totalBonus)}</td>
                          <td className="px-4 py-3 text-right font-medium text-[#ef4444]">{formatMoney(payroll.totalPenalty)}</td>
                          <td className="px-4 py-3 text-right font-medium text-[#475569]">{formatMoney(getInsuranceTotal(payroll))}</td>
                          <td className="px-4 py-3 text-right font-medium text-[#f59e0b]">{formatMoney(payroll.personalIncomeTax)}</td>
                          <td className="px-4 py-3 text-right font-bold text-[#1e293b]">{formatMoney(payroll.grossSalary)}</td>
                          <td className="px-4 py-3 text-right font-medium text-[#ef4444]">{formatMoney(payroll.totalDeduction)}</td>
                          <td className="px-4 py-3 text-right font-extrabold text-[#006fd5]">{formatMoney(payroll.netSalary)}</td>
                          <td className="px-4 py-3 text-right font-bold text-[#10b981]">{formatMoney(payroll.paidAmount)}</td>
                          <td className="px-4 py-3 text-right font-bold text-[#f59e0b]">{formatMoney(payroll.remainingAmount)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[payroll.status] ?? statusClass.DRAFT}`}>
                              {statusLabel[payroll.status] ?? payroll.status}
                            </span>
                          </td>
                          <td className="sticky right-0 z-10 bg-white px-4 py-3 shadow-[-1px_0_0_0_#e2e8f0] transition-colors group-hover:bg-[#f8fafc]">
                            <div className="flex justify-center gap-2">
                              <button className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff] text-[#006fd5] transition-all hover:-translate-y-0.5 hover:bg-[#006fd5] hover:text-white hover:shadow-md active:scale-95" type="button" title="Xem chi tiết" onClick={() => navigate(paths.payrollEmployeeDetail(overview.period.id, payroll.employeeId))}>
                                <Eye className="h-4 w-4" />
                              </button>
                              {canPay &&
                              overview.period.status === "APPROVED" &&
                              (payroll.status === "APPROVED" || payroll.status === "PARTIALLY_PAID") &&
                              Math.max(
                                toNumber(payroll.remainingAmount) ||
                                  toNumber(payroll.netSalary) - toNumber(payroll.paidAmount),
                                0,
                              ) > 0 ? (
                                <button className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:text-white hover:shadow-md active:scale-95" type="button" title="Chi trả lương" onClick={() => openPaymentModal([payroll.employeeId])}>
                                  <CreditCard className="h-4 w-4" />
                                </button>
                              ) : null}
                              {canEditPeriod && canManage ? (
                                <button className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-600 transition-all hover:-translate-y-0.5 hover:bg-rose-600 hover:text-white hover:shadow-md active:scale-95" type="button" title="Xóa khỏi kỳ" onClick={() => removeEmployeeFromPeriod(payroll.employeeId, payroll.employee?.name)}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] bg-[#f8fafc] px-5 py-3">
                  <span className="text-sm text-[#64748b]">
                    Hiển thị{" "}
                    <strong className="text-[#1e293b]">
                      {filteredPayrolls.length === 0 ? 0 : visibleStart}–{visibleEnd}
                    </strong>{" "}
                    / <strong className="text-[#1e293b]">{filteredPayrolls.length}</strong> bảng lương
                  </span>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredPayrolls.length}
                    showSizeChanger
                    pageSizeOptions={[10, 20, 50, 100]}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                    }}
                  />
                </div>
              </section>
            </>
          ) : loading ? (
            <div className="grid min-h-56 place-items-center text-sm text-[#667085]">Đang tải kỳ lương...</div>
          ) : null}
        </div>
      </main>
      <AddSinglePayrollModal
        open={singleAddOpen}
        employees={employees}
        existingEmployeeIds={existingPayrollEmployeeIds}
        onClose={() => setSingleAddOpen(false)}
        onSubmit={addSingleEmployeeToPeriod}
      />
      <PayrollApprovalRequestModal
        open={approvalRequestOpen}
        overview={overview}
        employees={employees}
        currentUserId={user?.id}
        onClose={() => setApprovalRequestOpen(false)}
        onSubmit={requestPeriodApproval}
      />
      <AddPayrollsModal
        open={payrollModalMode !== null}
        title={payrollModalMode === "recalculate" ? "Tính lại kỳ lương" : "Thêm nhân viên vào kỳ lương"}
        submitText={payrollModalMode === "recalculate" ? "Tính lại" : "Thêm và tính lại"}
        submittingText={payrollModalMode === "recalculate" ? "Đang tính..." : "Đang thêm..."}
        errorFallback={payrollModalMode === "recalculate" ? "Không thể tính lại kỳ lương." : "Không thể thêm nhân viên vào kỳ lương."}
        departments={departments}
        positions={positions}
        onClose={() => setPayrollModalMode(null)}
        onSubmit={payrollModalMode === "recalculate" ? createPayrollsForPeriod : addPayrollsToPeriod}
      />
      <PayrollPaymentModal
        open={paymentOpen}
        overview={overview}
        payrolls={payablePayrolls}
        initialEmployeeIds={paymentEmployeeIds}
        onClose={() => setPaymentOpen(false)}
        onSubmit={createPaymentBatch}
      />
    </AppLayout>
  );
}
