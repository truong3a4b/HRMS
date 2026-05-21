import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  FileText,
  IdCard,
  Mail,
  MapPin,
  UserRound,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { Avatar } from "../../../shared/ui/Avatar/Avatar";
import { useAuth } from "../../auth/services/useAuth";
import { employeeService } from "../../employees/services/employeeService";
import type {
  Employee,
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
  value: string;
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
  canEdit = false,
  onEdit,
}: {
  title: string;
  icon: React.ReactNode;
  rows: DetailRow[];
  canEdit?: boolean;
  onEdit?: () => void;
}) {
  return (
    <section className="rounded-lg border border-[#e5eaf0] bg-white p-5 shadow-[0_12px_28px_rgba(16,24,40,0.06)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1f5] pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e9f3ff] text-[#0e67a7]">
            {icon}
          </span>
          <h2 className="text-lg font-bold text-[#1f2937]">{title}</h2>
        </div>
        {canEdit ? (
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-[#c7dcf2] bg-white px-3 py-2 text-sm font-semibold text-[#0e67a7] transition-colors hover:bg-[#f2f8ff]"
            type="button"
            onClick={onEdit}
          >
            <Edit3 className="h-4 w-4" />
            Chỉnh sửa
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
        {rows.map((row) => (
          <div
            className="min-w-0 rounded-lg border border-[#edf1f5] bg-[#fbfcfe] px-4 py-3"
            key={row.label}
          >
            <span className="block text-xs font-medium uppercase text-[#667085]">
              {row.label}
            </span>
            <span className="mt-1 block min-w-0 break-words text-sm font-semibold text-[#243247]">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProfileHero({
  avatar,
  name,
  email,
  kind,
  subtitle,
}: {
  avatar?: string | null;
  name: string;
  email: string;
  kind: ProfileKind;
  subtitle: string;
}) {
  const roleLabel =
    kind === "candidate"
      ? "Ứng viên"
      : kind === "employee"
        ? "Nhân viên"
        : "Tài khoản";

  return (
    <section className="rounded-lg border border-[#dbe7f4] bg-white p-5 shadow-[0_16px_36px_rgba(16,24,40,0.08)]">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar
          alt={name}
          src={avatar ?? undefined}
          sizeClass="h-20 w-20"
          className="ring-4 ring-[#e9f3ff]"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#e9f3ff] px-3 py-1 text-xs font-bold text-[#0e67a7]">
            <BadgeCheck className="h-3.5 w-3.5" />
            {roleLabel}
          </div>
          <h1 className="truncate text-2xl font-bold text-[#172033]">{name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#667085]">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              {email}
            </span>
            <span>{subtitle}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [kind, setKind] = useState<ProfileKind>("account");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editSection, setEditSection] = useState<ProfileEditSection | null>(
    null,
  );

  const loadProfile = useCallback(
    async (ignore = false) => {
      setLoading(true);
      setError(null);
      setEmployee(null);
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

        const result = await profileService.getEmployeeProfile();
        if (!ignore) {
          setEmployee(result);
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
    }

    setEditSection(null);
    setNotice("Đã cập nhật thông tin cá nhân");
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
              value: display(employee.frontIdentityCardImage),
            },
            {
              label: "Ảnh mặt sau CCCD",
              value: display(employee.backIdentityCardImage),
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
            { label: "CV", value: display(candidate.cvUrl) },
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
              value: display(candidate.frontIdentityCardImage),
            },
            {
              label: "Ảnh mặt sau CCCD",
              value: display(candidate.backIdentityCardImage),
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
          <ProfileHero
            avatar={hero.avatar}
            name={hero.name}
            email={hero.email}
            kind={kind}
            subtitle={hero.subtitle || "-"}
          />

          {loading ? (
            <div className="rounded-lg border border-[#e5eaf0] bg-white px-5 py-8 text-center text-sm font-semibold text-[#667085]">
              Đang tải thông tin cá nhân...
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

          {!loading && kind === "employee" && employee ? (
            <div className="grid gap-5">
              <DetailSection
                title="Thông tin cá nhân"
                icon={<UserRound className="h-5 w-5" />}
                rows={employeePersonalRows}
                canEdit={canEditProfile}
                onEdit={() => setEditSection("basic")}
              />
              <DetailSection
                title="Thông tin công việc"
                icon={<BriefcaseBusiness className="h-5 w-5" />}
                rows={employeeWorkRows}
              />
              <DetailSection
                title="Thông tin bổ sung"
                icon={<IdCard className="h-5 w-5" />}
                rows={employeeAdditionalRows}
                canEdit={canEditProfile}
                onEdit={() => setEditSection("additional")}
              />
            </div>
          ) : null}

          {!loading && kind === "candidate" && candidate ? (
            <div className="grid gap-5">
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
              <section className="rounded-lg border border-[#e5eaf0] bg-white p-5 shadow-[0_12px_28px_rgba(16,24,40,0.06)]">
                <div className="mb-4 flex items-center gap-3 border-b border-[#edf1f5] pb-4">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#fff4e5] text-[#f79009]">
                    <FileText className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-bold text-[#1f2937]">
                    Hồ sơ ứng tuyển
                  </h2>
                </div>
                <div className="grid gap-3">
                  {candidate.applications?.length ? (
                    candidate.applications.map((application) => (
                      <article
                        className="rounded-lg border border-[#edf1f5] bg-[#fbfcfe] px-4 py-3"
                        key={application.id}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-bold text-[#243247]">
                              {application.recruitmentJob?.title ??
                                application.position?.name ??
                                "Vị trí ứng tuyển"}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#667085]">
                              <span className="inline-flex items-center gap-1">
                                <BriefcaseBusiness className="h-3.5 w-3.5" />
                                {application.position?.name ?? "-"}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {application.department?.name ?? "-"}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDate(application.appliedAt)}
                              </span>
                            </div>
                          </div>
                          <span className="rounded-full bg-[#e9f3ff] px-3 py-1 text-xs font-bold text-[#0e67a7]">
                            {applicationStatusLabels[application.status] ??
                              application.status}
                          </span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#d7dde8] bg-[#fbfcff] px-4 py-6 text-center text-sm text-[#667085]">
                      Chưa có hồ sơ ứng tuyển.
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : null}

          {!loading && kind === "account" ? (
            <DetailSection
              title="Thông tin tài khoản"
              icon={<Mail className="h-5 w-5" />}
              rows={accountRows}
            />
          ) : null}
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
