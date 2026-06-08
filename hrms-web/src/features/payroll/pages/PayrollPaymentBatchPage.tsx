import { Modal } from "antd";
import { CalendarDays, Eye, RefreshCcw, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "../../../app/layouts";
import { payrollService } from "../services/payrollService";
import type { PayrollPaymentBatch, PayrollPaymentMode } from "../types/payroll.types";

const currentDate = new Date();

const modeLabel: Record<PayrollPaymentMode, string> = {
  AMOUNT: "Số tiền cố định",
  PERCENT: "Theo tỷ lệ",
  REMAINING: "Toàn bộ còn lại",
};

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(date);
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

export function PayrollPaymentBatchPage() {
  const [batches, setBatches] = useState<PayrollPaymentBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<PayrollPaymentBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      setBatches(await payrollService.getPaymentBatches({ month, year }));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không tải được danh sách đợt trả lương."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [month, year]);

  const totalAmount = useMemo(
    () => batches.reduce((total, batch) => total + toNumber(batch.totalAmount), 0),
    [batches],
  );

  const openDetail = async (batch: PayrollPaymentBatch) => {
    try {
      setSelectedBatch(await payrollService.getPaymentBatchById(batch.id));
    } catch (error) {
      Modal.error({
        title: "Không thể tải chi tiết đợt trả",
        content: getErrorMessage(error, "Thao tác thất bại."),
      });
    }
  };

  return (
    <AppLayout>
      <main className="h-full overflow-y-auto bg-[#f1f5f9]">
        <div className="grid gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">Đợt trả lương</h1>
              <p className="mt-1 text-sm text-[#64748b]">
                Theo dõi các lần chi trả lương đã tạo trong từng kỳ.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select className="h-10 rounded-lg border border-[#d0d5dd] bg-white px-3 text-sm font-semibold text-[#344054]" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
                  <option key={item} value={item}>Tháng {item}</option>
                ))}
              </select>
              <input className="h-10 w-24 rounded-lg border border-[#d0d5dd] bg-white px-3 text-sm font-semibold text-[#344054]" min={1900} max={9999} type="number" value={year} onChange={(event) => setYear(Number(event.target.value))} />
              <button className="grid h-10 w-10 place-items-center rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#f8fafc] hover:text-[#006fd5] hover:shadow-md active:scale-95" title="Tải lại" type="button" onClick={() => void loadData()}>
                <RefreshCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
            <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase text-[#64748b]">Tổng đợt trả</div>
                  <div className="mt-1 text-2xl font-extrabold text-[#1e293b]">{batches.length}</div>
                </div>
                <CalendarDays className="h-8 w-8 text-[#006fd5]" />
              </div>
            </div>
            <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase text-[#64748b]">Tổng đã chi</div>
                  <div className="mt-1 text-2xl font-extrabold text-emerald-600">{formatMoney(totalAmount)} ₫</div>
                </div>
                <WalletCards className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </div>

          <section className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
            {loading ? (
              <div className="grid min-h-56 place-items-center text-sm text-[#667085]">Đang tải đợt trả lương...</div>
            ) : batches.length ? (
              <div className="overflow-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
                    <tr>
                      <th className="px-4 py-3 text-left">Kỳ lương</th>
                      <th className="px-4 py-3 text-left">Ngày trả</th>
                      <th className="px-4 py-3 text-left">Phương thức</th>
                      <th className="px-4 py-3 text-right">Nhân viên</th>
                      <th className="px-4 py-3 text-right">Tổng tiền</th>
                      <th className="px-4 py-3 text-left">Ghi chú</th>
                      <th className="px-4 py-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {batches.map((batch) => (
                      <tr className="hover:bg-[#f8fafc]" key={batch.id}>
                        <td className="px-4 py-3 font-semibold text-[#243247]">Tháng {batch.month}/{batch.year}</td>
                        <td className="px-4 py-3 text-[#475569]">{formatDate(batch.paymentDate)}</td>
                        <td className="px-4 py-3 text-[#475569]">{modeLabel[batch.mode]}</td>
                        <td className="px-4 py-3 text-right font-semibold">{batch.payments?.length ?? 0}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatMoney(batch.totalAmount)} ₫</td>
                        <td className="max-w-[260px] truncate px-4 py-3 text-[#64748b]">{batch.note || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <button className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff] text-[#006fd5] transition-all hover:-translate-y-0.5 hover:bg-[#006fd5] hover:text-white hover:shadow-md active:scale-95" type="button" title="Xem chi tiết" onClick={() => void openDetail(batch)}>
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
              <div className="grid min-h-56 place-items-center text-sm text-[#667085]">Chưa có đợt trả lương trong tháng này.</div>
            )}
          </section>
        </div>
      </main>

      <Modal open={Boolean(selectedBatch)} title="Chi tiết đợt trả lương" onCancel={() => setSelectedBatch(null)} footer={null} width={900} centered>
        {selectedBatch ? (
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4 max-[720px]:grid-cols-1">
              <div>
                <div className="text-xs font-bold uppercase text-[#64748b]">Kỳ lương</div>
                <div className="mt-1 font-bold text-[#1e293b]">Tháng {selectedBatch.month}/{selectedBatch.year}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-[#64748b]">Ngày trả</div>
                <div className="mt-1 font-bold text-[#1e293b]">{formatDate(selectedBatch.paymentDate)}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-[#64748b]">Tổng tiền</div>
                <div className="mt-1 font-bold text-emerald-600">{formatMoney(selectedBatch.totalAmount)} ₫</div>
              </div>
            </div>
            <div className="max-h-[55vh] overflow-auto rounded-lg border border-[#e2e8f0]">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
                  <tr>
                    <th className="px-4 py-3 text-left">Nhân viên</th>
                    <th className="px-4 py-3 text-right">Net</th>
                    <th className="px-4 py-3 text-right">Đã trả trước</th>
                    <th className="px-4 py-3 text-right">Số tiền trả</th>
                    <th className="px-4 py-3 text-right">Còn lại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {selectedBatch.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#1e293b]">{payment.employee?.name ?? "-"}</div>
                        <div className="text-xs text-[#64748b]">{payment.employee?.employeeId ?? "-"}</div>
                      </td>
                      <td className="px-4 py-3 text-right">{formatMoney(payment.payrollNetSalary)} ₫</td>
                      <td className="px-4 py-3 text-right">{formatMoney(payment.payrollPaidBefore)} ₫</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatMoney(payment.amount)} ₫</td>
                      <td className="px-4 py-3 text-right font-semibold text-amber-600">{formatMoney(payment.remainingAfter)} ₫</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Modal>
    </AppLayout>
  );
}
