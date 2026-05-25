import bcrypt from "bcrypt";
import * as XLSX from "xlsx";
import {
  EmployeeImportStatus,
  EmployeeStatus,
  Prisma,
  UserRole,
} from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { generateEmployeeId } from "./employee.service";

const REQUIRED_HEADERS = [
  "name",
  "email",
  "password",
  "departmentCode",
  "positionCode",
  "hireDate",
  "salary",
] as const;

const OPTIONAL_HEADERS = [
  "phone",
  "dateOfBirth",
  "gender",
  "address",
  "bankAccount",
  "status",
] as const;

const KNOWN_HEADERS = new Set<string>([...REQUIRED_HEADERS, ...OPTIONAL_HEADERS]);
const MAX_IMPORT_ROWS = 500;
const BATCH_TTL_HOURS = 24;

type ImportError = {
  field: string;
  message: string;
};

type NormalizedEmployeeImportRow = {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  bankAccount?: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  positionId: string;
  positionCode: string;
  positionName: string;
  hireDate: string;
  salary: number;
  status: EmployeeStatus;
};

type PreviewRow = {
  id: string;
  rowNumber: number;
  values: Record<string, unknown>;
  normalized: Omit<NormalizedEmployeeImportRow, "passwordHash"> | null;
  errors: ImportError[];
  warnings: ImportError[];
};

const normalizeHeader = (value: unknown) => String(value ?? "").trim();

const normalizeText = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text || undefined;
};

const normalizeEmail = (value: unknown) => normalizeText(value)?.toLowerCase();

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const parseDateValue = (value: unknown): Date | null => {
  if (value === undefined || value === null || value === "") return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  }

  const text = String(value).trim();
  const ymd = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymd) {
    const [, year, month, day] = ymd;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const dmy = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) {
    const [, day, month, year] = dmy;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const fallback = new Date(text);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const parseSalary = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const toPreviewNormalized = (
  normalized: NormalizedEmployeeImportRow | null,
): PreviewRow["normalized"] => {
  if (!normalized) return null;
  const { passwordHash: _passwordHash, ...safeNormalized } = normalized;
  return safeNormalized;
};

const readRowsFromWorkbook = (file: Express.Multer.File) => {
  const workbook = XLSX.read(file.buffer, { type: "buffer", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new ApiError(400, "Excel file does not contain any sheet");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  if (matrix.length < 2) {
    throw new ApiError(400, "Excel file does not contain employee rows");
  }

  const headers = (matrix[0] ?? []).map(normalizeHeader);
  const rows = matrix
    .slice(1)
    .map((cells, index) => {
      const values: Record<string, unknown> = {};
      headers.forEach((header, cellIndex) => {
        if (header) values[header] = cells[cellIndex] ?? "";
      });
      return { rowNumber: index + 2, values };
    })
    .filter(({ values }) =>
      Object.values(values).some((value) => normalizeText(value) !== undefined),
    );

  return { headers, rows };
};

const getEmployeeId = async (
  tx: Prisma.TransactionClient,
  reserved: Set<string>,
) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const employeeId = await generateEmployeeId();
    if (reserved.has(employeeId)) continue;

    const existing = await tx.employee.findUnique({
      where: { employeeId },
      select: { id: true },
    });

    if (!existing) {
      reserved.add(employeeId);
      return employeeId;
    }
  }

  throw new ApiError(500, "Could not generate unique employee code");
};

const parseJsonArray = (value: Prisma.JsonValue): ImportError[] => {
  return Array.isArray(value) ? (value as ImportError[]) : [];
};

const parseNormalizedRow = (
  value: Prisma.JsonValue | null,
): NormalizedEmployeeImportRow | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.name !== "string" ||
    typeof row.email !== "string" ||
    typeof row.passwordHash !== "string" ||
    typeof row.departmentId !== "string" ||
    typeof row.positionId !== "string" ||
    typeof row.hireDate !== "string" ||
    typeof row.salary !== "number"
  ) {
    return null;
  }

  return row as NormalizedEmployeeImportRow;
};

