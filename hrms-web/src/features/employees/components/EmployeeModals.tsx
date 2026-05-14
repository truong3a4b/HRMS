import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Modal } from "antd";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import type {
  CreateEmployeePayload,
  Employee,
  EmployeeOption,
  EmployeeStatus,
  UpdateEmployeeBasicPayload,
  UpdateEmployeeJobPayload,
} from "../types/employee.types";

type EmployeeModalProps = {
  open: boolean;
  departments: EmployeeOption[];
  positions: EmployeeOption[];
  onClose: () => void;
  onSubmit: (payload: CreateEmployeePayload) => Promise<void>;
};

type EmployeeEditModalProps = {
  open: boolean;
  employee: Employee | null;
  departments: EmployeeOption[];
  positions: EmployeeOption[];
  onClose: () => void;
  onSubmit: (
    id: string,
    basicPayload: UpdateEmployeeBasicPayload,
    jobPayload: UpdateEmployeeJobPayload,
  ) => Promise<void>;
};

type EmployeeDetailModalProps = {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
};

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";

const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  bankAccount: "",
  departmentId: "",
  positionId: "",
  hireDate: "",
  salary: "",
  status: "WORKING" as EmployeeStatus,
  effectiveFrom: "",
};

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

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

    if (data.message) {
      return data.message;
    }
  }

  return "Không thể lưu thông tin nhân viên";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function FormActions({
  submitText,
  isSubmitting,
  onClose,
}: {
  submitText: string;
  isSubmitting: boolean;
  onClose: () => void;
}) {
  return (
    <div className="mt-6 flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
      <button
        className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
        type="button"
        onClick={onClose}
      >
        Hủy
      </button>
      <button
        className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Đang lưu..." : submitText}
      </button>
    </div>
  );
}

