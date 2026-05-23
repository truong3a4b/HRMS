import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "antd";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import {
  findProvince,
  findWard,
  getLookupId,
  getWardOptions,
  provinceOptions,
  type LookupOption,
} from "../../../shared/data/addressOptions";
import type {
  Employee,
  UpdateEmployeeAdditionalPayload,
  UpdateEmployeeBasicPayload,
} from "../../employees/types/employee.types";
import type {
  CandidateProfile,
  CandidateProfilePayload,
} from "../types/profile.types";

type ProfileEditModalProps = {
  open: boolean;
  kind: "employee" | "candidate";
  section: ProfileEditSection;
  employee: Employee | null;
  candidate: CandidateProfile | null;
  onClose: () => void;
  onSubmit: (
    basicPayload?: UpdateEmployeeBasicPayload | CandidateProfilePayload,
    additionalPayload?: UpdateEmployeeAdditionalPayload,
  ) => Promise<void>;
};

export type ProfileEditSection = "basic" | "address" | "bank" | "additional";

type ProfileForm = {
  name: string;
  phone: string;
  avatar: string;
  dateOfBirth: string;
  gender: "" | "MALE" | "FEMALE" | "OTHER";
  address: string;
  provinceId: string;
  wardId: string;
  cvUrl: string;
  maritalStatus: string;
  nationality: string;
  religion: string;
  identityCardNumber: string;
  identityCardIssueDate: string;
  frontIdentityCardImage: string;
  backIdentityCardImage: string;
  bankAccount: string;
  bankName: string;
};

type ProfileFiles = {
  cvFile: File | null;
  frontIdentityCardImageFile: File | null;
  backIdentityCardImageFile: File | null;
};

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";

const labelClass = "mb-1.5 block text-sm font-medium text-[#344054]";

const emptyForm: ProfileForm = {
  name: "",
  phone: "",
  avatar: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  provinceId: "",
  wardId: "",
  cvUrl: "",
  maritalStatus: "",
  nationality: "",
  religion: "",
  identityCardNumber: "",
  identityCardIssueDate: "",
  frontIdentityCardImage: "",
  backIdentityCardImage: "",
  bankAccount: "",
  bankName: "",
};

const emptyFiles: ProfileFiles = {
  cvFile: null,
  frontIdentityCardImageFile: null,
  backIdentityCardImageFile: null,
};

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function getName(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const record = value as { name?: unknown };
  return typeof record.name === "string" ? record.name : "";
}

function toNullableString(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toNullableDate(value: string) {
  return value ? value : null;
}

function toLookup(value: LookupOption | null) {
  return value ? { id: value.id, name: value.name } : null;
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

  return "Khong the luu thong tin ca nhan";
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className={labelClass}>
        {label}
        {required && <span className="ml-1 text-[#b42318]">*</span>}
      </span>
      {children}
    </label>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#edf0f5] bg-[#fbfcff] p-4">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#344054]">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
        {children}
      </div>
    </section>
  );
}

