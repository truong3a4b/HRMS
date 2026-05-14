import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Modal } from "antd";
import {
  Briefcase,
  CheckSquare,
  Edit2,
  Plus,
  RefreshCcw,
  Search,
  Shield,
  Trash2,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import {
  extractPermissionKeys,
  fallbackPermissions,
  positionService,
} from "../services/positionService";
import type {
  PermissionCatalogItem,
  PermissionKey,
  Position,
} from "../types/position.types";

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";

const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

const emptyForm = {
  name: "",
  code: "",
  description: "",
};

const groupLabels: Record<string, string> = {
  position: "Chức vụ",
  recruitment: "Tuyển dụng",
  department: "Bộ phận",
  employee: "Nhân viên",
  schedule: "Lịch làm việc",
  attendance: "Chấm công",
  payroll: "Lương",
};

/** Tên tiếng Việt cố định cho từng mã quyền — ưu tiên hơn dữ liệu từ server */
const permissionNameMap: Record<string, string> = {
  POSITION_SETUP: "Cấu hình chức vụ",
  POSITION_VIEW: "Xem chức vụ",
  RECRUITMENT_MANAGE_JOB: "Quản lý tin tuyển dụng",
  RECRUITMENT_VIEW_APPLICATION: "Xem hồ sơ ứng viên",
  RECRUITMENT_MANAGE_APPLICATION: "Quản lý hồ sơ ứng viên",
  RECRUITMENT_APPROVE_DIRECT: "Duyệt trực tiếp ứng viên",
  DEPARTMENT_VIEW: "Xem bộ phận",
  DEPARTMENT_SETUP: "Cấu hình bộ phận",
  EMPLOYEE_VIEW_LIST: "Xem danh sách nhân viên",
  EMPLOYEE_VIEW_DETAIL: "Xem chi tiết nhân viên",
  EMPLOYEE_CREATE: "Tạo nhân viên",
  EMPLOYEE_UPDATE_BASIC: "Sửa thông tin cơ bản",
  EMPLOYEE_UPDATE_JOB: "Sửa thông tin công việc",
  EMPLOYEE_UPDATE_SELF_BASIC: "Tự sửa thông tin cá nhân",
  WORK_SCHEDULE_MANAGE: "Quản lý lịch làm việc",
  WORK_SCHEDULE_REGISTER: "Đăng ký lịch làm việc",
  WORK_SCHEDULE_VIEW: "Xem lịch làm việc",
  ATTENDANCE_DEVICE_VIEW: "Xem thiết bị chấm công",
  ATTENDANCE_DEVICE_SETUP: "Cấu hình thiết bị chấm công",
  ATTENDANCE_HISTORY_VIEW: "Xem lịch sử chấm công",
  ATTENDANCE_TIMESHEET_VIEW: "Xem bảng công",
  PAYROLL_POLICY_VIEW: "Xem chính sách lương",
  PAYROLL_POLICY_SETUP: "Cấu hình chính sách lương",
  PAYROLL_VIEW: "Xem bảng lương",
  PAYROLL_MANAGE: "Quản lý bảng lương",
  PAYROLL_APPROVE: "Duyệt bảng lương",
  PAYROLL_PAY: "Chi trả lương",
  PAYROLL_VIEW_SELF: "Xem lương cá nhân",
};

function getViName(key: string, fallbackName?: string) {
  return permissionNameMap[key] ?? fallbackName ?? key;
}

function getPermissionGroup(key: PermissionKey) {
  if (key.startsWith("POSITION_")) return "position";
  if (key.startsWith("RECRUITMENT_")) return "recruitment";
  if (key.startsWith("DEPARTMENT_")) return "department";
  if (key.startsWith("EMPLOYEE_")) return "employee";
  if (key.startsWith("WORK_SCHEDULE_")) return "schedule";
  if (key.startsWith("ATTENDANCE_")) return "attendance";
  if (key.startsWith("PAYROLL_")) return "payroll";

  return "other";
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

    if (data.message) {
      return data.message;
    }
  }

  return fallback;
}

