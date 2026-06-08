import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Modal, DatePicker } from "antd";
import dayjs from "dayjs";
import { Send } from "lucide-react";
import { useAuth } from "../../auth/services/useAuth";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import { MultiSelectDropdown, SelectedTags } from "../../../shared/ui/MultiSelectDropdown";
import type { WorkShift } from "../../work-shifts/types/workShift.types";
import { requestService } from "../services/requestService";
import type {
  ApprovalMode,
  LeaveType,
  RequestEmployeeOption,
} from "../types/request.types";

type CreateRequestKind =
  | "LEAVE"
  | "ATTENDANCE_CORRECTION"
  | "LATE_EARLY"
  | "BONUS_PENALTY";
type LateEarlyKind = "LATE_ARRIVAL" | "EARLY_LEAVE";

type UserOption = {
  id: string;
  label: string;
};

const fieldClass =
  "w-full rounded-xl border border-[#d0d5dd] bg-white px-3.5 py-2.5 text-sm text-[#344054] shadow-sm outline-none transition-all hover:border-[#98a2b3] focus:border-[#006fd5] focus:ring-4 focus:ring-[#006fd5]/10";
const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

const leaveTypeOptions: Array<{ value: LeaveType; label: string }> = [
  { value: "ANNUAL_LEAVE", label: "Nghỉ phép năm" },
  { value: "SICK_LEAVE", label: "Nghỉ ốm" },
  { value: "UNPAID_LEAVE", label: "Nghỉ không lương" },
  { value: "MATERNITY_LEAVE", label: "Nghỉ thai sản" },
  { value: "BEREAVEMENT_LEAVE", label: "Nghỉ tang chế" },
  { value: "MARRIAGE_LEAVE", label: "Nghỉ kết hôn" },
  { value: "COMPENSATORY_LEAVE", label: "Nghỉ bù" },
  { value: "OTHER", label: "Khác" },
];

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



type RequestFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requestKind: CreateRequestKind;
};

