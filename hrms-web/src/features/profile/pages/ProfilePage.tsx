import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Edit3,
  FileText,
  Gift,
  HandCoins,
  IdCard,
  Mail,
  MapPin,
  Percent,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { useAuth } from "../../auth/services/useAuth";
import { EmployeeJobHistoryList } from "../../employees/components/EmployeeJobHistoryList";
import { employeeService } from "../../employees/services/employeeService";
import type {
  Employee,
  EmployeeJobHistory,
  UpdateEmployeeAdditionalPayload,
  UpdateEmployeeBasicPayload,
} from "../../employees/types/employee.types";
import {
  ProfileEditModal,
  type ProfileEditSection,
} from "../components/ProfileEditModal";
import { profileService } from "../services/profileService";
import type {
  CandidateProfile,
  CandidateProfilePayload,
} from "../types/profile.types";

type DetailRow = {
  label: string;
  value: React.ReactNode;
};

type ProfileKind = "employee" | "candidate" | "account";

const genderLabels = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
} as const;

const employeeStatusLabels = {
  WORKING: "Đang làm việc",
  ON_LEAVE: "Đang nghỉ phép",
  RESIGNED: "Đã nghỉ việc",
} as const;

const applicationStatusLabels: Record<string, string> = {
  NOT_APPLIED: "Chưa ứng tuyển",
  APPLIED: "Đã ứng tuyển",
  INTERVIEWING: "Đang phỏng vấn",
  OFFER_SENT: "Đã gửi offer",
  OFFER_DECLINED: "Từ chối offer",
  ONBOARDED: "Đã onboard",
  CANCELLED: "Đã hủy",
  REJECTED: "Từ chối",
};

function display(value?: string | number | null) {
  return value == null || value === "" ? "-" : String(value);
}

function displayImage(url?: string | null, alt = "Image") {
  if (!url) return "-";
  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-1 block w-fit overflow-hidden rounded-lg border border-[#eaecf0] transition-opacity hover:opacity-80 bg-slate-50">
      <img src={url} alt={alt} className="h-20 w-auto object-cover" />
    </a>
  );
}

function displayLink(url?: string | null, label = "Tải xuống") {
  if (!url) return "-";
  return (
    <a href={url} target="_blank" rel="noreferrer" className="text-[#006fd5] hover:underline font-medium">
      {label}
    </a>
  );
}

function lookupName(value: unknown) {
  if (!value || typeof value !== "object") return "-";
  const record = value as { name?: unknown; code?: unknown };
  const name = typeof record.name === "string" ? record.name : "";
  const code = typeof record.code === "string" ? record.code : "";
  return [code, name].filter(Boolean).join(" - ") || "-";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function formatCurrency(value?: string | number | null) {
  if (value == null || value === "") return "-";
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value?: string | number | null) {
  if (value == null || value === "") return "-";
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);
  return `${amount.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`;
}

function formatNumber(value?: string | number | null) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) return "0";
  return number.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}

function formatPolicyPeriod(from?: string | null, to?: string | null) {
  if (!from && !to) return "-";
  return `${formatDate(from)} - ${to ? formatDate(to) : "Hiện tại"}`;
}

function getAutoPenaltyTypeLabel(type?: string) {
  const labels: Record<string, string> = {
    LATE_EARLY: "Đi muộn/về sớm",
    LATE_EARLY_PROGRESSIVE: "Đi muộn/về sớm lũy tiến",
    UNAUTHORIZED_ABSENCE: "Nghỉ không phép",
    UNAUTHORIZED_ABSENCE_PROGRESSIVE: "Nghỉ không phép lũy tiến",
  };

  return type ? labels[type] ?? type : "-";
}

function getCurrentLeaveBalance(employee: Employee) {
  const year = new Date().getFullYear();
  const balance = employee.leaveBalances?.find((item) => item.year === year);
  const entitled = Number(balance?.entitledLeaveDays ?? 0);
  const used = Number(balance?.usedPaidLeaveDays ?? 0);

  return {
    year,
    entitled: Number.isFinite(entitled) ? entitled : 0,
    used: Number.isFinite(used) ? used : 0,
  };
}

