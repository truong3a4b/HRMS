import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { paths } from "../../../app/router/paths";
import { AppLayout } from "../../../app/layouts";
import { payrollService } from "../services/payrollService";
import type { PayrollDetail } from "../types/payroll.types";

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

export function PayrollEmployeeDetailPage() {
  const { periodId = "", employeeId = "" } = useParams();
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState<PayrollDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    payrollService
      .getPeriodEmployeeDetail(periodId, employeeId)
      .then((result) => {
        if (!ignore) setPayroll(result);
      })
      .catch((error) => {
        if (!ignore) setErrorMessage(getErrorMessage(error, "Không tải được chi tiết bảng lương."));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [employeeId, periodId]);

  return (
    <AppLayout>
      <main className="h-full overflow-y-auto bg-[#f1f5f9]">
        <div className="grid gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex items-start gap-3">
            <button className="mt-1 grid h-9 w-9 place-items-center rounded-lg border border-[#d0d5dd] bg-white" type="button" onClick={() => navigate(paths.payrollPeriodOverview(periodId))}>
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">Chi tiết bảng lương</h1>
              <p className="text-sm text-[#667085]">
                {payroll ? `${payroll.employee?.name ?? "-"} · ${payroll.month}/${payroll.year}` : "Đang tải dữ liệu"}
              </p>
            </div>
          </div>

          {errorMessage ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

          {loading ? (
            <div className="grid min-h-56 place-items-center text-sm text-[#667085]">Đang tải chi tiết...</div>
          ) : payroll ? (
            <>
              <section className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-bold text-[#243247]">{payroll.employee?.name}</div>
                    <div className="text-sm text-[#667085]">
                      {payroll.employee?.employeeId} · {payroll.employee?.department?.name ?? "-"} · {payroll.employee?.position?.name ?? "-"}
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{payroll.status}</span>
                </div>
              </section>

              <div className="grid grid-cols-4 gap-3 max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
                {[
                  ["Lương thực tế", payroll.actualSalary],
                  ["Gross", payroll.grossSalary],
                  ["Khấu trừ", payroll.totalDeduction],
                  ["Thực nhận", payroll.netSalary],
                ].map(([label, value]) => (
                  <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm" key={label}>
                    <div className="text-xs font-semibold uppercase text-[#667085]">{label}</div>
                    <div className="mt-1 text-xl font-bold text-[#243247]">{formatMoney(value)}</div>
                  </div>
                ))}
              </div>

              <section className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
                <div className="border-b border-[#e2e8f0] px-4 py-3 text-base font-bold text-[#243247]">Tổng hợp</div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {[
                      ["Lương cơ bản", payroll.baseSalary],
                      ["Công chuẩn", `${toNumber(payroll.standardWorkDays).toLocaleString("vi-VN")} ngày`],
                      ["Công thực tế", `${toNumber(payroll.actualWorkDays).toLocaleString("vi-VN")} ngày`],
                      ["OT", payroll.totalOvertimePay],
                      ["Phụ cấp", payroll.totalAllowance],
                      ["Thưởng", payroll.totalBonus],
                      ["Phạt", payroll.totalPenalty],
                      ["BHXH", payroll.socialInsurance],
                      ["BHYT", payroll.healthInsurance],
                      ["BHTN", payroll.unemploymentInsurance],
                      ["Thuế TNCN", payroll.personalIncomeTax],
                      ["Thực nhận", payroll.netSalary],
                      ["Đã trả", payroll.paidAmount ?? 0],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td className="px-4 py-3 text-[#667085]">{label}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#243247]">
                          {typeof value === "string" && value.includes("ngày") ? value : formatMoney(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
                <div className="border-b border-[#e2e8f0] px-4 py-3 text-base font-bold text-[#243247]">Dòng chi tiết</div>
                <div className="overflow-auto">
                  <table className="w-full min-w-[780px] text-sm">
                    <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
                      <tr>
                        <th className="px-4 py-3 text-left">Loại</th>
                        <th className="px-4 py-3 text-left">Nội dung</th>
                        <th className="px-4 py-3 text-right">Giá trị</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {payroll.overtimeLines.map((line) => (
                        <tr key={`ot-${line.id}`}>
                          <td className="px-4 py-3">OT</td>
                          <td className="px-4 py-3">{line.workShiftName}</td>
                          <td className="px-4 py-3 text-right">{formatMoney(line.amount)}</td>
                        </tr>
                      ))}
                      {payroll.allowanceLines.map((line) => (
                        <tr key={`allowance-${line.id}`}>
                          <td className="px-4 py-3">Phụ cấp</td>
                          <td className="px-4 py-3">{line.allowanceName}</td>
                          <td className="px-4 py-3 text-right">{formatMoney(line.amount)}</td>
                        </tr>
                      ))}
                      {payroll.bonusPenaltyLines.map((line) => (
                        <tr key={`bonus-${line.id}`}>
                          <td className="px-4 py-3">{line.isBonus ? "Thưởng" : "Phạt"}</td>
                          <td className="px-4 py-3">{line.reason || "-"}</td>
                          <td className="px-4 py-3 text-right">{formatMoney(line.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>
    </AppLayout>
  );
}