export function RequestFormModal({ open, onClose, onSuccess, requestKind }: RequestFormModalProps) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<RequestEmployeeOption[]>([]);
  const [title, setTitle] = useState("");
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>("PARALLEL");
  const [approverIds, setApproverIds] = useState<string[]>([]);
  const [watcherIds, setWatcherIds] = useState<string[]>([]);
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveType, setLeaveType] = useState<LeaveType>("ANNUAL_LEAVE");
  const [leaveWorkShiftId, setLeaveWorkShiftId] = useState("");
  const [leaveWorkShifts, setLeaveWorkShifts] = useState<WorkShift[]>([]);
  const [isLoadingLeaveShifts, setIsLoadingLeaveShifts] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [workShiftId, setWorkShiftId] = useState("");
  const [attendanceWorkShifts, setAttendanceWorkShifts] = useState<WorkShift[]>([]);
  const [isLoadingAttendanceShifts, setIsLoadingAttendanceShifts] = useState(false);
  const [attendanceReason, setAttendanceReason] = useState("");
  const [lateEarlyDate, setLateEarlyDate] = useState("");
  const [lateEarlyType, setLateEarlyType] = useState<LateEarlyKind>("LATE_ARRIVAL");
  const [lateEarlyWorkShiftId, setLateEarlyWorkShiftId] = useState("");
  const [lateEarlyWorkShifts, setLateEarlyWorkShifts] = useState<WorkShift[]>([]);
  const [isLoadingLateEarlyShifts, setIsLoadingLateEarlyShifts] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [lateEarlyReason, setLateEarlyReason] = useState("");
  const [bonusPenaltyEmployeeId, setBonusPenaltyEmployeeId] = useState("");
  const [bonusPenaltyMonth, setBonusPenaltyMonth] = useState("");
  const [bonusPenaltyIsBonus, setBonusPenaltyIsBonus] = useState(true);
  const [bonusPenaltyAmount, setBonusPenaltyAmount] = useState("");
  const [bonusPenaltyReason, setBonusPenaltyReason] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userOptions = useMemo(
    () =>
      employees
        .map((employee) => ({
          id: employee.user?.id,
          label: `${employee.employeeId} - ${employee.name} - ${employee.email}`,
        }))
        .filter((option): option is UserOption => Boolean(option.id) && option.id !== user?.id),
    [employees, user?.id],
  );

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id,
        label: `${employee.employeeId} - ${employee.name} - ${employee.email}`,
      })),
    [employees],
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setTitle("");
      setApproverIds([]);
      setWatcherIds([]);
      setErrorMessage(null);
      setLeaveStartDate("");
      setLeaveEndDate("");
      setLeaveType("ANNUAL_LEAVE");
      setLeaveWorkShiftId("");
      setLeaveWorkShifts([]);
      setLeaveReason("");
      setAttendanceDate("");
      setAttendanceReason("");
      setLateEarlyDate("");
      setLateEarlyReason("");
      setStartTime("");
      setEndTime("");
      setBonusPenaltyEmployeeId("");
      setBonusPenaltyMonth("");
      setBonusPenaltyIsBonus(true);
      setBonusPenaltyAmount("");
      setBonusPenaltyReason("");
    }
  }, [open]);

  useEffect(() => {
    setIsLoadingOptions(true);
    requestService
      .getEmployeeOptions()
      .then((items) => setEmployees(items))
      .catch((error) => {
        setErrorMessage(getErrorMessage(error, "Không tải được danh sách nhân viên"));
      })
      .finally(() => setIsLoadingOptions(false));
  }, []);

  useEffect(() => {
    const date = leaveStartDate;
    setLeaveWorkShiftId("");
    if (requestKind !== "LEAVE" || !date) {
      setLeaveWorkShifts([]);
      return;
    }
    let isCurrent = true;
    setIsLoadingLeaveShifts(true);
    requestService
      .getMyLeaveShiftsByDate(date)
      .then((items) => {
        if (isCurrent) setLeaveWorkShifts(items);
      })
      .catch((error) => {
        if (isCurrent) {
          setLeaveWorkShifts([]);
          setErrorMessage(getErrorMessage(error, "Không tải được ca làm theo ngày nghỉ"));
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoadingLeaveShifts(false);
      });
    return () => { isCurrent = false; };
  }, [leaveStartDate, requestKind]);

  useEffect(() => {
    setWorkShiftId("");
    if (requestKind !== "ATTENDANCE_CORRECTION" || !attendanceDate) {
      setAttendanceWorkShifts([]);
      return;
    }
    let isCurrent = true;
    setIsLoadingAttendanceShifts(true);
    requestService
      .getMyScheduleShiftsByDate(attendanceDate)
      .then((items) => {
        if (isCurrent) setAttendanceWorkShifts(items);
      })
      .catch((error) => {
        if (isCurrent) {
          setAttendanceWorkShifts([]);
          setErrorMessage(getErrorMessage(error, "Không tải được ca làm theo ngày cộng công"));
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoadingAttendanceShifts(false);
      });
    return () => { isCurrent = false; };
  }, [attendanceDate, requestKind]);

  useEffect(() => {
    setLateEarlyWorkShiftId("");
    if (requestKind !== "LATE_EARLY" || !lateEarlyDate) {
      setLateEarlyWorkShifts([]);
      return;
    }
    let isCurrent = true;
    setIsLoadingLateEarlyShifts(true);
    requestService
      .getMyScheduleShiftsByDate(lateEarlyDate)
      .then((items) => {
        if (isCurrent) setLateEarlyWorkShifts(items);
      })
      .catch((error) => {
        if (isCurrent) {
          setLateEarlyWorkShifts([]);
          setErrorMessage(getErrorMessage(error, "Không tải được ca làm theo ngày đã chọn"));
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoadingLateEarlyShifts(false);
      });
    return () => { isCurrent = false; };
  }, [lateEarlyDate, requestKind]);

  const validateForm = () => {
    if (title.trim().length < 2) return "Vui lòng nhập tiêu đề đơn.";
    if (approverIds.length === 0) return "Vui lòng chọn ít nhất một người duyệt.";

    if (requestKind === "LEAVE") {
      if (!leaveStartDate || !leaveEndDate) return "Vui lòng chọn thời gian nghỉ phép.";
      if (!leaveType) return "Vui lòng chọn loại nghỉ phép.";
      if (!leaveReason.trim()) return "Vui lòng nhập lý do nghỉ phép.";
    }

    if (requestKind === "ATTENDANCE_CORRECTION") {
      if (!attendanceDate) return "Vui lòng chọn ngày cần cộng công.";
      if (!workShiftId) return "Vui lòng chọn ca làm cần cộng công.";
      if (!attendanceReason.trim()) return "Vui lòng nhập lý do cộng công.";
    }

    if (requestKind === "LATE_EARLY") {
      if (!lateEarlyDate || !startTime || !endTime) return "Vui lòng nhập ngày và khung giờ.";
      if (!lateEarlyWorkShiftId) return "Vui lòng chọn ca làm.";
      if (!lateEarlyReason.trim()) return "Vui lòng nhập lý do.";
    }
    if (requestKind === "BONUS_PENALTY") {
      const amount = Number(bonusPenaltyAmount);
      if (!bonusPenaltyEmployeeId) return "Vui lòng chọn nhân viên.";
      if (!bonusPenaltyMonth) return "Vui lòng chọn kỳ lương.";
      if (!Number.isFinite(amount) || amount <= 0) return "Vui lòng nhập số tiền lớn hơn 0.";
      if (!bonusPenaltyReason.trim()) return "Vui lòng nhập lý do thưởng phạt.";
    }
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const approvalFields = {
        title: title.trim(),
        approvalMode,
        approverIds,
        watcherIds,
      };

      if (requestKind === "LEAVE") {
        await requestService.createLeaveRequest({
          ...approvalFields,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          leaveType,
          workShiftId: leaveWorkShiftId || undefined,
          reason: leaveReason.trim(),
        });
      }

      if (requestKind === "ATTENDANCE_CORRECTION") {
        await requestService.createAttendanceCorrectionRequest({
          ...approvalFields,
          attendanceDate,
          workShiftId,
          reason: attendanceReason.trim(),
        });
      }

      if (requestKind === "LATE_EARLY") {
        await requestService.createLateEarlyRequest({
          ...approvalFields,
          date: lateEarlyDate,
          type: lateEarlyType,
          workShiftId: lateEarlyWorkShiftId,
          startTime,
          endTime,
          reason: lateEarlyReason.trim(),
        });
      }

      if (requestKind === "BONUS_PENALTY") {
        await requestService.createBonusPenaltyRequest({
          ...approvalFields,
          employeeId: bonusPenaltyEmployeeId,
          month: bonusPenaltyMonth,
          amount: Number(bonusPenaltyAmount),
          isBonus: bonusPenaltyIsBonus,
          reason: bonusPenaltyReason.trim(),
        });
      }

      onSuccess();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Không thể gửi yêu cầu"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const titles: Record<CreateRequestKind, string> = {
    LEAVE: "Tạo Đơn xin nghỉ phép",
    ATTENDANCE_CORRECTION: "Tạo Đơn đề xuất cộng công",
    LATE_EARLY: "Tạo Đơn đi muộn/về sớm",
    BONUS_PENALTY: "Tạo yêu cầu thưởng phạt"
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      destroyOnClose
      centered
      title={
        <h2 className="text-xl font-bold tracking-tight text-[#243247]">
          {titles[requestKind]}
        </h2>
      }
    >
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col h-[70vh]">
        {errorMessage ? (
          <div className="shrink-0 mb-4 rounded-xl border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto pr-3 flex flex-col gap-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d0d5dd] hover:[&::-webkit-scrollbar-thumb]:bg-[#98a2b3]">

        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className={labelClass}>Tiêu đề <span className="text-[#f04438]">*</span></span>
            <input
              className={fieldClass}
              value={title}
              placeholder="Nhập tiêu đề yêu cầu"
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
        </div>

        {requestKind === "LEAVE" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className={labelClass}>Ngày bắt đầu <span className="text-[#f04438]">*</span></span>
              <DatePicker className={`${fieldClass} !py-2`} format="DD/MM/YYYY" value={leaveStartDate ? dayjs(leaveStartDate) : null} onChange={(date) => setLeaveStartDate(date ? date.format("YYYY-MM-DD") : "")} />
            </label>
            <label>
              <span className={labelClass}>Ngày kết thúc <span className="text-[#f04438]">*</span></span>
              <DatePicker className={`${fieldClass} !py-2`} format="DD/MM/YYYY" value={leaveEndDate ? dayjs(leaveEndDate) : null} onChange={(date) => setLeaveEndDate(date ? date.format("YYYY-MM-DD") : "")} />
            </label>
            <label>
              <span className={labelClass}>Loại nghỉ <span className="text-[#f04438]">*</span></span>
              <select className={fieldClass} value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)}>
                {leaveTypeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </label>
            <label>
              <span className={labelClass}>Ca nghỉ</span>
              <select className={fieldClass} value={leaveWorkShiftId} disabled={!leaveStartDate || isLoadingLeaveShifts} onChange={(e) => setLeaveWorkShiftId(e.target.value)}>
                <option value="">{isLoadingLeaveShifts ? "Đang tải ca..." : "Nghỉ cả ngày"}</option>
                {leaveWorkShifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime}-{shift.endTime})</option>)}
              </select>
            </label>
            <label className="md:col-span-2">
              <span className={labelClass}>Lý do <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} value={leaveReason} placeholder="Nhập lý do nghỉ phép" onChange={(e) => setLeaveReason(e.target.value)} />
            </label>
          </div>
        ) : null}

        {requestKind === "ATTENDANCE_CORRECTION" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className={labelClass}>Ngày cộng công <span className="text-[#f04438]">*</span></span>
              <DatePicker className={`${fieldClass} !py-2`} format="DD/MM/YYYY" value={attendanceDate ? dayjs(attendanceDate) : null} onChange={(date) => setAttendanceDate(date ? date.format("YYYY-MM-DD") : "")} />
            </label>
            <label>
              <span className={labelClass}>Ca làm <span className="text-[#f04438]">*</span></span>
              <select className={fieldClass} value={workShiftId} disabled={!attendanceDate || isLoadingAttendanceShifts} onChange={(e) => setWorkShiftId(e.target.value)}>
                <option value="">{isLoadingAttendanceShifts ? "Đang tải ca..." : "Chọn ca làm"}</option>
                {attendanceWorkShifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime}-{shift.endTime})</option>)}
              </select>
            </label>
            <label className="md:col-span-2">
              <span className={labelClass}>Lý do <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} value={attendanceReason} placeholder="Nhập lý do cộng công" onChange={(e) => setAttendanceReason(e.target.value)} />
            </label>
          </div>
        ) : null}

        {requestKind === "LATE_EARLY" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className={labelClass}>Ngày <span className="text-[#f04438]">*</span></span>
              <DatePicker className={`${fieldClass} !py-2`} format="DD/MM/YYYY" value={lateEarlyDate ? dayjs(lateEarlyDate) : null} onChange={(date) => setLateEarlyDate(date ? date.format("YYYY-MM-DD") : "")} />
            </label>
            <label>
              <span className={labelClass}>Loại đơn</span>
              <select className={fieldClass} value={lateEarlyType} onChange={(e) => setLateEarlyType(e.target.value as LateEarlyKind)}>
                <option value="LATE_ARRIVAL">Đi muộn</option>
                <option value="EARLY_LEAVE">Về sớm</option>
              </select>
            </label>
            <label className="md:col-span-2">
              <span className={labelClass}>Ca làm <span className="text-[#f04438]">*</span></span>
              <select className={fieldClass} value={lateEarlyWorkShiftId} disabled={!lateEarlyDate || isLoadingLateEarlyShifts} onChange={(e) => setLateEarlyWorkShiftId(e.target.value)}>
                <option value="">{isLoadingLateEarlyShifts ? "Đang tải ca..." : "Chọn ca làm"}</option>
                {lateEarlyWorkShifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime}-{shift.endTime})</option>)}
              </select>
            </label>
            <label>
              <span className={labelClass}>Thời gian bắt đầu làm <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </label>
            <label>
              <span className={labelClass}>Thời gian kết thúc làm <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </label>
            <label className="md:col-span-2">
              <span className={labelClass}>Lý do <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} value={lateEarlyReason} placeholder="Nhập lý do đi muộn/về sớm" onChange={(e) => setLateEarlyReason(e.target.value)} />
            </label>
          </div>
        ) : null}

        {requestKind === "BONUS_PENALTY" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className={labelClass}>Nhân viên <span className="text-[#f04438]">*</span></span>
              <SearchableSelect
                className="w-full"
                value={bonusPenaltyEmployeeId}
                onChange={(value) => setBonusPenaltyEmployeeId(value ?? "")}
                options={[
                  { value: "", label: "-- Chọn nhân viên --" },
                  ...employeeOptions,
                ]}
                placeholder="Tìm kiếm nhân viên"
              />
            </label>
            <label>
              <span className={labelClass}>Kỳ lương <span className="text-[#f04438]">*</span></span>
              <DatePicker
                className={`${fieldClass} !py-2`}
                picker="month"
                format="MM/YYYY"
                value={bonusPenaltyMonth ? dayjs(`${bonusPenaltyMonth}-01`) : null}
                onChange={(date) => setBonusPenaltyMonth(date ? date.format("YYYY-MM") : "")}
              />
            </label>
            <label>
              <span className={labelClass}>Loại <span className="text-[#f04438]">*</span></span>
              <select className={fieldClass} value={bonusPenaltyIsBonus ? "bonus" : "penalty"} onChange={(e) => setBonusPenaltyIsBonus(e.target.value === "bonus")}>
                <option value="bonus">Thưởng</option>
                <option value="penalty">Phạt</option>
              </select>
            </label>
            <label className="md:col-span-2">
              <span className={labelClass}>Số tiền <span className="text-[#f04438]">*</span></span>
              <input
                className={fieldClass}
                type="number"
                min="0"
                step="1000"
                value={bonusPenaltyAmount}
                placeholder="Nhập số tiền"
                onChange={(e) => setBonusPenaltyAmount(e.target.value)}
              />
            </label>
            <label className="md:col-span-2">
              <span className={labelClass}>Lý do <span className="text-[#f04438]">*</span></span>
              <input className={fieldClass} value={bonusPenaltyReason} placeholder="Nhập lý do thưởng phạt" onChange={(e) => setBonusPenaltyReason(e.target.value)} />
            </label>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className={labelClass}>Cách duyệt</span>
            <select className={fieldClass} value={approvalMode} onChange={(e) => setApprovalMode(e.target.value as ApprovalMode)}>
              <option value="PARALLEL">Duyệt song song</option>
              <option value="SEQUENTIAL">Duyệt tuần tự</option>
            </select>
          </label>
          
          <div>
            <MultiSelectDropdown
              label="Người duyệt *"
              placeholder="Chọn người duyệt..."
              options={userOptions}
              selected={approverIds}
              onChange={setApproverIds}
            />
            {approverIds.length > 0 && (
              <div className="mt-2 min-w-0 max-w-full">
                <SelectedTags
                  ids={approverIds}
                  options={userOptions}
                  onRemove={(id) =>
                    setApproverIds((cur) => cur.filter((v) => v !== id))
                  }
                />
              </div>
            )}
          </div>

          <div>
            <MultiSelectDropdown
              label="Người theo dõi"
              placeholder="Chọn người theo dõi..."
              options={userOptions}
              selected={watcherIds}
              onChange={setWatcherIds}
            />
            {watcherIds.length > 0 && (
              <div className="mt-2 min-w-0 max-w-full">
                <SelectedTags
                  ids={watcherIds}
                  options={userOptions}
                  onRemove={(id) =>
                    setWatcherIds((cur) => cur.filter((v) => v !== id))
                  }
                />
              </div>
            )}
          </div>
        </div>

        </div>

        <div className="shrink-0 mt-4 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            className="rounded-xl border border-[#d0d5dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition-all hover:bg-[#f9fafb] active:scale-95 shadow-sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoadingOptions}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#006fd5] to-[#0055a8] px-6 py-2.5 text-sm font-semibold text-white! shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 [&_*]:!text-white"
          >
            <Send className="h-4.5 w-4.5" />
            {isSubmitting ? "Đang gửi..." : "Gửi duyệt"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
