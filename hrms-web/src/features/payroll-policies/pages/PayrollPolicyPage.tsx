import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Modal } from "antd";
import { AlertCircle, Award, Ban, Gavel,
  BadgePercent,
  Edit2,
  HandCoins,
  Landmark,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import { employeeService } from "../../employees/services/employeeService";
import { payrollPolicyService } from "../services/payrollPolicyService";
import type {
  AllowancePolicy,
  AllowancePolicyPayload,
  AttendanceBonusPolicy,
  AttendanceBonusPolicyPayload,
  AutoPenaltyPolicy,
  AutoPenaltyPolicyPayload,
  AutoPenaltyTier,
  AutoPenaltyType,
  InsurancePolicy,
  InsurancePolicyPayload,
  PayrollBonusPenalty,
  PayrollPolicyAssignmentPayload,
  PolicyStatusFilter,
  TaxBracket,
  TaxPolicy,
  TaxPolicyPayload,
} from "../types/payrollPolicy.types";
import type { Department } from "../../departments/types/department.types";
import type { EmployeeOption } from "../../employees/types/employee.types";

type TabKey = "insurance" | "tax" | "attendanceBonus" | "allowances" | "autoPenalties" | "bonusPenalties";
type EditablePolicy =
  | InsurancePolicy
  | TaxPolicy
  | AttendanceBonusPolicy
  | AllowancePolicy
  | AutoPenaltyPolicy;

const tabs: Array<{ key: TabKey; label: string; icon: ReactNode }> = [
  { key: "insurance", label: "Bảo hiểm", icon: <Landmark className="h-4 w-4" /> },
  { key: "tax", label: "Thuế TNCN", icon: <BadgePercent className="h-4 w-4" /> },
  { key: "allowances", label: "Phụ cấp", icon: <HandCoins className="h-4 w-4" /> },
  { key: "autoPenalties", label: "Tiền phạt", icon: <Gavel className="h-4 w-4" /> },
  { key: "attendanceBonus", label: "Thưởng chuyên cần", icon: <Award className="h-4 w-4" /> },
];

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";
const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

const defaultInsuranceForm: InsurancePolicyPayload = {
  name: "",
  employeeSocialRate: "",
  employeeHealthRate: "",
  employeeUnemploymentRate: "",
  employerSocialRate: "",
  employerHealthRate: "",
  employerUnemploymentRate: "",
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: "",
  isActive: true,
};

const defaultTaxForm: TaxPolicyPayload = {
  name: "",
  personalDeduction: "11000000",
  dependentDeduction: "4400000",
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: "",
  isActive: true,
  brackets: [{ fromAmount: "0", toAmount: "", rate: "" }],
};

const defaultAllowanceForm: AllowancePolicyPayload = {
  name: "",
  description: "",
  amount: "",
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: "",
  isActive: true,
};

const defaultAttendanceBonusForm: AttendanceBonusPolicyPayload = {
  name: "",
  amount: "",
  requiredWorkDays: "",
  maxLateMinutes: null,
  maxEarlyMinutes: null,
  maxAbsentDays: "",
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: "",
  isActive: true,
};

const defaultAutoPenaltyForm: AutoPenaltyPolicyPayload = {
  type: "LATE_EARLY",
  name: "",
  description: "",
  amount: "",
  isActive: true,
  tiers: [],
};

const autoPenaltyTypeOptions: Array<{ value: AutoPenaltyType; label: string }> = [
  { value: "LATE_EARLY", label: "Đi muộn/về sớm" },
  { value: "UNAUTHORIZED_ABSENCE", label: "Nghỉ không phép" },
  {
    value: "UNAUTHORIZED_ABSENCE_PROGRESSIVE",
    label: "Nghỉ không phép lũy tiến",
  },
  { value: "LATE_EARLY_PROGRESSIVE", label: "Đi muộn/về sớm lũy tiến" },
];

const progressiveAutoPenaltyTypes = new Set<AutoPenaltyType>([
  "UNAUTHORIZED_ABSENCE_PROGRESSIVE",
  "LATE_EARLY_PROGRESSIVE",
]);

function getAutoPenaltyTypeLabel(type: AutoPenaltyType) {
  return autoPenaltyTypeOptions.find((option) => option.value === type)?.label ?? type;
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

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function formatMoney(value?: string | number | null) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatPercent(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";
  return `${Number(value).toLocaleString("vi-VN")} %`;
}

function MoneyInput({
  value,
  onChange,
  placeholder,
  className = fieldClass,
}: {
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const formatted = useMemo(() => {
    if (value === null || value === undefined || value === "") return "";
    const clean = String(value).replace(/\D/g, "");
    if (!clean) return "";
    return Number(clean).toLocaleString("vi-VN");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    onChange(raw);
  };

  return (
    <input
      type="text"
      className={className}
      placeholder={placeholder}
      value={formatted}
      onChange={handleChange}
    />
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#f2f4f7] text-[#667085]"
      }`}
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${active ? "bg-[#12b76a]" : "bg-[#98a2b3]"}`} />
      {active ? "Đang áp dụng" : "Tạm dừng"}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-[#667085]">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f2f4f7] text-[#98a2b3]">
        <Search className="h-6 w-6" />
      </div>
      <p>{text}</p>
    </div>
  );
}

function InsuranceModal({
  open,
  policy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  policy: InsurancePolicy | null;
  onClose: () => void;
  onSubmit: (payload: InsurancePolicyPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<InsurancePolicyPayload>(defaultInsuranceForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      policy
        ? {
            name: policy.name,
            employeeSocialRate: policy.employeeSocialRate,
            employeeHealthRate: policy.employeeHealthRate,
            employeeUnemploymentRate: policy.employeeUnemploymentRate,
            employerSocialRate: policy.employerSocialRate ?? "",
            employerHealthRate: policy.employerHealthRate ?? "",
            employerUnemploymentRate: policy.employerUnemploymentRate ?? "",
            effectiveFrom: toDateInput(policy.effectiveFrom),
            effectiveTo: toDateInput(policy.effectiveTo),
            isActive: policy.isActive,
          }
        : defaultInsuranceForm,
    );
    setError(null);
  }, [open, policy]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.effectiveFrom) {
      setError("Vui lòng nhập tên chính sách và ngày hiệu lực.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ...form, name: form.name.trim() });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu chính sách bảo hiểm"));
    } finally {
      setSubmitting(false);
    }
  };

  const setValue = (key: keyof InsurancePolicyPayload, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff]">
            <Landmark className="h-4 w-4 text-[#006fd5]" />
          </span>
          <span>{policy ? "Chỉnh sửa chính sách bảo hiểm" : "Thêm chính sách bảo hiểm"}</span>
        </div>
      }
      onCancel={onClose}
      width={760}
      centered
      footer={
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:opacity-60" type="submit" form="insurancePolicyForm" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      }
    >
      <form id="insurancePolicyForm" className="grid gap-5" onSubmit={submit}>
        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            <AlertCircle className='h-4 w-4 shrink-0' />
            <span>{error}</span>
          </div>
        ) : null}
        
        <label>
          <span className={labelClass}>Tên chính sách <span className="text-[#f04438]">*</span></span>
          <input className={fieldClass} placeholder="VD: Bảo hiểm chính thức 2026..." value={form.name} onChange={(event) => setValue("name", event.target.value)} />
        </label>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
            <span className="text-sm font-semibold text-[#243247]">Tỷ lệ đóng của nhân viên (%)</span>
          </div>
          <div className="grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
            <label>
              <span className={labelClass}>BHXH nhân viên <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} type="number" step="0.01" placeholder="8.0" value={form.employeeSocialRate} onChange={(event) => setValue("employeeSocialRate", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>BHYT nhân viên <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} type="number" step="0.01" placeholder="1.5" value={form.employeeHealthRate} onChange={(event) => setValue("employeeHealthRate", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>BHTN nhân viên <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} type="number" step="0.01" placeholder="1.0" value={form.employeeUnemploymentRate} onChange={(event) => setValue("employeeUnemploymentRate", event.target.value)} />
            </label>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
            <span className="text-sm font-semibold text-[#243247]">Tỷ lệ đóng của công ty (%)</span>
          </div>
          <div className="grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
            <label>
              <span className={labelClass}>BHXH công ty</span>
              <input className={fieldClass} type="number" step="0.01" placeholder="17.5" value={form.employerSocialRate ?? ""} onChange={(event) => setValue("employerSocialRate", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>BHYT công ty</span>
              <input className={fieldClass} type="number" step="0.01" placeholder="3.0" value={form.employerHealthRate ?? ""} onChange={(event) => setValue("employerHealthRate", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>BHTN công ty</span>
              <input className={fieldClass} type="number" step="0.01" placeholder="1.0" value={form.employerUnemploymentRate ?? ""} onChange={(event) => setValue("employerUnemploymentRate", event.target.value)} />
            </label>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
            <span className="text-sm font-semibold text-[#243247]">Thời gian áp dụng</span>
          </div>
          <div className="grid grid-cols-3 gap-3 max-[720px]:grid-cols-1 items-start">
            <label>
              <span className={labelClass}>Hiệu lực từ <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} type="date" value={form.effectiveFrom} onChange={(event) => setValue("effectiveFrom", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>Hiệu lực đến</span>
              <input className={fieldClass} type="date" value={form.effectiveTo ?? ""} onChange={(event) => setValue("effectiveTo", event.target.value)} />
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm font-medium text-[#344054] h-full pt-7 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 accent-[#006fd5]" checked={form.isActive} onChange={(event) => setValue("isActive", event.target.checked)} />
              Đang áp dụng
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function TaxModal({
  open,
  policy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  policy: TaxPolicy | null;
  onClose: () => void;
  onSubmit: (payload: TaxPolicyPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<TaxPolicyPayload>(defaultTaxForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      policy
        ? {
            name: policy.name,
            personalDeduction: policy.personalDeduction,
            dependentDeduction: policy.dependentDeduction,
            effectiveFrom: toDateInput(policy.effectiveFrom),
            effectiveTo: toDateInput(policy.effectiveTo),
            isActive: policy.isActive,
            brackets: policy.brackets.map((item) => ({
              fromAmount: item.fromAmount,
              toAmount: item.toAmount ?? "",
              rate: item.rate,
            })),
          }
        : defaultTaxForm,
    );
    setError(null);
  }, [open, policy]);

  const setValue = (key: keyof TaxPolicyPayload, value: string | boolean | TaxBracket[]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const updateBracket = (index: number, key: keyof TaxBracket, value: string) => {
    const next = [...form.brackets];
    next[index] = { ...next[index], [key]: value };
    setValue("brackets", next);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || form.brackets.length === 0) {
      setError("Vui lòng nhập tên chính sách và ít nhất một bậc thuế.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ...form, name: form.name.trim() });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu chính sách thuế"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff]">
            <BadgePercent className="h-4 w-4 text-[#006fd5]" />
          </span>
          <span>{policy ? "Chỉnh sửa chính sách thuế" : "Thêm chính sách thuế"}</span>
        </div>
      }
      onCancel={onClose}
      width={820}
      centered
      styles={{ body: { maxHeight: "calc(100vh - 200px)", overflowY: "auto", paddingRight: "8px" } }}
      footer={
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:opacity-60" type="submit" form="taxPolicyForm" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      }
    >
      <form id="taxPolicyForm" className="grid gap-5" onSubmit={submit}>
        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            <AlertCircle className='h-4 w-4 shrink-0' />
            <span>{error}</span>
          </div>
        ) : null}
        
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
            <span className="text-sm font-semibold text-[#243247]">Thông tin chung</span>
          </div>
          <div className="grid grid-cols-3 gap-3 max-[720px]:grid-cols-1 mb-2">
            <label className="col-span-3 max-[720px]:col-span-1">
              <span className={labelClass}>Tên chính sách <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} placeholder="VD: Biểu thuế lũy tiến từng phần..." value={form.name} onChange={(event) => setValue("name", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>Giảm trừ bản thân (VNĐ) <span className="text-[#f04438]">*</span></span>
              <MoneyInput placeholder="11.000.000" value={form.personalDeduction} onChange={(val) => setValue("personalDeduction", val)} />
            </label>
            <label>
              <span className={labelClass}>Giảm trừ phụ thuộc (VNĐ) <span className="text-[#f04438]">*</span></span>
              <MoneyInput placeholder="4.400.000" value={form.dependentDeduction} onChange={(val) => setValue("dependentDeduction", val)} />
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm font-medium text-[#344054] h-full pt-7 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 accent-[#006fd5]" checked={form.isActive} onChange={(event) => setValue("isActive", event.target.checked)} />
              Đang áp dụng
            </label>
            <label>
              <span className={labelClass}>Hiệu lực từ <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} type="date" value={form.effectiveFrom} onChange={(event) => setValue("effectiveFrom", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>Hiệu lực đến</span>
              <input className={fieldClass} type="date" value={form.effectiveTo ?? ""} onChange={(event) => setValue("effectiveTo", event.target.value)} />
            </label>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
              <span className="text-sm font-semibold text-[#243247]">Bậc thuế tính theo thu nhập tháng</span>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-[#d0d5dd] bg-white px-3 py-1.5 text-xs font-semibold text-[#344054] shadow-xs transition-colors hover:bg-[#f9fafb]" type="button" onClick={() => setValue("brackets", [...form.brackets, { fromAmount: "", toAmount: "", rate: "" }])}>
              <Plus className="h-3.5 w-3.5" />
              Thêm bậc
            </button>
          </div>
          <div className="rounded-xl border border-[#edf0f5] bg-[#fbfcff] p-3">
            <div className="grid gap-3">
              {form.brackets.map((bracket, index) => (
                <div className="grid grid-cols-[1fr_1fr_120px_40px] items-center gap-2 max-[720px]:grid-cols-1" key={index}>
                  <div>
                    <span className="mb-1 block text-xs font-medium text-[#667085]">Từ thu nhập (VNĐ)</span>
                    <MoneyInput placeholder="0" value={bracket.fromAmount} onChange={(val) => updateBracket(index, "fromAmount", val)} />
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-medium text-[#667085]">Đến thu nhập (VNĐ)</span>
                    <MoneyInput placeholder="Trống nếu không giới hạn" value={bracket.toAmount ?? ""} onChange={(val) => updateBracket(index, "toAmount", val)} />
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-medium text-[#667085]">Thuế suất (%)</span>
                    <input className={fieldClass} type="number" step="0.01" placeholder="5" value={bracket.rate} onChange={(event) => updateBracket(index, "rate", event.target.value)} />
                  </div>
                  <div className="pt-5 max-[720px]:pt-1">
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fef3f2] text-[#b42318] transition-colors hover:bg-[#fee4e2]" type="button" title="Xóa bậc" onClick={() => setValue("brackets", form.brackets.filter((_, itemIndex) => itemIndex !== index))}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function AttendanceBonusModal({
  open,
  policy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  policy: AttendanceBonusPolicy | null;
  onClose: () => void;
  onSubmit: (payload: AttendanceBonusPolicyPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<AttendanceBonusPolicyPayload>(
    defaultAttendanceBonusForm,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      policy
        ? {
            name: policy.name,
            amount: policy.amount,
            requiredWorkDays: policy.requiredWorkDays ?? "",
            maxLateMinutes: policy.maxLateMinutes ?? null,
            maxEarlyMinutes: policy.maxEarlyMinutes ?? null,
            maxAbsentDays: policy.maxAbsentDays ?? "",
            effectiveFrom: toDateInput(policy.effectiveFrom),
            effectiveTo: toDateInput(policy.effectiveTo),
            isActive: policy.isActive,
          }
        : defaultAttendanceBonusForm,
    );
    setError(null);
  }, [open, policy]);

  const setValue = (
    key: keyof AttendanceBonusPolicyPayload,
    value: string | number | boolean | null,
  ) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.amount || !form.effectiveFrom) {
      setError("Vui lòng nhập tên, số tiền thưởng và ngày hiệu lực.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ...form, name: form.name.trim() });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu chính sách thưởng chuyên cần"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff]">
            <Award className="h-4 w-4 text-[#006fd5]" />
          </span>
          <span>{policy ? "Chỉnh sửa thưởng chuyên cần" : "Thêm thưởng chuyên cần"}</span>
        </div>
      }
      onCancel={onClose}
      width={760}
      centered
      footer={
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:opacity-60" type="submit" form="attendanceBonusPolicyForm" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      }
    >
      <form id="attendanceBonusPolicyForm" className="grid gap-5" onSubmit={submit}>
        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
            <span className="text-sm font-semibold text-[#243247]">Điều kiện thưởng chuyên cần</span>
          </div>
          <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
            <label>
              <span className={labelClass}>Tên chính sách <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} placeholder="VD: Thưởng chuyên cần hằng tháng" value={form.name} onChange={(event) => setValue("name", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>Số tiền thưởng (VNĐ) <span className="text-[#f04438]">*</span></span>
              <MoneyInput placeholder="500.000" value={form.amount} onChange={(val) => setValue("amount", val)} />
            </label>
            <label>
              <span className={labelClass}>Số ngày công yêu cầu</span>
              <input className={fieldClass} type="number" min="0" step="0.5" placeholder="VD: 22" value={form.requiredWorkDays ?? ""} onChange={(event) => setValue("requiredWorkDays", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>Số ngày vắng tối đa</span>
              <input className={fieldClass} type="number" min="0" step="0.5" placeholder="VD: 0" value={form.maxAbsentDays ?? ""} onChange={(event) => setValue("maxAbsentDays", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>Phút đi muộn tối đa</span>
              <input className={fieldClass} type="number" min="0" step="1" placeholder="VD: 15" value={form.maxLateMinutes ?? ""} onChange={(event) => setValue("maxLateMinutes", event.target.value === "" ? null : Number(event.target.value))} />
            </label>
            <label>
              <span className={labelClass}>Phút về sớm tối đa</span>
              <input className={fieldClass} type="number" min="0" step="1" placeholder="VD: 15" value={form.maxEarlyMinutes ?? ""} onChange={(event) => setValue("maxEarlyMinutes", event.target.value === "" ? null : Number(event.target.value))} />
            </label>
            <label>
              <span className={labelClass}>Hiệu lực từ <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} type="date" value={form.effectiveFrom} onChange={(event) => setValue("effectiveFrom", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>Hiệu lực đến</span>
              <input className={fieldClass} type="date" value={form.effectiveTo ?? ""} onChange={(event) => setValue("effectiveTo", event.target.value)} />
            </label>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm font-medium text-[#344054] cursor-pointer">
            <input type="checkbox" className="h-4 w-4 accent-[#006fd5]" checked={form.isActive} onChange={(event) => setValue("isActive", event.target.checked)} />
            Đang áp dụng
          </label>
        </div>
      </form>
    </Modal>
  );
}

function AllowanceModal({
  open,
  policy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  policy: AllowancePolicy | null;
  onClose: () => void;
  onSubmit: (payload: AllowancePolicyPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<AllowancePolicyPayload>(defaultAllowanceForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      policy
        ? {
            name: policy.name,
            description: policy.description ?? "",
            amount: policy.amount,
            effectiveFrom: toDateInput(policy.effectiveFrom),
            effectiveTo: toDateInput(policy.effectiveTo),
            isActive: policy.isActive,
          }
        : defaultAllowanceForm,
    );
    setError(null);
  }, [open, policy]);

  const setValue = (key: keyof AllowancePolicyPayload, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.amount || !form.effectiveFrom) {
      setError("Vui lòng nhập tên, số tiền và ngày hiệu lực.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ...form, name: form.name.trim(), description: form.description?.trim() || null });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu chính sách phụ cấp"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff]">
            <HandCoins className="h-4 w-4 text-[#006fd5]" />
          </span>
          <span>{policy ? "Chỉnh sửa phụ cấp" : "Thêm phụ cấp"}</span>
        </div>
      }
      onCancel={onClose}
      width={680}
      centered
      footer={
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:opacity-60" type="submit" form="allowancePolicyForm" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      }
    >
      <form id="allowancePolicyForm" className="grid gap-5" onSubmit={submit}>
        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            <AlertCircle className='h-4 w-4 shrink-0' />
            <span>{error}</span>
          </div>
        ) : null}
        
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
            <span className="text-sm font-semibold text-[#243247]">Thông tin phụ cấp</span>
          </div>
          <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1 mb-4">
            <label>
              <span className={labelClass}>Tên phụ cấp <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} placeholder="VD: Phụ cấp ăn trưa, xăng xe..." value={form.name} onChange={(event) => setValue("name", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>Số tiền (VNĐ) <span className="text-[#f04438]">*</span></span>
              <MoneyInput placeholder="500.000" value={form.amount} onChange={(val) => setValue("amount", val)} />
            </label>
            <label>
              <span className={labelClass}>Hiệu lực từ <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} type="date" value={form.effectiveFrom} onChange={(event) => setValue("effectiveFrom", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>Hiệu lực đến</span>
              <input className={fieldClass} type="date" value={form.effectiveTo ?? ""} onChange={(event) => setValue("effectiveTo", event.target.value)} />
            </label>
          </div>
          <label className="block mb-4">
            <span className={labelClass}>Mô tả</span>
            <textarea className={`${fieldClass} min-h-[80px] resize-y`} placeholder="Chi tiết điều kiện hưởng phụ cấp..." value={form.description ?? ""} onChange={(event) => setValue("description", event.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-[#344054] cursor-pointer">
            <input type="checkbox" className="h-4 w-4 accent-[#006fd5]" checked={form.isActive} onChange={(event) => setValue("isActive", event.target.checked)} />
            Đang áp dụng
          </label>
        </div>
      </form>
    </Modal>
  );
}

function AutoPenaltyModal({
  open,
  policy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  policy: AutoPenaltyPolicy | null;
  onClose: () => void;
  onSubmit: (payload: AutoPenaltyPolicyPayload) => Promise<void>;
}) {
  const [form, setForm] =
    useState<AutoPenaltyPolicyPayload>(defaultAutoPenaltyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isProgressive = progressiveAutoPenaltyTypes.has(form.type);

  useEffect(() => {
    if (!open) return;
    setForm(
      policy
        ? {
            type: policy.type,
            name: policy.name,
            description: policy.description ?? "",
            amount: policy.amount,
            isActive: policy.isActive,
            tiers: policy.tiers?.map((tier) => ({
              fromOccurrence: tier.fromOccurrence,
              toOccurrence: tier.toOccurrence ?? null,
              amount: tier.amount,
            })) ?? [],
          }
        : defaultAutoPenaltyForm,
    );
    setError(null);
  }, [open, policy]);

  const setValue = (
    key: keyof AutoPenaltyPolicyPayload,
    value: string | boolean | AutoPenaltyType | AutoPenaltyTier[],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const setTierValue = (
    index: number,
    key: keyof AutoPenaltyTier,
    value: string | number | null,
  ) => {
    const tiers = [...(form.tiers ?? [])];
    const current = tiers[index];
    if (!current) return;

    tiers[index] = {
      ...current,
      [key]:
        key === "amount"
          ? value
          : value === "" || value === null
            ? null
            : Number(value),
    };
    setValue("tiers", tiers);
  };

  const addTier = () => {
    const tiers = form.tiers ?? [];
    const last = tiers[tiers.length - 1];
    const nextFrom = last?.toOccurrence ? Number(last.toOccurrence) + 1 : tiers.length + 1;

    setValue("tiers", [
      ...tiers,
      { fromOccurrence: nextFrom, toOccurrence: null, amount: "" },
    ]);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || (!isProgressive && !form.amount) || (isProgressive && (!form.tiers || form.tiers.length === 0))) {
      setError("Vui lòng nhập tên chính sách và số tiền phạt.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const tiers = isProgressive
        ? (form.tiers ?? []).map((tier) => ({
            fromOccurrence: Number(tier.fromOccurrence),
            toOccurrence:
              tier.toOccurrence === null || tier.toOccurrence === undefined
                ? null
                : Number(tier.toOccurrence),
            amount: tier.amount,
          }))
        : [];

      await onSubmit({
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || null,
        amount: isProgressive ? form.amount || 0 : form.amount,
        tiers,
      });
    } catch (submitError) {
      setError(
        getErrorMessage(
          submitError,
          "Không thể lưu chính sách phạt tự động",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff]">
            <Gavel className="h-4 w-4 text-[#006fd5]" />
          </span>
          <span>Chỉnh sửa phạt tự động</span>
        </div>
      }
      onCancel={onClose}
      width={680}
      centered
      footer={
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:opacity-60" type="submit" form="autoPenaltyPolicyForm" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      }
    >
      <form id="autoPenaltyPolicyForm" className="grid gap-5" onSubmit={submit}>
        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
            <span className="text-sm font-semibold text-[#243247]">Thông tin phạt</span>
          </div>
          <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1 mb-4">
            <label>
              <span className={labelClass}>Tên chính sách <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} value={form.name} onChange={(event) => setValue("name", event.target.value)} />
            </label>
            <label>
              <span className={labelClass}>Loại phạt <span className="text-[#f04438]">*</span></span>
              <select className={fieldClass} value={form.type} onChange={(event) => setValue("type", event.target.value as AutoPenaltyType)}>
                {autoPenaltyTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={labelClass}>Số tiền phạt cơ sở (VNĐ) <span className="text-[#f04438]">*</span></span>
              <MoneyInput placeholder="50.000" value={form.amount ?? ""} onChange={(val) => setValue("amount", val)} />
            </label>
          </div>
          <label className="block mb-4">
            <span className={labelClass}>Mô tả</span>
            <textarea className={`${fieldClass} min-h-[80px] resize-y`} value={form.description ?? ""} onChange={(event) => setValue("description", event.target.value)} />
          </label>
          {isProgressive ? (
            <div className="mb-4 rounded-xl border border-[#edf0f5] bg-[#fbfcff] p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#243247]">Bậc phạt lũy tiến</span>
                <button className="rounded-lg border border-[#d0d5dd] bg-white px-3 py-1.5 text-xs font-semibold text-[#344054] transition-colors hover:bg-[#f9fafb]" type="button" onClick={addTier}>
                  Thêm bậc
                </button>
              </div>
              <div className="grid gap-3">
                {(form.tiers ?? []).map((tier, index) => (
                  <div className="grid grid-cols-[1fr_1fr_1fr_40px] items-end gap-2 max-[720px]:grid-cols-1" key={index}>
                    <label>
                      <span className="mb-1 block text-xs font-medium text-[#667085]">Từ lần/ngày</span>
                      <input className={fieldClass} min="1" type="number" value={tier.fromOccurrence} onChange={(event) => setTierValue(index, "fromOccurrence", event.target.value)} />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-medium text-[#667085]">Đến lần/ngày</span>
                      <input className={fieldClass} min="1" placeholder="Trống nếu không giới hạn" type="number" value={tier.toOccurrence ?? ""} onChange={(event) => setTierValue(index, "toOccurrence", event.target.value)} />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-medium text-[#667085]">Số tiền/bậc</span>
                      <MoneyInput value={tier.amount} onChange={(val) => setTierValue(index, "amount", val)} />
                    </label>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fef3f2] text-[#b42318] transition-colors hover:bg-[#fee4e2]" type="button" title="Xóa bậc" onClick={() => setValue("tiers", (form.tiers ?? []).filter((_, tierIndex) => tierIndex !== index))}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {(form.tiers ?? []).length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#d0d5dd] px-4 py-5 text-center text-sm text-[#667085]">
                    Chưa có bậc phạt
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          <label className="flex items-center gap-2 text-sm font-medium text-[#344054] cursor-pointer">
            <input type="checkbox" className="h-4 w-4 accent-[#006fd5]" checked={form.isActive} onChange={(event) => setValue("isActive", event.target.checked)} />
            Đang áp dụng
          </label>
        </div>
      </form>
    </Modal>
  );
}

function AssignmentModal({
  open,
  type,
  policies,
  departments,
  positions,
  onClose,
  onSubmit,
}: {
  open: boolean;
  type: TabKey;
  policies: EditablePolicy[];
  departments: Department[];
  positions: EmployeeOption[];
  onClose: () => void;
  onSubmit: (
    payload: PayrollPolicyAssignmentPayload & {
      allowancePolicyId?: string;
      autoPenaltyPolicyId?: string;
    },
  ) => Promise<void>;
}) {
  const [policyId, setPolicyId] = useState("");
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [positionIds, setPositionIds] = useState<string[]>([]);
  const [insuranceSalary, setInsuranceSalary] = useState("");
  const [dependentCount, setDependentCount] = useState("0");
  const [taxCode, setTaxCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPolicyId("");
    setDepartmentIds([]);
    setPositionIds([]);
    setInsuranceSalary("");
    setDependentCount("0");
    setTaxCode("");
    setError(null);
  }, [open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!policyId || departmentIds.length === 0 || positionIds.length === 0) {
      setError("Vui lòng chọn chính sách, bộ phận và chức vụ áp dụng.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (type === "insurance") {
        await onSubmit({
          departmentIds,
          positionIds,
          insurancePolicyId: policyId,
          isInsuranceApplicable: true,
          insuranceSalary: insuranceSalary || null,
        });
      } else if (type === "tax") {
        await onSubmit({
          departmentIds,
          positionIds,
          taxPolicyId: policyId,
          isTaxApplicable: true,
          dependentCount: Number(dependentCount) || 0,
          taxCode: taxCode || null,
        });
      } else if (type === "attendanceBonus") {
        await onSubmit({
          departmentIds,
          positionIds,
          attendanceBonusPolicyId: policyId,
          isAttendanceBonusApplicable: true,
        });
      } else if (type === "allowances") {
        await onSubmit({ departmentIds, positionIds, allowancePolicyId: policyId });
      } else {
        await onSubmit({
          departmentIds,
          positionIds,
          autoPenaltyPolicyId: policyId,
        });
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể áp dụng chính sách"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff]">
            <Users className="h-4 w-4 text-[#006fd5]" />
          </span>
          <span>Áp dụng chính sách cho nhân viên</span>
        </div>
      }
      onCancel={onClose}
      width={720}
      centered
      footer={
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:opacity-60" type="submit" form="assignmentForm" disabled={submitting}>
            {submitting ? "Đang áp dụng..." : "Áp dụng"}
          </button>
        </div>
      }
    >
      <form id="assignmentForm" className="grid gap-5" onSubmit={submit}>
        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            <AlertCircle className='h-4 w-4 shrink-0' />
            <span>{error}</span>
          </div>
        ) : null}
        
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
            <span className="text-sm font-semibold text-[#243247]">Chọn chính sách & đối tượng áp dụng</span>
          </div>
          <div className="grid gap-4 mb-2">
            <label>
              <span className={labelClass}>Chính sách <span className="text-[#f04438]">*</span></span>
              <select className={fieldClass} value={policyId} onChange={(event) => setPolicyId(event.target.value)}>
                <option value="">Chọn chính sách</option>
                {policies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
              <div>
                <span className={labelClass}>Bộ phận áp dụng <span className="text-[#f04438]">*</span></span>
                <SearchableSelect
                  mode="multiple"
                  placeholder="Chọn bộ phận..."
                  value={departmentIds}
                  onChange={(val: string[]) => setDepartmentIds(val || [])}
                  options={departments.map((d) => ({ value: d.id, label: d.name }))}
                />
              </div>
              <div>
                <span className={labelClass}>Chức vụ áp dụng <span className="text-[#f04438]">*</span></span>
                <SearchableSelect
                  mode="multiple"
                  placeholder="Chọn chức vụ..."
                  value={positionIds}
                  onChange={(val: string[]) => setPositionIds(val || [])}
                  options={positions.map((p) => ({ value: p.id, label: p.name }))}
                />
              </div>
            </div>
          </div>
        </div>

        {type === "insurance" ? (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
              <span className="text-sm font-semibold text-[#243247]">Thông tin bổ sung</span>
            </div>
            <label>
              <span className={labelClass}>Lương tính bảo hiểm (VNĐ)</span>
              <MoneyInput placeholder="Trống nếu tính theo lương cơ bản" value={insuranceSalary} onChange={(val) => setInsuranceSalary(val)} />
            </label>
          </div>
        ) : null}

        {type === "tax" ? (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
              <span className="text-sm font-semibold text-[#243247]">Thông tin giảm trừ & mã số thuế</span>
            </div>
            <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
              <label>
                <span className={labelClass}>Số người phụ thuộc</span>
                <input className={fieldClass} type="number" min="0" placeholder="0" value={dependentCount} onChange={(event) => setDependentCount(event.target.value)} />
              </label>
              <label>
                <span className={labelClass}>Mã số thuế</span>
                <input className={fieldClass} placeholder="VD: 0102030405..." value={taxCode} onChange={(event) => setTaxCode(event.target.value)} />
              </label>
            </div>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}

function BonusPenaltyModal({
  open,
  employees,
  onClose,
  onSubmit,
}: {
  open: boolean;
  employees: EmployeeOption[];
  onClose: () => void;
  onSubmit: (payload: {
    employeeId: string;
    month: string;
    amount: string;
    isBonus: boolean;
    reason?: string | null;
  }) => Promise<void>;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState("");
  const [isBonus, setIsBonus] = useState(true);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmployeeId("");
    setMonth(new Date().toISOString().slice(0, 7));
    setAmount("");
    setIsBonus(true);
    setReason("");
  }, [open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        employeeId,
        month: `${month}-01`,
        amount,
        isBonus,
        reason: reason.trim() || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Tạo phiếu thưởng/phạt" open={open} onCancel={onClose} footer={null} width={560}>
      <form className="grid gap-4" onSubmit={submit}>
        <label>
          <span className={labelClass}>Nhân viên <span className="text-[#f04438]">*</span></span>
          <SearchableSelect
            placeholder="Chọn nhân viên..."
            value={employeeId || undefined}
            onChange={(value: string) => setEmployeeId(value)}
            options={employees.map((employee) => ({ value: employee.id, label: employee.name }))}
          />
        </label>
        <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          <label>
            <span className={labelClass}>Tháng áp dụng</span>
            <input className={fieldClass} type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </label>
          <label>
            <span className={labelClass}>Loại phiếu</span>
            <select className={fieldClass} value={isBonus ? "bonus" : "penalty"} onChange={(event) => setIsBonus(event.target.value === "bonus")}>
              <option value="bonus">Thưởng</option>
              <option value="penalty">Phạt</option>
            </select>
          </label>
        </div>
        <label>
          <span className={labelClass}>Số tiền <span className="text-[#f04438]">*</span></span>
          <MoneyInput value={amount} onChange={setAmount} placeholder="Nhập số tiền" />
        </label>
        <label>
          <span className={labelClass}>Lý do</span>
          <textarea className={fieldClass} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-semibold text-[#344054]" type="button" onClick={onClose}>Đóng</button>
          <button className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" type="submit" disabled={submitting || !employeeId || !amount}>Lưu phiếu</button>
        </div>
      </form>
    </Modal>
  );
}

export function PayrollPolicyPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("insurance");
  const [status, setStatus] = useState<PolicyStatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [taxPolicies, setTaxPolicies] = useState<TaxPolicy[]>([]);
  const [attendanceBonusPolicies, setAttendanceBonusPolicies] = useState<AttendanceBonusPolicy[]>([]);
  const [allowancePolicies, setAllowancePolicies] = useState<AllowancePolicy[]>([]);
  const [autoPenaltyPolicies, setAutoPenaltyPolicies] = useState<AutoPenaltyPolicy[]>([]);
  const [bonusPenalties, setBonusPenalties] = useState<PayrollBonusPenalty[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [insuranceOpen, setInsuranceOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);
  const [attendanceBonusOpen, setAttendanceBonusOpen] = useState(false);
  const [allowanceOpen, setAllowanceOpen] = useState(false);
  const [autoPenaltyOpen, setAutoPenaltyOpen] = useState(false);
  const [bonusPenaltyOpen, setBonusPenaltyOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<InsurancePolicy | null>(null);
  const [selectedTax, setSelectedTax] = useState<TaxPolicy | null>(null);
  const [selectedAttendanceBonus, setSelectedAttendanceBonus] =
    useState<AttendanceBonusPolicy | null>(null);
  const [selectedAllowance, setSelectedAllowance] = useState<AllowancePolicy | null>(null);
  const [selectedAutoPenalty, setSelectedAutoPenalty] =
    useState<AutoPenaltyPolicy | null>(null);

  const activePolicies = useMemo(() => {
    const source =
      activeTab === "insurance"
        ? insurancePolicies
        : activeTab === "tax"
          ? taxPolicies
          : activeTab === "allowances"
            ? allowancePolicies
            : activeTab === "attendanceBonus"
              ? attendanceBonusPolicies
              : autoPenaltyPolicies;
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return source;
    return source.filter((policy) =>
      [policy.name, "description" in policy ? policy.description : ""]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [
    activeTab,
    allowancePolicies,
    attendanceBonusPolicies,
    autoPenaltyPolicies,
    insurancePolicies,
    searchTerm,
    taxPolicies,
  ]);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [
        insurance,
        tax,
        attendanceBonus,
        allowances,
        autoPenalties,
        vouchers,
        employeePage,
        departmentOptions,
        positionOptions,
      ] =
        await Promise.all([
          payrollPolicyService.getInsurancePolicies(status),
          payrollPolicyService.getTaxPolicies(status),
          payrollPolicyService.getAttendanceBonusPolicies(status),
          payrollPolicyService.getAllowancePolicies(status),
          payrollPolicyService.getAutoPenaltyPolicies(status),
          payrollPolicyService.getPayrollBonusPenalties(),
          employeeService.getEmployees({
            page: 1,
            limit: -1,
            search: "",
            departmentId: "",
            positionId: "",
          }),
          employeeService.getDepartments(),
          employeeService.getPositions(),
        ]);
      setInsurancePolicies(insurance);
      setTaxPolicies(tax);
      setAttendanceBonusPolicies(attendanceBonus);
      setAllowancePolicies(allowances);
      setAutoPenaltyPolicies(autoPenalties);
      setBonusPenalties(vouchers);
      setEmployees(
        (employeePage?.items ?? []).map((employee) => ({
          id: employee.id,
          name: employee.name,
        })),
      );
      setDepartments(departmentOptions as Department[]);
      setPositions(positionOptions);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không tải được dữ liệu chính sách"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [status]);

  const openAdd = () => {
    setSelectedInsurance(null);
    setSelectedTax(null);
    setSelectedAttendanceBonus(null);
    setSelectedAllowance(null);
    setSelectedAutoPenalty(null);
    if (activeTab === "insurance") setInsuranceOpen(true);
    if (activeTab === "tax") setTaxOpen(true);
    if (activeTab === "attendanceBonus") setAttendanceBonusOpen(true);
    if (activeTab === "allowances") setAllowanceOpen(true);
    if (activeTab === "autoPenalties") setAutoPenaltyOpen(true);
    if (activeTab === "bonusPenalties") setBonusPenaltyOpen(true);
  };

  const deletePolicy = (policy: EditablePolicy) => {
    Modal.confirm({
      title: "Xóa chính sách",
      content: `Bạn có chắc chắn muốn xóa "${policy.name}"?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        if (activeTab === "insurance") await payrollPolicyService.deleteInsurancePolicy(policy.id);
        if (activeTab === "tax") await payrollPolicyService.deleteTaxPolicy(policy.id);
        if (activeTab === "attendanceBonus") await payrollPolicyService.deleteAttendanceBonusPolicy(policy.id);
        if (activeTab === "allowances") await payrollPolicyService.deleteAllowancePolicy(policy.id);
        if (activeTab === "autoPenalties") await payrollPolicyService.deleteAutoPenaltyPolicy(policy.id);
        await loadData();
      },
    });
  };

  const submitAssignment = async (
    payload: PayrollPolicyAssignmentPayload & {
      allowancePolicyId?: string;
      autoPenaltyPolicyId?: string;
    },
  ) => {
    if (activeTab === "allowances" && payload.allowancePolicyId) {
      await payrollPolicyService.assignAllowancePolicy({
        allowancePolicyId: payload.allowancePolicyId,
        departmentIds: payload.departmentIds,
        positionIds: payload.positionIds,
      });
    } else if (activeTab === "autoPenalties" && payload.autoPenaltyPolicyId) {
      await payrollPolicyService.assignAutoPenaltyPolicy({
        autoPenaltyPolicyId: payload.autoPenaltyPolicyId,
        departmentIds: payload.departmentIds,
        positionIds: payload.positionIds,
      });
    } else {
      await payrollPolicyService.assignPayrollPolicies(payload);
    }
    setAssignmentOpen(false);
  };

  const visibleBonusPenalties = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return bonusPenalties;

    return bonusPenalties.filter((item) =>
      [
        item.employee?.name,
        item.employee?.employeeId,
        item.reason,
        item.autoPenaltyPolicy?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [bonusPenalties, searchTerm]);

  const cancelVoucher = (item: PayrollBonusPenalty) => {
    Modal.confirm({
      title: "Hủy phiếu thưởng/phạt",
      content: `Bạn có chắc chắn muốn hủy phiếu "${item.reason || item.id}"?`,
      okText: "Hủy phiếu",
      cancelText: "Đóng",
      okButtonProps: { danger: true },
      onOk: async () => {
        await payrollPolicyService.cancelPayrollBonusPenalty(item.id);
        await loadData();
      },
    });
  };

  const renderBonusPenaltyRows = () => {
    if (loading) return <EmptyState text="Đang tải dữ liệu..." />;
    if (visibleBonusPenalties.length === 0) return <EmptyState text="Chưa có phiếu thưởng/phạt phù hợp" />;

    return (
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <table className="w-full min-w-[900px]">
          <thead className="sticky top-0 z-1">
            <tr className="border-b border-[#ebedf2] bg-[#f9fafb]">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Nhân viên</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Loại phiếu</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Tháng áp dụng</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Lý do</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#667085]">Số tiền</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Trạng thái</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[#667085]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebedf2]">
            {visibleBonusPenalties.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-[#f9fafb]">
                <td className="px-5 py-4">
                  <strong className="block text-sm font-semibold text-[#243247]">{item.employee?.name ?? "-"}</strong>
                  <span className="text-xs text-[#667085]">{item.employee?.employeeId ?? ""}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${item.isBonus ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#fff4ed] text-[#b54708]"}`}>
                    {item.isBonus ? "Thưởng" : "Phạt"} · {item.source === "AUTO" ? "Tự động" : "Thủ công"}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-[#344054]">{formatDate(item.month)}</td>
                <td className="px-5 py-4 text-sm text-[#344054]">{item.reason || item.autoPenaltyPolicy?.name || "-"}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-[#243247]">{formatMoney(item.amount)}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${item.status === "ACTIVE" ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#f2f4f7] text-[#667085]"}`}>
                    {item.status === "ACTIVE" ? "Hiệu lực" : "Đã hủy"}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3f2] text-[#b42318] transition-colors hover:bg-[#fee4e2] disabled:cursor-not-allowed disabled:opacity-40" type="button" title="Hủy phiếu" disabled={item.status === "CANCELLED"} onClick={() => cancelVoucher(item)}>
                    <Ban className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRows = () => {
    if (activeTab === "bonusPenalties") return renderBonusPenaltyRows();
    if (loading) return <EmptyState text="Đang tải dữ liệu..." />;
    if (activePolicies.length === 0) return <EmptyState text="Chưa có chính sách phù hợp" />;

    return (
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <table className="w-full min-w-[760px]">
          <thead className="sticky top-0 z-1">
            <tr className="border-b border-[#ebedf2] bg-[#f9fafb]">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Chính sách</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Thông số chính</th>
              {activeTab !== "autoPenalties" && (
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Thời gian áp dụng</th>
              )}
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Trạng thái</th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[#667085]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebedf2]">
            {activePolicies.map((policy) => (
              <tr className="transition-colors hover:bg-[#f9fafb]" key={policy.id}>
                <td className="px-5 py-4">
                  <strong className="block text-sm font-semibold text-[#243247]">{policy.name}</strong>
                  {"description" in policy && policy.description ? (
                    <span className="mt-1 block line-clamp-2 text-xs text-[#667085]">{policy.description}</span>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-sm text-[#344054]">
                  {activeTab === "insurance" ? (
                    <div className="grid gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="w-20 font-medium text-[#667085]">Nhân viên:</span>
                        <span className="inline-flex items-center rounded-md bg-[#f0f7ff] px-2 py-0.5 font-medium text-[#006fd5]">
                          BHXH {formatPercent((policy as InsurancePolicy).employeeSocialRate)}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-[#f0f7ff] px-2 py-0.5 font-medium text-[#006fd5]">
                          BHYT {formatPercent((policy as InsurancePolicy).employeeHealthRate)}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-[#f0f7ff] px-2 py-0.5 font-medium text-[#006fd5]">
                          BHTN {formatPercent((policy as InsurancePolicy).employeeUnemploymentRate)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="w-20 font-medium text-[#667085]">Công ty:</span>
                        <span className="inline-flex items-center rounded-md bg-[#f8f9fa] px-2 py-0.5 font-medium text-[#344054]">
                          BHXH {formatPercent((policy as InsurancePolicy).employerSocialRate)}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-[#f8f9fa] px-2 py-0.5 font-medium text-[#344054]">
                          BHYT {formatPercent((policy as InsurancePolicy).employerHealthRate)}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-[#f8f9fa] px-2 py-0.5 font-medium text-[#344054]">
                          BHTN {formatPercent((policy as InsurancePolicy).employerUnemploymentRate)}
                        </span>
                      </div>
                    </div>
                  ) : activeTab === "tax" ? (
                    <div className="grid gap-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center rounded-md bg-[#f0f7ff] px-2.5 py-1 font-medium text-[#006fd5]">
                          Bản thân: {formatMoney((policy as TaxPolicy).personalDeduction)}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-[#f0f7ff] px-2.5 py-1 font-medium text-[#006fd5]">
                          Phụ thuộc: {formatMoney((policy as TaxPolicy).dependentDeduction)}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[#667085]">
                        Bao gồm <span className="font-semibold text-[#344054]">{(policy as TaxPolicy).brackets.length}</span> bậc thuế (từ {(policy as TaxPolicy).brackets[0]?.rate ?? 0}% đến {(policy as TaxPolicy).brackets[(policy as TaxPolicy).brackets.length - 1]?.rate ?? 0}%)
                      </div>
                    </div>
                  ) : activeTab === "attendanceBonus" ? (
                    <div className="grid gap-1.5">
                      <div className="inline-flex w-fit items-center rounded-lg bg-[#ecfdf3] px-3 py-1 text-sm font-semibold text-[#027a48]">
                        {formatMoney((policy as AttendanceBonusPolicy).amount)}
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-xs text-[#667085]">
                        <span className="rounded-md bg-[#f8f9fa] px-2 py-0.5">
                          Công: {(policy as AttendanceBonusPolicy).requiredWorkDays ?? "-"}
                        </span>
                        <span className="rounded-md bg-[#f8f9fa] px-2 py-0.5">
                          Muộn: {(policy as AttendanceBonusPolicy).maxLateMinutes ?? "-"} phút
                        </span>
                        <span className="rounded-md bg-[#f8f9fa] px-2 py-0.5">
                          Về sớm: {(policy as AttendanceBonusPolicy).maxEarlyMinutes ?? "-"} phút
                        </span>
                        <span className="rounded-md bg-[#f8f9fa] px-2 py-0.5">
                          Vắng: {(policy as AttendanceBonusPolicy).maxAbsentDays ?? "-"} ngày
                        </span>
                      </div>
                    </div>
                  ) : activeTab === "allowances" ? (
                    <div className="inline-flex items-center rounded-lg bg-[#ecfdf3] px-3 py-1 text-sm font-semibold text-[#027a48]">
                      {formatMoney((policy as AllowancePolicy).amount)}
                    </div>
                  ) : (
                    <div className="grid gap-1.5">
                      <div className="text-xs font-semibold text-[#667085]">
                        {getAutoPenaltyTypeLabel((policy as AutoPenaltyPolicy).type)}
                      </div>
                      {progressiveAutoPenaltyTypes.has((policy as AutoPenaltyPolicy).type) ? (
                        <div className="text-xs text-[#667085]">
                          {(policy as AutoPenaltyPolicy).tiers?.length ?? 0} bậc phạt
                        </div>
                      ) : (
                        <div className="inline-flex w-fit items-center rounded-lg bg-[#fff4ed] px-3 py-1 text-sm font-semibold text-[#b54708]">
                          {formatMoney((policy as AutoPenaltyPolicy).amount)}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                {activeTab !== "autoPenalties" && (
                  <td className="px-5 py-4 text-sm text-[#344054]">
                    <div className="font-medium text-[#243247]">{formatDate(policy.effectiveFrom)}</div>
                    <div className="text-xs text-[#667085]">{policy.effectiveTo ? `Đến ${formatDate(policy.effectiveTo)}` : "Không giới hạn"}</div>
                  </td>
                )}
                <td className="px-5 py-4">
                  <StatusBadge active={policy.isActive} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f7ff] text-[#006fd5] transition-colors hover:bg-[#006fd5] hover:text-white!"
                      type="button"
                      title="Sửa"
                      onClick={() => {
                        if (activeTab === "insurance") {
                          setSelectedInsurance(policy as InsurancePolicy);
                          setInsuranceOpen(true);
                        } else if (activeTab === "tax") {
                          setSelectedTax(policy as TaxPolicy);
                          setTaxOpen(true);
                        } else if (activeTab === "attendanceBonus") {
                          setSelectedAttendanceBonus(policy as AttendanceBonusPolicy);
                          setAttendanceBonusOpen(true);
                        } else if (activeTab === "allowances") {
                          setSelectedAllowance(policy as AllowancePolicy);
                          setAllowanceOpen(true);
                        } else {
                          setSelectedAutoPenalty(policy as AutoPenaltyPolicy);
                          setAutoPenaltyOpen(true);
                        }
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3f2] text-[#b42318] transition-colors hover:bg-[#fee4e2]" type="button" title="Xóa" onClick={() => deletePolicy(policy)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-y-auto bg-[#f1f5f9]">
        <div className="flex min-h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">Chính sách lương</h1>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-sm transition-shadow hover:shadow-md">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`flex min-h-10 shrink-0 items-center gap-2.5 rounded-lg px-5 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-[#006fd5] to-[#005baf] text-white! shadow-md"
                    : "text-[#667085]! hover:bg-[#f0f7ff] hover:text-[#006fd5]!"
                }`}
                onClick={() => {
                  setErrorMessage(null);
                  setActiveTab(tab.key);
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative min-w-[260px] flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#667085]" />
                <input className="w-full rounded-lg border border-[#d0d5dd] bg-white py-2 pl-9 pr-3 text-sm text-[#344054] placeholder-[#98a2b3] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10" placeholder="Tìm kiếm chính sách..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
              </div>
              <select className="rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10" value={status} onChange={(event) => setStatus(event.target.value as PolicyStatusFilter)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang áp dụng</option>
                <option value="inactive">Tạm dừng</option>
              </select>
              <button className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d0d5dd] text-[#344054] transition-all hover:border-[#006fd5] hover:bg-[#f0f7ff] hover:text-[#006fd5] hover:shadow-sm active:bg-[#e6f0fa]" type="button" title="Tải lại" onClick={() => void loadData()}>
                <RefreshCcw className="h-4.5 w-4.5 transition-transform duration-300 group-hover:-rotate-180" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-4 py-2 text-sm font-semibold text-[#344054] shadow-xs transition-all hover:border-[#006fd5] hover:bg-[#f0f7ff] hover:text-[#006fd5] active:bg-[#e6f0fa] disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={activeTab === "bonusPenalties"} onClick={() => setAssignmentOpen(true)}>
                <Users className="h-4 w-4" />
                Áp dụng chính sách
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! shadow-xs transition-colors hover:bg-[#0055a8] active:bg-[#003f7a]" type="button" onClick={openAdd}>
                <Plus className="h-4 w-4" />
                Thêm chính sách
              </button>
            </div>
          </div>

          {errorMessage ? <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">{errorMessage}</div> : null}

          {/* Table Section */}
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm transition-shadow hover:shadow-md">
            {renderRows()}
            <div className="shrink-0 border-t border-[#ebedf2] px-5 py-3.5 text-sm font-medium text-[#667085]">
              Hiển thị {activePolicies.length} chính sách
            </div>
          </section>
        </div>
      </main>

      <InsuranceModal
        open={insuranceOpen}
        policy={selectedInsurance}
        onClose={() => setInsuranceOpen(false)}
        onSubmit={async (payload) => {
          if (selectedInsurance) await payrollPolicyService.updateInsurancePolicy(selectedInsurance.id, payload);
          else await payrollPolicyService.createInsurancePolicy(payload);
          setInsuranceOpen(false);
          await loadData();
        }}
      />
      <TaxModal
        open={taxOpen}
        policy={selectedTax}
        onClose={() => setTaxOpen(false)}
        onSubmit={async (payload) => {
          if (selectedTax) await payrollPolicyService.updateTaxPolicy(selectedTax.id, payload);
          else await payrollPolicyService.createTaxPolicy(payload);
          setTaxOpen(false);
          await loadData();
        }}
      />
      <AttendanceBonusModal
        open={attendanceBonusOpen}
        policy={selectedAttendanceBonus}
        onClose={() => setAttendanceBonusOpen(false)}
        onSubmit={async (payload) => {
          if (selectedAttendanceBonus) {
            await payrollPolicyService.updateAttendanceBonusPolicy(
              selectedAttendanceBonus.id,
              payload,
            );
          } else {
            await payrollPolicyService.createAttendanceBonusPolicy(payload);
          }
          setAttendanceBonusOpen(false);
          await loadData();
        }}
      />
      <AllowanceModal
        open={allowanceOpen}
        policy={selectedAllowance}
        onClose={() => setAllowanceOpen(false)}
        onSubmit={async (payload) => {
          if (selectedAllowance) await payrollPolicyService.updateAllowancePolicy(selectedAllowance.id, payload);
          else await payrollPolicyService.createAllowancePolicy(payload);
          setAllowanceOpen(false);
          await loadData();
        }}
      />
      <AutoPenaltyModal
        open={autoPenaltyOpen}
        policy={selectedAutoPenalty}
        onClose={() => setAutoPenaltyOpen(false)}
        onSubmit={async (payload) => {
          if (selectedAutoPenalty) {
            await payrollPolicyService.updateAutoPenaltyPolicy(
              selectedAutoPenalty.id,
              payload,
            );
          } else {
            await payrollPolicyService.createAutoPenaltyPolicy(payload);
          }
          setAutoPenaltyOpen(false);
          await loadData();
        }}
      />
      <BonusPenaltyModal
        open={bonusPenaltyOpen}
        employees={employees}
        onClose={() => setBonusPenaltyOpen(false)}
        onSubmit={async (payload) => {
          await payrollPolicyService.createPayrollBonusPenalty(payload);
          setBonusPenaltyOpen(false);
          await loadData();
        }}
      />
      <AssignmentModal
        open={assignmentOpen}
        type={activeTab}
        policies={
          activeTab === "insurance"
            ? insurancePolicies
            : activeTab === "tax"
              ? taxPolicies
              : activeTab === "attendanceBonus"
                ? attendanceBonusPolicies
                : activeTab === "allowances"
                  ? allowancePolicies
                  : autoPenaltyPolicies
        }
        departments={departments}
        positions={positions}
        onClose={() => setAssignmentOpen(false)}
        onSubmit={submitAssignment}
      />
    </AppLayout>
  );
}
