import { Pagination, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Fingerprint, Pencil, Wifi, WifiOff } from "lucide-react";
import type { AttendanceDevice } from "../types/attendance.types";

type AttendanceDeviceTabProps = {
  devices: AttendanceDevice[];
  deviceTotal: number;
  devicePage: number;
  devicePageSize: number;
  loading: boolean;
  onPageChange: (page: number, size: number) => void;
  onSelectDevice: (deviceId: string) => void;
  onEditDevice: (device: AttendanceDevice) => void;
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function AttendanceDeviceTab({
  devices,
  deviceTotal,
  devicePage,
  devicePageSize,
  loading,
  onPageChange,
  onSelectDevice,
  onEditDevice,
}: AttendanceDeviceTabProps) {
  const deviceColumns: ColumnsType<AttendanceDevice> = [
    {
      title: "Thiết bị",
      dataIndex: "name",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-[#243247]">{record.name}</div>
          <div className="text-xs text-[#667085]">{record.code}</div>
        </div>
      ),
    },
    { title: "Vị trí", dataIndex: "location", render: (value) => value || "-" },
    {
      title: "Kết nối",
      dataIndex: "isConnected",
      align: "center",
      render: (value: boolean) =>
        value ? (
          <Tag color="green" icon={<Wifi className="h-3.5 w-3.5" />}>
            Online
          </Tag>
        ) : (
          <Tag icon={<WifiOff className="h-3.5 w-3.5" />}>Offline</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      align: "center",
      render: (value: boolean) => (
        <Tag color={value ? "blue" : "default"}>
          {value ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    { title: "Vân tay", dataIndex: "fingerprintCount", align: "center" },
    {
      title: "Heartbeat",
      dataIndex: "lastHeartbeatAt",
      render: formatDateTime,
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#b9d7f6] bg-[#f0f7ff] px-3 py-1.5 text-xs font-semibold text-[#006fd5] transition-all hover:border-[#006fd5] hover:bg-[#e0f0fe] hover:shadow-2xs active:bg-[#d1e6fb]"
            type="button"
            onClick={() => onSelectDevice(record.id)}
          >
            <Fingerprint className="h-3.5 w-3.5" />
            Vân tay
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#475569] transition-all hover:border-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#1e293b] hover:shadow-2xs active:bg-[#e2e8f0]"
            type="button"
            onClick={() => onEditDevice(record)}
          >
            <Pencil className="h-3.5 w-3.5 text-[#64748b]" />
            Sửa
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <Table
        bordered
        rowKey="id"
        columns={deviceColumns}
        dataSource={devices}
        pagination={false}
        loading={loading}
        scroll={{ x: 900 }}
      />
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 max-[720px]:flex-col max-[720px]:items-stretch">
        <span className="text-sm text-[#667085]">
          Tổng {deviceTotal} thiết bị
        </span>
        <Pagination
          current={devicePage}
          pageSize={devicePageSize}
          total={deviceTotal}
          showSizeChanger
          pageSizeOptions={[10, 20, 50]}
          onChange={onPageChange}
        />
      </div>
    </section>
  );
}
