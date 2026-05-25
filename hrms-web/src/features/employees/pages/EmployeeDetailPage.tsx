import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Badge,
  BriefcaseBusiness,
  CalendarDays,
  Edit2,
  Gift,
  Heart,
  Mail,
  Percent,
  Phone,
  ShieldCheck,
  Tag,
  TriangleAlert,
  User,
  WalletCards,
} from "lucide-react";
import { Modal } from "antd";
import { AppLayout } from "../../../app/layouts";
import { paths } from "../../../app/router/paths";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import {
  findProvince,
  findWard,
  getLookupId,
  getWardOptions,
  provinceOptions,
} from "../../../shared/data/addressOptions";
import { employeeService } from "../services/employeeService";
import { EmployeeJobHistoryList } from "../components/EmployeeJobHistoryList";
import { useAuth } from "../../auth/services/useAuth";
import { payrollPolicyService } from "../../payroll-policies/services/payrollPolicyService";
import type {
  AllowancePolicy,
  AttendanceBonusPolicy,
  AutoPenaltyPolicy,
  InsurancePolicy,
  TaxPolicy,
} from "../../payroll-policies/types/payrollPolicy.types";
import type {
  Employee,
  EmployeeJobHistory,
  EmployeeOption,
  EmployeeStatus,
  UpdateEmployeeAdditionalPayload,
  UpdateEmployeeBasicPayload,
  UpdateEmployeeJobPayload,
} from "../types/employee.types";

type DetailRow = {
  label: string;
  value: ReactNode;
};

type PayrollEditType =
  | "insurance"
  | "tax"
  | "attendanceBonus"
  | "allowance"
  | "autoPenalty";

type EmployeeDetailTab = "personal" | "work" | "payroll";

function getDetailTab(value: string | null): EmployeeDetailTab {
  return value === "work" || value === "payroll" ? value : "personal";
}

const statusLabels: Record<EmployeeStatus, string> = {
  WORKING: "Đang làm việc",
  ON_LEAVE: "Đang nghỉ phép",
  RESIGNED: "Đã nghỉ việc",
};

const genderLabels = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
} as const;

const autoPenaltyTypeLabels: Record<string, string> = {
  LATE_EARLY: "Đi muộn/về sớm",
  UNAUTHORIZED_ABSENCE: "Nghỉ không phép",
  UNAUTHORIZED_ABSENCE_PROGRESSIVE: "Nghỉ không phép lũy tiến",
  LATE_EARLY_PROGRESSIVE: "Đi muộn/về sớm lũy tiến",
};

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";

function getErrorMessage(error: unknown) {
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

  return "Không tải được thông tin nhân viên";
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);

  return new Intl.DateTimeFormat("vi-VN").format(date);
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

function formatPercent(value?: string | number | null) {
  if (value == null || value === "") return "-";
  return `${Number(value).toLocaleString("vi-VN")}%`;
}

function formatPolicyPeriod(from?: string | null, to?: string | null) {
  if (!from && !to) return "-";
  return `${formatDate(from)} - ${to ? formatDate(to) : "Không giới hạn"}`;
}

function countWorkDays(hireDate?: string | null) {
  if (!hireDate) return "-";

  const start = new Date(hireDate);
  if (Number.isNaN(start.getTime())) return "-";

  const today = new Date();
  const days = Math.max(
    0,
    Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1,
  );

  return `${days} ngày làm việc`;
}

function display(value?: string | number | null) {
  return value == null || value === "" ? "-" : String(value);
}

function displayImage(url?: string | null, alt = "Image") {
  if (!url) return "-";
  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-1 block w-fit overflow-hidden rounded-lg border border-[#eaecf0] transition-opacity hover:opacity-80 bg-slate-50">
      <img src={url} alt={alt} className="h-20 w-auto object-cover" />
    </a>
  );
}

