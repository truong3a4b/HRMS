import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../../../app/layouts";
import {
  AddEmployeeModal,
  EditEmployeeModal,
} from "../components/EmployeeModals";
import { EmployeeTable } from "../components/EmployeeTable";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import { employeeService } from "../services/employeeService";
import type {
  CreateEmployeePayload,
  Employee,
  EmployeeListMeta,
  EmployeeOption,
  EmployeeStatus,
  UpdateEmployeeBasicPayload,
  UpdateEmployeeJobPayload,
} from "../types/employee.types";

const statusOptions: Array<{ value: EmployeeStatus; label: string }> = [
  { value: "WORKING", label: "Đang làm việc" },
  { value: "ON_LEAVE", label: "Đang nghỉ phép" },
  { value: "RESIGNED", label: "Đã nghỉ việc" },
];

const initialMeta: EmployeeListMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

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

  return "Không tải được danh sách nhân viên";
}

export function EmployeeListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [status, setStatus] = useState<EmployeeStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<EmployeeOption[]>([]);
  const [positions, setPositions] = useState<EmployeeOption[]>([]);
  const [meta, setMeta] = useState<EmployeeListMeta>(initialMeta);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const rowOffset = useMemo(
    () => (currentPage - 1) * pageSize,
    [currentPage, pageSize],
  );

  const visibleStart = meta.total === 0 ? 0 : rowOffset + 1;
  const visibleEnd = Math.min(rowOffset + employees.length, meta.total);

  const resetToFirstPage = () => setCurrentPage(1);

  const loadEmployees = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await employeeService.getEmployees({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        departmentId,
        positionId,
        status: status || undefined,
      });

      setEmployees(result.items ?? []);
      setMeta(result.meta ?? initialMeta);
    } catch (error) {
      setEmployees([]);
      setMeta(initialMeta);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    let ignore = false;

    setIsLoading(true);
    setErrorMessage(null);
    employeeService
      .getEmployees({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        departmentId,
        positionId,
        status: status || undefined,
      })
      .then((result) => {
        if (ignore) {
          return;
        }

        setEmployees(result.items ?? []);
        setMeta(result.meta ?? initialMeta);
      })
      .catch((error: unknown) => {
        if (ignore) {
          return;
        }

        setEmployees([]);
        setMeta(initialMeta);
        setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentPage, departmentId, pageSize, positionId, searchTerm, status]);

  const handleAddEmployee = async (payload: CreateEmployeePayload) => {
    await employeeService.createEmployee(payload);
    setAddOpen(false);
    setCurrentPage(1);
    await loadEmployees();
  };

  const handleEditEmployee = async (
    id: string,
    basicPayload: UpdateEmployeeBasicPayload,
    jobPayload: UpdateEmployeeJobPayload,
  ) => {
    await employeeService.updateEmployeeBasic(id, basicPayload);

    const current = selectedEmployee;
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
      await employeeService.updateEmployeeJob(id, jobPayload);
    }

    setEditOpen(false);
    setSelectedEmployee(null);
    await loadEmployees();
  };

  const handleEdit = async (employee: Employee) => {
    const detail = await employeeService.getEmployeeById(employee.id);
    setSelectedEmployee(detail);
    setEditOpen(true);
  };

  const handleView = (employee: Employee) => {
    navigate(`/employees/${employee.id}`);
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden">
        <div className="flex h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">
                Danh sách nhân viên
              </h1>
              <p className="text-sm text-[#667085]">
                Quản lý thông tin nhân viên
              </p>
            </div>
            <button
              className="flex shrink-0 items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-white! transition-colors hover:bg-[#0055a8] active:bg-[#003f7a] [&_*]:!text-white"
              type="button"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Thêm nhân viên
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d0d5dd]">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" />
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  resetToFirstPage();
                }}
                className="w-full rounded-lg border border-[#d0d5dd] bg-white py-2 pl-10 pr-4 text-sm text-[#344054] placeholder-[#98a2b3] transition-colors focus:border-[#006fd5] focus:outline-none focus:ring-2 focus:ring-[#006fd5]/10"
              />
            </div>
            <SearchableSelect
              className="min-w-[160px] flex-1"
              value={departmentId}
              onChange={(value) => {
                setDepartmentId(value);
                resetToFirstPage();
              }}
              options={[
                { value: "", label: "Tất cả bộ phận" },
                ...departments.map((department) => ({ value: department.id, label: department.name }))
              ]}
            />
            <SearchableSelect
              className="min-w-[160px] flex-1"
              value={positionId}
              onChange={(value) => {
                setPositionId(value);
                resetToFirstPage();
              }}
              options={[
                { value: "", label: "Tất cả chức vụ" },
                ...positions.map((position) => ({ value: position.id, label: position.name }))
              ]}
            />
            <select
              className="min-w-[160px] flex-1 rounded-lg border border-[#d0d5dd] bg-white px-4 py-2 text-sm text-[#344054] transition-colors hover:border-[#b0b0b0] focus:border-[#006fd5] focus:outline-none focus:ring-2 focus:ring-[#006fd5]/10"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as EmployeeStatus | "");
                resetToFirstPage();
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#d0d5dd] text-[#344054] transition-colors hover:bg-[#f9fafb] active:bg-[#eef2f6]"
              type="button"
              onClick={() => void loadEmployees()}
              title="Tải lại"
            >
              <RefreshCcw className="h-4.5 w-4.5" />
            </button>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
              {errorMessage}
            </div>
          ) : null}

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#ebedf2] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
            <EmployeeTable
              employees={employees}
              isLoading={isLoading}
              rowOffset={rowOffset}
              onEdit={handleEdit}
              onView={handleView}
            />
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#ebedf2] px-4 py-3 max-[720px]:flex-col max-[720px]:items-stretch">
              <span className="text-sm text-[#667085]">
                Hiển thị {visibleStart}-{visibleEnd} / {meta.total} nhân viên
              </span>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={meta.total}
                showSizeChanger
                pageSizeOptions={[10, 20, 50]}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
              />
            </div>
          </section>

          <AddEmployeeModal
            open={addOpen}
            departments={departments}
            positions={positions}
            onClose={() => setAddOpen(false)}
            onSubmit={handleAddEmployee}
          />
          <EditEmployeeModal
            open={editOpen}
            employee={selectedEmployee}
            departments={departments}
            positions={positions}
            onClose={() => setEditOpen(false)}
            onSubmit={handleEditEmployee}
          />
        </div>
      </main>
    </AppLayout>
  );
}
