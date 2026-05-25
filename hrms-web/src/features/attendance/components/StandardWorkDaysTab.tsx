import { Button, DatePicker, Input, InputNumber, Popconfirm, Select, Spin, Table, Modal } from "antd";
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
import type { EmployeeStandardWorkDay } from "../types/attendance.types";

type StandardWorkDaysTabProps = {
  employees: Employee[];
  loadingEmployees?: boolean;
  refreshKey?: number;
  onError?: (message: string) => void;
  onNotice?: (message: string) => void;
};

const formatMonth = (value: string) => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : dayjs();
};

const toMonthYear = (value: string) => {
  const parsed = formatMonth(value);
  return {
    month: parsed.month() + 1,
    year: parsed.year(),
  };
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

export function StandardWorkDaysTab({
  employees,
  loadingEmployees,
  refreshKey,
  onError,
  onNotice,
}: StandardWorkDaysTabProps) {
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [configs, setConfigs] = useState<EmployeeStandardWorkDay[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [filterEmployeeId, setFilterEmployeeId] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [filterPositionId, setFilterPositionId] = useState("");
  const [assignDepartmentIds, setAssignDepartmentIds] = useState<string[]>([]);
  const [assignPositionIds, setAssignPositionIds] = useState<string[]>([]);
  const [assignWorkDays, setAssignWorkDays] = useState<number | null>(null);
  const [assignNote, setAssignNote] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeWorkDays, setEmployeeWorkDays] = useState<number | null>(null);
  const [employeeNote, setEmployeeNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingBulk, setSavingBulk] = useState(false);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const monthYear = useMemo(() => toMonthYear(month), [month]);

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
      const data = await attendanceService.getStandardWorkDays({
        ...monthYear,
        employeeId: filterEmployeeId,
        departmentId: filterDepartmentId,
        positionId: filterPositionId,
      });
      setConfigs(data);
    } catch (error) {
      setConfigs([]);
      onError?.(getErrorMessage(error, "Không thể tải cấu hình công chuẩn"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMeta();
  }, []);

  useEffect(() => {
    void loadConfigs();
  }, [
    monthYear.month,
    monthYear.year,
    filterEmployeeId,
    filterDepartmentId,
    filterPositionId,
    refreshKey,
  ]);

  useEffect(() => {
    if (!selectedEmployeeConfig) return;
    setEmployeeWorkDays(Number(selectedEmployeeConfig.standardWorkDays));
    setEmployeeNote(selectedEmployeeConfig.note ?? "");
  }, [selectedEmployeeConfig]);

  const submitBulk = async () => {
    if (!assignWorkDays || assignWorkDays <= 0) {
      onError?.("Vui lòng nhập công chuẩn lớn hơn 0");
      return;
    }

    if (!assignDepartmentIds.length && !assignPositionIds.length) {
      onError?.("Vui lòng chọn phòng ban hoặc chức vụ để áp dụng");
      return;
    }

    setSavingBulk(true);
    try {
      await attendanceService.assignStandardWorkDays({
        ...monthYear,
        departmentIds: assignDepartmentIds,
        positionIds: assignPositionIds,
        standardWorkDays: assignWorkDays,
        note: assignNote.trim() || null,
      });
      onNotice?.("Đã áp dụng công chuẩn cho nhóm nhân viên");
      await loadConfigs();
    } catch (error) {
      onError?.(getErrorMessage(error, "Không thể áp dụng công chuẩn"));
    } finally {
      setSavingBulk(false);
    }
  };

  const submitEmployee = async () => {
    if (!employeeId) {
      onError?.("Vui lòng chọn nhân viên");
      return;
    }

    if (!employeeWorkDays || employeeWorkDays <= 0) {
      onError?.("Vui lòng nhập công chuẩn lớn hơn 0");
      return;
    }

    setSavingEmployee(true);
    try {
      await attendanceService.upsertEmployeeStandardWorkDays(employeeId, {
        ...monthYear,
        standardWorkDays: employeeWorkDays,
        note: employeeNote.trim() || null,
      });
      onNotice?.("Đã lưu công chuẩn cho nhân viên");
      await loadConfigs();
    } catch (error) {
      onError?.(getErrorMessage(error, "Không thể lưu công chuẩn nhân viên"));
    } finally {
      setSavingEmployee(false);
    }
  };

  const deleteConfig = async (config: EmployeeStandardWorkDay) => {
    try {
      await attendanceService.deleteEmployeeStandardWorkDays(
        config.employeeId,
        config.year,
        config.month,
      );
      onNotice?.("Đã xóa cấu hình công chuẩn");
      await loadConfigs();
    } catch (error) {
      onError?.(getErrorMessage(error, "Không thể xóa cấu hình công chuẩn"));
    }
  };

  const columns: ColumnsType<EmployeeStandardWorkDay> = [
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
      title: "Tháng",
      width: 110,
      render: (_, record) => `${record.month}/${record.year}`,
    },
    {
      title: "Công chuẩn",
      dataIndex: "standardWorkDays",
      width: 130,
      render: (value) => (
        <span className="font-semibold text-blue-700">{formatNumber(value)}</span>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      render: (value) => value || "-",
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
              setEmployeeWorkDays(Number(record.standardWorkDays));
              setEmployeeNote(record.note ?? "");
              setIsEditModalOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <Popconfirm
            title="Xóa cấu hình công chuẩn?"
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
              picker="month"
              value={formatMonth(month)}
              format="MM/YYYY"
              onChange={(value) => {
                if (value) setMonth(value.format("YYYY-MM"));
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
        title="Áp dụng theo nhóm"
        open={isGroupModalOpen}
        onCancel={() => setIsGroupModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <div className="grid gap-3 pt-4">
          <DatePicker
            className="w-full"
            picker="month"
            value={formatMonth(month)}
            format="MM/YYYY"
            onChange={(value) => {
              if (value) setMonth(value.format("YYYY-MM"));
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
            min={0.01}
            step={0.5}
            placeholder="Công chuẩn"
            value={assignWorkDays}
            onChange={setAssignWorkDays}
          />
          <Input
            placeholder="Ghi chú"
            value={assignNote}
            onChange={(event) => setAssignNote(event.target.value)}
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
        title="Sửa công chuẩn nhân viên"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <div className="grid gap-3 pt-4">
          <InputNumber
            className="w-full"
            min={0.01}
            step={0.5}
            placeholder="Công chuẩn"
            value={employeeWorkDays}
            onChange={setEmployeeWorkDays}
          />
          <Input
            placeholder="Ghi chú"
            value={employeeNote}
            onChange={(event) => setEmployeeNote(event.target.value)}
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
