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
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
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

    setError(null);
  }, [candidate, employee, kind, open]);

  const update = (key: keyof ProfileForm, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "provinceId" ? { wardId: "" } : {}),
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
      backIdentityCardImage: toNullableString(form.backIdentityCardImage),
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
        backIdentityCardImage: toNullableString(form.backIdentityCardImage),
      },
    };
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (section === "basic" && !form.name.trim()) {
      setError("Vui long nhap ho ten");
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
            Huy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            form="profileEditForm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Dang luu..." : "Luu thay doi"}
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
          <FormSection title="Thong tin ca nhan">
            <Field label="Ho ten">
              <input
                className={fieldClass}
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
              />
            </Field>
            <Field label="So dien thoai">
              <input
                className={fieldClass}
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </Field>
            <Field label="Avatar URL">
              <input
                className={fieldClass}
                value={form.avatar}
                onChange={(event) => update("avatar", event.target.value)}
              />
            </Field>
            <Field label="Ngay sinh">
              <input
                className={fieldClass}
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => update("dateOfBirth", event.target.value)}
              />
            </Field>
            <Field label="Gioi tinh">
              <select
                className={fieldClass}
                value={form.gender}
                onChange={(event) => update("gender", event.target.value)}
              >
                <option value="">Chua chon</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nu</option>
                <option value="OTHER">Khac</option>
              </select>
            </Field>
            {kind === "candidate" ? (
              <Field label="CV URL">
                <input
                  className={fieldClass}
                  value={form.cvUrl}
                  onChange={(event) => update("cvUrl", event.target.value)}
                />
              </Field>
            ) : null}
            <Field label="Dia chi">
              <input
                className={fieldClass}
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
              />
            </Field>
            <Field label="Tinh/Thanh">
              <SearchableSelect
                value={form.provinceId}
                onChange={(value) => update("provinceId", value)}
                options={[
                  { value: "", label: "Chon tinh/thanh" },
                  ...provinceOptions.map((province) => ({
                    value: province.id,
                    label: province.name,
                  })),
                ]}
              />
            </Field>
            <Field label="Phuong/Xa">
              <SearchableSelect
                value={form.wardId}
                onChange={(value) => update("wardId", value)}
                options={[
                  { value: "", label: "Chon phuong/xa" },
                  ...wardOptions.map((wardItem) => ({
                    value: wardItem.id,
                    label: wardItem.name,
                  })),
                ]}
              />
            </Field>
            <Field label="So tai khoan">
              <input
                className={fieldClass}
                value={form.bankAccount}
                onChange={(event) => update("bankAccount", event.target.value)}
              />
            </Field>
            <Field label="Ngan hang">
              <input
                className={fieldClass}
                value={form.bankName}
                onChange={(event) => update("bankName", event.target.value)}
              />
            </Field>
          </FormSection>
        ) : null}

        {section === "address" ? (
          <FormSection title="Dia chi">
            <Field label="Dia chi">
              <input
                className={fieldClass}
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
              />
            </Field>
            <Field label="Tinh/Thanh">
              <SearchableSelect
                value={form.provinceId}
                onChange={(value) => update("provinceId", value)}
                options={[
                  { value: "", label: "Chon tinh/thanh" },
                  ...provinceOptions.map((province) => ({
                    value: province.id,
                    label: province.name,
                  })),
                ]}
              />
            </Field>
            <Field label="Phuong/Xa">
              <SearchableSelect
                value={form.wardId}
                onChange={(value) => update("wardId", value)}
                options={[
                  { value: "", label: "Chon phuong/xa" },
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
          <FormSection title="Ngan hang">
            <Field label="So tai khoan">
              <input
                className={fieldClass}
                value={form.bankAccount}
                onChange={(event) => update("bankAccount", event.target.value)}
              />
            </Field>
            <Field label="Ngan hang">
              <input
                className={fieldClass}
                value={form.bankName}
                onChange={(event) => update("bankName", event.target.value)}
              />
            </Field>
          </FormSection>
        ) : null}

        {section === "additional" ? (
          <FormSection title="Thong tin bo sung va giay to">
            <Field label="Tinh trang hon nhan">
            <input
              className={fieldClass}
              value={form.maritalStatus}
              onChange={(event) => update("maritalStatus", event.target.value)}
            />
          </Field>
          <Field label="Quoc tich">
            <input
              className={fieldClass}
              value={form.nationality}
              onChange={(event) => update("nationality", event.target.value)}
            />
          </Field>
          <Field label="Ton giao">
            <input
              className={fieldClass}
              value={form.religion}
              onChange={(event) => update("religion", event.target.value)}
            />
          </Field>
          <Field label="So CCCD/CMND">
            <input
              className={fieldClass}
              value={form.identityCardNumber}
              onChange={(event) =>
                update("identityCardNumber", event.target.value)
              }
            />
          </Field>
          <Field label="Ngay cap CCCD/CMND">
            <input
              className={fieldClass}
              type="date"
              value={form.identityCardIssueDate}
              onChange={(event) =>
                update("identityCardIssueDate", event.target.value)
              }
            />
          </Field>
          <Field label="Anh mat truoc CCCD">
            <input
              className={fieldClass}
              value={form.frontIdentityCardImage}
              onChange={(event) =>
                update("frontIdentityCardImage", event.target.value)
              }
            />
          </Field>
          <Field label="Anh mat sau CCCD">
            <input
              className={fieldClass}
              value={form.backIdentityCardImage}
              onChange={(event) =>
                update("backIdentityCardImage", event.target.value)
              }
            />
            </Field>
          </FormSection>
        ) : null}
      </form>
    </Modal>
  );
}
