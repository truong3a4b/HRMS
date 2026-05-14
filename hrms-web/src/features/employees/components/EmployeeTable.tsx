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
          <tr className="border-b border-[#ebedf2] bg-[#f9fafb]">
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
              #
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
              Mã
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
              Nhân viên
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
              Số điện thoại
            </th>

            <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
              Bộ phận
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
              Chức vụ
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#344054]">
              Trạng thái
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-[#344054]">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, index) => (
            <tr
              key={employee.id}
              className="border-b border-[#ebedf2] transition-colors hover:bg-[#f9fafb]"
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
                  <button
                    onClick={() => onView?.(employee)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#006fd5] text-white! transition-colors hover:bg-[#0055a8] active:bg-[#003f7a]"
                    title="Xem chi tiết"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit?.(employee)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#006fd5] text-white! transition-colors hover:bg-[#0055a8] active:bg-[#003f7a]"
                    title="Sửa"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <div className="group relative">
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#667085] transition-colors hover:bg-[#f0f0f0] active:bg-[#e0e0e0]"
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
