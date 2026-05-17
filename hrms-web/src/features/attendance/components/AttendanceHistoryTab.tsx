import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import type { Employee } from "../../employees/types/employee.types";
import type { AttendanceHistoryData, AttendanceLog } from "../types/attendance.types";
import { AttendanceMonthPicker } from "./AttendanceMonthPicker";

type AttendanceHistoryTabProps = {
  data: AttendanceHistoryData | null;
  loading: boolean;
  employeeScoped: boolean;
  employees: Employee[];
  employeeId: string;
  month: string;
  onEmployeeChange: (value: string) => void;
  onMonthChange: (value: string) => void;
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : "-";
}

export function AttendanceHistoryTab({
  data,
  loading,
  employeeScoped,
  employees,
  employeeId,
  month,
  onEmployeeChange,
  onMonthChange,
}: AttendanceHistoryTabProps) {
  const logColumns: ColumnsType<AttendanceLog> = [
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      render: formatDateTime,
    },
    { title: "Finger ID", dataIndex: "fingerId", width: 100 },
    {
      title: "Thiết bị",
      dataIndex: "device",
      render: (device: AttendanceLog["device"]) => (
        <div>
          <div className="font-medium text-[#243247]">{device.name}</div>
          <div className="text-xs text-[#667085]">{device.code}</div>
        </div>
      ),
    },
    {
      title: "Ghi nhận",
      dataIndex: "createdAt",
      render: formatDateTime,
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {employeeScoped ? (
          <div className="min-w-[260px] flex-1">
            <SearchableSelect
              value={employeeId}
              onChange={onEmployeeChange}
              options={[
                { value: "", label: "Chọn nhân viên" },
                ...employees.map((employee) => ({
                  value: employee.id,
                  label: `${employee.employeeId} - ${employee.name}`,
                })),
              ]}
            />
          </div>
        ) : null}
        <AttendanceMonthPicker value={month} onChange={onMonthChange} />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <Table
          rowKey="id"
          columns={logColumns}
          dataSource={data?.logs ?? []}
          loading={loading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 800 }}
        />
      </div>
    </section>
  );
}