export function AddEmployeeModal({
  open,
  departments,
  positions,
  onClose,
  onSubmit,
}: EmployeeModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, status: "WORKING", effectiveFrom: todayInput() });
      setError(null);
    }
  }, [open]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const salary = Number(form.salary);
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.departmentId ||
      !form.positionId ||
      !form.hireDate ||
      Number.isNaN(salary)
    ) {
      setError(
        "Vui lòng nhập đủ họ tên, email, bộ phận, chức vụ, ngày vào làm và lương.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateEmployeePayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: (form.gender || undefined) as CreateEmployeePayload["gender"],
        address: form.address.trim() || undefined,
        bankAccount: form.bankAccount.trim() || undefined,
        departmentId: form.departmentId,
        positionId: form.positionId,
        hireDate: form.hireDate,
        salary,
      };

      await onSubmit(payload);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Thêm nhân viên"
      footer={null}
      onCancel={onClose}
      width={760}
    >
      <form onSubmit={handleSubmit}>
        {error ? (
          <div className="mb-4 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
          <Field label="Họ và tên">
            <input
              className={fieldClass}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              className={fieldClass}
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
          <Field label="Số điện thoại">
            <input
              className={fieldClass}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>
          <Field label="Ngày sinh">
            <input
              className={fieldClass}
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
            />
          </Field>
          <Field label="Giới tính">
            <select
              className={fieldClass}
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
            >
              <option value="">Chưa chọn</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </Field>
          <Field label="Địa chỉ">
            <input
              className={fieldClass}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </Field>
          <Field label="Bộ phận">
            <select
              className={fieldClass}
              value={form.departmentId}
              onChange={(e) => update("departmentId", e.target.value)}
            >
              <option value="">Chọn bộ phận</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Chức vụ">
            <select
              className={fieldClass}
              value={form.positionId}
              onChange={(e) => update("positionId", e.target.value)}
            >
              <option value="">Chọn chức vụ</option>
              {positions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ngày vào làm">
            <input
              className={fieldClass}
              type="date"
              value={form.hireDate}
              onChange={(e) => update("hireDate", e.target.value)}
            />
          </Field>
          <Field label="Lương">
            <input
              className={fieldClass}
              type="number"
              min={0}
              value={form.salary}
              onChange={(e) => update("salary", e.target.value)}
            />
          </Field>
          <Field label="Số tài khoản">
            <input
              className={fieldClass}
              value={form.bankAccount}
              onChange={(e) => update("bankAccount", e.target.value)}
            />
          </Field>
        </div>
        <FormActions
          submitText="Thêm nhân viên"
          isSubmitting={isSubmitting}
          onClose={onClose}
        />
      </form>
    </Modal>
  );
}

export function EmployeeDetailModal({
  open,
  employee,
  onClose,
  onEdit,
}: EmployeeDetailModalProps) {
  const rows = useMemo(
    () =>
      employee
        ? [
            ["Mã nhân viên", employee.employeeId],
            ["Họ và tên", employee.name],
            ["Email", employee.email],
            ["Số điện thoại", employee.phone || "-"],
            ["Bộ phận", employee.department?.name || "-"],
            ["Chức vụ", employee.position?.name || "-"],
            ["Ngày vào làm", toDateInput(employee.hireDate) || "-"],
            ["Lương", employee.salary != null ? String(employee.salary) : "-"],
            ["Địa chỉ", employee.address || "-"],
            ["Số tài khoản", employee.bankAccount || "-"],
          ]
        : [],
    [employee],
  );

  return (
    <Modal
      open={open}
      title="Chi tiết nhân viên"
      footer={null}
      onCancel={onClose}
      width={720}
    >
      {employee ? (
        <>
          <div className="mb-5 flex items-center gap-4">
            <Avatar
              src={employee.avatar}
              alt={employee.name}
              sizeClass="h-14 w-14"
            />
            <div className="min-w-0">
              <strong className="block truncate text-lg text-[#172033]">
                {employee.name}
              </strong>
              <span className="text-sm text-[#667085]">
                {employee.position?.name || "-"} |{" "}
                {employee.department?.name || "-"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
            {rows.map(([label, value]) => (
              <div
                className="rounded-lg border border-[#edf0f5] bg-[#fbfcff] p-3"
                key={label}
              >
                <span className="block text-xs text-[#667085]">{label}</span>
                <strong className="mt-1 block truncate text-sm font-semibold text-[#243247]">
                  {value}
                </strong>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054]"
              type="button"
              onClick={onClose}
            >
              Đóng
            </button>
            <button
              className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white"
              type="button"
              onClick={() => onEdit(employee)}
            >
              Chỉnh sửa
            </button>
          </div>
        </>
      ) : (
        <div className="py-10 text-center text-[#667085]">Không có dữ liệu</div>
      )}
    </Modal>
  );
}

export function EditEmployeeModal({
  open,
  employee,
  departments,
  positions,
  onClose,
  onSubmit,
}: EmployeeEditModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && employee) {
      setForm({
        ...emptyForm,
        name: employee.name,
        email: employee.email,
        phone: employee.phone ?? "",
        dateOfBirth: toDateInput(employee.dateOfBirth),
        gender: employee.gender ?? "",
        address: employee.address ?? "",
        bankAccount: employee.bankAccount ?? "",
        departmentId: employee.departmentId ?? employee.department?.id ?? "",
        positionId: employee.positionId ?? employee.position?.id ?? "",
        hireDate: toDateInput(employee.hireDate),
        salary: employee.salary != null ? String(employee.salary) : "",
        status: employee.status,
        effectiveFrom: todayInput(),
      });
      setError(null);
    }
  }, [employee, open]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!employee) return;

    const salary = Number(form.salary);
    if (
      !form.name.trim() ||
      !form.departmentId ||
      !form.positionId ||
      !form.hireDate ||
      !form.effectiveFrom ||
      Number.isNaN(salary)
    ) {
      setError(
        "Vui lòng nhập đủ họ tên, bộ phận, chức vụ, ngày vào làm, ngày hiệu lực và lương.",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(
        employee.id,
        {
          name: form.name.trim(),
          phone: form.phone.trim() || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: (form.gender ||
            undefined) as UpdateEmployeeBasicPayload["gender"],
          address: form.address.trim() || undefined,
          bankAccount: form.bankAccount.trim() || undefined,
        },
        {
          departmentId: form.departmentId,
          positionId: form.positionId,
          hireDate: form.hireDate,
          salary,
          status: form.status,
          effectiveFrom: form.effectiveFrom,
        },
      );
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Chỉnh sửa nhân viên"
      footer={null}
      onCancel={onClose}
      width={760}
    >
      <form onSubmit={handleSubmit}>
        {error ? (
          <div className="mb-4 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
          <Field label="Mã nhân viên">
            <input
              className={`${fieldClass} bg-[#f9fafb]`}
              value={employee?.employeeId ?? ""}
              disabled
            />
          </Field>
          <Field label="Email">
            <input
              className={`${fieldClass} bg-[#f9fafb]`}
              value={form.email}
              disabled
            />
          </Field>
          <Field label="Họ và tên">
            <input
              className={fieldClass}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>
          <Field label="Số điện thoại">
            <input
              className={fieldClass}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>
          <Field label="Ngày sinh">
            <input
              className={fieldClass}
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
            />
          </Field>
          <Field label="Giới tính">
            <select
              className={fieldClass}
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
            >
              <option value="">Chưa chọn</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </Field>
          <Field label="Địa chỉ">
            <input
              className={fieldClass}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </Field>
          <Field label="Số tài khoản">
            <input
              className={fieldClass}
              value={form.bankAccount}
              onChange={(e) => update("bankAccount", e.target.value)}
            />
          </Field>
          <Field label="Bộ phận">
            <select
              className={fieldClass}
              value={form.departmentId}
              onChange={(e) => update("departmentId", e.target.value)}
            >
              <option value="">Chọn bộ phận</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Chức vụ">
            <select
              className={fieldClass}
              value={form.positionId}
              onChange={(e) => update("positionId", e.target.value)}
            >
              <option value="">Chọn chức vụ</option>
              {positions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ngày vào làm">
            <input
              className={fieldClass}
              type="date"
              value={form.hireDate}
              onChange={(e) => update("hireDate", e.target.value)}
            />
          </Field>
          <Field label="Lương">
            <input
              className={fieldClass}
              type="number"
              min={0}
              value={form.salary}
              onChange={(e) => update("salary", e.target.value)}
            />
          </Field>
          <Field label="Trạng thái">
            <select
              className={fieldClass}
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="WORKING">Đang làm việc</option>
              <option value="ON_LEAVE">Đang nghỉ phép</option>
              <option value="RESIGNED">Đã nghỉ việc</option>
            </select>
          </Field>
          <Field label="Ngày hiệu lực thay đổi">
            <input
              className={fieldClass}
              type="date"
              value={form.effectiveFrom}
              onChange={(e) => update("effectiveFrom", e.target.value)}
            />
          </Field>
        </div>
        <FormActions
          submitText="Lưu thay đổi"
          isSubmitting={isSubmitting}
          onClose={onClose}
        />
      </form>
    </Modal>
  );
}