function getErrorMessage(error: unknown) {
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

  return "Không thể tải thông tin cá nhân";
}

function DetailSection({
  title,
  icon,
  rows,
  children,
  canEdit = false,
  onEdit,
}: {
  title: string;
  icon: React.ReactNode;
  rows?: DetailRow[];
  children?: React.ReactNode;
  canEdit?: boolean;
  onEdit?: () => void;
}) {
  return (
    <section className="rounded-2xl border border-[#d0d5dd] bg-white shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eaecf0] px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded bg-[#eef7ff] text-[#006fd5]">
            {icon}
          </div>
          <h2 className="text-base font-bold text-[#101828]">{title}</h2>
        </div>
        {canEdit ? (
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-[#067647] transition-colors hover:bg-[#d1fadf] border border-transparent hover:border-[#a6f4c5]"
            type="button"
            onClick={onEdit}
          >
            <Edit3 className="h-4 w-4" />
            Chỉnh sửa
          </button>
        ) : null}
      </div>
      {children ? (
        <div className="p-6">{children}</div>
      ) : (
        <div className="grid grid-cols-2 p-6 max-[760px]:grid-cols-1">
          {(rows ?? []).map((row) => (
            <div
              className="flex flex-col justify-center border-b border-[#eaecf0] px-4 py-3 last:border-0 [&:nth-last-child(2):nth-child(odd)]:border-0"
              key={row.label}
            >
              <span className="text-xs font-medium text-[#667085]">{row.label}</span>
              <span className="mt-1 break-words text-sm font-medium text-[#101828]">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PolicyStatus({
  enabled,
  active,
}: {
  enabled: boolean;
  active?: boolean;
}) {
  const label = !enabled ? "Không áp dụng" : active === false ? "Tạm dừng" : "Đang áp dụng";
  const className = !enabled
    ? "bg-[#f2f4f7] text-[#667085]"
    : active === false
      ? "bg-[#fff6ed] text-[#c4320a]"
      : "bg-[#ecfdf3] text-[#067647]";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>
      {label}
    </span>
  );
}

function PayrollPolicyCard({ employee }: { employee: Employee }) {
  const profile = employee.payrollProfile;
  const insurance = profile?.insurancePolicy;
  const tax = profile?.taxPolicy;
  const attendanceBonus = profile?.attendanceBonusPolicy;
  const leaveBalance = getCurrentLeaveBalance(employee);
  const allowancePolicies =
    employee.allowances?.map((item) => item.allowancePolicy).filter(Boolean) ?? [];
  const autoPenaltyPolicies =
    employee.autoPenaltyPolicies
      ?.map((item) => item.autoPenaltyPolicy)
      .filter(Boolean) ?? [];

  return (
    <section className="rounded-lg border border-[#e5eaf0] bg-white p-5 shadow-[0_12px_28px_rgba(16,24,40,0.06)]">
      <div className="mb-4 flex items-center gap-3 border-b border-[#edf1f5] pb-4">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#ecfdf3] text-[#067647]">
          <HandCoins className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-bold text-[#1f2937]">
          Chính sách lương đang áp dụng
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 max-[920px]:grid-cols-1">
        <article className="rounded-lg border border-[#edf1f5] bg-[#fbfcfe] p-4">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-[#006fd5]" />
            <strong className="text-sm text-[#243247]">Phép năm</strong>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm text-[#475467] max-[640px]:grid-cols-1">
            <div>
              <span className="block text-xs text-[#667085]">Được cấp {leaveBalance.year}</span>
              <span className="font-semibold text-[#243247]">{formatNumber(leaveBalance.entitled)} ngày</span>
            </div>
            <div>
              <span className="block text-xs text-[#667085]">Đã dùng</span>
              <span className="font-semibold text-[#243247]">{formatNumber(leaveBalance.used)} ngày</span>
            </div>
            <div>
              <span className="block text-xs text-[#667085]">Còn lại</span>
              <span className="font-semibold text-[#243247]">{formatNumber(Math.max(0, leaveBalance.entitled - leaveBalance.used))} ngày</span>
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-[#edf1f5] bg-[#fbfcfe] p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#0e67a7]" />
              <strong className="truncate text-sm text-[#243247]">Bảo hiểm</strong>
            </div>
            <PolicyStatus
              enabled={Boolean(profile?.isInsuranceApplicable && insurance)}
              active={insurance?.isActive}
            />
          </div>
          <div className="grid gap-2 text-sm text-[#475467]">
            <div className="font-semibold text-[#243247]">{insurance?.name ?? "-"}</div>
            <div>Lương đóng BH: {formatCurrency(profile?.insuranceSalary ?? employee.salary)}</div>
            <div>
              NLĐ: BHXH {formatPercent(insurance?.employeeSocialRate)} | BHYT{" "}
              {formatPercent(insurance?.employeeHealthRate)} | BHTN{" "}
              {formatPercent(insurance?.employeeUnemploymentRate)}
            </div>
            <div className="text-xs text-[#667085]">
              Hiệu lực: {formatPolicyPeriod(insurance?.effectiveFrom, insurance?.effectiveTo)}
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-[#edf1f5] bg-[#fbfcfe] p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Percent className="h-4 w-4 shrink-0 text-[#7a5af8]" />
              <strong className="truncate text-sm text-[#243247]">Thuế TNCN</strong>
            </div>
            <PolicyStatus
              enabled={Boolean(profile?.isTaxApplicable && tax)}
              active={tax?.isActive}
            />
          </div>
          <div className="grid gap-2 text-sm text-[#475467]">
            <div className="font-semibold text-[#243247]">{tax?.name ?? "-"}</div>
            <div>Mã số thuế: {profile?.taxCode || "-"}</div>
            <div>
              Giảm trừ bản thân: {formatCurrency(tax?.personalDeduction)} | Phụ thuộc:{" "}
              {profile?.dependentCount ?? 0} người
            </div>
            <div className="text-xs text-[#667085]">
              Bậc thuế: {tax?.brackets?.length ?? 0} | Hiệu lực:{" "}
              {formatPolicyPeriod(tax?.effectiveFrom, tax?.effectiveTo)}
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-[#edf1f5] bg-[#fbfcfe] p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Gift className="h-4 w-4 shrink-0 text-[#f79009]" />
              <strong className="truncate text-sm text-[#243247]">Thưởng chuyên cần</strong>
            </div>
            <PolicyStatus
              enabled={Boolean(profile?.isAttendanceBonusApplicable && attendanceBonus)}
              active={attendanceBonus?.isActive}
            />
          </div>
          <div className="grid gap-2 text-sm text-[#475467]">
            <div className="font-semibold text-[#243247]">
              {attendanceBonus?.name ?? "-"}
            </div>
            <div>Số tiền: {formatCurrency(attendanceBonus?.amount)}</div>
            <div>
              Công yêu cầu: {attendanceBonus?.requiredWorkDays ?? "-"} | Vắng tối đa:{" "}
              {attendanceBonus?.maxAbsentDays ?? "-"}
            </div>
            <div className="text-xs text-[#667085]">
              Hiệu lực:{" "}
              {formatPolicyPeriod(attendanceBonus?.effectiveFrom, attendanceBonus?.effectiveTo)}
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-[#edf1f5] bg-[#fbfcfe] p-4">
          <div className="mb-3 flex items-center gap-2">
            <HandCoins className="h-4 w-4 shrink-0 text-[#067647]" />
            <strong className="text-sm text-[#243247]">Phụ cấp</strong>
          </div>
          {allowancePolicies.length ? (
            <div className="grid gap-2">
              {allowancePolicies.map((policy) => (
                <div className="flex items-center justify-between gap-3 text-sm" key={policy!.id}>
                  <span className="min-w-0 truncate font-semibold text-[#243247]">
                    {policy!.name}
                  </span>
                  <span className="shrink-0 text-[#067647]">
                    {formatCurrency(policy!.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[#667085]">Chưa có phụ cấp được gắn</div>
          )}
        </article>
      </div>

      <article className="mt-3 rounded-lg border border-[#edf1f5] bg-[#fbfcfe] p-4">
        <div className="mb-3 flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 shrink-0 text-[#d92d20]" />
          <strong className="text-sm text-[#243247]">Phạt tự động</strong>
        </div>
        {autoPenaltyPolicies.length ? (
          <div className="grid grid-cols-2 gap-2 max-[760px]:grid-cols-1">
            {autoPenaltyPolicies.map((policy) => (
              <div
                className="rounded-lg border border-[#edf1f5] bg-white px-3 py-2 text-sm"
                key={policy!.id}
              >
                <div className="font-semibold text-[#243247]">{policy!.name}</div>
                <div className="mt-1 text-xs text-[#667085]">
                  {getAutoPenaltyTypeLabel(policy!.type)} | Mức phạt:{" "}
                  {formatCurrency(policy!.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[#667085]">Chưa có chính sách phạt tự động</div>
        )}
      </article>
    </section>
  );
}

function ProfileHero({
  avatar,
  name,
  email,
  kind,
  subtitle,
  canEditAvatar = false,
  avatarUploading = false,
  onAvatarFileSelect,
}: {
  avatar?: string | null;
  name: string;
  email: string;
  kind: ProfileKind;
  subtitle: string;
  canEditAvatar?: boolean;
  avatarUploading?: boolean;
  onAvatarFileSelect?: (file: File) => void;
}) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const roleLabel =
    kind === "candidate"
      ? "Ứng viên"
      : kind === "employee"
        ? "Nhân viên"
        : "Tài khoản";

  return (
    <aside className="sticky top-5 w-[320px] shrink-0 max-[900px]:static max-[900px]:w-full">
      <div className="rounded-2xl border border-[#d0d5dd] bg-white p-6 text-center shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
        <div className="relative mx-auto mb-4 h-24 w-24">
          <Avatar
            alt={name}
            src={avatar ?? undefined}
            sizeClass="h-24 w-24"
            className="ring-4 ring-[#f9fafb]"
          />
          {canEditAvatar ? (
            <>
              <button
                className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#006fd5] text-white shadow-sm transition-colors hover:bg-[#0055a8] disabled:cursor-not-allowed disabled:opacity-70"
                type="button"
                aria-label="Chọn ảnh cá nhân"
                title="Chọn ảnh cá nhân"
                disabled={avatarUploading}
                onClick={() => avatarInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={avatarInputRef}
                className="hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (file) {
                    onAvatarFileSelect?.(file);
                    event.currentTarget.value = "";
                  }
                }}
              />
            </>
          ) : null}
        </div>
        
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#eef7ff] px-3 py-1 text-xs font-bold text-[#006fd5]">
          <BadgeCheck className="h-3.5 w-3.5" />
          {roleLabel}
        </div>
        <h1 className="mb-1 text-xl font-bold text-[#101828] break-words w-full">{name}</h1>
        <div className="flex flex-col items-center gap-2 text-sm text-[#475467] w-full">
          <span className="flex items-center gap-1.5 min-w-0 w-full justify-center">
            <Mail className="h-4 w-4 shrink-0 text-[#667085]" />
            <span className="truncate">{email}</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#344054] break-words w-full justify-center text-center">
            {subtitle}
          </span>
        </div>
      </div>
    </aside>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [jobHistories, setJobHistories] = useState<EmployeeJobHistory[]>([]);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [kind, setKind] = useState<ProfileKind>("account");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editSection, setEditSection] = useState<ProfileEditSection | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"personal" | "work" | "payroll" | "application">("personal");

  const loadProfile = useCallback(
    async (ignore = false) => {
      setLoading(true);
      setError(null);
      setEmployee(null);
      setJobHistories([]);
      setCandidate(null);

      try {
        if (user?.role === "CANDIDATE") {
          const result = await profileService.getCandidateProfile();
          if (!ignore) {
            setCandidate(result);
            setKind("candidate");
          }
          return;
        }

        const [result, jobHistoryResult] = await Promise.all([
          profileService.getEmployeeProfile(),
          employeeService.getMyJobHistory(),
        ]);
        if (!ignore) {
          setEmployee(result);
          setJobHistories(jobHistoryResult);
          setKind("employee");
        }
      } catch (loadError) {
        if (!ignore) {
          setKind("account");
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    },
    [user?.role],
  );

  useEffect(() => {
    let ignore = false;

    void loadProfile(ignore);

    return () => {
      ignore = true;
    };
  }, [loadProfile]);

  const canEditProfile =
    user?.role === "CANDIDATE" ||
    user?.role === "ADMIN" ||
    Boolean(
      user?.permissions?.some((permission) =>
        ["EMPLOYEE_UPDATE_SELF_BASIC", "EMPLOYEE_UPDATE_BASIC"].includes(
          permission,
        ),
      ),
    );

  const handleProfileUpdate = async (
    basicPayload?: UpdateEmployeeBasicPayload | CandidateProfilePayload,
    additionalPayload?: UpdateEmployeeAdditionalPayload,
  ) => {
    setNotice(null);
    if (kind === "candidate") {
      const updated = await profileService.updateCandidateProfile(
        basicPayload as CandidateProfilePayload,
      );
      setCandidate(updated);
    } else {
      const tasks: Promise<unknown>[] = [];
      if (basicPayload && Object.keys(basicPayload).length > 0) {
        tasks.push(
          employeeService.updateMyBasic(
            basicPayload as Parameters<typeof employeeService.updateMyBasic>[0],
          ),
        );
      }
      if (additionalPayload && Object.keys(additionalPayload).length > 0) {
        tasks.push(employeeService.updateMyAdditional(additionalPayload));
      }
      await Promise.all(tasks);
      const updated = await profileService.getEmployeeProfile();
      setEmployee(updated);
      setJobHistories(await employeeService.getMyJobHistory());
    }

    setEditSection(null);
    setNotice("Đã cập nhật thông tin cá nhân");
  };

  const handleAvatarFileSelect = async (file: File) => {
    if (kind === "account") return;

    setNotice(null);
    setError(null);
    setAvatarUploading(true);

    try {
      if (kind === "candidate") {
        const updated = await profileService.updateCandidateProfile({
          avatarFile: file,
        });
        setCandidate(updated);
      } else {
        const updated = await employeeService.updateMyBasic({
          avatarFile: file,
        });
        setEmployee(updated);
      }

      setNotice("Đã cập nhật ảnh cá nhân");
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setAvatarUploading(false);
    }
  };

  const accountRows = useMemo<DetailRow[]>(
    () => [
      { label: "Email đăng nhập", value: display(user?.email) },
      { label: "Vai trò", value: display(user?.role) },
      { label: "Mã tài khoản", value: display(user?.id) },
    ],
    [user],
  );

  const employeePersonalRows = useMemo<DetailRow[]>(
    () =>
      employee
        ? [
            { label: "Họ tên", value: employee.name },
            { label: "Email", value: employee.email },
            { label: "Số điện thoại", value: display(employee.phone) },
            { label: "Ngày sinh", value: formatDate(employee.dateOfBirth) },
            {
              label: "Giới tính",
              value: employee.gender ? genderLabels[employee.gender] : "-",
            },
            { label: "Địa chỉ", value: display(employee.address) },
            { label: "Tỉnh/Thành", value: lookupName(employee.province) },
            { label: "Phường/Xã", value: lookupName(employee.ward) },
            { label: "Tài khoản ngân hàng", value: display(employee.bankAccount) },
            { label: "Ngân hàng", value: lookupName(employee.bank) },
          ]
        : [],
    [employee],
  );

  const employeeWorkRows = useMemo<DetailRow[]>(
    () =>
      employee
        ? [
            { label: "Mã nhân viên", value: employee.employeeId },
            {
              label: "Trạng thái",
              value: employeeStatusLabels[employee.status] ?? employee.status,
            },
            { label: "Phòng ban", value: employee.department?.name ?? "-" },
            { label: "Chức vụ", value: employee.position?.name ?? "-" },
            { label: "Ngày vào làm", value: formatDate(employee.hireDate) },
            { label: "Lương cơ bản", value: formatCurrency(employee.salary) },
          ]
        : [],
    [employee],
  );

  const employeeAdditionalRows = useMemo<DetailRow[]>(
    () =>
      employee
        ? [
            { label: "Tình trạng hôn nhân", value: display(employee.maritalStatus) },
            { label: "Quốc tịch", value: display(employee.nationality) },
            { label: "Tôn giáo", value: display(employee.religion) },
            { label: "Số CCCD/CMND", value: display(employee.identityCardNumber) },
            {
              label: "Ngày cấp CCCD/CMND",
              value: formatDate(employee.identityCardIssueDate),
            },
            {
              label: "Ảnh mặt trước CCCD",
              value: displayImage(employee.frontIdentityCardImage, "Mặt trước CCCD"),
            },
            {
              label: "Ảnh mặt sau CCCD",
              value: displayImage(employee.backIdentityCardImage, "Mặt sau CCCD"),
            },
          ]
        : [],
    [employee],
  );

  const candidatePersonalRows = useMemo<DetailRow[]>(
    () =>
      candidate
        ? [
            { label: "Họ tên", value: display(candidate.fullName) },
            { label: "Email", value: candidate.email },
            { label: "Số điện thoại", value: display(candidate.phone) },
            { label: "Ngày sinh", value: formatDate(candidate.dateOfBirth) },
            {
              label: "Giới tính",
              value: candidate.gender ? genderLabels[candidate.gender] : "-",
            },
            { label: "CV", value: displayLink(candidate.cvUrl, "Xem CV") },
            { label: "Địa chỉ", value: display(candidate.address) },
            { label: "Tỉnh/Thành", value: lookupName(candidate.province) },
            { label: "Phường/Xã", value: lookupName(candidate.ward) },
            { label: "Tài khoản ngân hàng", value: display(candidate.bankAccount) },
            { label: "Ngân hàng", value: lookupName(candidate.bank) },
          ]
        : [],
    [candidate],
  );

  const candidateAdditionalRows = useMemo<DetailRow[]>(
    () =>
      candidate
        ? [
            { label: "Tình trạng hôn nhân", value: display(candidate.maritalStatus) },
            { label: "Quốc tịch", value: display(candidate.nationality) },
            { label: "Tôn giáo", value: display(candidate.religion) },
            { label: "Số CCCD/CMND", value: display(candidate.identityCardNumber) },
            {
              label: "Ngày cấp CCCD/CMND",
              value: formatDate(candidate.identityCardIssueDate),
            },
            {
              label: "Ảnh mặt trước CCCD",
              value: displayImage(candidate.frontIdentityCardImage, "Mặt trước CCCD"),
            },
            {
              label: "Ảnh mặt sau CCCD",
              value: displayImage(candidate.backIdentityCardImage, "Mặt sau CCCD"),
            },
          ]
        : [],
    [candidate],
  );

  const hero =
    kind === "candidate" && candidate
      ? {
          avatar: candidate.avatar,
          name: candidate.fullName || candidate.email,
          email: candidate.email,
          subtitle: `${candidate.applications?.length ?? 0} hồ sơ ứng tuyển`,
        }
      : kind === "employee" && employee
        ? {
            avatar: employee.avatar,
            name: employee.name,
            email: employee.email,
            subtitle: [employee.department?.name, employee.position?.name]
              .filter(Boolean)
              .join(" - "),
          }
        : {
            avatar: null,
            name: user?.email ?? "Tài khoản",
            email: user?.email ?? "-",
            subtitle: user?.role ?? "-",
          };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-y-auto">
        <div className="flex min-h-full flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex items-start gap-6 max-[900px]:flex-col">
            <ProfileHero
              avatar={hero.avatar}
              name={hero.name}
              email={hero.email}
              kind={kind}
              subtitle={hero.subtitle || "-"}
              canEditAvatar={canEditProfile && kind !== "account"}
              avatarUploading={avatarUploading}
              onAvatarFileSelect={handleAvatarFileSelect}
            />

            <section className="grid min-w-0 flex-1 content-start gap-5">
              {loading ? (
                <div className="rounded-2xl border border-[#d0d5dd] bg-white px-5 py-8 text-center text-sm font-semibold text-[#667085] shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
                  Đang tải thông tin cá nhân...
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318] shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
                  {error}
                </div>
              ) : null}
              {notice ? (
                <div className="rounded-2xl border border-[#abefc6] bg-[#f6fef9] px-4 py-3 text-sm text-[#067647] shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
                  {notice}
                </div>
              ) : null}

              {!loading && kind === "employee" && employee ? (
                <>
                  <div className="flex border-b border-[#d0d5dd] bg-transparent">
                    <button
                      className={`inline-flex min-h-14 items-center justify-center gap-2 border-b-2 px-8 text-sm font-semibold transition-all duration-300 max-[640px]:flex-1 max-[640px]:px-4 ${
                        activeTab === "personal"
                          ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5] shadow-[inset_0_-2px_0_0_#006fd5]"
                          : "border-transparent text-[#667085] hover:bg-slate-50 hover:text-[#344054]"
                      }`}
                      type="button"
                      onClick={() => setActiveTab("personal")}
                    >
                      <UserRound className="h-4 w-4" />
                      Cá nhân
                    </button>
                    <button
                      className={`inline-flex min-h-14 items-center justify-center gap-2 border-b-2 px-8 text-sm font-semibold transition-all duration-300 max-[640px]:flex-1 max-[640px]:px-4 ${
                        activeTab === "work"
                          ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5] shadow-[inset_0_-2px_0_0_#006fd5]"
                          : "border-transparent text-[#667085] hover:bg-slate-50 hover:text-[#344054]"
                      }`}
                      type="button"
                      onClick={() => setActiveTab("work")}
                    >
                      <BriefcaseBusiness className="h-4 w-4" />
                      Công việc
                    </button>
                    <button
                      className={`inline-flex min-h-14 items-center justify-center gap-2 border-b-2 px-8 text-sm font-semibold transition-all duration-300 max-[640px]:flex-1 max-[640px]:px-4 ${
                        activeTab === "payroll"
                          ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5] shadow-[inset_0_-2px_0_0_#006fd5]"
                          : "border-transparent text-[#667085] hover:bg-slate-50 hover:text-[#344054]"
                      }`}
                      type="button"
                      onClick={() => setActiveTab("payroll")}
                    >
                      <HandCoins className="h-4 w-4" />
                      Lương & Chính sách
                    </button>
                  </div>

                  {activeTab === "personal" ? (
                    <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <DetailSection
                        title="Thông tin cá nhân"
                        icon={<UserRound className="h-5 w-5" />}
                        rows={employeePersonalRows}
                        canEdit={canEditProfile}
                        onEdit={() => setEditSection("basic")}
                      />
                      <DetailSection
                        title="Thông tin bổ sung"
                        icon={<IdCard className="h-5 w-5" />}
                        rows={employeeAdditionalRows}
                        canEdit={canEditProfile}
                        onEdit={() => setEditSection("additional")}
                      />
                    </div>
                  ) : activeTab === "work" ? (
                    <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <DetailSection
                        title="Thông tin công việc"
                        icon={<BriefcaseBusiness className="h-5 w-5" />}
                        rows={employeeWorkRows}
                      />
                      <DetailSection
                        title="Lịch sử thay đổi công việc"
                        icon={<CalendarDays className="h-5 w-5" />}
                      >
                        <EmployeeJobHistoryList histories={jobHistories} />
                      </DetailSection>
                    </div>
                  ) : activeTab === "payroll" ? (
                    <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <PayrollPolicyCard employee={employee} />
                    </div>
                  ) : null}
                </>
              ) : null}

              {!loading && kind === "candidate" && candidate ? (
                <>
                  <div className="flex border-b border-[#d0d5dd] bg-transparent">
                    <button
                      className={`inline-flex min-h-14 items-center justify-center gap-2 border-b-2 px-8 text-sm font-semibold transition-all duration-300 max-[640px]:flex-1 max-[640px]:px-4 ${
                        activeTab === "personal"
                          ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5] shadow-[inset_0_-2px_0_0_#006fd5]"
                          : "border-transparent text-[#667085] hover:bg-slate-50 hover:text-[#344054]"
                      }`}
                      type="button"
                      onClick={() => setActiveTab("personal")}
                    >
                      <UserRound className="h-4 w-4" />
                      Cá nhân
                    </button>
                    <button
                      className={`inline-flex min-h-14 items-center justify-center gap-2 border-b-2 px-8 text-sm font-semibold transition-all duration-300 max-[640px]:flex-1 max-[640px]:px-4 ${
                        activeTab === "application"
                          ? "border-[#006fd5] bg-[#eef7ff] text-[#006fd5] shadow-[inset_0_-2px_0_0_#006fd5]"
                          : "border-transparent text-[#667085] hover:bg-slate-50 hover:text-[#344054]"
                      }`}
                      type="button"
                      onClick={() => setActiveTab("application")}
                    >
                      <FileText className="h-4 w-4" />
                      Hồ sơ ứng tuyển
                    </button>
                  </div>

                  {activeTab === "personal" || activeTab !== "application" ? (
                    <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <DetailSection
                        title="Thông tin ứng viên"
                        icon={<UserRound className="h-5 w-5" />}
                        rows={candidatePersonalRows}
                        canEdit={canEditProfile}
                        onEdit={() => setEditSection("basic")}
                      />
                      <DetailSection
                        title="Hồ sơ và giấy tờ"
                        icon={<IdCard className="h-5 w-5" />}
                        rows={candidateAdditionalRows}
                        canEdit={canEditProfile}
                        onEdit={() => setEditSection("additional")}
                      />
                    </div>
                  ) : activeTab === "application" ? (
                    <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <section className="rounded-2xl border border-[#d0d5dd] bg-white shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
                        <div className="mb-4 flex items-center gap-3 border-b border-[#eaecf0] px-6 py-4">
                          <span className="grid h-8 w-8 place-items-center rounded bg-[#fff4e5] text-[#f79009]">
                            <FileText className="h-4 w-4" />
                          </span>
                          <h2 className="text-base font-bold text-[#101828]">
                            Hồ sơ ứng tuyển
                          </h2>
                        </div>
                        <div className="grid gap-3 p-6">
                          {candidate.applications?.length ? (
                            candidate.applications.map((application) => (
                              <article
                                className="rounded-lg border border-[#eaecf0] bg-[#f9fafb] px-4 py-3"
                                key={application.id}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="font-bold text-[#101828]">
                                      {application.recruitmentJob?.title ??
                                        application.position?.name ??
                                        "Vị trí ứng tuyển"}
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#475467]">
                                      <span className="inline-flex items-center gap-1">
                                        <BriefcaseBusiness className="h-3.5 w-3.5 text-[#667085]" />
                                        {application.position?.name ?? "-"}
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5 text-[#667085]" />
                                        {application.department?.name ?? "-"}
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <CalendarDays className="h-3.5 w-3.5 text-[#667085]" />
                                        {formatDate(application.appliedAt)}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-xs font-bold text-[#006fd5]">
                                    {applicationStatusLabels[application.status] ??
                                      application.status}
                                  </span>
                                </div>
                              </article>
                            ))
                          ) : (
                            <div className="rounded-lg border border-dashed border-[#d0d5dd] bg-[#fcfcfd] px-4 py-6 text-center text-sm text-[#667085]">
                              Chưa có hồ sơ ứng tuyển.
                            </div>
                          )}
                        </div>
                      </section>
                    </div>
                  ) : null}
                </>
              ) : null}

              {!loading && kind === "account" ? (
                <DetailSection
                  title="Thông tin tài khoản"
                  icon={<Mail className="h-5 w-5" />}
                  rows={accountRows}
                />
              ) : null}
            </section>
          </div>
          
          <ProfileEditModal
            open={editSection !== null}
            kind={kind === "candidate" ? "candidate" : "employee"}
            section={editSection ?? "basic"}
            employee={employee}
            candidate={candidate}
            onClose={() => setEditSection(null)}
            onSubmit={handleProfileUpdate}
          />
        </div>
      </main>
    </AppLayout>
  );
}
