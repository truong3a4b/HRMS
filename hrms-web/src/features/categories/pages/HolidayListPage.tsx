import { Modal } from "antd";
import {
  AlertCircle,
  CalendarDays,
  Edit2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AppLayout } from "../../../app/layouts";
import { payrollPolicyService } from "../../payroll-policies/services/payrollPolicyService";
import type {
  Holiday,
  HolidayPayload,
} from "../../payroll-policies/types/payrollPolicy.types";

type StatusFilter = "all" | "active" | "inactive";

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";
const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

const defaultForm: HolidayPayload = {
  name: "",
  date: new Date().toISOString().slice(0, 10),
  salaryMultiplier: "1",
  description: "",
  isActive: true,
};

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

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function formatNumber(value?: string | number | null) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return "-";
  return parsed.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#f2f4f7] text-[#667085]"
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          active ? "bg-[#12b76a]" : "bg-[#98a2b3]"
        }`}
      />
      {active ? "Đang áp dụng" : "Tạm dừng"}
    </span>
  );
}

function HolidayModal({
  open,
  holiday,
  onClose,
  onSubmit,
}: {
  open: boolean;
  holiday: Holiday | null;
  onClose: () => void;
  onSubmit: (payload: HolidayPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<HolidayPayload>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      holiday
        ? {
            name: holiday.name,
            date: holiday.date.slice(0, 10),
            salaryMultiplier: holiday.salaryMultiplier,
            description: holiday.description ?? "",
            isActive: holiday.isActive,
          }
        : defaultForm,
    );
    setError(null);
  }, [holiday, open]);

  const setValue = (key: keyof HolidayPayload, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const multiplier = Number(form.salaryMultiplier);

    if (!form.name.trim() || !form.date) {
      setError("Vui lòng nhập tên và ngày nghỉ lễ.");
      return;
    }

    if (!Number.isFinite(multiplier) || multiplier <= 0) {
      setError("Hệ số lương phải lớn hơn 0.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        description:
          typeof form.description === "string"
            ? form.description.trim()
            : form.description,
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu ngày nghỉ lễ."));
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
            <CalendarDays className="h-4 w-4 text-[#006fd5]" />
          </span>
          <span>{holiday ? "Chỉnh sửa ngày nghỉ lễ" : "Thêm ngày nghỉ lễ"}</span>
        </div>
      }
      onCancel={onClose}
      width={640}
      centered
      footer={
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button
            className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:opacity-60"
            type="submit"
            form="holidayForm"
            disabled={submitting}
          >
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      }
    >
      <form id="holidayForm" className="grid gap-4" onSubmit={submit}>
        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <label>
          <span className={labelClass}>
            Tên ngày nghỉ <span className="text-[#f04438]">*</span>
          </span>
          <input
            className={fieldClass}
            value={form.name}
            placeholder="VD: Tết Dương lịch"
            onChange={(event) => setValue("name", event.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
          <label>
            <span className={labelClass}>
              Ngày nghỉ <span className="text-[#f04438]">*</span>
            </span>
            <input
              className={fieldClass}
              type="date"
              value={form.date}
              onChange={(event) => setValue("date", event.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>
              Hệ số lương <span className="text-[#f04438]">*</span>
            </span>
            <input
              className={fieldClass}
              type="number"
              min="0.01"
              step="0.01"
              value={form.salaryMultiplier}
              onChange={(event) =>
                setValue("salaryMultiplier", event.target.value)
              }
            />
          </label>
        </div>

        <label>
          <span className={labelClass}>Ghi chú</span>
          <textarea
            className={`${fieldClass} min-h-24 resize-none`}
            value={form.description ?? ""}
            placeholder="Ghi chú nội bộ nếu cần"
            onChange={(event) => setValue("description", event.target.value)}
          />
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#344054]">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#006fd5]"
            checked={form.isActive}
            onChange={(event) => setValue("isActive", event.target.checked)}
          />
          Đang áp dụng
        </label>
      </form>
    </Modal>
  );
}

export function HolidayListPage() {
  const currentDate = new Date();
  const [items, setItems] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  const activeParam = status === "all" ? undefined : status === "active";

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await payrollPolicyService.getHolidays({
        isActive: activeParam,
        month,
        year,
      });
      setItems(result);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Không tải được danh sách ngày nghỉ lễ."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [month, year, status]);

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        (item.description ?? "").toLowerCase().includes(keyword),
    );
  }, [items, searchTerm]);

  const openAdd = () => {
    setSelectedHoliday(null);
    setModalOpen(true);
  };

  const openEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setModalOpen(true);
  };

  const deleteHoliday = (holiday: Holiday) => {
    Modal.confirm({
      title: "Xóa ngày nghỉ lễ?",
      content: `Ngày ${holiday.name} sẽ không còn được dùng khi tính lương.`,
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        await payrollPolicyService.deleteHoliday(holiday.id);
        await loadData();
      },
    });
  };

  const submitHoliday = async (payload: HolidayPayload) => {
    if (selectedHoliday) {
      await payrollPolicyService.updateHoliday(selectedHoliday.id, payload);
    } else {
      await payrollPolicyService.createHoliday(payload);
    }

    setModalOpen(false);
    await loadData();
  };

  const years = Array.from({ length: 7 }, (_, index) => year - 3 + index);

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-y-auto bg-[#f1f5f9]">
        <div className="flex min-h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">
                Danh mục ngày nghỉ lễ
              </h1>
              <p className="text-sm text-[#667085]">
                Thiết lập ngày nghỉ và hệ số lương dùng khi tạo bảng lương.
              </p>
            </div>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! shadow-xs transition-colors hover:bg-[#0055a8]"
              type="button"
              onClick={openAdd}
            >
              <Plus className="h-4 w-4" />
              Thêm ngày nghỉ
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="relative min-w-[260px] flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#667085]" />
              <input
                className="w-full rounded-lg border border-[#d0d5dd] bg-white py-2 pl-9 pr-3 text-sm text-[#344054] placeholder-[#98a2b3] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
                placeholder="Tìm kiếm ngày nghỉ..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <select
              className={fieldClass}
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map(
                (value) => (
                  <option key={value} value={value}>
                    Tháng {value}
                  </option>
                ),
              )}
            </select>
            <select
              className={fieldClass}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <select
              className={fieldClass}
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang áp dụng</option>
              <option value="inactive">Tạm dừng</option>
            </select>
            <button
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d0d5dd] text-[#344054] transition-all hover:border-[#006fd5] hover:bg-[#f0f7ff] hover:text-[#006fd5]"
              type="button"
              title="Tải lại"
              onClick={() => void loadData()}
            >
              <RefreshCcw className="h-4.5 w-4.5 transition-transform duration-300 group-hover:-rotate-180" />
            </button>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
              {errorMessage}
            </div>
          ) : null}

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
            <div className="min-h-0 min-w-0 flex-1 overflow-auto">
              <table className="w-full min-w-[760px]">
                <thead className="sticky top-0 z-1">
                  <tr className="border-b border-[#ebedf2] bg-[#f9fafb]">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">
                      Ngày nghỉ
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">
                      Ngày
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">
                      Hệ số lương
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">
                      Trạng thái
                    </th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[#667085]">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebedf2]">
                  {loading ? (
                    <tr>
                      <td
                        className="px-5 py-16 text-center text-sm text-[#667085]"
                        colSpan={5}
                      >
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-16 text-center text-sm text-[#667085]"
                        colSpan={5}
                      >
                        Chưa có ngày nghỉ lễ phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((holiday) => (
                      <tr
                        className="transition-colors hover:bg-[#f9fafb]"
                        key={holiday.id}
                      >
                        <td className="px-5 py-4">
                          <strong className="block text-sm font-semibold text-[#243247]">
                            {holiday.name}
                          </strong>
                          {holiday.description ? (
                            <span className="mt-1 block text-xs text-[#667085]">
                              {holiday.description}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-[#344054]">
                          {formatDate(holiday.date)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-lg bg-[#f0f7ff] px-3 py-1 text-sm font-semibold text-[#006fd5]">
                            x{formatNumber(holiday.salaryMultiplier)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge active={holiday.isActive} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f7ff] text-[#006fd5] transition-colors hover:bg-[#006fd5] hover:text-white!"
                              type="button"
                              title="Sửa"
                              onClick={() => openEdit(holiday)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3f2] text-[#b42318] transition-colors hover:bg-[#fee4e2]"
                              type="button"
                              title="Xóa"
                              onClick={() => deleteHoliday(holiday)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="shrink-0 border-t border-[#ebedf2] px-5 py-3.5 text-sm font-medium text-[#667085]">
              Hiển thị {filteredItems.length} ngày nghỉ lễ
            </div>
          </section>
        </div>
      </main>

      <HolidayModal
        open={modalOpen}
        holiday={selectedHoliday}
        onClose={() => setModalOpen(false)}
        onSubmit={submitHoliday}
      />
    </AppLayout>
  );
}
