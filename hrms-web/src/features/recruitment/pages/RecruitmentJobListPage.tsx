import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Modal, Pagination, DatePicker } from "antd";
import dayjs from "dayjs";
import {
  BriefcaseBusiness,
  Edit2,
  Eye,
  Plus,
  RefreshCcw,
  Search,
} from "lucide-react";
import { AppLayout } from "../../../app/layouts";
import { useAuth } from "../../auth/services/useAuth";
import { SearchableSelect } from "../../../shared/ui/SearchableSelect";
import { employeeService } from "../../employees/services/employeeService";
import type { EmployeeOption } from "../../employees/types/employee.types";
import { recruitmentService } from "../services/recruitmentService";
import type {
  ApplyJobPayload,
  RecruitmentJob,
  RecruitmentJobListData,
  RecruitmentJobPayload,
  RecruitmentJobStatus,
} from "../types/recruitment.types";
import {
  DetailCard,
  fieldClass,
  formatDate,
  getErrorMessage,
  InfoRow,
  JobStatusBadge,
  labelClass,
  salaryText,
  toDateInput,
} from "../components/recruitmentUi";

const initialData: RecruitmentJobListData = {
  items: [],
  meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
};

const emptyJobForm = {
  title: "",
  positionId: "",
  departmentId: "",
  description: "",
  requirements: "",
  benefits: "",
  salaryMin: "",
  salaryMax: "",
  quantity: "1",
  deadline: "",
  status: "OPEN" as RecruitmentJobStatus,
};

const emptyApplyForm = {
  fullName: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  coverLetter: "",
  notes: "",
};

function hasPermission(permissions: string[] | undefined, key: string) {
  return permissions?.includes(key) ?? false;
}

function canManageJobs(user: ReturnType<typeof useAuth>["user"]) {
  return (
    user?.role === "ADMIN" ||
    hasPermission(user?.permissions, "RECRUITMENT_MANAGE_JOB")
  );
}

