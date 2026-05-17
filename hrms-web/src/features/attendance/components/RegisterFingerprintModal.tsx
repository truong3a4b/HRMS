import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "antd";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import type { Employee } from "../../employees/types/employee.types";
import type { AttendanceDevice } from "../types/attendance.types";

type RegisterFingerprintModalProps = {
  open: boolean;
  device: AttendanceDevice | null;
  employees: Employee[];
  onClose: () => void;
  onSubmit: (employeeId: string, fingerName: string) => Promise<void>;
};

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";
const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

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

export function RegisterFingerprintModal({
  open,
  device,
  employees,
  onClose,
  onSubmit,
}: RegisterFingerprintModalProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [fingerName, setFingerName] = useState("index");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmployeeId("");
    setFingerName("index");
    setError(null);
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!employeeId || !fingerName.trim()) {
      setError("Vui lòng chọn nhân viên và nhập tên ngón tay.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(employeeId, fingerName.trim());
    } catch (submitError) {
      setError(
        getErrorMessage(submitError, "Không thể gửi lệnh đăng ký vân tay"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={`Đăng ký vân tay${device ? ` - ${device.name}` : ""}`}
      footer={null}
      onCancel={onClose}
      destroyOnHidden
    >
      <form className="grid gap-4 pt-2" onSubmit={handleSubmit}>
        {error ? (
          <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-3 py-2 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}
        <label>
          <span className={labelClass}>Nhân viên</span>
          <SearchableSelect
            value={employeeId}
            onChange={setEmployeeId}
            options={[
              { value: "", label: "Chọn nhân viên" },
              ...employees.map((employee) => ({
                value: employee.id,
                label: `${employee.employeeId} - ${employee.name}`,
              })),
            ]}
          />
        </label>
        <label>
          <span className={labelClass}>Ngón tay</span>
          <input
            className={fieldClass}
            value={fingerName}
            onChange={(event) => setFingerName(event.target.value)}
            placeholder="thumb, index, middle..."
          />
        </label>
        <div className="rounded-lg border border-[#d0d5dd] bg-[#f9fafb] px-3 py-2 text-sm text-[#667085]">
          Sau khi gửi lệnh, thiết bị sẽ yêu cầu nhân viên đặt tay lên cảm biến.
          Database chỉ được cập nhật khi thiết bị trả kết quả thành công.
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] hover:bg-[#f9fafb]"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! hover:bg-[#0055a8] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={submitting || !device}
          >
            {submitting ? "Đang gửi..." : "Gửi lệnh"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
