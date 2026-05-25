import { Modal, Spin, Tag } from "antd";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { employeeService } from "../services/employeeService";
import type { EmployeeImportPreview, EmployeeImportPreviewRow } from "../types/employee.types";

type EmployeeImportModalProps = {
  open: boolean;
  onClose: () => void;
  onImported: (createdCount: number) => Promise<void> | void;
};

const fieldClass =
  "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors focus:border-[#006fd5] focus:ring-2 focus:ring-[#006fd5]/10";

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

function issueText(row: EmployeeImportPreviewRow) {
  return [...row.errors, ...row.warnings]
    .map((issue) => `${issue.field}: ${issue.message}`)
    .join("; ");
}

function formatMoney(value?: number | null) {
  if (value == null) return "-";
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function EmployeeImportModal({
  open,
  onClose,
  onImported,
}: EmployeeImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<EmployeeImportPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview(null);
      setError(null);
      setLoadingPreview(false);
      setConfirming(false);
    }
  }, [open]);

  const canConfirm = Boolean(preview && preview.errorRows === 0 && preview.totalRows > 0);
  const summaryTone = useMemo(() => {
    if (!preview) return null;
    return preview.errorRows > 0
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }, [preview]);

  const handlePreview = async () => {
    if (!file) {
      setError("Vui lòng chọn file Excel trước khi preview.");
      return;
    }

    setLoadingPreview(true);
    setError(null);
    try {
      setPreview(await employeeService.previewImport(file));
    } catch (previewError) {
      setPreview(null);
      setError(getErrorMessage(previewError, "Không thể preview file import."));
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;

    setConfirming(true);
    setError(null);
    try {
      const result = await employeeService.confirmImport(preview.id);
      await onImported(result.createdCount);
      onClose();
    } catch (confirmError) {
      setError(getErrorMessage(confirmError, "Không thể xác nhận import."));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Import nhân viên bằng Excel"
      onCancel={onClose}
      width={1100}
      centered
      footer={
        <div className="flex flex-wrap justify-between gap-3 border-t border-[#edf0f5] pt-4">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-semibold text-[#344054] transition-colors hover:bg-[#f9fafb]"
            type="button"
            onClick={() => void employeeService.downloadImportTemplate()}
          >
            <Download className="h-4 w-4" />
            Tải template
          </button>
          <div className="flex flex-wrap justify-end gap-3">
            <button
              className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
              type="button"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-[#c7dcf2] bg-white px-4 py-2 text-sm font-semibold text-[#006fd5] transition-colors hover:bg-[#f2f8ff] disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={!file || loadingPreview || confirming}
              onClick={() => void handlePreview()}
            >
              <Upload className="h-4 w-4" />
              {loadingPreview ? "Đang preview..." : "Preview"}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-[#006fd5] px-4 py-2 text-sm font-semibold text-white! transition-colors hover:bg-[#0055a8] disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={!canConfirm || confirming || loadingPreview}
              onClick={() => void handleConfirm()}
            >
              <CheckCircle2 className="h-4 w-4" />
              {confirming ? "Đang import..." : "Xác nhận import"}
            </button>
          </div>
        </div>
      }
      styles={{
        body: {
          maxHeight: "calc(100vh - 220px)",
          overflowY: "auto",
          paddingRight: "8px",
        },
      }}
    >
      <div className="grid gap-4">
        {error ? (
          <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}

        <div className="rounded-xl border border-[#d0d5dd] bg-white p-4">
          <label>
            <span className="mb-1.5 block text-sm font-medium text-[#344054]">
              File Excel
            </span>
            <input
              className={fieldClass}
              type="file"
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setPreview(null);
                setError(null);
              }}
            />
          </label>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#667085]">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Hỗ trợ tối đa 500 dòng. Preview không hiển thị mật khẩu.</span>
          </div>
        </div>

        {preview ? (
          <div className={`rounded-lg border px-4 py-3 text-sm ${summaryTone}`}>
            Tổng {preview.totalRows} dòng, {preview.errorRows} dòng lỗi,{" "}
            {preview.warningRows} dòng cảnh báo.
          </div>
        ) : null}

        <Spin spinning={loadingPreview || confirming}>
          {preview ? (
            <div className="overflow-auto rounded-xl border border-[#d0d5dd] bg-white">
              <table className="w-full min-w-[1050px] text-sm">
                <thead className="bg-[#f8fafc] text-xs font-bold uppercase tracking-wider text-[#667085]">
                  <tr>
                    <th className="px-4 py-3 text-left">Dòng</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-left">Họ tên</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Phòng ban</th>
                    <th className="px-4 py-3 text-left">Chức vụ</th>
                    <th className="px-4 py-3 text-left">Ngày vào làm</th>
                    <th className="px-4 py-3 text-right">Lương</th>
                    <th className="px-4 py-3 text-left">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f5]">
                  {preview.rows.map((row) => {
                    const normalized = row.normalized;
                    const hasError = row.errors.length > 0;
                    const hasWarning = row.warnings.length > 0;

                    return (
                      <tr key={row.id} className={hasError ? "bg-rose-50/40" : ""}>
                        <td className="px-4 py-3 font-semibold text-[#344054]">
                          {row.rowNumber}
                        </td>
                        <td className="px-4 py-3">
                          {hasError ? (
                            <Tag color="red">Lỗi</Tag>
                          ) : hasWarning ? (
                            <Tag color="gold">Cảnh báo</Tag>
                          ) : (
                            <Tag color="green">Hợp lệ</Tag>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#243247]">
                          {normalized?.name ?? String(row.values.name ?? "-")}
                        </td>
                        <td className="px-4 py-3 text-[#475467]">
                          {normalized?.email ?? String(row.values.email ?? "-")}
                        </td>
                        <td className="px-4 py-3 text-[#475467]">
                          {normalized
                            ? `${normalized.departmentCode} - ${normalized.departmentName}`
                            : String(row.values.departmentCode ?? "-")}
                        </td>
                        <td className="px-4 py-3 text-[#475467]">
                          {normalized
                            ? `${normalized.positionCode} - ${normalized.positionName}`
                            : String(row.values.positionCode ?? "-")}
                        </td>
                        <td className="px-4 py-3 text-[#475467]">
                          {normalized?.hireDate ?? String(row.values.hireDate ?? "-")}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-[#243247]">
                          {formatMoney(normalized?.salary)}
                        </td>
                        <td className="max-w-[280px] px-4 py-3 text-[#667085]">
                          {hasError || hasWarning ? (
                            <span className="inline-flex items-start gap-1.5">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                              <span>{issueText(row)}</span>
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </Spin>
      </div>
    </Modal>
  );
}
