import { Modal } from "antd";
import { ArrowLeft, BadgeCheck, Banknote, ChevronRight, Clock, Coins, FileText, MinusCircle, PlusCircle, Receipt, ShieldAlert, WalletCards } from "lucide-react";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { paths } from "../../../app/router/paths";
import { AppLayout } from "../../../app/layouts";
import { payrollService } from "../services/payrollService";
import type { MoneyValue, PayrollDetail } from "../types/payroll.types";

type DetailDialog = "overtime" | "allowance" | "bonus" | "penalty" | null;

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value?: MoneyValue | null) {
  const formatted = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(toNumber(value));
  return `${formatted} ₫`;
}

function formatNumber(value?: MoneyValue | null) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

function formatPercent(value?: MoneyValue | null) {
  if (value === undefined || value === null) return "";
  const rate = toNumber(value);
  return ` (${formatNumber(rate)}%)`;
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

function getTaxableIncome(payroll: PayrollDetail) {
  const profile = payroll.employee?.payrollProfile;
  const policy = profile?.taxPolicy;
  if (!profile?.isTaxApplicable || !policy) return 0;

  const insuranceDeduction =
    toNumber(payroll.socialInsurance) +
    toNumber(payroll.healthInsurance) +
    toNumber(payroll.unemploymentInsurance);

  return Math.max(
    0,
    toNumber(payroll.grossSalary) -
      insuranceDeduction -
      toNumber(policy.personalDeduction) -
      profile.dependentCount * toNumber(policy.dependentDeduction),
  );
}

function getCurrentTaxRate(payroll: PayrollDetail) {
  const brackets = payroll.employee?.payrollProfile?.taxPolicy?.brackets ?? [];
  const taxableIncome = getTaxableIncome(payroll);
  if (taxableIncome <= 0) return 0;

  const bracket = brackets.find((item) => {
    const from = toNumber(item.fromAmount);
    const to = item.toAmount == null ? Number.POSITIVE_INFINITY : toNumber(item.toAmount);
    return taxableIncome > from && taxableIncome <= to;
  });

  return bracket?.rate;
}

function SummaryRow({
  label,
  value,
  icon: Icon,
  variant = "default",
  onClick,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  variant?: "default" | "income" | "deduction" | "total";
  onClick?: () => void;
}) {
  const valueColor =
    variant === "income" ? "text-emerald-600" :
    variant === "deduction" ? "text-rose-600" :
    variant === "total" ? "text-[#006fd5] font-extrabold text-lg" : "text-[#1e293b]";

  const content = (
    <>
      <td className="px-5 py-3.5 text-[#475569]">
        <div className="flex items-center gap-2.5">
          {Icon ? <Icon className={`h-4.5 w-4.5 ${variant === "income" ? "text-emerald-500" : variant === "deduction" ? "text-rose-500" : "text-[#94a3b8]"}`} /> : null}
          <span className="font-medium">{label}</span>
        </div>
      </td>
      <td className={`px-5 py-3.5 text-right font-semibold ${valueColor}`}>
        <span className="inline-flex items-center justify-end gap-2">
          <span>{value}</span>
          {onClick ? <ChevronRight className="h-4 w-4 text-[#94a3b8]" /> : null}
        </span>
      </td>
    </>
  );

  return (
    <tr className={`group transition-colors ${onClick ? "cursor-pointer hover:bg-[#f8fafc]" : ""}`} onClick={onClick}>
      {content}
    </tr>
  );
}

function DetailModal({
  payroll,
  dialog,
  onClose,
}: {
  payroll: PayrollDetail;
  dialog: DetailDialog;
  onClose: () => void;
}) {
  const bonusLines = payroll.bonusPenaltyLines.filter((line) => line.isBonus);
  const penaltyLines = payroll.bonusPenaltyLines.filter((line) => !line.isBonus);
  const moneyRows =
    dialog === "allowance"
      ? payroll.allowanceLines.map((line) => ({
          id: line.id,
          name: line.allowanceName,
          amount: line.amount,
        }))
      : (dialog === "bonus" ? bonusLines : penaltyLines).map((line) => ({
          id: line.id,
          name: line.autoPenaltyPolicy?.name || line.payrollBonusPenalty?.reason || line.reason || "-",
          amount: line.amount,
        }));

  const config = {
    overtime: {
      title: "Chi tiết tăng ca",
      total: payroll.totalOvertimePay,
      countLabel: "Tổng công OT",
      countValue: `${formatNumber(payroll.totalOvertimeWorkDays)} công`,
      subLabel: "Tổng giờ OT",
      subValue: `${formatNumber(payroll.totalOvertimeHours)} giờ`,
      rows: payroll.overtimeLines,
    },
    allowance: {
      title: "Chi tiết phụ cấp",
      total: payroll.totalAllowance,
      rows: payroll.allowanceLines,
    },
    bonus: {
      title: "Chi tiết thưởng",
      total: payroll.totalBonus,
      rows: bonusLines,
    },
    penalty: {
      title: "Chi tiết phạt",
      total: payroll.totalPenalty,
      rows: penaltyLines,
    },
  }[dialog ?? "overtime"];

  return (
    <Modal open={dialog !== null} title={config.title} onCancel={onClose} footer={null} width={860} centered>
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Tổng tiền</div>
            <div className="mt-1 text-2xl font-extrabold text-[#1e293b]">
              {formatMoney(config.total)}
            </div>
          </div>
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
              {"countLabel" in config ? config.countLabel : "Số dòng"}
            </div>
            <div className="mt-1 text-2xl font-extrabold text-[#1e293b]">
              {"countValue" in config ? config.countValue : config.rows.length.toLocaleString("vi-VN")}
            </div>
          </div>
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
              {"subLabel" in config ? config.subLabel : "Bình quân"}
            </div>
            <div className="mt-1 text-2xl font-extrabold text-[#1e293b]">
              {"subValue" in config ? (
                config.subValue
              ) : (
                formatMoney(config.rows.length ? toNumber(config.total) / config.rows.length : 0)
              )}
            </div>
          </div>
        </div>

        <div className="overflow-auto rounded-xl border border-[#e2e8f0] shadow-sm">
          {dialog === "overtime" ? (
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[#f8fafc] text-xs font-bold uppercase tracking-wider text-[#64748b]">
                <tr>
                  <th className="px-5 py-3 text-left">Loại ca OT</th>
                  <th className="px-5 py-3 text-right">Công OT</th>
                  <th className="px-5 py-3 text-right">Giờ OT</th>
                  <th className="px-5 py-3 text-right">Đơn giá giờ</th>
                  <th className="px-5 py-3 text-right">Hệ số</th>
                  <th className="px-5 py-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] bg-white">
                {payroll.overtimeLines.map((line) => (
                  <tr key={line.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-[#1e293b]">{line.workShiftName}</div>
                      <div className="text-xs text-[#64748b]">{line.workShiftCode ?? "-"}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-[#475569]">{formatNumber(line.workDays)}</td>
                    <td className="px-5 py-3 text-right font-medium text-[#475569]">{formatNumber(line.hours)}</td>
                    <td className="px-5 py-3 text-right font-medium text-[#475569]">{formatMoney(line.baseHourlyRate)}</td>
                    <td className="px-5 py-3 text-right font-medium text-[#475569]">{formatNumber(line.multiplier)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-[#1e293b]">{formatMoney(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-[#f8fafc] text-xs font-bold uppercase tracking-wider text-[#64748b]">
                <tr>
                  <th className="px-5 py-3 text-left">Nội dung</th>
                  <th className="px-5 py-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] bg-white">
                {moneyRows.map((line) => (
                  <tr key={line.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-[#1e293b]">{line.name}</td>
                    <td className="px-5 py-3 text-right font-semibold text-[#1e293b]">{formatMoney(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function PayrollEmployeeDetailPage() {
  const { periodId = "", employeeId = "" } = useParams();
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState<PayrollDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DetailDialog>(null);

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

  const labels = useMemo(() => {
    const profile = payroll?.employee?.payrollProfile;
    const insurance = profile?.insurancePolicy;
    const taxRate = payroll ? getCurrentTaxRate(payroll) : null;

    return {
      social: `BHXH${formatPercent(insurance?.employeeSocialRate)}`,
      health: `BHYT${formatPercent(insurance?.employeeHealthRate)}`,
      unemployment: `BHTN${formatPercent(insurance?.employeeUnemploymentRate)}`,
      tax: `Thuế TNCN${profile?.taxPolicy ? formatPercent(taxRate ?? 0) : ""}`,
    };
  }, [payroll]);

  return (
    <AppLayout>
      <main className="h-full overflow-y-auto bg-[#f1f5f9]">
        <div className="grid gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-full border border-[#e2e8f0] bg-white text-[#64748b] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#f8fafc] hover:text-[#006fd5] hover:shadow-md active:scale-95" type="button" title="Quay lại" onClick={() => navigate(paths.payrollPeriodOverview(periodId))}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-[#1e293b]">Chi tiết bảng lương</h1>
              <p className="text-sm font-medium text-[#64748b]">
                {payroll ? `${payroll.employee?.name ?? "-"} · Tháng ${payroll.month}/${payroll.year}` : "Đang tải dữ liệu..."}
              </p>
            </div>
          </div>

          {errorMessage ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

          {loading ? (
            <div className="grid min-h-56 place-items-center text-sm text-[#667085]">Đang tải chi tiết...</div>
          ) : payroll ? (
            <>
              <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-[#1e293b] p-6 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-full border-2 border-white/20 shadow-inner">
                      <Avatar
                        alt={payroll.employee?.name ?? "NV"}
                        sizeClass="h-full w-full"
                      />
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-white">{payroll.employee?.name}</div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm">{payroll.employee?.employeeId}</span>
                        <span>·</span>
                        <span>{payroll.employee?.department?.name ?? "-"}</span>
                        <span>·</span>
                        <span>{payroll.employee?.position?.name ?? "-"}</span>
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-1.5 text-sm font-bold text-blue-200 backdrop-blur-md">
                    {payroll.status}
                  </span>
                </div>
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500 opacity-20 blur-3xl" />
                <div className="absolute bottom-0 right-20 h-20 w-20 rounded-full bg-emerald-500 opacity-20 blur-2xl" />
              </section>

              <div className="grid grid-cols-4 gap-4 max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
                {[
                  { label: "Lương thực tế", value: payroll.actualSalary, icon: Banknote, color: "blue" },
                  { label: "Tổng Gross", value: payroll.grossSalary, icon: Coins, color: "blue" },
                  { label: "Khấu trừ", value: payroll.totalDeduction, icon: MinusCircle, color: "rose" },
                  { label: "Thực nhận", value: payroll.netSalary, icon: WalletCards, color: "emerald" },
                ].map((item) => {
                  const Icon = item.icon;
                  const colorClasses = {
                    blue: "bg-[#f0f7ff] text-[#006fd5] border-[#006fd5]/10",
                    emerald: "bg-emerald-50 text-emerald-600 border-emerald-600/10",
                    rose: "bg-rose-50 text-rose-600 border-rose-600/10",
                  }[item.color as "blue" | "emerald" | "rose"];

                  return (
                    <div className="group relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-0.5" key={item.label}>
                      <div className="flex items-center justify-between gap-3 relative z-10">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#64748b]">{item.label}</div>
                          <div className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#1e293b]">
                            {formatMoney(item.value)}
                          </div>
                        </div>
                        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${colorClasses} transition-transform group-hover:scale-110`}>
                          <Icon className="h-6 w-6" />
                        </span>
                      </div>
                      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40 ${item.color === "blue" ? "bg-[#006fd5]" : item.color === "emerald" ? "bg-emerald-500" : "bg-rose-500"}`} />
                    </div>
                  );
                })}
              </div>

              <section className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-5 py-4">
                  <Receipt className="h-5 w-5 text-[#64748b]" />
                  <h2 className="text-lg font-extrabold text-[#1e293b]">Bảng lương chi tiết</h2>
                </div>
                
                <div className="px-5 py-3 bg-slate-50 border-b border-[#e2e8f0] text-xs font-bold uppercase tracking-wider text-[#64748b]">Thu nhập</div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[#e2e8f0]">
                    <SummaryRow icon={FileText} label="Lương cơ bản" value={formatMoney(payroll.baseSalary)} />
                    <SummaryRow icon={Clock} label="Công chuẩn" value={formatNumber(payroll.standardWorkDays)} />
                    <SummaryRow icon={Clock} label="Công thực tế" value={formatNumber(payroll.actualWorkDays)} />
                    <SummaryRow icon={Clock} label="Tăng ca (OT)" variant="income" value={formatMoney(payroll.totalOvertimePay)} onClick={() => setDialog("overtime")} />
                    <SummaryRow icon={PlusCircle} label="Phụ cấp" variant="income" value={formatMoney(payroll.totalAllowance)} onClick={() => setDialog("allowance")} />
                    <SummaryRow icon={PlusCircle} label="Thưởng" variant="income" value={formatMoney(payroll.totalBonus)} onClick={() => setDialog("bonus")} />
                  </tbody>
                </table>

                <div className="px-5 py-3 bg-slate-50 border-y border-[#e2e8f0] text-xs font-bold uppercase tracking-wider text-[#64748b]">Khấu trừ</div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[#e2e8f0]">
                    <SummaryRow icon={MinusCircle} label="Phạt" variant="deduction" value={formatMoney(payroll.totalPenalty)} onClick={() => setDialog("penalty")} />
                    <SummaryRow icon={ShieldAlert} label={labels.social} variant="deduction" value={formatMoney(payroll.socialInsurance)} />
                    <SummaryRow icon={ShieldAlert} label={labels.health} variant="deduction" value={formatMoney(payroll.healthInsurance)} />
                    <SummaryRow icon={ShieldAlert} label={labels.unemployment} variant="deduction" value={formatMoney(payroll.unemploymentInsurance)} />
                    <SummaryRow icon={MinusCircle} label={labels.tax} variant="deduction" value={formatMoney(payroll.personalIncomeTax)} />
                  </tbody>
                </table>

                <div className="px-5 py-3 bg-[#f0f7ff] border-y border-[#006fd5]/10 text-xs font-bold uppercase tracking-wider text-[#006fd5]">Tổng kết</div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[#006fd5]/10 bg-[#f8fbff]">
                    <SummaryRow icon={WalletCards} label="Thực nhận" variant="total" value={formatMoney(payroll.netSalary)} />
                    <SummaryRow icon={BadgeCheck} label="Đã trả" value={formatMoney(payroll.paidAmount ?? 0)} />
                  </tbody>
                </table>
              </section>

              <DetailModal payroll={payroll} dialog={dialog} onClose={() => setDialog(null)} />
            </>
          ) : null}
        </div>
      </main>
    </AppLayout>
  );
}