function PositionFormModal({
  open,
  position,
  permissions,
  onClose,
  onSubmit,
}: {
  open: boolean;
  position: Position | null;
  permissions: PermissionCatalogItem[];
  onClose: () => void;
  onSubmit: (
    form: typeof emptyForm,
    permissionKeys: PermissionKey[],
  ) => Promise<void>;
}) {
  const [form, setForm] = useState(emptyForm);
  const [selectedPermissions, setSelectedPermissions] = useState<
    Set<PermissionKey>
  >(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, PermissionCatalogItem[]>>(
      (groups, permission) => {
        const group = getPermissionGroup(permission.key);
        groups[group] ??= [];
        groups[group].push(permission);
        return groups;
      },
      {},
    );
  }, [permissions]);

  useEffect(() => {
    if (open) {
      setForm({
        name: position?.name ?? "",
        code: position?.code ?? "",
        description: position?.description ?? "",
      });
      setSelectedPermissions(
        new Set(position ? extractPermissionKeys(position) : []),
      );
      setError(null);
    }
  }, [open, position]);

  const togglePermission = (permission: PermissionKey, checked: boolean) => {
    setSelectedPermissions((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(permission);
      } else {
        next.delete(permission);
      }

      return next;
    });
  };

  const toggleGroup = (items: PermissionCatalogItem[], checked: boolean) => {
    setSelectedPermissions((current) => {
      const next = new Set(current);

      for (const item of items) {
        if (checked) {
          next.add(item.key);
        } else {
          next.delete(item.key);
        }
      }

      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      setError("Tên chức vụ phải có ít nhất 2 ký tự.");
      return;
    }

    if (selectedPermissions.size === 0) {
      setError("Vui lòng chọn ít nhất một quyền cho chức vụ.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(form, Array.from(selectedPermissions));
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu chức vụ"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const allSelected = selectedPermissions.size === permissions.length;

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0f7ff]">
            <Briefcase className="h-4 w-4 text-[#006fd5]" />
          </span>
          <span>{position ? "Chỉnh sửa chức vụ" : "Thêm chức vụ"}</span>
        </div>
      }
      footer={null}
      onCancel={onClose}
      width={860}
    >
      <form onSubmit={handleSubmit}>
        {error ? (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            <span className="mt-0.5 shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        ) : null}

        {/* ── Thông tin cơ bản ── */}
        <div className="mb-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
            <span className="text-sm font-semibold text-[#243247]">
              Thông tin chức vụ
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
            <label>
              <span className={labelClass}>
                Tên chức vụ <span className="text-[#f04438]">*</span>
              </span>
              <input
                className={fieldClass}
                placeholder="VD: Trưởng phòng, Nhân viên..."
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              <span className={labelClass}>Mã chức vụ</span>
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
            <label className="col-span-2 max-[680px]:col-span-1">
              <span className={labelClass}>Mô tả</span>
              <textarea
                className={`${fieldClass} min-h-[72px] resize-y`}
                placeholder="Mô tả ngắn về chức vụ này..."
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </label>
          </div>
        </div>

        {/* ── Phân quyền ── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-[#006fd5]" />
              <span className="text-sm font-semibold text-[#243247]">
                Phân quyền
              </span>
              <span className="rounded-full bg-[#f0f7ff] px-2 py-0.5 text-xs font-medium text-[#006fd5]">
                {selectedPermissions.size}/{permissions.length}
              </span>
            </div>
            <button
              className="flex items-center gap-1.5 rounded-lg border border-[#d0d5dd] px-3 py-1.5 text-xs font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
              type="button"
              onClick={() =>
                setSelectedPermissions(
                  allSelected
                    ? new Set()
                    : new Set(permissions.map((item) => item.key)),
                )
              }
            >
              <CheckSquare className="h-3.5 w-3.5" />
              {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
            {Object.entries(groupedPermissions).map(([group, items]) => {
              const selectedCount = items.filter((item) =>
                selectedPermissions.has(item.key),
              ).length;
              const allGroupSelected = selectedCount === items.length;
              const partialSelected = selectedCount > 0 && !allGroupSelected;

              return (
                <section
                  className="rounded-xl border border-[#edf0f5] bg-[#fbfcff] p-3"
                  key={group}
                >
                  {/* Group header */}
                  <label className="mb-2.5 flex cursor-pointer items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-[#f0f7ff]">
                        <Shield className="h-3.5 w-3.5 text-[#006fd5]" />
                      </span>
                      <span className="text-sm font-semibold text-[#243247]">
                        {groupLabels[group] ?? group}
                      </span>
                      {selectedCount > 0 && (
                        <span className="rounded-full bg-[#006fd5] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {selectedCount}
                        </span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#006fd5]"
                      checked={allGroupSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = partialSelected;
                      }}
                      onChange={(event) =>
                        toggleGroup(items, event.target.checked)
                      }
                    />
                  </label>
                  <div className="border-t border-[#edf0f5] pt-2">
                    <div className="grid gap-1.5">
                      {items.map((permission) => (
                        <label
                          key={permission.key}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                            selectedPermissions.has(permission.key)
                              ? "bg-[#f0f7ff]"
                              : "hover:bg-[#f5f5f5]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 shrink-0 accent-[#006fd5]"
                            checked={selectedPermissions.has(permission.key)}
                            onChange={(event) =>
                              togglePermission(
                                permission.key,
                                event.target.checked,
                              )
                            }
                          />
                          <span className="text-sm font-medium text-[#344054]">
                            {getViName(permission.key, permission.name)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button
            className="rounded-lg border border-[#d0d5dd] px-5 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-5 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Đang lưu..."
              : position
                ? "Cập nhật"
                : "Thêm chức vụ"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function PositionListPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [permissions, setPermissions] =
    useState<PermissionCatalogItem[]>(fallbackPermissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null,
  );

  const filteredPositions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return positions;
    }

    return positions.filter((position) =>
      [position.name, position.code, position.description]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [positions, searchTerm]);

  const loadPositions = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await positionService.getPositions();
      setPositions(result);
    } catch (error) {
      setPositions([]);
      setErrorMessage(
        getErrorMessage(error, "Không tải được danh sách chức vụ"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPositions();
    positionService
      .getPermissions()
      .then(setPermissions)
      .catch(() => setPermissions(fallbackPermissions));
  }, []);

  const openAdd = () => {
    setSelectedPosition(null);
    setFormOpen(true);
  };

  const openEdit = async (position: Position) => {
    setSelectedPosition(position);
    setFormOpen(true);

    try {
      const detail = await positionService.getPositionById(position.id);
      setSelectedPosition(detail);
    } catch {
      setSelectedPosition(position);
    }
  };

  const handleSubmit = async (
    form: typeof emptyForm,
    permissionKeys: PermissionKey[],
  ) => {
    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      description: form.description.trim() || undefined,
      permissionKeys,
    };

    if (selectedPosition) {
      await positionService.updatePosition(selectedPosition.id, payload);
    } else {
      await positionService.createPosition(payload);
    }

    setFormOpen(false);
    setSelectedPosition(null);
    await loadPositions();
  };

  const handleDelete = (position: Position) => {
    Modal.confirm({
      title: "Xóa chức vụ",
      content: `Bạn có chắc chắn muốn xóa ${position.name}?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        await positionService.deletePosition(position.id);
        await loadPositions();
      },
    });
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden">
        <div className="flex h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">
                Danh sách chức vụ
              </h1>
              <p className="text-sm text-[#667085]">
                Quản lý chức vụ và phân quyền theo vai trò công việc
              </p>
            </div>
            <button
              className="flex shrink-0 items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-white! transition-colors hover:bg-[#0055a8] active:bg-[#003f7a] [&_*]:!text-white"
              type="button"
              onClick={openAdd}
            >
              <Plus className="h-5 w-5" />
              Thêm chức vụ
            </button>
          </div>

          <div className="flex flex-wrap gap-3 rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" />
              <input
                type="text"
                placeholder="Tìm kiếm chức vụ..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-lg border border-[#d0d5dd] bg-white py-2 pl-10 pr-4 text-sm text-[#344054] placeholder-[#98a2b3] transition-colors focus:border-[#006fd5] focus:outline-none focus:ring-2 focus:ring-[#006fd5]/10"
              />
            </div>
            <button
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#d0d5dd] text-[#344054] transition-colors hover:bg-[#f9fafb] active:bg-[#eef2f6]"
              type="button"
              onClick={() => void loadPositions()}
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
            ) : filteredPositions.length === 0 ? (
              <div className="flex h-full items-center justify-center py-12 text-[#667085]">
                Chưa có chức vụ nào
              </div>
            ) : (
              <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                <table className="w-full min-w-200">
                  <thead className="sticky top-0 z-1">
                    <tr className="border-b border-[#ebedf2] bg-[#f9fafb]">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Mã
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Chức vụ
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
                        Quyền
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-[#344054]">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPositions.map((position, index) => {
                      const permissionKeys = extractPermissionKeys(position);
                      const permissionNames = permissionKeys
                        .map((key) =>
                          getViName(
                            key,
                            permissions.find((p) => p.key === key)?.name,
                          ),
                        )
                        .filter(Boolean);
                      const visibleNames = permissionNames.slice(0, 3);
                      const remaining =
                        permissionNames.length - visibleNames.length;

                      return (
                        <tr
                          key={position.id}
                          className="border-b border-[#ebedf2] transition-colors hover:bg-[#f9fafb]"
                        >
                          <td className="px-4 py-3 text-sm text-[#344054]">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-[#344054]">
                            {position.code ?? "-"}
                          </td>
                          <td className="px-4 py-3">
                            <strong className="block text-sm text-[#344054]">
                              {position.name}
                            </strong>
                            <span className="line-clamp-2 text-xs text-[#667085]">
                              {position.description || "Không có mô tả"}
                            </span>
                          </td>
                          <td className="max-w-[260px] px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {visibleNames.map((name) => (
                                <span
                                  key={name}
                                  className="inline-flex items-center rounded-md bg-[#f0f7ff] px-2 py-0.5 text-xs font-medium text-[#006fd5]"
                                >
                                  {name}
                                </span>
                              ))}
                              {remaining > 0 && (
                                <span className="inline-flex items-center rounded-md bg-[#f9fafb] px-2 py-0.5 text-xs font-medium text-[#667085]">
                                  +{remaining}
                                </span>
                              )}
                              {permissionNames.length === 0 && (
                                <span className="text-xs text-[#98a2b3]">
                                  Chưa có quyền
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#006fd5] text-white! transition-colors hover:bg-[#0055a8]"
                                type="button"
                                title="Sửa"
                                onClick={() => void openEdit(position)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3f2] text-[#b42318] transition-colors hover:bg-[#fee4e2]"
                                type="button"
                                title="Xóa"
                                onClick={() => handleDelete(position)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="shrink-0 border-t border-[#ebedf2] px-4 py-3 text-sm text-[#667085]">
              Hiển thị {filteredPositions.length} / {positions.length} chức vụ
            </div>
          </section>
        </div>
      </main>
      <PositionFormModal
        open={formOpen}
        position={selectedPosition}
        permissions={permissions}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </AppLayout>
  );
}
