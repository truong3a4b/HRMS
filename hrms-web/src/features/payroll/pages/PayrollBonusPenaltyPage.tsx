import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Modal, Pagination } from "antd";
import { Ban, Pencil, Plus, RefreshCcw, Search } from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import { useAuth } from "../../auth/services/useAuth";
import { employeeService } from "../../employees/services/employeeService";
import type { EmployeeOption } from "../../employees/types/employee.types";
import { payrollPolicyService } from "../../payroll-policies/services/payrollPolicyService";
import type { PayrollBonusPenalty } from "../../payroll-policies/types/payrollPolicy.types";

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";
const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
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

function MoneyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const formatted = useMemo(() => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("vi-VN");
  }, [value]);

  return (
    <input
      className={fieldClass}
      inputMode="numeric"
      placeholder={placeholder}
      value={formatted}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
    />
  );
}

function VoucherModal({
  open,
  employees,
  voucher,
  onClose,
  onSubmit,
}: {
  open: boolean;
  employees: EmployeeOption[];
  voucher?: PayrollBonusPenalty | null;
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
    setEmployeeId(voucher?.employeeId ?? "");
    setMonth(
      voucher?.month
        ? new Date(voucher.month).toISOString().slice(0, 7)
        : new Date().toISOString().slice(0, 7),
    );
    setAmount(voucher?.amount ? String(Math.trunc(Number(voucher.amount))) : "");
    setIsBonus(voucher?.isBonus ?? true);
    setReason(voucher?.reason ?? "");
  }, [open, voucher]);

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
    <Modal
      title={voucher ? "Chỉnh sửa phiếu thưởng/phạt" : "Tạo phiếu thưởng/phạt"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
    >
      <form className="grid gap-4" onSubmit={submit}>
        <label>
          <span className={labelClass}>
            Nhân viên <span className="text-[#f04438]">*</span>
          </span>
          <SearchableSelect
            placeholder="Chọn nhân viên..."
            value={employeeId || undefined}
            onChange={(value: string) => setEmployeeId(value)}
            options={employees.map((employee) => ({
              value: employee.id,
              label: employee.name,
            }))}
          />
        </label>
        <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          <label>
            <span className={labelClass}>Tháng áp dụng</span>
            <input
              className={fieldClass}
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>Loại phiếu</span>
            <select
              className={fieldClass}
              value={isBonus ? "bonus" : "penalty"}
              onChange={(event) => setIsBonus(event.target.value === "bonus")}
            >
              <option value="bonus">Thưởng</option>
              <option value="penalty">Phạt</option>
            </select>
          </label>
        </div>
        <label>
          <span className={labelClass}>
            Số tiền <span className="text-[#f04438]">*</span>
          </span>
          <MoneyInput
            value={amount}
            onChange={setAmount}
            placeholder="Nhập số tiền"
          />
        </label>
        <label>
          <span className={labelClass}>Lý do</span>
          <textarea
            className={fieldClass}
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-semibold text-[#344054]"
            type="button"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            type="submit"
            disabled={submitting || !employeeId || !amount}
          >
            Lưu phiếu
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function PayrollBonusPenaltyPage({
  scope = "all",
}: {
  scope?: "all" | "mine";
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<PayrollBonusPenalty[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<"" | "ACTIVE" | "CANCELLED">("");
  const [scanMonth, setScanMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PayrollBonusPenalty | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const permissions = new Set(user?.permissions ?? []);
  const hasPermission = (permission: string) =>
    isAdmin || permissions.has(permission);
  const canManage = hasPermission("PAYROLL_MANAGE");

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const vouchers =
        scope === "mine"
          ? await payrollPolicyService.getMyPayrollBonusPenalties({
              status: status || undefined,
            })
          : await payrollPolicyService.getPayrollBonusPenalties({
              status: status || undefined,
            });
      setItems(vouchers);

      if (!canManage) {
        setEmployees([]);
        return;
      }

      const employeePage = await employeeService.getEmployees({
        page: 1,
        limit: -1,
        search: "",
        departmentId: "",
        positionId: "",
      });
      setEmployees(
        (employeePage?.items ?? []).map((employee) => ({
          id: employee.id,
          name: employee.name,
        })),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không tải được phiếu thưởng/phạt"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [status, scope, canManage]);

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) =>
      [
        item.employee?.name,
        item.employee?.employeeId,
        item.reason,
        item.autoPenaltyPolicy?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [items, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, status, scope]);

  const pagedItems = useMemo(
    () =>
      filteredItems.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      ),
    [filteredItems, currentPage, pageSize],
  );

  const visibleStart =
    filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const visibleEnd = Math.min(currentPage * pageSize, filteredItems.length);

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

  const activateVoucher = (item: PayrollBonusPenalty) => {
    Modal.confirm({
      title: "Kích hoạt lại phiếu thưởng/phạt",
      content: `Bạn có chắc chắn muốn kích hoạt lại phiếu "${item.reason || item.id}"?`,
      okText: "Kích hoạt",
      cancelText: "Đóng",
      onOk: async () => {
        await payrollPolicyService.updatePayrollBonusPenalty(item.id, {
          employeeId: item.employeeId,
          month: item.month,
          amount: item.amount,
          isBonus: item.isBonus,
          reason: item.reason ?? null,
          status: "ACTIVE",
        });
        await loadData();
      },
    });
  };

  const scanAutoPenalties = async () => {
    const [year, month] = scanMonth.split("-").map(Number);
    setScanning(true);
    setErrorMessage(null);
    try {
      await payrollPolicyService.generateAutoPayrollBonusPenalties({
        month,
        year,
      });
      await loadData();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không tạo được phiếu phạt tự động"));
    } finally {
      setScanning(false);
    }
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-y-auto bg-[#f1f5f9]">
        <div className="flex min-h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">
                Phiếu thưởng/phạt
              </h1>
            </div>
            {canManage ? (
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#0055a8]"
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Tạo phiếu
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="relative min-w-[260px] flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#667085]" />
              <input
                className="w-full rounded-lg border border-[#d0d5dd] bg-white py-2 pl-9 pr-3 text-sm text-[#344054] placeholder-[#98a2b3] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
                placeholder="Tìm nhân viên, lý do, chính sách..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <select
              className={fieldClass}
              style={{ maxWidth: 180 }}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "" | "ACTIVE" | "CANCELLED")
              }
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Hiệu lực</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
            {canManage ? (
              <>
                <input
                  className={fieldClass}
                  style={{ maxWidth: 170 }}
                  type="month"
                  value={scanMonth}
                  onChange={(event) => setScanMonth(event.target.value)}
                />
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-4 py-2 text-sm font-semibold text-[#344054] transition-colors hover:border-[#006fd5] hover:bg-[#f0f7ff] hover:text-[#006fd5] disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={scanning}
                  onClick={() => void scanAutoPenalties()}
                >
                  {scanning ? "Đang quét..." : "Quét phạt tự động"}
                </button>
              </>
            ) : null}
            <button
              className="grid h-10 w-10 place-items-center rounded-lg border border-[#d0d5dd] text-[#344054] transition-colors hover:border-[#006fd5] hover:bg-[#f0f7ff] hover:text-[#006fd5]"
              type="button"
              title="Tải lại"
              onClick={() => void loadData()}
            >
              <RefreshCcw className="h-4.5 w-4.5" />
            </button>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
              {errorMessage}
            </div>
          ) : null}

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
            {loading ? (
              <div className="grid flex-1 place-items-center p-10 text-sm text-[#667085]">
                Đang tải dữ liệu...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="grid flex-1 place-items-center p-10 text-sm text-[#667085]">
                Chưa có phiếu thưởng/phạt phù hợp
              </div>
            ) : (
              <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="sticky top-0 z-1">
                    <tr className="border-b border-[#ebedf2] bg-[#f9fafb]">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Nhân viên</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Loại phiếu</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Tháng</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Lý do</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#667085]">Số tiền</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#667085]">Trạng thái</th>
                      {canManage ? (
                        <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[#667085]">Thao tác</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebedf2]">
                    {pagedItems.map((item) => (
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
                        {canManage ? (
                          <td className="px-5 py-4 text-center">
                            <div className="inline-flex items-center gap-2">
                              <button
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef4ff] text-[#004e98] transition-colors hover:bg-[#dbeafe] disabled:cursor-not-allowed disabled:opacity-40"
                                type="button"
                                title="Chỉnh sửa phiếu"
                                disabled={item.status === "CANCELLED"}
                                onClick={() => {
                                  setEditingItem(item);
                                  setModalOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              {item.status === "CANCELLED" ? (
                                <button
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#ecfdf3] text-[#027a48] transition-colors hover:bg-[#d1fadf]"
                                  type="button"
                                  title="Kích hoạt lại phiếu"
                                  onClick={() => activateVoucher(item)}
                                >
                                  <RefreshCcw className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3f2] text-[#b42318] transition-colors hover:bg-[#fee4e2]"
                                  type="button"
                                  title="Hủy phiếu"
                                  onClick={() => cancelVoucher(item)}
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#ebedf2] px-5 py-3.5 text-sm font-medium text-[#667085]">
              <span>
                Hiển thị {visibleStart}-{visibleEnd} / {filteredItems.length} phiếu
              </span>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredItems.length}
                showSizeChanger
                pageSizeOptions={[10, 20, 50, 100]}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
              />
            </div>
          </section>
        </div>
      </main>

      <VoucherModal
        open={modalOpen}
        employees={employees}
        voucher={editingItem}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={async (payload) => {
          if (editingItem) {
            await payrollPolicyService.updatePayrollBonusPenalty(
              editingItem.id,
              payload,
            );
          } else {
            await payrollPolicyService.createPayrollBonusPenalty(payload);
          }
          setModalOpen(false);
          setEditingItem(null);
          await loadData();
        }}
      />
    </AppLayout>
  );
}
