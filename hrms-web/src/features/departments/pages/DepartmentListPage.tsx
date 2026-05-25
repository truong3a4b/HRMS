import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Modal } from "antd";
import {
  ArrowRightLeft,
  Edit2,
  Info,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import { employeeService } from "../../employees/services/employeeService";
import type { Employee } from "../../employees/types/employee.types";
import { departmentService } from "../services/departmentService";
import type { Department } from "../types/department.types";
import { useAuth } from "../../auth/services/useAuth";

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";

const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

const emptyForm = {
  name: "",
  code: "",
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
  employees: Employee[];
  onClose: () => void;
  onSubmit: (form: typeof emptyForm) => Promise<void>;
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCreateMode = !department;
  const selectedManager = useMemo(
    () => employees.find((employee) => employee.id === form.managerId) ?? null,
    [employees, form.managerId],
  );

  useEffect(() => {
    if (open) {
      setForm({
        name: department?.name ?? "",
        code: department?.code ?? "",
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
      onCancel={onClose}
      width={620}
      centered
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '8px' } }}
      footer={
        <div className="flex justify-end gap-3 pt-4 border-t border-[#edf0f5]">
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
            form="departmentForm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      }
    >
      <form id="departmentForm" onSubmit={handleSubmit}>
        {error ? (
          <div className="mb-4 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}
        <div className="grid gap-4">
          {isCreateMode ? (
            <div className="rounded-lg border border-[#c7dcf2] bg-[#f2f8ff] px-4 py-3 text-sm text-[#175cd3]">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-semibold">Mã bộ phận có thể nhập hoặc để trống.</div>
                  <div className="mt-0.5 text-[#475467]">
                    Nếu để trống, hệ thống sẽ tự sinh mã. Nếu chọn trưởng bộ phận đang thuộc bộ phận khác, hệ thống sẽ chuyển nhân viên đó sang bộ phận mới sau khi lưu.
                  </div>
                </div>
              </div>
            </div>
          ) : null}
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
          {isCreateMode ? (
            <label>
              <span className={labelClass}>Mã bộ phận</span>
              <input
                className={fieldClass}
                value={form.code}
                placeholder="Tự sinh nếu để trống"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value,
                  }))
                }
              />
            </label>
          ) : (
            <label>
              <span className={labelClass}>Mã bộ phận</span>
              <input
                className={`${fieldClass} bg-[#f9fafb]`}
                value={form.code || "Tự sinh"}
                disabled
              />
            </label>
          )}
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
            <SearchableSelect
              value={form.managerId}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  managerId: value,
                }))
              }
              options={[
                { value: "", label: "Chưa chọn" },
                ...employees.map((employee) => ({
                  value: employee.id,
                  label: `${employee.name} - ${employee.email}${
                    employee.department?.name ? ` (${employee.department.name})` : ""
                  }`,
                }))
              ]}
            />
          </label>
          {selectedManager ? (
            <div className="rounded-lg border border-[#edf0f5] bg-[#fbfcfe] px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={selectedManager.avatar}
                  alt={selectedManager.name}
                  sizeClass="h-10 w-10"
                />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-[#243247]">
                    {selectedManager.name}
                  </strong>
                  <span className="block truncate text-xs text-[#667085]">
                    {selectedManager.email} | Hiện tại:{" "}
                    {selectedManager.department?.name ?? "Chưa thuộc bộ phận"}
                  </span>
                </div>
              </div>
              {isCreateMode ? (
                <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  <ArrowRightLeft className="h-4 w-4 shrink-0" />
                  Nhân viên này sẽ được gán vào bộ phận mới khi tạo.
                </div>
              ) : null}
            </div>
          ) : null}
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
      centered
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '8px' } }}
    >
      {isLoading ? (
        <div className="py-10 text-center text-[#667085]">Đang tải dữ liệu...</div>
      ) : employees.length === 0 ? (
        <div className="py-10 text-center text-[#667085]">
          Bộ phận chưa có nhân viên
        </div>
      ) : (
        <div className="flex flex-col">
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
  const { user } = useAuth();
  const canSetup = user?.role === "ADMIN" || user?.permissions?.includes("DEPARTMENT_SETUP");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
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
      .getEmployees({ page: 1, limit: -1, search: "" })
      .then((result) => {
        setEmployees(result.items ?? []);
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
        code: form.code.trim() || undefined,
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
            </div>
            {canSetup ? (
              <button
                className="flex shrink-0 items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-white! transition-colors hover:bg-[#0055a8] active:bg-[#003f7a] [&_*]:!text-white"
                type="button"
                onClick={openAdd}
              >
                <Plus className="h-5 w-5" />
                Thêm bộ phận
              </button>
            ) : null}
          </div>

          <div className="flex gap-3 overflow-x-auto rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(16,24,40,0.06)] border border-[#d0d5dd] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d0d5dd]">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#667085]" />
              <input
                className="w-full rounded-xl border border-[#d0d5dd] bg-white py-2.5 pl-10 pr-4 text-sm text-[#344054] shadow-sm transition-all placeholder-[#98a2b3] focus:border-[#006fd5] focus:outline-none focus:ring-4 focus:ring-[#006fd5]/10 hover:border-[#98a2b3]"
                value={searchTerm}
                placeholder="Tìm kiếm bộ phận..."
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <button
              className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-[#d0d5dd] bg-white text-[#667085] shadow-sm transition-all hover:bg-[#f9fafb] hover:text-[#344054] active:scale-95"
              type="button"
              title="Tải lại"
              onClick={() => void loadDepartments()}
            >
              <RefreshCcw className="h-4.5 w-4.5" />
            </button>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
              {errorMessage}
            </div>
          ) : null}

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#d0d5dd] bg-white shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-16 text-[#667085]">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#006fd5] border-r-transparent"></div>
                  <p className="text-sm font-medium">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : filteredDepartments.length === 0 ? (
              <div className="flex h-full items-center justify-center py-16 text-[#667085]">
                <div className="flex flex-col items-center gap-3 opacity-60">
                  <Users className="h-12 w-12 text-[#98a2b3]" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-[#667085]">Chưa có bộ phận nào</p>
                </div>
              </div>
            ) : (
              <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-[#d0d5dd] bg-[#f9fafb]/90 backdrop-blur-md">
                      <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        Mã
                      </th>
                      <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        Bộ phận
                      </th>
                      <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        Trưởng bộ phận
                      </th>
                      <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        Nhân viên
                      </th>
                      <th className="px-5 py-3.5 text-center text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d0d5dd]">
                    {filteredDepartments.map((department, index) => (
                      <tr
                        className="group transition-colors hover:bg-[#f8faff]"
                        key={department.id}
                      >
                        <td className="px-5 py-4 text-sm text-[#667085]">
                          {index + 1}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-[#344054]">
                          {department.code ?? "-"}
                        </td>
                        <td className="px-5 py-4">
                          <strong className="block text-sm font-semibold text-[#243247] group-hover:text-[#006fd5] transition-colors">
                            {department.name}
                          </strong>
                          <span className="line-clamp-2 text-xs text-[#667085] mt-0.5">
                            {department.description || "Không có mô tả"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#344054]">
                          {department.manager?.name ?? "-"}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#344054]">
                          <span className="inline-flex rounded-md bg-[#f2f4f7] px-2 py-1 text-xs font-medium text-[#344054]">
                            {department.employeeCount ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-[#006fd5] transition-all hover:bg-[#006fd5] hover:text-white hover:shadow-md hover:shadow-blue-500/20 active:scale-95"
                              type="button"
                              title="Xem nhân viên"
                              onClick={() => void openEmployees(department)}
                            >
                              <Users className="h-4 w-4" />
                            </button>
                            {canSetup ? (
                              <>
                                <button
                                  className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white hover:shadow-md hover:shadow-emerald-500/20 active:scale-95"
                                  type="button"
                                  title="Sửa"
                                  onClick={() => openEdit(department)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="grid h-8 w-8 place-items-center rounded-lg bg-[#fef3f2] text-[#b42318] transition-all hover:bg-[#b42318] hover:text-white hover:shadow-md hover:shadow-rose-500/20 active:scale-95"
                                  type="button"
                                  title="Xóa"
                                  onClick={() => handleDelete(department)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#d0d5dd] bg-[#fcfcfd] px-5 py-3.5 max-[720px]:flex-col max-[720px]:items-stretch">
              <span className="text-sm font-medium text-[#667085]">
                Hiển thị {filteredDepartments.length} / {departments.length} bộ phận
              </span>
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
