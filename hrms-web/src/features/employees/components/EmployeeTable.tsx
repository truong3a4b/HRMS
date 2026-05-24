import { Edit2, Eye, MoreHorizontal } from "lucide-react";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import type { Employee, EmployeeStatus } from "../types/employee.types";

type EmployeeTableProps = {
  employees: Employee[];
  isLoading?: boolean;
  rowOffset?: number;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onView?: (employee: Employee) => void;
};

const statusConfig: Record<
  EmployeeStatus,
  { bg: string; text: string; label: string }
> = {
  WORKING: {
    bg: "bg-[#ecfdf5]",
    text: "text-[#065f46]",
    label: "Đang làm việc",
  },
  ON_LEAVE: {
    bg: "bg-[#fffbeb]",
    text: "text-[#92400e]",
    label: "Đang nghỉ phép",
  },
  RESIGNED: {
    bg: "bg-[#fef2f2]",
    text: "text-[#7f1d1d]",
    label: "Đã nghỉ việc",
  },
};

export function EmployeeTable({
  employees,
  isLoading,
  rowOffset = 0,
  onEdit,
  onView,
}: EmployeeTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center py-12">
        <div className="text-[#667085]">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center py-12">
        <div className="text-[#667085]">Không có dữ liệu nhân viên</div>
      </div>
    );
  }

  const getStatusBadge = (status: EmployeeStatus) => {
    const config = statusConfig[status] || statusConfig.WORKING;

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-auto">
      <table className="w-full min-w-230">
        <thead className="sticky top-0 z-1">
          <tr className="border-b border-[#d0d5dd] bg-[#f9fafb]/90 backdrop-blur-md">
            <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wider text-[#667085]">
              #
            </th>
            <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wider text-[#667085]">
              Mã
            </th>
            <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wider text-[#667085]">
              Nhân viên
            </th>
            <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wider text-[#667085]">
              Số điện thoại
            </th>
            <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wider text-[#667085]">
              Bộ phận
            </th>
            <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wider text-[#667085]">
              Chức vụ
            </th>
            <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wider text-[#667085]">
              Trạng thái
            </th>
            <th className="px-4 py-3.5 text-center text-[13px] font-semibold uppercase tracking-wider text-[#667085]">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, index) => (
            <tr
              key={employee.id}
              className="border-b border-[#d0d5dd] transition-colors hover:bg-[#f8faff] group"
            >
              <td className="px-4 py-3 text-sm text-[#344054]">
                {rowOffset + index + 1}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-[#344054]">
                {employee.employeeId || "-"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={employee.avatar}
                    alt={employee.name}
                    sizeClass="h-8 w-8"
                  />
                  <div className="min-w-0 flex flex-col">
                    <span className="max-w-56 truncate text-sm font-medium text-[#344054]">
                      {employee.name}
                    </span>
                    <span className="max-w-56 truncate text-xs text-[#667085]">
                      {employee.email}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-[#344054]">
                {employee.phone || "-"}
              </td>

              <td className="px-4 py-3 text-sm text-[#344054]">
                {employee.department?.name || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-[#344054]">
                {employee.position?.name || "-"}
              </td>
              <td className="px-4 py-3">{getStatusBadge(employee.status)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  {onView ? (
                    <button
                      onClick={() => onView(employee)}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-[#006fd5] transition-all hover:bg-[#006fd5] hover:text-white hover:shadow-md hover:shadow-blue-500/20 active:scale-95"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  ) : null}
                  {onEdit ? (
                    <button
                      onClick={() => onEdit(employee)}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white hover:shadow-md hover:shadow-emerald-500/20 active:scale-95"
                      title="Sửa"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  ) : null}

                  <div className="group relative">
                    <button
                      className="grid h-8 w-8 place-items-center rounded-lg border border-[#d0d5dd] bg-slate-50 text-[#667085] transition-all hover:bg-white hover:text-[#344054] hover:shadow-sm active:scale-95"
                      title="Thêm thao tác"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
