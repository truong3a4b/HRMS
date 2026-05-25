import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { employeeService } from "../../employees/services/employeeService";
import type { Employee } from "../../employees/types/employee.types";
import { AttendanceDeviceTab } from "../components/AttendanceDeviceTab";
import { AttendanceHistoryTab } from "../components/AttendanceHistoryTab";
import { AttendanceTimesheetTab } from "../components/AttendanceTimesheetTab";
import { DeviceFormModal } from "../components/DeviceFormModal";
import { EmployeeFingerprintTab } from "../components/EmployeeFingerprintTab";
import { RegisterFingerprintModal } from "../components/RegisterFingerprintModal";
import { StandardWorkDaysTab } from "../components/StandardWorkDaysTab";
import { attendanceService } from "../services/attendanceService";
import type {
  AttendanceDevice,
  AttendanceHistoryData,
  AttendanceTimesheetData,
  EmployeeFingerprint,
} from "../types/attendance.types";

type AttendanceTab =
  | "devices"
  | "fingerprints"
  | "myLogs"
  | "myTimesheet"
  | "employeeLogs"
  | "employeeTimesheet"
  | "standardWorkDays";

type AttendanceManagementPageProps = {
  initialTab?: AttendanceTab;
  tabs?: AttendanceTab[];
};

const allTabs: Array<{ key: AttendanceTab; label: string }> = [
  { key: "devices", label: "Thiết bị" },
  { key: "fingerprints", label: "Vân tay" },
  { key: "myLogs", label: "Lịch sử chấm công" },
  { key: "myTimesheet", label: "Bảng công của tôi" },
  { key: "employeeLogs", label: "Lịch sử nhân viên" },
  { key: "employeeTimesheet", label: "Bảng công nhân viên" },
  { key: "standardWorkDays", label: "Công chuẩn" },
];

const pageTitles: Record<AttendanceTab, { title: string; subtitle: string }> = {
  devices: {
    title: "Thiết bị chấm công",
    subtitle: "Quản lý thiết bị và vân tay trên từng máy chấm công",
  },
  fingerprints: {
    title: "Thiết bị chấm công",
    subtitle: "Quản lý thiết bị và vân tay trên từng máy chấm công",
  },
  myLogs: {
    title: "Lịch sử chấm công",
    subtitle: "Theo dõi các lần ghi nhận chấm công của chính mình",
  },
  myTimesheet: {
    title: "Bảng công của tôi",
    subtitle: "Tổng hợp công, tăng ca và ngày nghỉ theo tháng",
  },
  employeeLogs: {
    title: "Lịch sử chấm công nhân viên",
    subtitle: "Tra cứu log chấm công theo từng nhân viên",
  },
  employeeTimesheet: {
    title: "Bảng công nhân viên",
    subtitle: "Theo dõi bảng công tháng của từng nhân viên",
  },
  standardWorkDays: {
    title: "Cấu hình công chuẩn",
    subtitle: "Thiết lập công chuẩn theo tháng cho nhân viên",
  },
};

const currentMonth = () => dayjs().format("YYYY-MM");

function getMonthParam(value: string | null) {
  return value && /^\d{4}-\d{2}$/.test(value) ? value : currentMonth();
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
    if (data.message) return data.message;
  }

  return fallback;
}