function FileField({
  label,
  accept,
  currentUrl,
  file,
  onChange,
}: {
  label: string;
  accept: string;
  currentUrl?: string | null;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="grid gap-2">
        <input
          className={fieldClass}
          type="file"
          accept={accept}
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
        <div className="min-h-5 text-xs text-[#667085]">
          {file ? (
            <span className="font-medium text-[#344054]">{file.name}</span>
          ) : currentUrl ? (
            <a
              className="font-medium text-[#0e67a7] hover:underline"
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
            >
              Tệp hiện tại
            </a>
          ) : (
            <span>Chưa có file</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProfileEditModal({
  open,
  kind,
  section,
  employee,
  candidate,
  onClose,
  onSubmit,
}: ProfileEditModalProps) {
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [files, setFiles] = useState<ProfileFiles>(emptyFiles);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wardOptions = useMemo(
    () => getWardOptions(form.provinceId),
    [form.provinceId],
  );

  useEffect(() => {
    if (!open) return;

    if (kind === "candidate" && candidate) {
      const provinceId = getLookupId(candidate.province);
      setForm({
        ...emptyForm,
        name: candidate.fullName ?? "",
        phone: candidate.phone ?? "",
        avatar: candidate.avatar ?? "",
        dateOfBirth: toDateInput(candidate.dateOfBirth),
        gender: candidate.gender ?? "",
        address: candidate.address ?? "",
        provinceId,
        wardId: getLookupId(candidate.ward),
        cvUrl: candidate.cvUrl ?? "",
        maritalStatus: candidate.maritalStatus ?? "",
        nationality: candidate.nationality ?? "",
        religion: candidate.religion ?? "",
        identityCardNumber: candidate.identityCardNumber ?? "",
        identityCardIssueDate: toDateInput(candidate.identityCardIssueDate),
        frontIdentityCardImage: candidate.frontIdentityCardImage ?? "",
        backIdentityCardImage: candidate.backIdentityCardImage ?? "",
        bankAccount: candidate.bankAccount ?? "",
        bankName: getName(candidate.bank),
      });
    } else if (employee) {
      const provinceId = getLookupId(employee.province);
      setForm({
        ...emptyForm,
        name: employee.name,
        phone: employee.phone ?? "",
        avatar: employee.avatar ?? "",
        dateOfBirth: toDateInput(employee.dateOfBirth),
        gender: employee.gender ?? "",
        address: employee.address ?? "",
        provinceId,
        wardId: getLookupId(employee.ward),
        maritalStatus: employee.maritalStatus ?? "",
        nationality: employee.nationality ?? "",
        religion: employee.religion ?? "",
        identityCardNumber: employee.identityCardNumber ?? "",
        identityCardIssueDate: toDateInput(employee.identityCardIssueDate),
        frontIdentityCardImage: employee.frontIdentityCardImage ?? "",
        backIdentityCardImage: employee.backIdentityCardImage ?? "",
        bankAccount: employee.bankAccount ?? "",
        bankName: getName(employee.bank),
      });
    } else {
      setForm(emptyForm);
    }

    setFiles(emptyFiles);
    setError(null);
  }, [candidate, employee, kind, open]);

  const update = (key: keyof ProfileForm, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "provinceId" ? { wardId: "" } : {}),
    }));
  };

  const updateFile = (key: keyof ProfileFiles, file: File | null) => {
    setFiles((current) => ({
      ...current,
      [key]: file,
    }));
  };

  const sectionTitleByKey: Record<ProfileEditSection, string> = {
    basic: "Chinh sua thong tin ca nhan",
    address: "Chinh sua dia chi",
    bank: "Chinh sua thong tin ngan hang",
    additional: "Chinh sua thong tin bo sung va giay to",
  };

  const buildCandidatePayload = (): CandidateProfilePayload => {
    const province = toLookup(findProvince(form.provinceId));
    const ward = toLookup(findWard(form.provinceId, form.wardId));
    const bank = form.bankName.trim()
      ? { id: form.bankName.trim(), name: form.bankName.trim() }
      : null;

    if (section === "basic") {
      return {
        fullName: toNullableString(form.name),
        phone: toNullableString(form.phone),
        avatar: toNullableString(form.avatar),
        dateOfBirth: toNullableDate(form.dateOfBirth),
        gender: form.gender || null,
        cvFile: files.cvFile,
        cvUrl: toNullableString(form.cvUrl),
        address: toNullableString(form.address),
        province,
        ward,
        bankAccount: toNullableString(form.bankAccount),
        bank,
      };
    }

    if (section === "address") {
      return {
        address: toNullableString(form.address),
        province,
        ward,
      };
    }

    if (section === "bank") {
      return {
        bankAccount: toNullableString(form.bankAccount),
        bank,
      };
    }

    return {
      maritalStatus: toNullableString(form.maritalStatus),
      nationality: toNullableString(form.nationality),
      religion: toNullableString(form.religion),
      identityCardNumber: toNullableString(form.identityCardNumber),
      identityCardIssueDate: toNullableDate(form.identityCardIssueDate),
      frontIdentityCardImage: toNullableString(form.frontIdentityCardImage),
      frontIdentityCardImageFile: files.frontIdentityCardImageFile,
      backIdentityCardImage: toNullableString(form.backIdentityCardImage),
      backIdentityCardImageFile: files.backIdentityCardImageFile,
    };
  };

  const buildEmployeePayloads = () => {
    const province = toLookup(findProvince(form.provinceId));
    const ward = toLookup(findWard(form.provinceId, form.wardId));
    const bank = form.bankName.trim()
      ? { id: form.bankName.trim(), name: form.bankName.trim() }
      : null;

    if (section === "basic") {
      return {
        basic: {
          name: form.name.trim(),
          phone: toNullableString(form.phone),
          avatar: toNullableString(form.avatar),
          dateOfBirth: toNullableDate(form.dateOfBirth),
          gender: form.gender || null,
          address: toNullableString(form.address),
          province,
          ward,
          bankAccount: toNullableString(form.bankAccount),
          bank,
        },
      };
    }

    if (section === "address") {
      return {
        basic: {
          address: toNullableString(form.address),
          province,
          ward,
        },
      };
    }

    if (section === "bank") {
      return {
        basic: {
          bankAccount: toNullableString(form.bankAccount),
          bank,
        },
      };
    }

    return {
      basic: undefined,
      additional: {
        maritalStatus: toNullableString(form.maritalStatus),
        nationality: toNullableString(form.nationality),
        religion: toNullableString(form.religion),
        identityCardNumber: toNullableString(form.identityCardNumber),
        identityCardIssueDate: toNullableDate(form.identityCardIssueDate),
        frontIdentityCardImage: toNullableString(form.frontIdentityCardImage),
        frontIdentityCardImageFile: files.frontIdentityCardImageFile,
        backIdentityCardImage: toNullableString(form.backIdentityCardImage),
        backIdentityCardImageFile: files.backIdentityCardImageFile,
      },
    };
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (section === "basic" && !form.name.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }

    setIsSubmitting(true);
    try {
      if (kind === "candidate") {
        await onSubmit(buildCandidatePayload());
      } else {
        const payloads = buildEmployeePayloads();
        await onSubmit(payloads.basic, payloads.additional);
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={sectionTitleByKey[section]}
      onCancel={onClose}
      width={860}
      centered
      styles={{
        body: {
          maxHeight: "calc(100vh - 210px)",
          overflowY: "auto",
          paddingRight: "8px",
        },
      }}
      footer={
        <div className="flex justify-end gap-3 border-t border-[#edf0f5] pt-4">
          <button
            className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            form="profileEditForm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      }
    >
      <form id="profileEditForm" className="grid gap-4" onSubmit={submit}>
        {error ? (
          <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}

        {section === "basic" ? (
          <FormSection title="Thông tin cá nhân">
            <Field label="Họ tên" required>
              <input
                className={fieldClass}
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
              />
            </Field>
            <Field label="Số điện thoại">
              <input
                className={fieldClass}
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </Field>
            <Field label="Ngày sinh">
              <input
                className={fieldClass}
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => update("dateOfBirth", event.target.value)}
              />
            </Field>
            <Field label="Giới tính">
              <select
                className={fieldClass}
                value={form.gender}
                onChange={(event) => update("gender", event.target.value)}
              >
                <option value="">Chưa chọn</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </Field>
            {kind === "candidate" ? (
              <FileField
                label="CV"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                currentUrl={form.cvUrl}
                file={files.cvFile}
                onChange={(file) => updateFile("cvFile", file)}
              />
            ) : null}
            <Field label="Địa chỉ">
              <input
                className={fieldClass}
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
              />
            </Field>
            <Field label="Tỉnh/Thành phố">
              <SearchableSelect
                value={form.provinceId}
                onChange={(value) => update("provinceId", value)}
                options={[
                  { value: "", label: "Chọn tỉnh/thành phố" },
                  ...provinceOptions.map((province) => ({
                    value: province.id,
                    label: province.name,
                  })),
                ]}
              />
            </Field>
            <Field label="Phường/Xã">
              <SearchableSelect
                value={form.wardId}
                onChange={(value) => update("wardId", value)}
                options={[
                  { value: "", label: "Chọn phường/xã" },
                  ...wardOptions.map((wardItem) => ({
                    value: wardItem.id,
                    label: wardItem.name,
                  })),
                ]}
              />
            </Field>
            <Field label="Số tài khoản">
              <input
                className={fieldClass}
                value={form.bankAccount}
                onChange={(event) => update("bankAccount", event.target.value)}
              />
            </Field>
            <Field label="Ngân hàng">
              <input
                className={fieldClass}
                value={form.bankName}
                onChange={(event) => update("bankName", event.target.value)}
              />
            </Field>
          </FormSection>
        ) : null}

        {section === "address" ? (
          <FormSection title="Địa chỉ">
            <Field label="Địa chỉ">
              <input
                className={fieldClass}
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
              />
            </Field>
            <Field label="Tỉnh/Thành phố">
              <SearchableSelect
                value={form.provinceId}
                onChange={(value) => update("provinceId", value)}
                options={[
                  { value: "", label: "Chọn tỉnh/thành phố" },
                  ...provinceOptions.map((province) => ({
                    value: province.id,
                    label: province.name,
                  })),
                ]}
              />
            </Field>
            <Field label="Phường/Xã">
              <SearchableSelect
                value={form.wardId}
                onChange={(value) => update("wardId", value)}
                options={[
                  { value: "", label: "Chọn phường/xã" },
                  ...wardOptions.map((wardItem) => ({
                    value: wardItem.id,
                    label: wardItem.name,
                  })),
                ]}
              />
            </Field>
          </FormSection>
        ) : null}

        {section === "bank" ? (
          <FormSection title="Ngân hàng">
            <Field label="Số tài khoản">
              <input
                className={fieldClass}
                value={form.bankAccount}
                onChange={(event) => update("bankAccount", event.target.value)}
              />
            </Field>
            <Field label="Ngân hàng">
              <input
                className={fieldClass}
                value={form.bankName}
                onChange={(event) => update("bankName", event.target.value)}
              />
            </Field>
          </FormSection>
        ) : null}

        {section === "additional" ? (
          <FormSection title="Thông tin bổ sung và giấy tờ">
            <Field label="Tình trạng hôn nhân">
            <input
              className={fieldClass}
              value={form.maritalStatus}
              onChange={(event) => update("maritalStatus", event.target.value)}
            />
          </Field>
          <Field label="Quốc tịch">
            <input
              className={fieldClass}
              value={form.nationality}
              onChange={(event) => update("nationality", event.target.value)}
            />
          </Field>
          <Field label="Tôn giáo">
            <input
              className={fieldClass}
              value={form.religion}
              onChange={(event) => update("religion", event.target.value)}
            />
          </Field>
          <Field label="Số CCCD/CMND">
            <input
              className={fieldClass}
              value={form.identityCardNumber}
              onChange={(event) =>
                update("identityCardNumber", event.target.value)
              }
            />
          </Field>
          <Field label="Ngày cấp CCCD/CMND">
            <input
              className={fieldClass}
              type="date"
              value={form.identityCardIssueDate}
              onChange={(event) =>
                update("identityCardIssueDate", event.target.value)
              }
            />
          </Field>
          <FileField
            label="Ảnh mặt trước CCCD"
            accept="image/jpeg,image/png,image/webp"
            currentUrl={form.frontIdentityCardImage}
            file={files.frontIdentityCardImageFile}
            onChange={(file) => updateFile("frontIdentityCardImageFile", file)}
          />
          <FileField
            label="Ảnh mặt sau CCCD"
            accept="image/jpeg,image/png,image/webp"
            currentUrl={form.backIdentityCardImage}
            file={files.backIdentityCardImageFile}
            onChange={(file) => updateFile("backIdentityCardImageFile", file)}
          />
          </FormSection>
        ) : null}
      </form>
    </Modal>
  );
}