export const employeeImportService = {
  createTemplateBuffer() {
    const rows = [
      [
        ...REQUIRED_HEADERS,
        ...OPTIONAL_HEADERS,
      ],
      [
        "Nguyen Van A",
        "nguyenvana@example.com",
        "Password123",
        "HR",
        "STAFF",
        "2026-05-25",
        10000000,
        "0901234567",
        "1995-01-15",
        "MALE",
        "Ha Noi",
        "123456789",
        "WORKING",
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  },

  async preview(file: Express.Multer.File | undefined, uploadedByUserId?: string) {
    if (!file) {
      throw new ApiError(400, "Excel file is required");
    }

    const { headers, rows } = readRowsFromWorkbook(file);
    if (rows.length === 0) {
      throw new ApiError(400, "Excel file does not contain employee rows");
    }
    if (rows.length > MAX_IMPORT_ROWS) {
      throw new ApiError(400, `Employee import cannot exceed ${MAX_IMPORT_ROWS} rows`);
    }

    const missingHeaders = REQUIRED_HEADERS.filter(
      (header) => !headers.includes(header),
    );
    if (missingHeaders.length > 0) {
      throw new ApiError(
        400,
        `Missing required columns: ${missingHeaders.join(", ")}`,
      );
    }

    const unknownHeaders = headers.filter(
      (header) => header && !KNOWN_HEADERS.has(header),
    );

    const [departments, positions, users, employees] = await Promise.all([
      prisma.department.findMany({
        where: { code: { not: null } },
        select: { id: true, code: true, name: true },
      }),
      prisma.position.findMany({
        where: { code: { not: null } },
        select: { id: true, code: true, name: true },
      }),
      prisma.user.findMany({ select: { email: true } }),
      prisma.employee.findMany({ select: { email: true } }),
    ]);

    const departmentByCode = new Map(
      departments.map((department) => [department.code?.toLowerCase(), department]),
    );
    const positionByCode = new Map(
      positions.map((position) => [position.code?.toLowerCase(), position]),
    );
    const existingEmails = new Set([
      ...users.map((user) => user.email.toLowerCase()),
      ...employees.map((employee) => employee.email.toLowerCase()),
    ]);
    const seenEmails = new Map<string, number>();

    const previewRows = await Promise.all(
      rows.map(async ({ rowNumber, values }) => {
        const errors: ImportError[] = [];
        const warnings: ImportError[] = unknownHeaders.map((header) => ({
          field: header,
          message: `Unknown column "${header}" will be ignored`,
        }));

        const name = normalizeText(values.name);
        const email = normalizeEmail(values.email);
        const password = normalizeText(values.password);
        const departmentCode = normalizeText(values.departmentCode);
        const positionCode = normalizeText(values.positionCode);
        const hireDate = parseDateValue(values.hireDate);
        const salary = parseSalary(values.salary);
        const dateOfBirth = parseDateValue(values.dateOfBirth);
        const gender = normalizeText(values.gender) as
          | "MALE"
          | "FEMALE"
          | "OTHER"
          | undefined;
        const status =
          (normalizeText(values.status) as EmployeeStatus | undefined) ??
          EmployeeStatus.WORKING;

        if (!name || name.length < 2) {
          errors.push({ field: "name", message: "Name is required" });
        }
        if (!email || !isEmail(email)) {
          errors.push({ field: "email", message: "Email is invalid" });
        } else {
          if (existingEmails.has(email)) {
            errors.push({ field: "email", message: "Email already exists" });
          }
          const firstRow = seenEmails.get(email);
          if (firstRow) {
            errors.push({
              field: "email",
              message: `Email is duplicated with row ${firstRow}`,
            });
          } else {
            seenEmails.set(email, rowNumber);
          }
        }
        if (!password || password.length < 6) {
          errors.push({
            field: "password",
            message: "Password must have at least 6 characters",
          });
        }
        if (!departmentCode) {
          errors.push({ field: "departmentCode", message: "Department code is required" });
        }
        if (!positionCode) {
          errors.push({ field: "positionCode", message: "Position code is required" });
        }
        if (!hireDate) {
          errors.push({ field: "hireDate", message: "Hire date is invalid" });
        }
        if (salary === null || salary < 0) {
          errors.push({ field: "salary", message: "Salary must be a non-negative number" });
        }
        if (values.dateOfBirth && !dateOfBirth) {
          errors.push({ field: "dateOfBirth", message: "Date of birth is invalid" });
        }
        if (gender && !["MALE", "FEMALE", "OTHER"].includes(gender)) {
          errors.push({ field: "gender", message: "Gender is invalid" });
        }
        if (!Object.values(EmployeeStatus).includes(status)) {
          errors.push({ field: "status", message: "Status is invalid" });
        }

        const department = departmentCode
          ? departmentByCode.get(departmentCode.toLowerCase())
          : undefined;
        const position = positionCode
          ? positionByCode.get(positionCode.toLowerCase())
          : undefined;

        if (departmentCode && !department) {
          errors.push({ field: "departmentCode", message: "Department code was not found" });
        }
        if (positionCode && !position) {
          errors.push({ field: "positionCode", message: "Position code was not found" });
        }

        const normalized: NormalizedEmployeeImportRow | null =
          errors.length === 0 &&
          name &&
          email &&
          password &&
          department &&
          position &&
          hireDate &&
          salary !== null
            ? {
                name,
                email,
                passwordHash: await bcrypt.hash(password, 10),
                phone: normalizeText(values.phone),
                dateOfBirth: dateOfBirth ? toIsoDate(dateOfBirth) : undefined,
                gender,
                address: normalizeText(values.address),
                bankAccount: normalizeText(values.bankAccount),
                departmentId: department.id,
                departmentCode: department.code ?? "",
                departmentName: department.name,
                positionId: position.id,
                positionCode: position.code ?? "",
                positionName: position.name,
                hireDate: toIsoDate(hireDate),
                salary,
                status,
              }
            : null;

        return { rowNumber, values, normalized, errors, warnings };
      }),
    );

    const totalRows = previewRows.length;
    const errorRows = previewRows.filter((row) => row.errors.length > 0).length;
    const warningRows = previewRows.filter((row) => row.warnings.length > 0).length;
    const expiresAt = new Date(Date.now() + BATCH_TTL_HOURS * 60 * 60 * 1000);

    const batch = await prisma.employeeImportBatch.create({
      data: {
        uploadedByUserId,
        totalRows,
        errorRows,
        warningRows,
        expiresAt,
        rows: {
          create: previewRows.map((row) => ({
            rowNumber: row.rowNumber,
            rawData: row.values as Prisma.InputJsonValue,
            normalizedData: row.normalized as Prisma.InputJsonValue,
            errors: row.errors as Prisma.InputJsonValue,
            warnings: row.warnings as Prisma.InputJsonValue,
          })),
        },
      },
      include: {
        rows: {
          orderBy: { rowNumber: "asc" },
        },
      },
    });

    return {
      id: batch.id,
      status: batch.status,
      totalRows,
      errorRows,
      warningRows,
      expiresAt: batch.expiresAt,
      rows: batch.rows.map(
        (row): PreviewRow => ({
          id: row.id,
          rowNumber: row.rowNumber,
          values: row.rawData as Record<string, unknown>,
          normalized: toPreviewNormalized(
            parseNormalizedRow(row.normalizedData),
          ),
          errors: parseJsonArray(row.errors),
          warnings: parseJsonArray(row.warnings),
        }),
      ),
    };
  },

  async confirm(batchId: string, userId?: string) {
    const batch = await prisma.employeeImportBatch.findUnique({
      where: { id: batchId },
      include: {
        rows: {
          orderBy: { rowNumber: "asc" },
        },
      },
    });

    if (!batch) {
      throw new ApiError(404, "Employee import batch not found");
    }
    if (batch.uploadedByUserId && userId && batch.uploadedByUserId !== userId) {
      throw new ApiError(403, "You cannot confirm this employee import batch");
    }
    if (batch.status !== EmployeeImportStatus.PREVIEWED) {
      throw new ApiError(400, "Employee import batch is not confirmable");
    }
    if (batch.expiresAt.getTime() <= Date.now()) {
      await prisma.employeeImportBatch.update({
        where: { id: batch.id },
        data: { status: EmployeeImportStatus.EXPIRED },
      });
      throw new ApiError(400, "Employee import batch has expired");
    }
    if (batch.errorRows > 0) {
      throw new ApiError(400, "Employee import batch still has validation errors");
    }

    const normalizedRows = batch.rows.map((row) => {
      const normalized = parseNormalizedRow(row.normalizedData);
      if (!normalized) {
        throw new ApiError(400, `Row ${row.rowNumber} is missing validated data`);
      }
      return normalized;
    });

    try {
      const createdCount = await prisma.$transaction(async (tx) => {
        const reservedEmployeeIds = new Set<string>();

        for (const row of normalizedRows) {
          const user = await tx.user.create({
            data: {
              email: row.email,
              password: row.passwordHash,
              role: UserRole.EMPLOYEE,
            },
          });

          const employeeId = await getEmployeeId(tx, reservedEmployeeIds);
          const employee = await tx.employee.create({
            data: {
              employeeId,
              userId: user.id,
              name: row.name,
              email: row.email,
              phone: row.phone,
              dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
              gender: row.gender,
              address: row.address,
              bankAccount: row.bankAccount,
              departmentId: row.departmentId,
              positionId: row.positionId,
              hireDate: new Date(row.hireDate),
              salary: row.salary,
              status: row.status,
            },
          });

          await tx.employeeJobHistory.create({
            data: {
              employeeId: employee.id,
              departmentId: employee.departmentId,
              positionId: employee.positionId,
              hireDate: employee.hireDate,
              salary: employee.salary,
              status: employee.status,
              effectiveFrom: employee.hireDate ?? new Date(),
            },
          });
        }

        await tx.employeeImportBatch.update({
          where: { id: batch.id },
          data: {
            status: EmployeeImportStatus.CONFIRMED,
            confirmedAt: new Date(),
          },
        });

        return normalizedRows.length;
      });

      return { createdCount };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ApiError(
          409,
          "Import data is no longer valid because a unique value already exists. Please preview the file again.",
        );
      }

      throw error;
    }
  },
};
