import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Modal } from "antd";
import {
  Edit2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { employeeService } from "../../employees/services/employeeService";
import type { Employee, EmployeeOption } from "../../employees/types/employee.types";
import { departmentService } from "../services/departmentService";
import type { Department } from "../types/department.types";

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";

const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

const emptyForm = {
  name: "",
  description: "",
  managerId: "",
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

    if (data.message) {
      return data.message;
    }
  }

  return fallback;
}

function DepartmentFormModal({
  open,
  department,
  employees,
  onClose,
  onSubmit,
}: {
  open: boolean;
  department: Department | null;
  employees: EmployeeOption[];
  onClose: () => void;
  onSubmit: (form: typeof emptyForm) => Promise<void>;
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: department?.name ?? "",
        description: department?.description ?? "",
        managerId: department?.manager?.id ?? department?.managerId ?? "",
      });
      setError(null);
    }
  }, [department, open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      setError("Tên bộ phận phải có ít nhất 2 ký tự.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu bộ phận"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={department ? "Chỉnh sửa bộ phận" : "Thêm bộ phận"}
      footer={null}
      onCancel={onClose}
      width={620}
    >
      <form onSubmit={handleSubmit}>
        {error ? (
          <div className="mb-4 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}
        <div className="grid gap-4">
          <label>
            <span className={labelClass}>Tên bộ phận</span>
            <input
              className={fieldClass}
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>
          <label>
            <span className={labelClass}>Mô tả</span>
            <textarea
              className={`${fieldClass} min-h-24 resize-y`}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span className={labelClass}>Trưởng bộ phận</span>
            <select
              className={fieldClass}
              value={form.managerId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  managerId: event.target.value,
                }))
              }
            >
              <option value="">Chưa chọn</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button
            className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EmployeeListModal({
  open,
  department,
  employees,
  isLoading,
  onClose,
}: {
  open: boolean;
  department: Department | null;
  employees: Employee[];
  isLoading: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      title={department ? `Nhân viên - ${department.name}` : "Nhân viên"}
      footer={null}
      onCancel={onClose}
      width={720}
    >
      {isLoading ? (
        <div className="py-10 text-center text-[#667085]">Đang tải dữ liệu...</div>
      ) : employees.length === 0 ? (
        <div className="py-10 text-center text-[#667085]">
          Bộ phận chưa có nhân viên
        </div>
      ) : (
        <div className="max-h-100 overflow-auto">
          {employees.map((employee) => (
            <div
              className="flex items-center gap-3 border-b border-[#edf0f5] py-3 last:border-b-0"
              key={employee.id}
            >
              <Avatar
                src={employee.avatar}
                alt={employee.name}
                sizeClass="h-10 w-10"
              />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm text-[#243247]">
                  {employee.name}
                </strong>
                <span className="block truncate text-xs text-[#667085]">
                  {employee.email} | {employee.position?.name ?? "-"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export function DepartmentListPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [departmentEmployees, setDepartmentEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const filteredDepartments = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return departments;
    }

    return departments.filter((department) =>
      [department.name, department.code, department.description]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [departments, searchTerm]);

  const loadDepartments = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await departmentService.getDepartments();
      setDepartments(result);
    } catch (error) {
      setDepartments([]);
      setErrorMessage(getErrorMessage(error, "Không tải được danh sách bộ phận"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDepartments();

    employeeService
      .getEmployees({ page: 1, limit: 100, search: "" })
      .then((result) => {
        setEmployees(
          (result.items ?? []).map((employee) => ({
            id: employee.id,
            name: `${employee.name} - ${employee.email}`,
          })),
        );
      })
      .catch(() => setEmployees([]));
  }, []);

  const openAdd = () => {
    setSelectedDepartment(null);
    setFormOpen(true);
  };

  const openEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormOpen(true);
  };

  const handleSubmit = async (form: typeof emptyForm) => {
    if (selectedDepartment) {
      await departmentService.updateDepartment(selectedDepartment.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
      });
      await departmentService.updateManager(
        selectedDepartment.id,
        form.managerId || null,
      );
    } else {
      await departmentService.createDepartment({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        managerId: form.managerId || null,
      });
    }

    setFormOpen(false);
    setSelectedDepartment(null);
    await loadDepartments();
  };

  const handleDelete = (department: Department) => {
    Modal.confirm({
      title: "Xóa bộ phận",
      content: `Bạn có chắc chắn muốn xóa ${department.name}?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        await departmentService.deleteDepartment(department.id);
        await loadDepartments();
      },
    });
  };

  const openEmployees = async (department: Department) => {
    setSelectedDepartment(department);
    setEmployeeModalOpen(true);
    setEmployeesLoading(true);
    try {
      const result = await departmentService.getEmployeesByDepartment(
        department.id,
      );
      setDepartmentEmployees(result);
    } catch {
      setDepartmentEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden">
        <div className="flex h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">
                Danh sách bộ phận
              </h1>
              <p className="text-sm text-[#667085]">
                Quản lý bộ phận, trưởng bộ phận và số lượng nhân viên
              </p>
            </div>
            <button
              className="flex shrink-0 items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-white! transition-colors hover:bg-[#0055a8] active:bg-[#003f7a] [&_*]:!text-white"
              type="button"
              onClick={openAdd}
            >
              <Plus className="h-5 w-5" />
              Thêm bộ phận
            </button>
          </div>

          <div className="flex flex-wrap gap-3 rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" />
              <input
                type="text"
                placeholder="Tìm kiếm bộ phận..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-lg border border-[#d0d5dd] bg-white py-2 pl-10 pr-4 text-sm text-[#344054] placeholder-[#98a2b3] transition-colors focus:border-[#006fd5] focus:outline-none focus:ring-2 focus:ring-[#006fd5]/10"
              />
            </div>
            <button
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#d0d5dd] text-[#344054] transition-colors hover:bg-[#f9fafb] active:bg-[#eef2f6]"
              type="button"
              onClick={() => void loadDepartments()}
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
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-12 text-[#667085]">
                Đang tải dữ liệu...
              </div>
            ) : filteredDepartments.length === 0 ? (
              <div className="flex h-full items-center justify-center py-12 text-[#667085]">
                Chưa có bộ phận nào
              </div>
            ) : (
              <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                <table className="w-full min-w-220">
                  <thead className="sticky top-0 z-1">
                    <tr className="border-b border-[#ebedf2] bg-[#f9fafb]">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Mã
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Bộ phận
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Trưởng bộ phận
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Nhân viên
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-[#344054]">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartments.map((department, index) => (
                      <tr
                        key={department.id}
                        className="border-b border-[#ebedf2] transition-colors hover:bg-[#f9fafb]"
                      >
                        <td className="px-4 py-3 text-sm text-[#344054]">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-[#344054]">
                          {department.code ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <strong className="block text-sm text-[#344054]">
                            {department.name}
                          </strong>
                          <span className="line-clamp-2 text-xs text-[#667085]">
                            {department.description || "Không có mô tả"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#344054]">
                          {department.manager?.name ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#344054]">
                          {department.employeeCount ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#006fd5] text-white! transition-colors hover:bg-[#0055a8]"
                              type="button"
                              title="Xem nhân viên"
                              onClick={() => void openEmployees(department)}
                            >
                              <Users className="h-4 w-4" />
                            </button>
                            <button
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#006fd5] text-white! transition-colors hover:bg-[#0055a8]"
                              type="button"
                              title="Sửa"
                              onClick={() => openEdit(department)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3f2] text-[#b42318] transition-colors hover:bg-[#fee4e2]"
                              type="button"
                              title="Xóa"
                              onClick={() => handleDelete(department)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="shrink-0 border-t border-[#ebedf2] px-4 py-3 text-sm text-[#667085]">
              Hiển thị {filteredDepartments.length} / {departments.length} bộ phận
            </div>
          </section>
        </div>
      </main>
      <DepartmentFormModal
        open={formOpen}
        department={selectedDepartment}
        employees={employees}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
      <EmployeeListModal
        open={employeeModalOpen}
        department={selectedDepartment}
        employees={departmentEmployees}
        isLoading={employeesLoading}
        onClose={() => setEmployeeModalOpen(false)}
      />
    </AppLayout>
  );
}
