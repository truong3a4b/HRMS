import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "antd";
import type { AttendanceDevice } from "../types/attendance.types";

type DeviceFormModalProps = {
  open: boolean;
  device: AttendanceDevice | null;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    code: string;
    location?: string | null;
    isActive: boolean;
  }) => Promise<void>;
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

export function DeviceFormModal({
  open,
  device,
  onClose,
  onSubmit,
}: DeviceFormModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(device?.name ?? "");
    setCode(device?.code ?? "");
    setLocation(device?.location ?? "");
    setIsActive(device?.isActive ?? true);
    setError(null);
  }, [device, open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Vui lòng nhập tên thiết bị và mã thiết bị.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim(),
        location: location.trim() || null,
        isActive,
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu thiết bị"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={device ? "Cập nhật thiết bị" : "Thêm thiết bị"}
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
          <span className={labelClass}>Tên thiết bị</span>
          <input
            className={fieldClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label>
          <span className={labelClass}>Mã thiết bị</span>
          <input
            className={fieldClass}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </label>
        <label>
          <span className={labelClass}>Vị trí</span>
          <input
            className={fieldClass}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-[#344054]">
          <input
            checked={isActive}
            type="checkbox"
            onChange={(event) => setIsActive(event.target.checked)}
          />
          Đang hoạt động
        </label>
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
            disabled={submitting}
          >
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
