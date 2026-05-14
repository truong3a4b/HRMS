import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Badge,
  BriefcaseBusiness,
  CalendarDays,
  Edit2,
  Heart,
  Mail,
  Phone,
  Tag,
  User,
  WalletCards,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { EditEmployeeModal } from "../components/EmployeeModals";
import { employeeService } from "../services/employeeService";
import type {
  Employee,
  EmployeeOption,
  EmployeeStatus,
  UpdateEmployeeBasicPayload,
  UpdateEmployeeJobPayload,
} from "../types/employee.types";

type DetailRow = {
  label: string;
  value: string;
};

const statusLabels: Record<EmployeeStatus, string> = {
  WORKING: "Đang làm việc",
  ON_LEAVE: "Đang nghỉ phép",
  RESIGNED: "Đã nghỉ việc",
};

const genderLabels = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
} as const;

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

  return "Không tải được thông tin nhân viên";
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function formatCurrency(value?: string | number | null) {
  if (value == null || value === "") {
    return "-";
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function countWorkDays(hireDate?: string | null) {
  if (!hireDate) {
    return "-";
  }

  const start = new Date(hireDate);
  if (Number.isNaN(start.getTime())) {
    return "-";
  }

  const today = new Date();
  const diff = today.getTime() - start.getTime();
  const days = Math.max(0, Math.floor(diff / 86_400_000) + 1);

  return `${days} ngày làm việc`;
}

function display(value?: string | number | null) {
  return value == null || value === "" ? "-" : String(value);
}

function DetailSection({ title, rows }: { title: string; rows: DetailRow[] }) {
  return (
    <section className="rounded-lg border border-[#e5eaf0] bg-white p-6 shadow-[0_12px_28px_rgba(16,24,40,0.06)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#edf1f5] pb-4">
        <h2 className="text-lg font-bold text-[#1f2937]">{title}</h2>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 max-[780px]:grid-cols-1">
        {rows.map((row) => (
          <div
            className="min-w-0 rounded-lg border border-[#edf1f5] bg-[#fbfcfe] px-4 py-3"
            key={row.label}
          >
            <span className="block text-xs font-medium uppercase text-[#667085]">
              {row.label}
            </span>
            <span className="mt-1 block min-w-0 break-words text-sm font-semibold text-[#243247]">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"personal" | "work">("personal");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<EmployeeOption[]>([]);
  const [positions, setPositions] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const loadEmployee = async () => {
    if (!id) {
      setErrorMessage("Không tìm thấy mã nhân viên");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await employeeService.getEmployeeById(id);
      setEmployee(result);
    } catch (error) {
      setEmployee(null);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadEmployee();
  }, [id]);

  useEffect(() => {
    let ignore = false;

    Promise.allSettled([
      employeeService.getDepartments(),
      employeeService.getPositions(),
    ]).then(([departmentResult, positionResult]) => {
      if (ignore) {
        return;
      }

      if (departmentResult.status === "fulfilled") {
        setDepartments(departmentResult.value);
      }

      if (positionResult.status === "fulfilled") {
        setPositions(positionResult.value);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  const personalRows = useMemo<DetailRow[]>(
    () =>
      employee
        ? [
            { label: "Họ tên", value: employee.name },
            { label: "Email", value: employee.email },
            { label: "Số điện thoại", value: display(employee.phone) },
            { label: "Ngày sinh", value: formatDate(employee.dateOfBirth) },
            {
              label: "Giới tính",
              value: employee.gender ? genderLabels[employee.gender] : "-",
            },
            { label: "Nơi thường trú", value: display(employee.address) },
            { label: "Nơi ở hiện tại", value: display(employee.address) },
            {
              label: "Tài khoản ngân hàng",
              value: display(employee.bankAccount),
            },
          ]
        : [],
    [employee],
  );

  const workRows = useMemo<DetailRow[]>(
    () =>
      employee
        ? [
            { label: "Mã nhân viên", value: display(employee.employeeId) },
            { label: "Bộ phận", value: display(employee.department?.name) },
            { label: "Chức vụ", value: display(employee.position?.name) },
            { label: "Ngày vào làm", value: formatDate(employee.hireDate) },
            { label: "Thâm niên", value: countWorkDays(employee.hireDate) },
            { label: "Lương", value: formatCurrency(employee.salary) },
            { label: "Trạng thái", value: statusLabels[employee.status] },
          ]
        : [],
    [employee],
  );

  const handleEditEmployee = async (
    employeeId: string,
    basicPayload: UpdateEmployeeBasicPayload,
    jobPayload: UpdateEmployeeJobPayload,
  ) => {
    await employeeService.updateEmployeeBasic(employeeId, basicPayload);

    const current = employee;
    const jobChanged =
      !current ||
      (current.departmentId ?? current.department?.id ?? "") !==
        jobPayload.departmentId ||
      (current.positionId ?? current.position?.id ?? "") !==
        jobPayload.positionId ||
      (current.hireDate ?? "").slice(0, 10) !== jobPayload.hireDate ||
      Number(current.salary ?? 0) !== jobPayload.salary ||
      current.status !== jobPayload.status;

    if (jobChanged) {
      await employeeService.updateEmployeeJob(employeeId, jobPayload);
    }

    setEditOpen(false);
    await loadEmployee();
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-auto bg-[#f7f8fa]">
        <div className="min-h-full px-5 py-5 max-[640px]:px-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
              type="button"
              onClick={() => navigate("/employees")}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>
            {employee ? (
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8]"
                type="button"
                onClick={() => setEditOpen(true)}
              >
                <Edit2 className="h-4 w-4" />
                Chỉnh sửa
              </button>
            ) : null}
          </div>

          {isLoading ? (
            <div className="rounded-lg border border-[#e7ebf0] bg-white py-16 text-center text-[#667085]">
              Đang tải thông tin nhân viên...
            </div>
          ) : errorMessage ? (
            <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
              {errorMessage}
            </div>
          ) : employee ? (
            <div className="grid min-h-[calc(100dvh-132px)] grid-cols-[370px_minmax(0,1fr)] overflow-hidden rounded-lg border border-[#e2e6ea] bg-white max-[980px]:grid-cols-1">
              <aside className="border-r border-[#e2e6ea] bg-white px-6 py-8 max-[980px]:border-b max-[980px]:border-r-0">
                <div className="flex flex-col items-center text-center">
                  <Avatar
                    src={employee.avatar}
                    alt={employee.name}
                    sizeClass="h-56 w-56"
                    className="rounded-lg! border border-[#e2e6ea] p-1"
                  />
                  <h1 className="mt-6 text-2xl font-bold text-[#243247]">
                    {employee.name}
                  </h1>
                  <p className="mt-2 text-base text-[#667085]">
                    {employee.position?.name || "-"}
                  </p>
                </div>

                <div className="mt-7 border-t border-[#e2e6ea] pt-6">
                  <div className="grid gap-4 text-base text-[#243247]">
                    <div className="flex min-w-0 items-center gap-3">
                      <Heart className="h-5 w-5 shrink-0 text-[#ff5a66]" />
                      <span>{countWorkDays(employee.hireDate)}</span>
                    </div>
                    <div className="flex min-w-0 items-center gap-3">
                      <Tag className="h-5 w-5 shrink-0 text-[#98a2b3]" />
                      <span>Mã nhân viên {employee.employeeId || "-"}</span>
                    </div>
                    <div className="flex min-w-0 items-center gap-3">
                      <Mail className="h-5 w-5 shrink-0 text-[#98a2b3]" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex min-w-0 items-center gap-3">
                      <Phone className="h-5 w-5 shrink-0 text-[#98a2b3]" />
                      <span>{employee.phone || "-"}</span>
                    </div>
                  </div>
                </div>
              </aside>

              <section className="min-w-0 bg-[#fbfcfd]">
                <div className="flex border-b border-[#e2e6ea] bg-white">
                  <button
                    className={`inline-flex min-h-16 items-center gap-2 border-b-2 px-12 text-lg font-semibold transition-colors max-[640px]:flex-1 max-[640px]:justify-center max-[640px]:px-4 ${
                      activeTab === "personal"
                        ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5]"
                        : "border-transparent text-[#344054] hover:bg-[#f9fafb]"
                    }`}
                    type="button"
                    onClick={() => setActiveTab("personal")}
                  >
                    <User className="h-5 w-5" />
                    Cá nhân
                  </button>
                  <button
                    className={`inline-flex min-h-16 items-center gap-2 border-b-2 px-12 text-lg font-semibold transition-colors max-[640px]:flex-1 max-[640px]:justify-center max-[640px]:px-4 ${
                      activeTab === "work"
                        ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5]"
                        : "border-transparent text-[#344054] hover:bg-[#f9fafb]"
                    }`}
                    type="button"
                    onClick={() => setActiveTab("work")}
                  >
                    <BriefcaseBusiness className="h-5 w-5" />
                    Công việc
                  </button>
                </div>

                <div className="p-5">
                  {activeTab === "personal" ? (
                    <DetailSection
                      title="Thông tin cơ bản"
                      rows={personalRows}
                    />
                  ) : (
                    <div className="grid gap-5">
                      <DetailSection
                        title="Thông tin công việc"
                        rows={workRows}
                      />
                      <section className="rounded-lg border border-[#e7ebf0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                        <h2 className="text-xl font-bold text-[#1f2937]">
                          Tóm tắt
                        </h2>
                        <div className="mt-5 grid grid-cols-3 gap-4 max-[780px]:grid-cols-1">
                          <div className="rounded-lg border border-[#edf0f5] bg-[#fbfcff] p-4">
                            <Badge className="h-5 w-5 text-[#006fd5]" />
                            <span className="mt-3 block text-sm text-[#667085]">
                              Trạng thái
                            </span>
                            <strong className="mt-1 block text-base text-[#243247]">
                              {statusLabels[employee.status]}
                            </strong>
                          </div>
                          <div className="rounded-lg border border-[#edf0f5] bg-[#fbfcff] p-4">
                            <CalendarDays className="h-5 w-5 text-[#006fd5]" />
                            <span className="mt-3 block text-sm text-[#667085]">
                              Ngày vào làm
                            </span>
                            <strong className="mt-1 block text-base text-[#243247]">
                              {formatDate(employee.hireDate)}
                            </strong>
                          </div>
                          <div className="rounded-lg border border-[#edf0f5] bg-[#fbfcff] p-4">
                            <WalletCards className="h-5 w-5 text-[#006fd5]" />
                            <span className="mt-3 block text-sm text-[#667085]">
                              Lương
                            </span>
                            <strong className="mt-1 block text-base text-[#243247]">
                              {formatCurrency(employee.salary)}
                            </strong>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </main>

      <EditEmployeeModal
        open={editOpen}
        employee={employee}
        departments={departments}
        positions={positions}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditEmployee}
      />
    </AppLayout>
  );
}
