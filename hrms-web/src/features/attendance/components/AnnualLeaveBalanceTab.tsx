import { Button, DatePicker, InputNumber, Popconfirm, Select, Spin, Table, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Save, Trash2, Users, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import { departmentService } from "../../departments/services/departmentService";
import type { Department } from "../../departments/types/department.types";
import type { Employee } from "../../employees/types/employee.types";
import { positionService } from "../../positions/services/positionService";
import type { Position } from "../../positions/types/position.types";
import { attendanceService } from "../services/attendanceService";
import type { EmployeeAnnualLeaveBalance } from "../types/attendance.types";

type AnnualLeaveBalanceTabProps = {
  employees: Employee[];
  loadingEmployees?: boolean;
  refreshKey?: number;
  onError?: (message: string) => void;
  onNotice?: (message: string) => void;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string };
    if (data.message) return data.message;
  }

  return fallback;
};

const formatNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "-";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(parsed);
};

export function AnnualLeaveBalanceTab({
  employees,
  loadingEmployees,
  refreshKey,
  onError,
  onNotice,
}: AnnualLeaveBalanceTabProps) {
  const [year, setYear] = useState(dayjs().year());
  const [configs, setConfigs] = useState<EmployeeAnnualLeaveBalance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [filterEmployeeId, setFilterEmployeeId] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [filterPositionId, setFilterPositionId] = useState("");
  const [assignDepartmentIds, setAssignDepartmentIds] = useState<string[]>([]);
  const [assignPositionIds, setAssignPositionIds] = useState<string[]>([]);
  const [assignLeaveDays, setAssignLeaveDays] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [employeeLeaveDays, setEmployeeLeaveDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingBulk, setSavingBulk] = useState(false);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const selectedEmployeeConfig = useMemo(
    () =>
      employeeId
        ? configs.find((config) => config.employeeId === employeeId) ?? null
        : null,
    [configs, employeeId],
  );

  const loadMeta = async () => {
    try {
      const [departmentData, positionData] = await Promise.all([
        departmentService.getDepartments(),
        positionService.getPositions(),
      ]);
      setDepartments(departmentData);
      setPositions(positionData);
    } catch (error) {
      onError?.(getErrorMessage(error, "Không thể tải phòng ban/chức vụ"));
    }
  };

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAnnualLeaveBalances({
        year,
        employeeId: filterEmployeeId,
        departmentId: filterDepartmentId,
        positionId: filterPositionId,
      });
      setConfigs(data);
    } catch (error) {
      setConfigs([]);
      onError?.(getErrorMessage(error, "Không thể tải cấu hình phép năm"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMeta();
  }, []);

  useEffect(() => {
    void loadConfigs();
  }, [year, filterEmployeeId, filterDepartmentId, filterPositionId, refreshKey]);

  useEffect(() => {
    if (!selectedEmployeeConfig) return;
    setEmployeeLeaveDays(Number(selectedEmployeeConfig.entitledLeaveDays));
  }, [selectedEmployeeConfig]);

  const submitBulk = async () => {
    if (assignLeaveDays === null || assignLeaveDays < 0) {
      onError?.("Vui lòng nhập số ngày phép năm hợp lệ");
      return;
    }

    if (!assignDepartmentIds.length && !assignPositionIds.length) {
      onError?.("Vui lòng chọn phòng ban hoặc chức vụ để áp dụng");
      return;
    }

    setSavingBulk(true);
    try {
      await attendanceService.assignAnnualLeaveBalances({
        year,
        departmentIds: assignDepartmentIds,
        positionIds: assignPositionIds,
        entitledLeaveDays: assignLeaveDays,
      });
      onNotice?.("Đã áp dụng phép năm cho nhóm nhân viên");
      await loadConfigs();
    } catch (error) {
      onError?.(getErrorMessage(error, "Không thể áp dụng phép năm"));
    } finally {
      setSavingBulk(false);
    }
  };

  const submitEmployee = async () => {
    if (!employeeId) {
      onError?.("Vui lòng chọn nhân viên");
      return;
    }

    if (employeeLeaveDays === null || employeeLeaveDays < 0) {
      onError?.("Vui lòng nhập số ngày phép năm hợp lệ");
      return;
    }

    setSavingEmployee(true);
    try {
      await attendanceService.upsertEmployeeAnnualLeaveBalance(employeeId, {
        year,
        entitledLeaveDays: employeeLeaveDays,
      });
      onNotice?.("Đã lưu phép năm cho nhân viên");
      await loadConfigs();
    } catch (error) {
      onError?.(getErrorMessage(error, "Không thể lưu phép năm nhân viên"));
    } finally {
      setSavingEmployee(false);
    }
  };

  const deleteConfig = async (config: EmployeeAnnualLeaveBalance) => {
    try {
      await attendanceService.deleteEmployeeAnnualLeaveBalance(
        config.employeeId,
        config.year,
      );
      onNotice?.("Đã xóa cấu hình phép năm");
      await loadConfigs();
    } catch (error) {
      onError?.(getErrorMessage(error, "Không thể xóa cấu hình phép năm"));
    }
  };

  const columns: ColumnsType<EmployeeAnnualLeaveBalance> = [
    {
      title: "Nhân viên",
      dataIndex: "employee",
      render: (_, record) => (
        <div className="min-w-0">
          <div className="font-semibold text-slate-800">
            {record.employee.employeeId} - {record.employee.name}
          </div>
          <div className="text-xs text-slate-500">{record.employee.email}</div>
        </div>
      ),
    },
    {
      title: "Phòng ban",
      render: (_, record) => record.employee.department?.name ?? "-",
    },
    {
      title: "Chức vụ",
      render: (_, record) => record.employee.position?.name ?? "-",
    },
    {
      title: "Năm",
      width: 100,
      dataIndex: "year",
    },
    {
      title: "Phép năm",
      dataIndex: "entitledLeaveDays",
      width: 130,
      render: (value) => (
        <span className="font-semibold text-blue-700">{formatNumber(value)}</span>
      ),
    },
    {
      title: "Đã dùng",
      dataIndex: "usedPaidLeaveDays",
      width: 120,
      render: formatNumber,
    },
    {
      title: "Còn lại",
      width: 120,
      render: (_, record) =>
        formatNumber(
          Number(record.entitledLeaveDays) - Number(record.usedPaidLeaveDays),
        ),
    },
    {
      title: "",
      width: 100,
      render: (_, record) => (
        <div className="flex gap-2">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-blue-200 text-blue-600 transition-colors hover:bg-blue-50"
            type="button"
            title="Sửa"
            onClick={() => {
              setEmployeeId(record.employeeId);
              setEmployeeLeaveDays(Number(record.entitledLeaveDays));
              setIsEditModalOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <Popconfirm
            title="Xóa cấu hình phép năm?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteConfig(record)}
          >
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600 transition-colors hover:bg-rose-50"
              type="button"
              title="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <DatePicker
              picker="year"
              value={dayjs(String(year), "YYYY")}
              format="YYYY"
              onChange={(value) => {
                if (value) setYear(value.year());
              }}
            />
            <div className="min-w-[240px]">
              <SearchableSelect
                value={filterEmployeeId}
                onChange={setFilterEmployeeId}
                options={[
                  { value: "", label: "Tất cả nhân viên" },
                  ...employees.map((employee) => ({
                    value: employee.id,
                    label: `${employee.employeeId} - ${employee.name}`,
                  })),
                ]}
              />
            </div>
            <Select
              className="min-w-[200px]"
              allowClear
              placeholder="Phòng ban"
              value={filterDepartmentId || undefined}
              onChange={(value) => setFilterDepartmentId(value ?? "")}
              options={departments.map((department) => ({
                value: department.id,
                label: department.name,
              }))}
            />
            <Select
              className="min-w-[200px]"
              allowClear
              placeholder="Chức vụ"
              value={filterPositionId || undefined}
              onChange={(value) => setFilterPositionId(value ?? "")}
              options={positions.map((position) => ({
                value: position.id,
                label: position.name,
              }))}
            />
          </div>
          <Button
            type="primary"
            icon={<Users className="h-4 w-4" />}
            onClick={() => setIsGroupModalOpen(true)}
          >
            Áp dụng theo nhóm
          </Button>
        </div>

        <Spin spinning={Boolean(loadingEmployees)}>
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={configs}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 900 }}
          />
        </Spin>
      </div>

      <Modal
        title="Áp dụng phép năm theo nhóm"
        open={isGroupModalOpen}
        onCancel={() => setIsGroupModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <div className="grid gap-3 pt-4">
          <DatePicker
            className="w-full"
            picker="year"
            value={dayjs(String(year), "YYYY")}
            format="YYYY"
            onChange={(value) => {
              if (value) setYear(value.year());
            }}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Phòng ban áp dụng"
            value={assignDepartmentIds}
            onChange={setAssignDepartmentIds}
            options={departments.map((department) => ({
              value: department.id,
              label: department.name,
            }))}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Chức vụ áp dụng"
            value={assignPositionIds}
            onChange={setAssignPositionIds}
            options={positions.map((position) => ({
              value: position.id,
              label: position.name,
            }))}
          />
          <InputNumber
            className="w-full"
            min={0}
            step={0.5}
            placeholder="Số ngày phép năm"
            value={assignLeaveDays}
            onChange={setAssignLeaveDays}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setIsGroupModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              icon={<Save className="h-4 w-4" />}
              loading={savingBulk}
              onClick={async () => {
                await submitBulk();
                setIsGroupModalOpen(false);
              }}
            >
              Áp dụng
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        title="Sửa phép năm nhân viên"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <div className="grid gap-3 pt-4">
          <InputNumber
            className="w-full"
            min={0}
            step={0.5}
            placeholder="Số ngày phép năm"
            value={employeeLeaveDays}
            onChange={setEmployeeLeaveDays}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              icon={<Save className="h-4 w-4" />}
              loading={savingEmployee}
              onClick={async () => {
                await submitEmployee();
                setIsEditModalOpen(false);
              }}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
