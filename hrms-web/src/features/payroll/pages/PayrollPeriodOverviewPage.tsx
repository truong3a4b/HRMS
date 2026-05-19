import { Modal } from "antd";
import { ArrowLeft, BadgeCheck, Banknote, Calculator, CheckCircle2, Eye, RefreshCcw, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { paths } from "../../../app/router/paths";
import { AppLayout } from "../../../app/layouts";
import { useAuth } from "../../auth/services/useAuth";
import { payrollService } from "../services/payrollService";
import type { PayrollPeriodOverview } from "../types/payroll.types";

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

export function PayrollPeriodOverviewPage() {
  const { periodId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const permissions = user?.permissions ?? [];
  const canManage = isAdmin || permissions.includes("PAYROLL_MANAGE");
  const canApprove = isAdmin || permissions.includes("PAYROLL_APPROVE");
  const [overview, setOverview] = useState<PayrollPeriodOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const runPeriodAction = async (action: "request" | "approve") => {
    if (!overview) return;
    try {
      const next =
        action === "request"
          ? await payrollService.requestPeriodApproval(overview.period.id)
          : await payrollService.approvePeriod(overview.period.id);
      setOverview(next);
    } catch (error) {
      Modal.error({
        title: "Không thể cập nhật kỳ lương",
        content: getErrorMessage(error, "Thao tác thất bại."),
      });
    }
  };

  const recalculatePeriod = async () => {
    if (!overview) return;

    try {
      const result = await payrollService.recalculatePeriod(overview.period.id);
      setOverview(result.overview);
      Modal.success({
        title: "Đã tính lại kỳ lương",
        content: `Đã tính lại ${result.recalculatedCount} bảng lương trong kỳ.`,
      });
    } catch (error) {
      Modal.error({
        title: "Không thể tính lại kỳ lương",
        content: getErrorMessage(error, "Thao tác thất bại."),
      });
    }
  };

  return (
    <AppLayout>
      <main className="h-full overflow-y-auto bg-[#f1f5f9]">
        <div className="grid gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <button className="mt-1 grid h-9 w-9 place-items-center rounded-lg border border-[#d0d5dd] bg-white" type="button" onClick={() => navigate(paths.payrollManagement)}>
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#243247]">
                  {overview?.period.name || "Tổng quan kỳ lương"}
                </h1>
                <p className="text-sm text-[#667085]">
                  {overview ? `Tháng ${overview.month}/${overview.year}` : "Đang tải dữ liệu"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-lg border border-[#d0d5dd] bg-white" type="button" onClick={() => void loadData()}>
                <RefreshCcw className="h-4 w-4" />
              </button>
              {overview?.period.status === "DRAFT" && canManage ? (
                <>
                  <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#243247]" type="button" onClick={() => void recalculatePeriod()}>
                    <Calculator className="h-4 w-4" />
                    Tính lại
                  </button>
                  <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white!" type="button" onClick={() => void runPeriodAction("request")}>
                    <Send className="h-4 w-4" />
                    Gửi duyệt
                  </button>
                </>
              ) : null}
              {overview?.period.status === "WAITING_APPROVAL" && canApprove ? (
                <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#006fd5] px-4 text-sm font-semibold text-white!" type="button" onClick={() => void runPeriodAction("approve")}>
                  <CheckCircle2 className="h-4 w-4" />
                  Duyệt kỳ lương
                </button>
              ) : null}
            </div>
          </div>

          {errorMessage ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

          {overview ? (
            <>
              <div className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2 max-[620px]:grid-cols-1">
                {[
                  { label: "Nhân viên", value: overview.totalEmployees.toLocaleString("vi-VN"), icon: BadgeCheck },
                  { label: "Gross", value: formatMoney(overview.summary.grossSalary), icon: Banknote },
                  { label: "Thực nhận", value: formatMoney(overview.summary.netSalary), icon: Banknote },
                  { label: "Còn phải trả", value: formatMoney(overview.summary.remainingAmount), icon: Banknote },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm" key={item.label}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase text-[#667085]">{item.label}</div>
                          <div className="mt-1 text-xl font-bold text-[#243247]">{item.value}</div>
                        </div>
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f0f7ff] text-[#006fd5]">
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm">
                <input className="w-full rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm" placeholder="Tìm nhân viên, mã nhân viên, phòng ban..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
              </div>

              <section className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
                <div className="overflow-auto">
                  <table className="w-full min-w-[1040px] text-sm">
                    <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
                      <tr>
                        <th className="px-4 py-3 text-left">Nhân viên</th>
                        <th className="px-4 py-3 text-right">Công</th>
                        <th className="px-4 py-3 text-right">Gross</th>
                        <th className="px-4 py-3 text-right">Khấu trừ</th>
                        <th className="px-4 py-3 text-right">Thực nhận</th>
                        <th className="px-4 py-3 text-right">Đã trả</th>
                        <th className="px-4 py-3 text-right">Còn lại</th>
                        <th className="px-4 py-3 text-left">Trạng thái</th>
                        <th className="px-4 py-3 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {filteredPayrolls.map((payroll) => (
                        <tr className="hover:bg-[#f8fafc]" key={payroll.id}>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-[#243247]">{payroll.employee?.name ?? "-"}</div>
                            <div className="text-xs text-[#667085]">
                              {payroll.employee?.employeeId ?? "-"} · {payroll.employee?.department?.name ?? "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">{toNumber(payroll.actualWorkDays).toLocaleString("vi-VN")}</td>
                          <td className="px-4 py-3 text-right">{formatMoney(payroll.grossSalary)}</td>
                          <td className="px-4 py-3 text-right">{formatMoney(payroll.totalDeduction)}</td>
                          <td className="px-4 py-3 text-right font-semibold">{formatMoney(payroll.netSalary)}</td>
                          <td className="px-4 py-3 text-right">{formatMoney(payroll.paidAmount)}</td>
                          <td className="px-4 py-3 text-right">{formatMoney(payroll.remainingAmount)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[payroll.status] ?? statusClass.DRAFT}`}>
                              {statusLabel[payroll.status] ?? payroll.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <button className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff] text-[#006fd5] hover:bg-[#006fd5] hover:text-white!" type="button" onClick={() => navigate(paths.payrollEmployeeDetail(overview.period.id, payroll.employeeId))}>
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-[#e2e8f0] px-4 py-3 text-sm text-[#667085]">
                  Hiển thị {filteredPayrolls.length} bảng lương
                </div>
              </section>
            </>
          ) : loading ? (
            <div className="grid min-h-56 place-items-center text-sm text-[#667085]">Đang tải kỳ lương...</div>
          ) : null}
        </div>
      </main>
    </AppLayout>
  );
}