export function AttendanceManagementPage({
  initialTab = "devices",
  tabs,
}: AttendanceManagementPageProps) {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AttendanceTab>(initialTab);
  const visibleTabs = useMemo(
    () => allTabs.filter((tab) => !tabs || tabs.includes(tab.key)),
    [tabs],
  );
  const pageTitle = pageTitles[activeTab];
  const [devices, setDevices] = useState<AttendanceDevice[]>([]);
  const [devicePage, setDevicePage] = useState(1);
  const [devicePageSize, setDevicePageSize] = useState(10);
  const [deviceTotal, setDeviceTotal] = useState(0);
  const [deviceSearch, setDeviceSearch] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [fingerprints, setFingerprints] = useState<EmployeeFingerprint[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState(searchParams.get("employeeId") ?? "");
  const [month, setMonth] = useState(currentMonth);
  const [employeeMonth, setEmployeeMonth] = useState(() =>
    getMonthParam(searchParams.get("month")),
  );
  const [myHistory, setMyHistory] = useState<AttendanceHistoryData | null>(
    null,
  );
  const [employeeHistory, setEmployeeHistory] =
    useState<AttendanceHistoryData | null>(null);
  const [myTimesheet, setMyTimesheet] =
    useState<AttendanceTimesheetData | null>(null);
  const [employeeTimesheet, setEmployeeTimesheet] =
    useState<AttendanceTimesheetData | null>(null);
  const [standardWorkDaysRefreshKey, setStandardWorkDaysRefreshKey] =
    useState(0);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<AttendanceDevice | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedDevice = useMemo(
    () => devices.find((device) => device.id === selectedDeviceId) ?? null,
    [devices, selectedDeviceId],
  );

  const loadEmployees = async () => {
    const data = await employeeService.getEmployees({
      page: 1,
      limit: 100,
    });
    setEmployees(data.items ?? []);
  };

  const loadDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getDevices({
        page: devicePage,
        limit: devicePageSize,
        search: deviceSearch,
      });
      setDevices(data.devices ?? []);
      setDeviceTotal(data.total ?? 0);
      if (!selectedDeviceId && data.devices?.length) {
        setSelectedDeviceId(data.devices[0].id);
      }
    } catch (loadError) {
      setDevices([]);
      setDeviceTotal(0);
      setError(getErrorMessage(loadError, "Không thể tải danh sách thiết bị"));
    } finally {
      setLoading(false);
    }
  };

  const loadFingerprints = async (deviceId = selectedDeviceId) => {
    if (!deviceId) {
      setFingerprints([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setFingerprints(await attendanceService.getFingerprints(deviceId));
    } catch (loadError) {
      setFingerprints([]);
      setError(getErrorMessage(loadError, "Không thể tải danh sách vân tay"));
    } finally {
      setLoading(false);
    }
  };

  const loadMyHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      setMyHistory(await attendanceService.getMyHistory(month));
    } catch (loadError) {
      setMyHistory(null);
      setError(getErrorMessage(loadError, "Không thể tải log của tôi"));
    } finally {
      setLoading(false);
    }
  };

  const loadMyTimesheet = async () => {
    setLoading(true);
    setError(null);
    try {
      setMyTimesheet(await attendanceService.getMyTimesheet(month));
    } catch (loadError) {
      setMyTimesheet(null);
      setError(getErrorMessage(loadError, "Không thể tải bảng công của tôi"));
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeHistory = async () => {
    if (!employeeId) {
      setEmployeeHistory(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setEmployeeHistory(
        await attendanceService.getEmployeeHistory(employeeId, employeeMonth),
      );
    } catch (loadError) {
      setEmployeeHistory(null);
      setError(getErrorMessage(loadError, "Không thể tải log nhân viên"));
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeTimesheet = async () => {
    if (!employeeId) {
      setEmployeeTimesheet(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setEmployeeTimesheet(
        await attendanceService.getEmployeeTimesheet(employeeId, employeeMonth),
      );
    } catch (loadError) {
      setEmployeeTimesheet(null);
      setError(getErrorMessage(loadError, "Không thể tải bảng công nhân viên"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEmployees();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const queryEmployeeId = searchParams.get("employeeId");
    const queryMonth = searchParams.get("month");
    if (queryEmployeeId !== null) setEmployeeId(queryEmployeeId);
    if (queryMonth !== null) setEmployeeMonth(getMonthParam(queryMonth));
  }, [searchParams]);

  useEffect(() => {
    void loadDevices();
  }, [devicePage, devicePageSize, deviceSearch]);

  useEffect(() => {
    if (activeTab === "fingerprints") {
      void loadFingerprints();
    }
  }, [activeTab, selectedDeviceId]);

  useEffect(() => {
    if (activeTab === "myLogs") void loadMyHistory();
    if (activeTab === "myTimesheet") void loadMyTimesheet();
  }, [activeTab, month]);

  useEffect(() => {
    if (activeTab === "employeeLogs") void loadEmployeeHistory();
    if (activeTab === "employeeTimesheet") void loadEmployeeTimesheet();
  }, [activeTab, employeeId, employeeMonth]);

  const renderContent = () => {
    if (activeTab === "devices") {
      return (
        <AttendanceDeviceTab
          devices={devices}
          deviceTotal={deviceTotal}
          devicePage={devicePage}
          devicePageSize={devicePageSize}
          loading={loading}
          onPageChange={(page, size) => {
            setDevicePage(page);
            setDevicePageSize(size);
          }}
          onSelectDevice={(deviceId) => {
            setSelectedDeviceId(deviceId);
            setActiveTab("fingerprints");
          }}
          onEditDevice={(device) => {
            setEditingDevice(device);
            setDeviceModalOpen(true);
          }}
        />
      );
    }
    if (activeTab === "fingerprints") {
      return (
        <EmployeeFingerprintTab
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          fingerprints={fingerprints}
          loading={loading}
          onSelectDevice={setSelectedDeviceId}
          onRegisterClick={() => setRegisterModalOpen(true)}
          onDeleteFingerprint={async (record) => {
            if (!selectedDevice) return;
            await attendanceService.deleteFingerprint(
              selectedDevice.id,
              record.id,
            );
            setNotice("Đã gửi lệnh xóa vân tay xuống thiết bị.");
          }}
        />
      );
    }
    if (activeTab === "myLogs") {
      return (
        <AttendanceHistoryTab
          data={myHistory}
          loading={loading}
          employeeScoped={false}
          employees={employees}
          employeeId={employeeId}
          month={month}
          onEmployeeChange={setEmployeeId}
          onMonthChange={setMonth}
        />
      );
    }
    if (activeTab === "myTimesheet") {
      return (
        <AttendanceTimesheetTab
          data={myTimesheet}
          loading={loading}
          employeeScoped={false}
          employees={employees}
          employeeId={employeeId}
          month={month}
          onEmployeeChange={setEmployeeId}
          onMonthChange={setMonth}
        />
      );
    }
    if (activeTab === "employeeLogs") {
      return (
        <AttendanceHistoryTab
          data={employeeHistory}
          loading={loading}
          employeeScoped={true}
          employees={employees}
          employeeId={employeeId}
          month={employeeMonth}
          onEmployeeChange={setEmployeeId}
          onMonthChange={setEmployeeMonth}
        />
      );
    }
    if (activeTab === "standardWorkDays") {
      return (
        <StandardWorkDaysTab
          employees={employees}
          loadingEmployees={loading}
          refreshKey={standardWorkDaysRefreshKey}
          onError={setError}
          onNotice={setNotice}
        />
      );
    }
    return (
      <AttendanceTimesheetTab
        data={employeeTimesheet}
        loading={loading}
        employeeScoped={true}
        employees={employees}
        employeeId={employeeId}
        month={employeeMonth}
        onEmployeeChange={setEmployeeId}
        onMonthChange={setEmployeeMonth}
      />
    );
  };

  const refreshActiveTab = () => {
    setError(null);
    setNotice(null);
    if (activeTab === "devices") void loadDevices();
    if (activeTab === "fingerprints") void loadFingerprints();
    if (activeTab === "myLogs") void loadMyHistory();
    if (activeTab === "myTimesheet") void loadMyTimesheet();
    if (activeTab === "employeeLogs") void loadEmployeeHistory();
    if (activeTab === "employeeTimesheet") void loadEmployeeTimesheet();
    if (activeTab === "standardWorkDays") {
      setStandardWorkDaysRefreshKey((value) => value + 1);
    }
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-y-auto">
        <div className="flex min-h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">
                {pageTitle.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {activeTab === "devices" ? (
                <div className="relative min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                  <input
                    className="w-full rounded-lg border border-[#d0d5dd] bg-white py-2 pl-9 pr-3 text-sm text-[#344054] outline-none focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10"
                    value={deviceSearch}
                    placeholder="Tìm thiết bị..."
                    onChange={(event) => {
                      setDeviceSearch(event.target.value);
                      setDevicePage(1);
                    }}
                  />
                </div>
              ) : null}
              <button
                className="group grid h-10 w-10 place-items-center rounded-lg border border-[#d0d5dd] text-[#344054] transition-all hover:border-[#006fd5] hover:bg-[#f0f7ff] hover:text-[#006fd5] hover:shadow-sm active:bg-[#e6f0fa]"
                type="button"
                title="Tải lại"
                onClick={refreshActiveTab}
              >
                <RefreshCcw className="h-4.5 w-4.5 transition-transform duration-300 group-hover:-rotate-180" />
              </button>
              {activeTab === "devices" ? (
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! hover:bg-[#0055a8]"
                  type="button"
                  onClick={() => {
                    setEditingDevice(null);
                    setDeviceModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Thêm thiết bị
                </button>
              ) : null}
            </div>
          </div>

          {visibleTabs.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto rounded-lg border border-[#d0d5dd] bg-white p-2">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`min-h-10 shrink-0 rounded-lg px-3 text-sm font-semibold transition-colors ${
                    activeTab === tab.key
                      ? "bg-[#006fd5] text-white!"
                      : "text-[#344054] hover:bg-[#f5f7fb]"
                  }`}
                  onClick={() => {
                    setError(null);
                    setNotice(null);
                    setActiveTab(tab.key);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
              {error}
            </div>
          ) : null}
          {notice ? (
            <div className="rounded-lg border border-[#abefc6] bg-[#f6fef9] px-4 py-3 text-sm text-[#067647]">
              {notice}
            </div>
          ) : null}

          {renderContent()}

          <DeviceFormModal
            open={deviceModalOpen}
            device={editingDevice}
            onClose={() => setDeviceModalOpen(false)}
            onSubmit={async (payload) => {
              if (editingDevice) {
                await attendanceService.updateDevice(editingDevice.id, payload);
                setNotice("Đã cập nhật thiết bị.");
              } else {
                await attendanceService.createDevice(payload);
                setNotice("Đã tạo thiết bị.");
              }
              setDeviceModalOpen(false);
              await loadDevices();
            }}
          />
          <RegisterFingerprintModal
            open={registerModalOpen}
            device={selectedDevice}
            employees={employees}
            onClose={() => setRegisterModalOpen(false)}
            onSubmit={async (targetEmployeeId, fingerName) => {
              if (!selectedDevice) return;
              await attendanceService.registerFingerprint(selectedDevice.id, {
                employeeId: targetEmployeeId,
                fingerName,
              });
              setRegisterModalOpen(false);
              setNotice("Đã gửi lệnh đăng ký vân tay xuống thiết bị.");
            }}
          />
        </div>
      </main>
    </AppLayout>
  );
}