function lookupName(value?: EmployeeOption | Record<string, unknown> | null) {
  if (!value) return "-";
  if ("name" in value && value.name) return String(value.name);
  return "-";
}

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toLookup(value: EmployeeOption | null) {
  return value ? { id: value.id, name: value.name } : null;
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function hasPermission(
  role: string | undefined,
  permissions: string[] | undefined,
  key: string,
) {
  return role?.toUpperCase() === "ADMIN" || Boolean(permissions?.includes(key));
}

function Card({
  title,
  icon,
  children,
  canEdit,
  onEdit,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  canEdit?: boolean;
  onEdit?: () => void;
}) {
  return (
    <section className="rounded-xl border border-[#d0d5dd] bg-white p-5 shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f5] pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e9f3ff] text-[#006fd5]">
            {icon}
          </span>
          <h2 className="truncate text-lg font-bold text-[#1f2937]">{title}</h2>
        </div>
        {canEdit ? (
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-[#c7dcf2] bg-white px-3 py-2 text-sm font-semibold text-[#006fd5] transition-colors hover:bg-[#f2f8ff]"
            type="button"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4" />
            Chỉnh sửa
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function DetailGrid({ rows }: { rows: DetailRow[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
      {rows.map((row) => (
        <div
          className="min-w-0 rounded-lg border border-[#edf0f5] bg-[#fbfcfe] px-4 py-3"
          key={row.label}
        >
          <span className="block text-xs font-medium uppercase text-[#667085]">
            {row.label}
          </span>
          <span className="mt-1 block min-w-0 break-words text-sm font-semibold text-[#243247]">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function PolicyStatus({ enabled, active }: { enabled: boolean; active?: boolean }) {
  const label = !enabled
    ? "Không áp dụng"
    : active === false
      ? "Tạm dừng"
      : "Đang áp dụng";
  const className = !enabled
    ? "bg-[#f2f4f7] text-[#667085]"
    : active === false
      ? "bg-[#fff6ed] text-[#c4320a]"
      : "bg-[#ecfdf3] text-[#067647]";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>
      {label}
    </span>
  );
}

function PolicyCard({
  title,
  icon,
  children,
  status,
  canEdit,
  onEdit,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  status?: ReactNode;
  canEdit?: boolean;
  onEdit?: () => void;
}) {
  return (
    <article className="rounded-lg border border-[#edf0f5] bg-[#fbfcfe] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <strong className="truncate text-sm text-[#243247]">{title}</strong>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {status}
          {canEdit ? (
            <button
              className="grid h-8 w-8 place-items-center rounded-lg border border-[#c7dcf2] bg-white text-[#006fd5] transition-colors hover:bg-[#f2f8ff]"
              type="button"
              title={`Chỉnh sửa ${title}`}
              onClick={onEdit}
            >
              <Edit2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
      {children}
    </article>
  );
}

function AdditionalInfoModal({
  open,
  employee,
  onClose,
  onSubmit,
}: {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSubmit: (payload: UpdateEmployeeAdditionalPayload) => Promise<void>;
}) {
  const [form, setForm] = useState({
    maritalStatus: "",
    nationality: "",
    religion: "",
    identityCardNumber: "",
    identityCardIssueDate: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !employee) return;

    setForm({
      maritalStatus: employee.maritalStatus ?? "",
      nationality: employee.nationality ?? "",
      religion: employee.religion ?? "",
      identityCardNumber: employee.identityCardNumber ?? "",
      identityCardIssueDate: toDateInput(employee.identityCardIssueDate),
    });
    setError(null);
  }, [employee, open]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        maritalStatus: nullableText(form.maritalStatus),
        nationality: nullableText(form.nationality),
        religion: nullableText(form.religion),
        identityCardNumber: nullableText(form.identityCardNumber),
        identityCardIssueDate: form.identityCardIssueDate || null,
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Chỉnh sửa thông tin thêm"
      onCancel={onClose}
      footer={null}
      centered
      width={620}
    >
      <form className="grid gap-4" onSubmit={submit}>
        {error ? (
          <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">
              Tình trạng hôn nhân
            </span>
            <input
              className={fieldClass}
              value={form.maritalStatus}
              onChange={(event) => update("maritalStatus", event.target.value)}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">
              Quốc tịch
            </span>
            <input
              className={fieldClass}
              value={form.nationality}
              onChange={(event) => update("nationality", event.target.value)}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">
              Tôn giáo
            </span>
            <input
              className={fieldClass}
              value={form.religion}
              onChange={(event) => update("religion", event.target.value)}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">
              Số CCCD/CMND
            </span>
            <input
              className={fieldClass}
              value={form.identityCardNumber}
              onChange={(event) =>
                update("identityCardNumber", event.target.value)
              }
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">
              Ngày cấp CCCD/CMND
            </span>
            <input
              className={fieldClass}
              type="date"
              value={form.identityCardIssueDate}
              onChange={(event) =>
                update("identityCardIssueDate", event.target.value)
              }
            />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button
            className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function BasicContactBankModal({
  open,
  employee,
  onClose,
  onSubmit,
}: {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSubmit: (payload: UpdateEmployeeBasicPayload) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    provinceId: "",
    wardId: "",
    bankAccount: "",
    bankName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const wardOptions = useMemo(
    () => getWardOptions(form.provinceId),
    [form.provinceId],
  );

  useEffect(() => {
    if (!open || !employee) return;

    const provinceId = getLookupId(employee.province);
    setForm({
      name: employee.name,
      phone: employee.phone ?? "",
      dateOfBirth: toDateInput(employee.dateOfBirth),
      gender: employee.gender ?? "",
      address: employee.address ?? "",
      provinceId,
      wardId: getLookupId(employee.ward),
      bankAccount: employee.bankAccount ?? "",
      bankName: lookupName(employee.bank) === "-" ? "" : lookupName(employee.bank),
    });
    setError(null);
  }, [employee, open]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "provinceId" ? { wardId: "" } : {}),
    }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Vui lòng nhập họ tên.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const bank = form.bankName.trim()
        ? { id: form.bankName.trim(), name: form.bankName.trim() }
        : null;
      await onSubmit({
        name: form.name.trim(),
        phone: nullableText(form.phone),
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender
          ? (form.gender as UpdateEmployeeBasicPayload["gender"])
          : null,
        address: nullableText(form.address),
        province: toLookup(findProvince(form.provinceId)),
        ward: toLookup(findWard(form.provinceId, form.wardId)),
        bankAccount: nullableText(form.bankAccount),
        bank,
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Chỉnh sửa thông tin cá nhân, liên hệ và ngân hàng"
      onCancel={onClose}
      footer={null}
      centered
      width={820}
    >
      <form className="grid gap-4" onSubmit={submit}>
        {error ? (
          <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Họ tên</span>
            <input className={fieldClass} value={form.name} onChange={(event) => update("name", event.target.value)} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Số điện thoại</span>
            <input className={fieldClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Ngày sinh</span>
            <input className={fieldClass} type="date" value={form.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Giới tính</span>
            <select className={fieldClass} value={form.gender} onChange={(event) => update("gender", event.target.value)}>
              <option value="">Chưa chọn</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </label>
          <label className="col-span-2 max-[680px]:col-span-1">
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Địa chỉ</span>
            <input className={fieldClass} value={form.address} onChange={(event) => update("address", event.target.value)} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Tỉnh/Thành</span>
            <SearchableSelect
              value={form.provinceId}
              onChange={(value) => update("provinceId", value)}
              options={[
                { value: "", label: "Chọn tỉnh/thành" },
                ...provinceOptions.map((province) => ({
                  value: province.id,
                  label: province.name,
                })),
              ]}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Xã/Phường</span>
            <SearchableSelect
              value={form.wardId}
              onChange={(value) => update("wardId", value)}
              options={[
                { value: "", label: "Chọn xã/phường" },
                ...wardOptions.map((ward) => ({
                  value: ward.id,
                  label: ward.name,
                })),
              ]}
              disabled={!form.provinceId}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Ngân hàng</span>
            <input className={fieldClass} value={form.bankName} onChange={(event) => update("bankName", event.target.value)} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Số tài khoản</span>
            <input className={fieldClass} value={form.bankAccount} onChange={(event) => update("bankAccount", event.target.value)} />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:opacity-60" type="submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function WorkInfoModal({
  open,
  employee,
  departments,
  positions,
  onClose,
  onSubmit,
}: {
  open: boolean;
  employee: Employee | null;
  departments: EmployeeOption[];
  positions: EmployeeOption[];
  onClose: () => void;
  onSubmit: (payload: UpdateEmployeeJobPayload) => Promise<void>;
}) {
  const [form, setForm] = useState({
    departmentId: "",
    positionId: "",
    hireDate: "",
    salary: "",
    status: "WORKING" as EmployeeStatus,
    effectiveFrom: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !employee) return;

    setForm({
      departmentId: employee.departmentId ?? employee.department?.id ?? "",
      positionId: employee.positionId ?? employee.position?.id ?? "",
      hireDate: toDateInput(employee.hireDate),
      salary: employee.salary != null ? String(employee.salary) : "",
      status: employee.status,
      effectiveFrom: todayInput(),
    });
    setError(null);
  }, [employee, open]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const salary = Number(form.salary);

    if (
      !form.departmentId ||
      !form.positionId ||
      !form.hireDate ||
      !form.effectiveFrom ||
      Number.isNaN(salary)
    ) {
      setError("Vui lòng nhập đủ bộ phận, chức vụ, ngày vào làm, ngày hiệu lực và lương.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        departmentId: form.departmentId,
        positionId: form.positionId,
        hireDate: form.hireDate,
        salary,
        status: form.status,
        effectiveFrom: form.effectiveFrom,
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Chỉnh sửa thông tin công việc" onCancel={onClose} footer={null} centered width={760}>
      <form className="grid gap-4" onSubmit={submit}>
        {error ? (
          <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Bộ phận</span>
            <SearchableSelect
              value={form.departmentId}
              onChange={(value) => update("departmentId", value)}
              options={[
                { value: "", label: "Chọn bộ phận" },
                ...departments.map((item) => ({ value: item.id, label: item.name })),
              ]}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Chức vụ</span>
            <SearchableSelect
              value={form.positionId}
              onChange={(value) => update("positionId", value)}
              options={[
                { value: "", label: "Chọn chức vụ" },
                ...positions.map((item) => ({ value: item.id, label: item.name })),
              ]}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Ngày vào làm</span>
            <input className={fieldClass} type="date" value={form.hireDate} onChange={(event) => update("hireDate", event.target.value)} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Lương</span>
            <input className={fieldClass} min={0} type="number" value={form.salary} onChange={(event) => update("salary", event.target.value)} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Trạng thái</span>
            <select className={fieldClass} value={form.status} onChange={(event) => update("status", event.target.value as EmployeeStatus)}>
              <option value="WORKING">Đang làm việc</option>
              <option value="ON_LEAVE">Đang nghỉ phép</option>
              <option value="RESIGNED">Đã nghỉ việc</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Ngày hiệu lực thay đổi</span>
            <input className={fieldClass} type="date" value={form.effectiveFrom} onChange={(event) => update("effectiveFrom", event.target.value)} />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:opacity-60" type="submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PayrollPolicyAssignModal({
  open,
  employee,
  type,
  insurancePolicies,
  taxPolicies,
  attendanceBonusPolicies,
  allowancePolicies,
  autoPenaltyPolicies,
  onClose,
  onAssigned,
}: {
  open: boolean;
  employee: Employee | null;
  type: PayrollEditType | null;
  insurancePolicies: InsurancePolicy[];
  taxPolicies: TaxPolicy[];
  attendanceBonusPolicies: AttendanceBonusPolicy[];
  allowancePolicies: AllowancePolicy[];
  autoPenaltyPolicies: AutoPenaltyPolicy[];
  onClose: () => void;
  onAssigned: () => Promise<void>;
}) {
  const [policyId, setPolicyId] = useState("");
  const [insuranceSalary, setInsuranceSalary] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [dependentCount, setDependentCount] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const options = useMemo(() => {
    if (type === "insurance") return insurancePolicies;
    if (type === "tax") return taxPolicies;
    if (type === "attendanceBonus") return attendanceBonusPolicies;
    if (type === "allowance") return allowancePolicies;
    if (type === "autoPenalty") return autoPenaltyPolicies;
    return [];
  }, [
    allowancePolicies,
    attendanceBonusPolicies,
    autoPenaltyPolicies,
    insurancePolicies,
    taxPolicies,
    type,
  ]);

  const title = {
    insurance: "Áp dụng chính sách bảo hiểm",
    tax: "Áp dụng chính sách thuế",
    attendanceBonus: "Áp dụng thưởng chuyên cần",
    allowance: "Áp dụng phụ cấp",
    autoPenalty: "Áp dụng phạt tự động",
  }[type ?? "insurance"];

  useEffect(() => {
    if (!open || !employee || !type) return;

    const profile = employee.payrollProfile;
    setPolicyId(
      type === "insurance"
        ? (profile?.insurancePolicyId ?? "")
        : type === "tax"
          ? (profile?.taxPolicyId ?? "")
          : type === "attendanceBonus"
            ? (profile?.attendanceBonusPolicyId ?? "")
            : "",
    );
    setInsuranceSalary(
      profile?.insuranceSalary != null ? String(profile.insuranceSalary) : "",
    );
    setTaxCode(profile?.taxCode ?? "");
    setDependentCount(String(profile?.dependentCount ?? 0));
    setError(null);
  }, [employee, open, type]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!employee || !type) return;

    if (!policyId) {
      setError("Vui lòng chọn chính sách.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const target = { employeeIds: [employee.id] };
      if (type === "insurance") {
        await payrollPolicyService.assignPayrollPolicies({
          ...target,
          insurancePolicyId: policyId,
          isInsuranceApplicable: true,
          insuranceSalary: insuranceSalary || null,
        });
      } else if (type === "tax") {
        await payrollPolicyService.assignPayrollPolicies({
          ...target,
          taxPolicyId: policyId,
          isTaxApplicable: true,
          taxCode: taxCode.trim() || null,
          dependentCount: Number(dependentCount) || 0,
        });
      } else if (type === "attendanceBonus") {
        await payrollPolicyService.assignPayrollPolicies({
          ...target,
          attendanceBonusPolicyId: policyId,
          isAttendanceBonusApplicable: true,
        });
      } else if (type === "allowance") {
        await payrollPolicyService.assignAllowancePolicy({
          ...target,
          allowancePolicyId: policyId,
        });
      } else if (type === "autoPenalty") {
        await payrollPolicyService.assignAutoPenaltyPolicy({
          ...target,
          autoPenaltyPolicyId: policyId,
        });
      }

      await onAssigned();
      onClose();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title={title} onCancel={onClose} footer={null} centered width={620}>
      <form className="grid gap-4" onSubmit={submit}>
        {error ? (
          <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}
        <label>
          <span className="mb-1.5 block text-sm font-medium text-[#344054]">
            Chính sách
          </span>
          <select
            className={fieldClass}
            value={policyId}
            onChange={(event) => setPolicyId(event.target.value)}
          >
            <option value="">Chọn chính sách</option>
            {options.map((policy) => (
              <option key={policy.id} value={policy.id}>
                {policy.name}
              </option>
            ))}
          </select>
        </label>

        {type === "insurance" ? (
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">
              Lương đóng bảo hiểm
            </span>
            <input
              className={fieldClass}
              min={0}
              type="number"
              value={insuranceSalary}
              onChange={(event) => setInsuranceSalary(event.target.value)}
            />
          </label>
        ) : null}

        {type === "tax" ? (
          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            <label>
              <span className="mb-1.5 block text-sm font-medium text-[#344054]">
                Mã số thuế
              </span>
              <input
                className={fieldClass}
                value={taxCode}
                onChange={(event) => setTaxCode(event.target.value)}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-[#344054]">
                Số người phụ thuộc
              </span>
              <input
                className={fieldClass}
                min={0}
                type="number"
                value={dependentCount}
                onChange={(event) => setDependentCount(event.target.value)}
              />
            </label>
          </div>
        ) : null}

        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button
            className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Đang áp dụng..." : "Áp dụng"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<EmployeeDetailTab>(() =>
    getDetailTab(searchParams.get("tab")),
  );
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [jobHistories, setJobHistories] = useState<EmployeeJobHistory[]>([]);
  const [departments, setDepartments] = useState<EmployeeOption[]>([]);
  const [positions, setPositions] = useState<EmployeeOption[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [taxPolicies, setTaxPolicies] = useState<TaxPolicy[]>([]);
  const [attendanceBonusPolicies, setAttendanceBonusPolicies] = useState<AttendanceBonusPolicy[]>([]);
  const [allowancePolicyOptions, setAllowancePolicyOptions] = useState<AllowancePolicy[]>([]);
  const [autoPenaltyPolicyOptions, setAutoPenaltyPolicyOptions] = useState<AutoPenaltyPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [basicOpen, setBasicOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [payrollEditType, setPayrollEditType] = useState<PayrollEditType | null>(null);

  const permissions = user?.permissions ?? [];
  const canEditBasic = hasPermission(user?.role, permissions, "EMPLOYEE_UPDATE_BASIC");
  const canEditJob = hasPermission(user?.role, permissions, "EMPLOYEE_UPDATE_JOB");
  const canEditPayroll = hasPermission(user?.role, permissions, "PAYROLL_POLICY_SETUP");

  const loadEmployee = async () => {
    if (!id) {
      setErrorMessage("Không tìm thấy mã nhân viên");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [employeeResult, jobHistoryResult] = await Promise.all([
        employeeService.getEmployeeById(id),
        employeeService.getJobHistory(id),
      ]);
      setEmployee(employeeResult);
      setJobHistories(jobHistoryResult);
    } catch (error) {
      setEmployee(null);
      setJobHistories([]);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadEmployee();
  }, [id]);

  useEffect(() => {
    setActiveTab(getDetailTab(searchParams.get("tab")));
  }, [searchParams]);

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
    if (!canEditPayroll) return;
    let ignore = false;

    Promise.allSettled([
      payrollPolicyService.getInsurancePolicies("active"),
      payrollPolicyService.getTaxPolicies("active"),
      payrollPolicyService.getAttendanceBonusPolicies("active"),
      payrollPolicyService.getAllowancePolicies("active"),
      payrollPolicyService.getAutoPenaltyPolicies("active"),
    ]).then((results) => {
      if (ignore) return;
      const [
        insuranceResult,
        taxResult,
        attendanceBonusResult,
        allowanceResult,
        autoPenaltyResult,
      ] = results;

      if (insuranceResult.status === "fulfilled") {
        setInsurancePolicies(insuranceResult.value);
      }
      if (taxResult.status === "fulfilled") {
        setTaxPolicies(taxResult.value);
      }
      if (attendanceBonusResult.status === "fulfilled") {
        setAttendanceBonusPolicies(attendanceBonusResult.value);
      }
      if (allowanceResult.status === "fulfilled") {
        setAllowancePolicyOptions(allowanceResult.value);
      }
      if (autoPenaltyResult.status === "fulfilled") {
        setAutoPenaltyPolicyOptions(autoPenaltyResult.value);
      }
    });

    return () => {
      ignore = true;
    };
  }, [canEditPayroll]);

  const openPayrollEdit = (type: PayrollEditType) => {
    setPayrollEditType(type);
  };

  const personalRows = useMemo<DetailRow[]>(
    () =>
      employee
        ? [
            { label: "Họ tên", value: employee.name },
            { label: "Email", value: employee.email },
            { label: "Số điện thoại", value: display(employee.phone) },
            { label: "Ngày sinh", value: formatDate(employee.dateOfBirth) },
            {
              label: "Giới tính",
              value: employee.gender ? genderLabels[employee.gender] : "-",
            },
            { label: "Trạng thái tài khoản", value: employee.user?.role ?? "-" },
            { label: "Địa chỉ", value: display(employee.address) },
            { label: "Tỉnh/Thành", value: lookupName(employee.province) },
            { label: "Xã/Phường", value: lookupName(employee.ward) },
            { label: "Ngân hàng", value: lookupName(employee.bank) },
            {
              label: "Số tài khoản ngân hàng",
              value: display(employee.bankAccount),
            },
          ]
        : [],
    [employee],
  );

  const additionalRows = useMemo<DetailRow[]>(
    () =>
      employee
        ? [
            { label: "Tình trạng hôn nhân", value: display(employee.maritalStatus) },
            { label: "Quốc tịch", value: display(employee.nationality) },
            { label: "Tôn giáo", value: display(employee.religion) },
            { label: "Số CCCD/CMND", value: display(employee.identityCardNumber) },
            {
              label: "Ngày cấp CCCD/CMND",
              value: formatDate(employee.identityCardIssueDate),
            },
            {
              label: "Ảnh CCCD mặt trước",
              value: displayImage(employee.frontIdentityCardImage, "Mặt trước CCCD"),
            },
            {
              label: "Ảnh CCCD mặt sau",
              value: displayImage(employee.backIdentityCardImage, "Mặt sau CCCD"),
            },
          ]
        : [],
    [employee],
  );

  const workRows = useMemo<DetailRow[]>(
    () =>
      employee
        ? [
            { label: "Mã nhân viên", value: display(employee.employeeId) },
            { label: "Bộ phận", value: display(employee.department?.name) },
            { label: "Chức vụ", value: display(employee.position?.name) },
            { label: "Ngày vào làm", value: formatDate(employee.hireDate) },
            { label: "Thâm niên", value: countWorkDays(employee.hireDate) },
            { label: "Lương cơ bản", value: formatCurrency(employee.salary) },
            { label: "Trạng thái", value: statusLabels[employee.status] },
          ]
        : [],
    [employee],
  );

  const handleEditBasic = async (payload: UpdateEmployeeBasicPayload) => {
    if (!employee) return;
    await employeeService.updateEmployeeBasic(employee.id, payload);
    setBasicOpen(false);
    await loadEmployee();
  };

  const handleEditJob = async (payload: UpdateEmployeeJobPayload) => {
    if (!employee) return;
    await employeeService.updateEmployeeJob(employee.id, payload);
    setWorkOpen(false);
    await loadEmployee();
  };

  const handleEditAdditional = async (payload: UpdateEmployeeAdditionalPayload) => {
    if (!employee) return;
    await employeeService.updateEmployeeAdditional(employee.id, payload);
    setAdditionalOpen(false);
    await loadEmployee();
  };

  const payrollProfile = employee?.payrollProfile;
  const insurance = payrollProfile?.insurancePolicy;
  const tax = payrollProfile?.taxPolicy;
  const attendanceBonus = payrollProfile?.attendanceBonusPolicy;
  const allowancePolicies =
    employee?.allowances?.map((item) => item.allowancePolicy).filter(Boolean) ?? [];
  const autoPenaltyPolicies =
    employee?.autoPenaltyPolicies
      ?.map((item) => item.autoPenaltyPolicy)
      .filter(Boolean) ?? [];

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-auto bg-[#f7f8fa]">
        <div className="min-h-full px-5 py-5 max-[640px]:px-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
              type="button"
              onClick={() => navigate(paths.employees)}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>

          </div>

          {isLoading ? (
            <div className="rounded-xl border border-[#d0d5dd] bg-white py-16 text-center text-[#667085] shadow-sm">
              Đang tải thông tin nhân viên...
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318] shadow-sm">
              {errorMessage}
            </div>
          ) : employee ? (
            <div className="grid min-h-[calc(100dvh-132px)] grid-cols-[340px_minmax(0,1fr)] gap-5 max-[1080px]:grid-cols-1">
              <aside className="self-start rounded-xl border border-[#d0d5dd] bg-white px-6 py-7 shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
                <div className="flex flex-col items-center text-center">
                  <Avatar
                    src={employee.avatar}
                    alt={employee.name}
                    sizeClass="h-48 w-48"
                    className="rounded-xl! border border-[#d0d5dd] bg-white p-1 shadow-sm"
                  />
                  <h1 className="mt-5 text-2xl font-bold text-[#243247] break-words w-full">
                    {employee.name}
                  </h1>
                  <p className="mt-2 text-sm font-medium text-[#667085] break-words w-full">
                    {employee.position?.name || "-"}
                  </p>
                  <span className="mt-3 rounded-full bg-[#ecfdf3] px-3 py-1 text-xs font-bold text-[#067647]">
                    {statusLabels[employee.status]}
                  </span>
                </div>

                <div className="mt-7 grid gap-4 border-t border-[#edf0f5] pt-6 text-sm text-[#243247]">
                  <div className="flex min-w-0 items-center gap-3">
                    <Heart className="h-5 w-5 shrink-0 text-[#ff5a66]" />
                    <span>{countWorkDays(employee.hireDate)}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-3">
                    <Tag className="h-5 w-5 shrink-0 text-[#98a2b3]" />
                    <span>Mã nhân viên {employee.employeeId || "-"}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-[#98a2b3]" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-3">
                    <Phone className="h-5 w-5 shrink-0 text-[#98a2b3]" />
                    <span>{employee.phone || "-"}</span>
                  </div>
                </div>
              </aside>

              <section className="grid min-w-0 content-start gap-5">
                <div className="flex border-b border-[#d0d5dd] bg-transparent">
                  <button
                    className={`inline-flex min-h-14 items-center justify-center gap-2 border-b-2 px-8 text-sm font-semibold transition-all duration-300 max-[640px]:flex-1 max-[640px]:px-4 ${
                      activeTab === "personal"
                        ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5] shadow-[inset_0_-2px_0_0_#006fd5]"
                        : "border-transparent text-[#667085] hover:bg-slate-50 hover:text-[#344054]"
                    }`}
                    type="button"
                    onClick={() => setActiveTab("personal")}
                  >
                    <User className="h-4 w-4" />
                    Cá nhân
                  </button>
                  <button
                    className={`inline-flex min-h-14 items-center justify-center gap-2 border-b-2 px-8 text-sm font-semibold transition-all duration-300 max-[640px]:flex-1 max-[640px]:px-4 ${
                      activeTab === "work"
                        ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5] shadow-[inset_0_-2px_0_0_#006fd5]"
                        : "border-transparent text-[#667085] hover:bg-slate-50 hover:text-[#344054]"
                    }`}
                    type="button"
                    onClick={() => setActiveTab("work")}
                  >
                    <BriefcaseBusiness className="h-4 w-4" />
                    Công việc
                  </button>
                  <button
                    className={`inline-flex min-h-14 items-center justify-center gap-2 border-b-2 px-8 text-sm font-semibold transition-all duration-300 max-[640px]:flex-1 max-[640px]:px-4 ${
                      activeTab === "payroll"
                        ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5] shadow-[inset_0_-2px_0_0_#006fd5]"
                        : "border-transparent text-[#667085] hover:bg-slate-50 hover:text-[#344054]"
                    }`}
                    type="button"
                    onClick={() => setActiveTab("payroll")}
                  >
                    <WalletCards className="h-4 w-4" />
                    Lương & Chính sách
                  </button>
                </div>

                {activeTab === "personal" ? (
                  <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card
                      title="Thông tin cá nhân, liên hệ và ngân hàng"
                      icon={<User className="h-5 w-5" />}
                      canEdit={canEditBasic}
                      onEdit={() => setBasicOpen(true)}
                    >
                      <DetailGrid rows={personalRows} />
                    </Card>
                    <Card
                      title="Thông tin thêm"
                      icon={<ShieldCheck className="h-5 w-5" />}
                      canEdit={canEditBasic}
                      onEdit={() => setAdditionalOpen(true)}
                    >
                      <DetailGrid rows={additionalRows} />
                    </Card>
                  </div>
                ) : activeTab === "work" ? (
                  <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
                      <div className="rounded-xl border border-[#d0d5dd] bg-white p-4 shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
                        <Badge className="h-5 w-5 text-[#006fd5]" />
                        <span className="mt-3 block text-sm text-[#667085]">
                          Trạng thái
                        </span>
                        <strong className="mt-1 block text-base text-[#243247]">
                          {statusLabels[employee.status]}
                        </strong>
                      </div>
                      <div className="rounded-xl border border-[#d0d5dd] bg-white p-4 shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
                        <CalendarDays className="h-5 w-5 text-[#006fd5]" />
                        <span className="mt-3 block text-sm text-[#667085]">
                          Ngày vào làm
                        </span>
                        <strong className="mt-1 block text-base text-[#243247]">
                          {formatDate(employee.hireDate)}
                        </strong>
                      </div>
                      <div className="rounded-xl border border-[#d0d5dd] bg-white p-4 shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
                        <WalletCards className="h-5 w-5 text-[#006fd5]" />
                        <span className="mt-3 block text-sm text-[#667085]">
                          Lương cơ bản
                        </span>
                        <strong className="mt-1 block text-base text-[#243247]">
                          {formatCurrency(employee.salary)}
                        </strong>
                      </div>
                    </div>
                    <Card
                      title="Thông tin công việc"
                      icon={<BriefcaseBusiness className="h-5 w-5" />}
                      canEdit={canEditJob}
                      onEdit={() => setWorkOpen(true)}
                    >
                      <DetailGrid rows={workRows} />
                    </Card>
                    <Card
                      title="Lịch sử thay đổi công việc"
                      icon={<CalendarDays className="h-5 w-5" />}
                    >
                      <EmployeeJobHistoryList histories={jobHistories} />
                    </Card>
                  </div>
                ) : activeTab === "payroll" ? (
                  <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">

                <Card
                  title="Chính sách lương"
                  icon={<WalletCards className="h-5 w-5" />}
                >
                  <div className="grid grid-cols-2 gap-3 max-[980px]:grid-cols-1">
                    <PolicyCard
                      title="Bảo hiểm"
                      icon={<ShieldCheck className="h-4 w-4 shrink-0 text-[#006fd5]" />}
                      canEdit={canEditPayroll}
                      onEdit={() => openPayrollEdit("insurance")}
                      status={
                        <PolicyStatus
                          enabled={Boolean(payrollProfile?.isInsuranceApplicable && insurance)}
                          active={insurance?.isActive}
                        />
                      }
                    >
                      <div className="grid gap-3 text-sm">
                        <div className="rounded-lg border border-[#edf0f5] bg-[#f9fafb] p-3">
                          <div className="mb-2 font-semibold text-[#006fd5]">{insurance?.name ?? "Chưa thiết lập"}</div>
                          <div className="grid grid-cols-2 gap-2 text-[#475467]">
                            <div>
                              <span className="block text-xs text-[#667085]">Lương đóng BH</span>
                              <span className="font-medium text-[#243247]">{formatCurrency(payrollProfile?.insuranceSalary ?? employee.salary)}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-[#667085]">Hiệu lực</span>
                              <span className="font-medium text-[#243247]">{formatPolicyPeriod(insurance?.effectiveFrom, insurance?.effectiveTo)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-sm">
                            <span className="mb-2 block text-xs font-semibold text-[#667085]">MỨC ĐÓNG NLĐ</span>
                            <ul className="grid gap-1.5 text-xs text-[#475467]">
                              <li className="flex justify-between"><span>BHXH:</span> <strong className="text-[#243247]">{formatPercent(insurance?.employeeSocialRate)}</strong></li>
                              <li className="flex justify-between"><span>BHYT:</span> <strong className="text-[#243247]">{formatPercent(insurance?.employeeHealthRate)}</strong></li>
                              <li className="flex justify-between"><span>BHTN:</span> <strong className="text-[#243247]">{formatPercent(insurance?.employeeUnemploymentRate)}</strong></li>
                            </ul>
                          </div>
                          <div className="rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-sm">
                            <span className="mb-2 block text-xs font-semibold text-[#667085]">MỨC ĐÓNG CÔNG TY</span>
                            <ul className="grid gap-1.5 text-xs text-[#475467]">
                              <li className="flex justify-between"><span>BHXH:</span> <strong className="text-[#243247]">{formatPercent(insurance?.employerSocialRate)}</strong></li>
                              <li className="flex justify-between"><span>BHYT:</span> <strong className="text-[#243247]">{formatPercent(insurance?.employerHealthRate)}</strong></li>
                              <li className="flex justify-between"><span>BHTN:</span> <strong className="text-[#243247]">{formatPercent(insurance?.employerUnemploymentRate)}</strong></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </PolicyCard>

                    <PolicyCard
                      title="Thuế TNCN"
                      icon={<Percent className="h-4 w-4 shrink-0 text-[#7a5af8]" />}
                      canEdit={canEditPayroll}
                      onEdit={() => openPayrollEdit("tax")}
                      status={
                        <PolicyStatus
                          enabled={Boolean(payrollProfile?.isTaxApplicable && tax)}
                          active={tax?.isActive}
                        />
                      }
                    >
                      <div className="grid gap-3 text-sm">
                        <div className="rounded-lg border border-[#edf0f5] bg-[#f9fafb] p-3">
                          <div className="mb-2 font-semibold text-[#7a5af8]">{tax?.name ?? "Chưa thiết lập"}</div>
                          <div className="grid grid-cols-2 gap-2 text-[#475467]">
                            <div>
                              <span className="block text-xs text-[#667085]">Mã số thuế</span>
                              <span className="font-medium text-[#243247]">{payrollProfile?.taxCode || "-"}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-[#667085]">Bậc thuế áp dụng</span>
                              <span className="font-medium text-[#243247]">{tax?.brackets?.length ?? 0} bậc</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-sm">
                            <span className="mb-1 block text-xs text-[#667085]">Giảm trừ bản thân</span>
                            <strong className="text-sm text-[#243247]">{formatCurrency(tax?.personalDeduction)}</strong>
                          </div>
                          <div className="rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-sm">
                            <span className="mb-1 block text-xs text-[#667085]">Giảm trừ NPT ({payrollProfile?.dependentCount ?? 0})</span>
                            <strong className="text-sm text-[#243247]">{formatCurrency(tax?.dependentDeduction)}/người</strong>
                          </div>
                        </div>
                        <div className="text-xs text-[#667085] mt-1 text-right">
                          Hiệu lực: {formatPolicyPeriod(tax?.effectiveFrom, tax?.effectiveTo)}
                        </div>
                      </div>
                    </PolicyCard>

                    <PolicyCard
                      title="Thưởng chuyên cần"
                      icon={<Gift className="h-4 w-4 shrink-0 text-[#f79009]" />}
                      canEdit={canEditPayroll}
                      onEdit={() => openPayrollEdit("attendanceBonus")}
                      status={
                        <PolicyStatus
                          enabled={Boolean(
                            payrollProfile?.isAttendanceBonusApplicable &&
                              attendanceBonus,
                          )}
                          active={attendanceBonus?.isActive}
                        />
                      }
                    >
                      <div className="grid gap-3 text-sm">
                        <div className="rounded-lg border border-[#edf0f5] bg-[#f9fafb] p-3">
                          <div className="mb-2 font-semibold text-[#f79009]">{attendanceBonus?.name ?? "Chưa thiết lập"}</div>
                          <div className="grid grid-cols-2 gap-2 text-[#475467]">
                            <div>
                              <span className="block text-xs text-[#667085]">Số tiền thưởng</span>
                              <span className="font-medium text-[#243247]">{formatCurrency(attendanceBonus?.amount)}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-[#667085]">Công yêu cầu</span>
                              <span className="font-medium text-[#243247]">{attendanceBonus?.requiredWorkDays ?? "-"} ngày</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-sm">
                            <span className="mb-1 block text-xs text-[#667085]">Muộn tối đa</span>
                            <strong className="text-sm text-[#243247]">{attendanceBonus?.maxLateMinutes ?? "-"} phút</strong>
                          </div>
                          <div className="rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-sm">
                            <span className="mb-1 block text-xs text-[#667085]">Vắng tối đa</span>
                            <strong className="text-sm text-[#243247]">{attendanceBonus?.maxAbsentDays ?? "-"} ngày</strong>
                          </div>
                        </div>
                        <div className="text-xs text-[#667085] mt-1 text-right">
                          Hiệu lực: {formatPolicyPeriod(attendanceBonus?.effectiveFrom, attendanceBonus?.effectiveTo)}
                        </div>
                      </div>
                    </PolicyCard>

                    <PolicyCard
                      title="Phụ cấp"
                      icon={<WalletCards className="h-4 w-4 shrink-0 text-[#067647]" />}
                      canEdit={canEditPayroll}
                      onEdit={() => openPayrollEdit("allowance")}
                    >
                      {allowancePolicies.length ? (
                        <div className="grid gap-2">
                          {allowancePolicies.map((policy) => (
                            <div
                              className="flex items-center justify-between gap-3 rounded-lg border border-[#edf0f5] bg-[#f9fafb] px-3 py-2.5 text-sm"
                              key={policy!.id}
                            >
                              <span className="min-w-0 truncate font-semibold text-[#243247]">
                                {policy!.name}
                              </span>
                              <strong className="shrink-0 text-[#067647]">
                                {formatCurrency(policy!.amount)}
                              </strong>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-[#667085]">
                          Chưa có phụ cấp được gán
                        </div>
                      )}
                    </PolicyCard>
                  </div>

                  <PolicyCard
                    title="Phạt tự động"
                    icon={<TriangleAlert className="h-4 w-4 shrink-0 text-[#d92d20]" />}
                    canEdit={canEditPayroll}
                    onEdit={() => openPayrollEdit("autoPenalty")}
                  >
                    {autoPenaltyPolicies.length ? (
                      <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
                        {autoPenaltyPolicies.map((policy) => (
                          <div
                            className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-3 py-3 text-sm"
                            key={policy!.id}
                          >
                            <div className="font-semibold text-[#d92d20]">
                              {policy!.name}
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="block text-[#667085]">Loại phạt</span>
                                <span className="font-medium text-[#b42318]">{autoPenaltyTypeLabels[policy!.type] ?? policy!.type}</span>
                              </div>
                              <div>
                                <span className="block text-[#667085]">Mức phạt</span>
                                <span className="font-medium text-[#b42318]">{formatCurrency(policy!.amount)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-[#667085]">
                        Chưa có chính sách phạt tự động
                      </div>
                    )}
                  </PolicyCard>
                </Card>
                  </div>
                ) : null}
              </section>
            </div>
          ) : null}
        </div>
      </main>

      <BasicContactBankModal
        open={basicOpen}
        employee={employee}
        onClose={() => setBasicOpen(false)}
        onSubmit={handleEditBasic}
      />
      <WorkInfoModal
        open={workOpen}
        employee={employee}
        departments={departments}
        positions={positions}
        onClose={() => setWorkOpen(false)}
        onSubmit={handleEditJob}
      />
      <AdditionalInfoModal
        open={additionalOpen}
        employee={employee}
        onClose={() => setAdditionalOpen(false)}
        onSubmit={handleEditAdditional}
      />
      <PayrollPolicyAssignModal
        open={Boolean(payrollEditType)}
        employee={employee}
        type={payrollEditType}
        insurancePolicies={insurancePolicies}
        taxPolicies={taxPolicies}
        attendanceBonusPolicies={attendanceBonusPolicies}
        allowancePolicies={allowancePolicyOptions}
        autoPenaltyPolicies={autoPenaltyPolicyOptions}
        onClose={() => setPayrollEditType(null)}
        onAssigned={loadEmployee}
      />
    </AppLayout>
  );
}