function JobFormModal({
  open,
  job,
  departments,
  positions,
  onClose,
  onSubmit,
}: {
  open: boolean;
  job: RecruitmentJob | null;
  departments: EmployeeOption[];
  positions: EmployeeOption[];
  onClose: () => void;
  onSubmit: (payload: RecruitmentJobPayload) => Promise<void>;
}) {
  const [form, setForm] = useState(emptyJobForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        title: job?.title ?? "",
        positionId: job?.positionId ?? job?.position?.id ?? "",
        departmentId: job?.departmentId ?? job?.department?.id ?? "",
        description: job?.description ?? "",
        requirements: job?.requirements ?? "",
        benefits: job?.benefits ?? "",
        salaryMin: job?.salaryMin != null ? String(job.salaryMin) : "",
        salaryMax: job?.salaryMax != null ? String(job.salaryMax) : "",
        quantity: job?.quantity != null ? String(job.quantity) : "1",
        deadline: toDateInput(job?.deadline),
        status: job?.status ?? "OPEN",
      });
      setError(null);
    }
  }, [job, open]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const salaryMin = Number(form.salaryMin);
    const salaryMax = Number(form.salaryMax);
    const quantity = Number(form.quantity);

    if (
      !form.title.trim() ||
      !form.positionId ||
      !form.departmentId ||
      form.description.trim().length < 10 ||
      form.requirements.trim().length < 10 ||
      form.benefits.trim().length < 3 ||
      !form.deadline ||
      Number.isNaN(salaryMin) ||
      Number.isNaN(salaryMax) ||
      Number.isNaN(quantity)
    ) {
      setError("Vui lòng nhập đủ thông tin tuyển dụng hợp lệ.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: form.title.trim(),
        positionId: form.positionId,
        departmentId: form.departmentId,
        description: form.description.trim(),
        requirements: form.requirements.trim(),
        benefits: form.benefits.trim(),
        salaryMin,
        salaryMax,
        quantity,
        deadline: form.deadline,
        status: form.status,
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể lưu tin tuyển dụng"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={job ? "Chỉnh sửa vị trí tuyển dụng" : "Thêm vị trí tuyển dụng"}
      onCancel={onClose}
      width={820}
      centered
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '8px' } }}
      footer={
        <div className="flex justify-end gap-3 pt-4 border-t border-[#edf0f5]">
          <button
            className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] hover:bg-[#f9fafb]"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! hover:bg-[#0055a8] disabled:opacity-60"
            type="submit"
            form="jobForm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      }
    >
      <form id="jobForm" onSubmit={handleSubmit}>
        {error ? (
          <div className="mb-4 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
          <label className="col-span-2 max-[720px]:col-span-1">
            <span className={labelClass}>Tiêu đề</span>
            <input
              className={fieldClass}
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>Chức vụ</span>
            <SearchableSelect
              value={form.positionId}
              onChange={(value) => update("positionId", value)}
              options={[
                { value: "", label: "Chọn chức vụ" },
                ...positions.map((position) => ({ value: position.id, label: position.name }))
              ]}
            />
          </label>
          <label>
            <span className={labelClass}>Bộ phận</span>
            <SearchableSelect
              value={form.departmentId}
              onChange={(value) => update("departmentId", value)}
              options={[
                { value: "", label: "Chọn bộ phận" },
                ...departments.map((department) => ({ value: department.id, label: department.name }))
              ]}
            />
          </label>
          <label>
            <span className={labelClass}>Lương tối thiểu</span>
            <input
              className={fieldClass}
              type="number"
              min={0}
              value={form.salaryMin}
              onChange={(event) => update("salaryMin", event.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>Lương tối đa</span>
            <input
              className={fieldClass}
              type="number"
              min={0}
              value={form.salaryMax}
              onChange={(event) => update("salaryMax", event.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>Số lượng</span>
            <input
              className={fieldClass}
              type="number"
              min={1}
              value={form.quantity}
              onChange={(event) => update("quantity", event.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>Hạn nộp</span>
            <DatePicker
              className={`${fieldClass} !py-2 w-full`}
              format="DD/MM/YYYY"
              value={form.deadline ? dayjs(form.deadline) : null}
              onChange={(date) => update("deadline", date ? date.format("YYYY-MM-DD") : "")}
            />
          </label>
          {(["description", "requirements", "benefits"] as const).map((key) => (
            <label className="col-span-2 max-[720px]:col-span-1" key={key}>
              <span className={labelClass}>
                {key === "description"
                  ? "Mô tả công việc"
                  : key === "requirements"
                    ? "Yêu cầu ứng viên"
                    : "Quyền lợi"}
              </span>
              <textarea
                className={`${fieldClass} min-h-24 resize-y`}
                value={form[key]}
                onChange={(event) => update(key, event.target.value)}
              />
            </label>
          ))}
        </div>
      </form>
    </Modal>
  );
}

function ApplyJobModal({
  open,
  job,
  onClose,
  onSubmit,
}: {
  open: boolean;
  job: RecruitmentJob | null;
  onClose: () => void;
  onSubmit: (payload: ApplyJobPayload) => Promise<void>;
}) {
  const [form, setForm] = useState(emptyApplyForm);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(emptyApplyForm);
      setCvFile(null);
      setError(null);
    }
  }, [open]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!job) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        recruitmentJobId: job.id,
        fullName: form.fullName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: (form.gender || undefined) as ApplyJobPayload["gender"],
        address: form.address.trim() || undefined,
        cvFile: cvFile || undefined,
        coverLetter: form.coverLetter.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể ứng tuyển"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={job ? `Ứng tuyển: ${job.title}` : "Ứng tuyển"}
      onCancel={onClose}
      width={680}
      centered
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '8px' } }}
      footer={
        <div className="flex justify-end gap-3 pt-4 border-t border-[#edf0f5]">
          <button
            className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] hover:bg-[#f9fafb]"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! hover:bg-[#0055a8] disabled:opacity-60"
            type="submit"
            form="applyForm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang gửi..." : "Ứng tuyển"}
          </button>
        </div>
      }
    >
      <form id="applyForm" onSubmit={handleSubmit}>
        {error ? (
          <div className="mb-4 rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          <label>
            <span className={labelClass}>Họ tên</span>
            <input
              className={fieldClass}
              value={form.fullName}
              onChange={(event) => update("fullName", event.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>Số điện thoại</span>
            <input
              className={fieldClass}
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </label>
          <label>
            <span className={labelClass}>Ngày sinh</span>
            <DatePicker
              className={`${fieldClass} !py-2 w-full`}
              format="DD/MM/YYYY"
              value={form.dateOfBirth ? dayjs(form.dateOfBirth) : null}
              onChange={(date) => update("dateOfBirth", date ? date.format("YYYY-MM-DD") : "")}
            />
          </label>
          <label>
            <span className={labelClass}>Giới tính</span>
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
          </label>
          <label className="col-span-2 max-[640px]:col-span-1">
            <span className={labelClass}>Địa chỉ</span>
            <input
              className={fieldClass}
              value={form.address}
              onChange={(event) => update("address", event.target.value)}
            />
          </label>
          <label className="col-span-2 max-[640px]:col-span-1">
            <span className={labelClass}>File CV</span>
            <input
              className={fieldClass}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) =>
                setCvFile(event.target.files?.item(0) ?? null)
              }
            />
            {cvFile ? (
              <span className="mt-1 block truncate text-xs text-[#667085]">
                {cvFile.name}
              </span>
            ) : null}
          </label>
          <label className="col-span-2 max-[640px]:col-span-1">
            <span className={labelClass}>Cover letter</span>
            <textarea
              className={`${fieldClass} min-h-24 resize-y`}
              value={form.coverLetter}
              onChange={(event) => update("coverLetter", event.target.value)}
            />
          </label>
          <label className="col-span-2 max-[640px]:col-span-1">
            <span className={labelClass}>Ghi chú</span>
            <textarea
              className={`${fieldClass} min-h-20 resize-y`}
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}

function JobDetailModal({
  open,
  job,
  isCandidate,
  canManage,
  onClose,
  onEdit,
  onCloseJob,
  onReopenJob,
  onApply,
}: {
  open: boolean;
  job: RecruitmentJob | null;
  isCandidate: boolean;
  canManage: boolean;
  onClose: () => void;
  onEdit: (job: RecruitmentJob) => void;
  onCloseJob: (job: RecruitmentJob) => void;
  onReopenJob: (job: RecruitmentJob) => void;
  onApply: (job: RecruitmentJob) => void;
}) {
  return (
    <Modal
      open={open}
      title="Chi tiết tuyển dụng"
      width={820}
      onCancel={onClose}
      centered
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '8px' } }}
      footer={job ? (
        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#edf0f5]">
          {canManage && job.status === "OPEN" ? (
            <>
              <button
                className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] hover:bg-[#f9fafb]"
                type="button"
                onClick={() => onEdit(job)}
              >
                Chỉnh sửa
              </button>
              <button
                className="rounded-lg border border-[#fecdca] px-4 py-2 text-sm font-medium text-[#b42318] hover:bg-[#fffbfa]"
                type="button"
                onClick={() => onCloseJob(job)}
              >
                Đóng tin
              </button>
            </>
          ) : null}
          {canManage && job.status === "CLOSED" ? (
            <button
              className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! hover:bg-[#0055a8]"
              type="button"
              onClick={() => onReopenJob(job)}
            >
              Mở lại
            </button>
          ) : null}
          {isCandidate && job.status === "OPEN" ? (
            <button
              className="rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! hover:bg-[#0055a8] disabled:opacity-60"
              type="button"
              disabled={job.applied}
              onClick={() => onApply(job)}
            >
              {job.applied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
            </button>
          ) : null}
        </div>
      ) : null}
    >
      {job ? (
        <div className="grid gap-4">
          <div className="rounded-lg border border-[#edf0f5] bg-[#fbfcff] p-4">
            <div className="mb-3">
              <JobStatusBadge status={job.status} />
            </div>
            <h2 className="text-xl font-bold text-[#243247]">{job.title}</h2>
            <p className="mt-1 text-sm text-[#667085]">
              {job.position?.name ?? "-"} | {job.department?.name ?? "-"}
            </p>
          </div>
          <DetailCard title="Thông tin tuyển dụng">
            <InfoRow label="Chức vụ" value={job.position?.name ?? "-"} />
            <InfoRow label="Bộ phận" value={job.department?.name ?? "-"} />
            <InfoRow label="Số lượng" value={job.quantity} />
            <InfoRow label="Mức lương" value={salaryText(job)} />
            <InfoRow label="Hạn nộp" value={formatDate(job.deadline)} />
          </DetailCard>
          <DetailCard title="Mô tả công việc">
            <p className="whitespace-pre-wrap text-sm leading-6 text-[#344054]">
              {job.description}
            </p>
          </DetailCard>
          <DetailCard title="Yêu cầu ứng viên">
            <p className="whitespace-pre-wrap text-sm leading-6 text-[#344054]">
              {job.requirements}
            </p>
          </DetailCard>
          <DetailCard title="Quyền lợi">
            <p className="whitespace-pre-wrap text-sm leading-6 text-[#344054]">
              {job.benefits}
            </p>
          </DetailCard>
        </div>
      ) : (
        <div className="py-10 text-center text-[#667085]">Không có dữ liệu</div>
      )}
    </Modal>
  );
}

export function RecruitmentJobListPage() {
  const { user } = useAuth();
  const isCandidate = user?.role === "CANDIDATE";
  const manageJobs = canManageJobs(user);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jobs, setJobs] = useState<RecruitmentJob[]>([]);
  const [meta, setMeta] = useState(initialData.meta);
  const [departments, setDepartments] = useState<EmployeeOption[]>([]);
  const [positions, setPositions] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<RecruitmentJob | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  const rowOffset = useMemo(
    () => (currentPage - 1) * pageSize,
    [currentPage, pageSize],
  );

  const loadJobs = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await recruitmentService.getJobs({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        departmentId,
        positionId,
      });
      setJobs(result.items ?? []);
      setMeta(result.meta ?? initialData.meta);
    } catch (error) {
      setJobs([]);
      setMeta(initialData.meta);
      setErrorMessage(
        getErrorMessage(error, "Không tải được danh sách tuyển dụng"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs();
  }, [currentPage, departmentId, pageSize, positionId, searchTerm]);

  useEffect(() => {
    Promise.allSettled([
      employeeService.getDepartments(),
      employeeService.getPositions(),
    ]).then(([departmentResult, positionResult]) => {
      if (departmentResult.status === "fulfilled") {
        setDepartments(departmentResult.value);
      }
      if (positionResult.status === "fulfilled") {
        setPositions(positionResult.value);
      }
    });
  }, []);

  const openDetail = async (job: RecruitmentJob) => {
    setSelectedJob(job);
    setDetailOpen(true);
    try {
      setSelectedJob(await recruitmentService.getJobById(job.id));
    } catch {
      setSelectedJob(job);
    }
  };

  const handleJobSubmit = async (payload: RecruitmentJobPayload) => {
    if (selectedJob) {
      await recruitmentService.updateJob(selectedJob.id, payload);
    } else {
      await recruitmentService.createJob(payload);
    }
    setJobFormOpen(false);
    setSelectedJob(null);
    await loadJobs();
  };

  const handleApply = async (payload: ApplyJobPayload) => {
    await recruitmentService.applyJob(payload);
    setApplyOpen(false);
    setDetailOpen(false);
    await loadJobs();
  };

  return (
    <AppLayout>
      <main className="h-full min-w-0 overflow-hidden">
        <div className="flex h-full min-w-0 flex-col gap-5 px-5 py-5 max-[640px]:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#243247]">
                Vị trí tuyển dụng
              </h1>
            </div>
            {manageJobs ? (
              <button
                className="flex shrink-0 items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-white! hover:bg-[#0055a8] [&_*]:!text-white"
                type="button"
                onClick={() => {
                  setSelectedJob(null);
                  setJobFormOpen(true);
                }}
              >
                <Plus className="h-5 w-5" />
                Thêm tin
              </button>
            ) : null}
          </div>

          <div className="flex gap-3 overflow-x-auto rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(16,24,40,0.06)] border border-[#d0d5dd] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d0d5dd]">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#667085]" />
              <input
                className="w-full rounded-xl border border-[#d0d5dd] bg-white py-2.5 pl-10 pr-4 text-sm text-[#344054] shadow-sm transition-all placeholder-[#98a2b3] focus:border-[#006fd5] focus:outline-none focus:ring-4 focus:ring-[#006fd5]/10 hover:border-[#98a2b3]"
                value={searchTerm}
                placeholder="Tìm kiếm vị trí tuyển dụng..."
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <SearchableSelect
              className="min-w-[170px] flex-1 [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!py-1.5 [&_.ant-select-selector]:!shadow-sm [&_.ant-select-selector]:!border-[#d0d5dd] hover:[&_.ant-select-selector]:!border-[#98a2b3]"
              value={departmentId}
              onChange={(value) => {
                setDepartmentId(value);
                setCurrentPage(1);
              }}
              options={[
                { value: "", label: "Tất cả bộ phận" },
                ...departments.map((department) => ({ value: department.id, label: department.name }))
              ]}
            />
            <SearchableSelect
              className="min-w-[170px] flex-1 [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!py-1.5 [&_.ant-select-selector]:!shadow-sm [&_.ant-select-selector]:!border-[#d0d5dd] hover:[&_.ant-select-selector]:!border-[#98a2b3]"
              value={positionId}
              onChange={(value) => {
                setPositionId(value);
                setCurrentPage(1);
              }}
              options={[
                { value: "", label: "Tất cả chức vụ" },
                ...positions.map((position) => ({ value: position.id, label: position.name }))
              ]}
            />
            <button
              className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-[#d0d5dd] bg-white text-[#667085] shadow-sm transition-all hover:bg-[#f9fafb] hover:text-[#344054] active:scale-95"
              type="button"
              title="Tải lại"
              onClick={() => void loadJobs()}
            >
              <RefreshCcw className="h-4.5 w-4.5" />
            </button>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
              {errorMessage}
            </div>
          ) : null}

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#d0d5dd] bg-white shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-16 text-[#667085]">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#006fd5] border-r-transparent"></div>
                  <p className="text-sm font-medium">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex h-full items-center justify-center py-16 text-[#667085]">
                <div className="flex flex-col items-center gap-3 opacity-60">
                  <BriefcaseBusiness className="h-12 w-12 text-[#98a2b3]" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-[#667085]">Chưa có vị trí tuyển dụng</p>
                </div>
              </div>
            ) : (
              <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-[#d0d5dd] bg-[#f9fafb]/90 backdrop-blur-md">
                      <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        Vị trí
                      </th>
                      <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        Bộ phận
                      </th>
                      <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        Số lượng & Lương
                      </th>
                      <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        Hạn nộp
                      </th>
                      <th className="px-5 py-3.5 text-left text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-5 py-3.5 text-center text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d0d5dd]">
                    {jobs.map((job, index) => (
                      <tr
                        className="group transition-colors hover:bg-[#f8faff]"
                        key={job.id}
                      >
                        <td className="px-5 py-4 text-sm text-[#667085]">
                          {rowOffset + index + 1}
                        </td>
                        <td className="px-5 py-4">
                          <strong className="block max-w-[280px] truncate text-sm font-semibold text-[#243247] group-hover:text-[#006fd5] transition-colors">
                            {job.title}
                          </strong>
                          <span className="line-clamp-1 text-xs text-[#667085] mt-0.5">
                            {job.position?.name ?? "-"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#344054]">
                          {job.department?.name ?? "-"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex w-fit rounded-md bg-[#f2f4f7] px-2 py-1 text-xs font-medium text-[#344054]">
                              SL: {job.quantity}
                            </span>
                            <span className="text-sm text-[#344054]">
                              {salaryText(job)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#344054]">
                          {formatDate(job.deadline)}
                        </td>
                        <td className="px-5 py-4">
                          <JobStatusBadge status={job.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-[#006fd5] transition-all hover:bg-[#006fd5] hover:text-white hover:shadow-md hover:shadow-blue-500/20 active:scale-95"
                              type="button"
                              title="Xem chi tiết"
                              onClick={() => void openDetail(job)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {manageJobs && job.status === "OPEN" ? (
                              <button
                                className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white hover:shadow-md hover:shadow-emerald-500/20 active:scale-95"
                                type="button"
                                title="Sửa"
                                onClick={() => {
                                  setSelectedJob(job);
                                  setJobFormOpen(true);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#d0d5dd] bg-[#fcfcfd] px-5 py-3.5 max-[720px]:flex-col max-[720px]:items-stretch">
              <span className="text-sm text-[#667085]">
                Hiển thị {jobs.length === 0 ? 0 : rowOffset + 1}-
                {Math.min(rowOffset + jobs.length, meta.total)} / {meta.total} tin
              </span>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={meta.total}
                showSizeChanger
                pageSizeOptions={[10, 20, 50]}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
              />
            </div>
          </section>
        </div>
      </main>

      <JobDetailModal
        open={detailOpen}
        job={selectedJob}
        isCandidate={isCandidate}
        canManage={manageJobs}
        onClose={() => setDetailOpen(false)}
        onEdit={(job) => {
          setSelectedJob(job);
          setDetailOpen(false);
          setJobFormOpen(true);
        }}
        onCloseJob={(job) => {
          void recruitmentService.closeJob(job.id).then(loadJobs);
          setDetailOpen(false);
        }}
        onReopenJob={(job) => {
          void recruitmentService.reopenJob(job.id).then(loadJobs);
          setDetailOpen(false);
        }}
        onApply={(job) => {
          setSelectedJob(job);
          setApplyOpen(true);
        }}
      />
      <JobFormModal
        open={jobFormOpen}
        job={selectedJob}
        departments={departments}
        positions={positions}
        onClose={() => setJobFormOpen(false)}
        onSubmit={handleJobSubmit}
      />
      <ApplyJobModal
        open={applyOpen}
        job={selectedJob}
        onClose={() => setApplyOpen(false)}
        onSubmit={handleApply}
      />
    </AppLayout>
  );
}
