import { Modal } from "antd";
import { CalendarDays, Eye, FilePlus2, RefreshCcw } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../../app/router/paths";
import { AppLayout } from "../../../app/layouts";
import { useAuth } from "../../auth/services/useAuth";
import { employeeService } from "../../employees/services/employeeService";
import type { EmployeeOption } from "../../employees/types/employee.types";
import { payrollService } from "../services/payrollService";
import type {
  CreatePayrollByTargetsPayload,
  PayrollPeriod,
  PayrollPeriodStatus,
} from "../types/payroll.types";

const currentDate = new Date();

const statusLabel: Record<PayrollPeriodStatus, string> = {
  DRAFT: "Nháp",
  WAITING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  CANCELLED: "Đã hủy",
};

const statusClass: Record<PayrollPeriodStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  WAITING_APPROVAL: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
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

function CreatePeriodModal({
  open,
  departments,
  positions,
  onClose,
  onSubmit,
}: {
  open: boolean;
  departments: EmployeeOption[];
  positions: EmployeeOption[];
  onClose: () => void;
  onSubmit: (payload: CreatePayrollByTargetsPayload) => Promise<void>;
}) {
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [periodName, setPeriodName] = useState("");
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [positionIds, setPositionIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDepartmentIds(departments.map((item) => item.id));
    setPositionIds(positions.map((item) => item.id));
    setPeriodName("");
    setErrorMessage(null);
  }, [departments, open, positions]);

  const toggle = (list: string[], value: string, setter: (next: string[]) => void) =>
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!departmentIds.length || !positionIds.length) {
      setErrorMessage("Vui lòng chọn bộ phận và chức vụ.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit({
        month,
        year,
        periodName: periodName.trim() || null,
        departmentIds,
        positionIds,
        skipExisting: true,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể tạo kỳ lương."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Tạo kỳ lương" onCancel={onClose} footer={null} width={760} centered>
      <form className="grid gap-4" onSubmit={submit}>
        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}
        <div className="grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Tháng</span>
            <input className="w-full rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm" min={1} max={12} type="number" value={month} onChange={(event) => setMonth(Number(event.target.value))} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Năm</span>
            <input className="w-full rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm" min={1900} max={9999} type="number" value={year} onChange={(event) => setYear(Number(event.target.value))} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">Tên kỳ</span>
            <input className="w-full rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm" value={periodName} onChange={(event) => setPeriodName(event.target.value)} placeholder="VD: Kỳ lương 05/2026" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
          <section>
            <div className="mb-2 text-sm font-semibold text-[#243247]">Bộ phận</div>
            <div className="grid max-h-52 gap-2 overflow-auto rounded-lg border border-[#e2e8f0] p-3">
              {departments.map((department) => (
                <label className="flex items-center gap-2 text-sm" key={department.id}>
                  <input checked={departmentIds.includes(department.id)} type="checkbox" onChange={() => toggle(departmentIds, department.id, setDepartmentIds)} />
                  {department.name}
                </label>
              ))}
            </div>
          </section>
          <section>
            <div className="mb-2 text-sm font-semibold text-[#243247]">Chức vụ</div>
            <div className="grid max-h-52 gap-2 overflow-auto rounded-lg border border-[#e2e8f0] p-3">
              {positions.map((position) => (
                <label className="flex items-center gap-2 text-sm" key={position.id}>
                  <input checked={positionIds.includes(position.id)} type="checkbox" onChange={() => toggle(positionIds, position.id, setPositionIds)} />
                  {position.name}
                </label>
              ))}
            </div>
          </section>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-semibold" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white!" disabled={submitting} type="submit">
            {submitting ? "Đang tạo..." : "Tạo kỳ lương"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function PayrollPeriodListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const canManage = isAdmin || (user?.permissions ?? []).includes("PAYROLL_MANAGE");
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [departments, setDepartments] = useState<EmployeeOption[]>([]);
  const [positions, setPositions] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [periodResult, departmentResult, positionResult] = await Promise.all([
        payrollService.getPeriods(),
        employeeService.getDepartments(),
        employeeService.getPositions(),
      ]);
      setPeriods(periodResult);
      setDepartments(departmentResult);
      setPositions(positionResult);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không tải được danh sách kỳ lương."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const createPeriod = async (payload: CreatePayrollByTargetsPayload) => {
    const result = await payrollService.createByTargets(payload);
    setCreateOpen(false);
    await loadData();
    const periodId = result.payrolls[0]?.periodId;
    if (periodId) navigate(paths.payrollPeriodOverview(periodId));
  };

  return (
    <AppLayout>
      <main className="h-full overflow-y-auto bg-[#f1f5f9]">
        <div className="grid gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">Kỳ lương</h1>
              <p className="text-sm text-[#667085]">Quản lý các kỳ lương và quy trình duyệt.</p>
            </div>
            <div className="flex gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-lg border border-[#d0d5dd] bg-white" type="button" onClick={() => void loadData()}>
                <RefreshCcw className="h-4 w-4" />
              </button>
              {canManage ? (
                <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#006fd5] px-4 text-sm font-semibold text-white!" type="button" onClick={() => setCreateOpen(true)}>
                  <FilePlus2 className="h-4 w-4" />
                  Tạo kỳ lương
                </button>
              ) : null}
            </div>
          </div>
          {errorMessage ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}
          <section className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
            {loading ? (
              <div className="grid min-h-56 place-items-center text-sm text-[#667085]">Đang tải kỳ lương...</div>
            ) : periods.length ? (
              <div className="overflow-auto">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="bg-[#f8fafc] text-xs uppercase text-[#667085]">
                    <tr>
                      <th className="px-4 py-3 text-left">Kỳ lương</th>
                      <th className="px-4 py-3 text-left">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Bảng lương</th>
                      <th className="px-4 py-3 text-right">Đợt trả</th>
                      <th className="px-4 py-3 text-left">Ngày tạo</th>
                      <th className="px-4 py-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {periods.map((period) => (
                      <tr className="hover:bg-[#f8fafc]" key={period.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 font-semibold text-[#243247]">
                            <CalendarDays className="h-4 w-4 text-[#006fd5]" />
                            {period.name || `Kỳ lương ${period.month}/${period.year}`}
                          </div>
                          <div className="mt-1 text-xs text-[#667085]">Tháng {period.month}/{period.year}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[period.status]}`}>
                            {statusLabel[period.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{period._count?.payrolls ?? 0}</td>
                        <td className="px-4 py-3 text-right font-semibold">{period._count?.paymentBatches ?? 0}</td>
                        <td className="px-4 py-3 text-[#667085]">{formatDate(period.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <button className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff] text-[#006fd5] hover:bg-[#006fd5] hover:text-white!" type="button" onClick={() => navigate(paths.payrollPeriodOverview(period.id))}>
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
              <div className="grid min-h-56 place-items-center text-sm text-[#667085]">Chưa có kỳ lương.</div>
            )}
          </section>
        </div>
      </main>
      <CreatePeriodModal open={createOpen} departments={departments} positions={positions} onClose={() => setCreateOpen(false)} onSubmit={createPeriod} />
    </AppLayout>
  );
}
