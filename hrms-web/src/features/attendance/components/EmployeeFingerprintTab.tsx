import { Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Fingerprint, Trash2 } from "lucide-react";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import type { AttendanceDevice, EmployeeFingerprint } from "../types/attendance.types";

type EmployeeFingerprintTabProps = {
  devices: AttendanceDevice[];
  selectedDeviceId: string;
  fingerprints: EmployeeFingerprint[];
  loading: boolean;
  onSelectDevice: (deviceId: string) => void;
  onRegisterClick: () => void;
  onDeleteFingerprint: (record: EmployeeFingerprint) => void;
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : "-";
}

export function EmployeeFingerprintTab({
  devices,
  selectedDeviceId,
  fingerprints,
  loading,
  onSelectDevice,
  onRegisterClick,
  onDeleteFingerprint,
}: EmployeeFingerprintTabProps) {
  const fingerprintColumns: ColumnsType<EmployeeFingerprint> = [
    { title: "Finger ID", dataIndex: "fingerId", width: 100, align: "center" },
    {
      title: "Nhân viên",
      dataIndex: "employee",
      render: (employee: EmployeeFingerprint["employee"]) => (
        <div>
          <div className="font-semibold text-[#243247]">{employee.name}</div>
          <div className="text-xs text-[#667085]">
            {employee.employeeId} · {employee.email}
          </div>
        </div>
      ),
    },
    {
      title: "Ngón tay",
      dataIndex: "fingerName",
      align: "center",
      render: (value) => value || "-",
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "createdAt",
      render: formatDateTime,
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <button
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#fca5a5] bg-[#fef2f2] px-3 py-1.5 text-xs font-semibold text-[#dc2626] transition-all hover:border-[#dc2626] hover:bg-[#fee2e2] hover:shadow-2xs active:bg-[#fecaca]"
          type="button"
          onClick={() => {
            Modal.confirm({
              title: "Xác nhận xóa vân tay",
              content: "Bạn có chắc chắn muốn xóa vân tay này không?",
              okText: "Xóa",
              cancelText: "Hủy",
              okButtonProps: { danger: true },
              onOk: () => onDeleteFingerprint(record),
            });
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Xóa
        </button>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[260px] flex-1">
          <SearchableSelect
            value={selectedDeviceId}
            onChange={onSelectDevice}
            options={[
              { value: "", label: "Chọn thiết bị" },
              ...devices.map((device) => ({
                value: device.id,
                label: `${device.name} (${device.code})`,
              })),
            ]}
          />
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! hover:bg-[#0055a8] disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          disabled={!selectedDeviceId}
          onClick={onRegisterClick}
        >
          <Fingerprint className="h-4 w-4" />
          Đăng ký vân tay
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <Table
          bordered
          rowKey="id"
          columns={fingerprintColumns}
          dataSource={fingerprints}
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </div>
    </section>
  );
}
