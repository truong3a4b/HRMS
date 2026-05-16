import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import { ApiError } from "../utils/apiError";

const fieldLabels: Record<string, string> = {
  code: "Mã ca",
  name: "Tên ca",
  startTime: "Giờ bắt đầu",
  endTime: "Giờ kết thúc",
  breakStartTime: "Giờ bắt đầu nghỉ",
  breakEndTime: "Giờ kết thúc nghỉ",
  lateGracePeriod: "Số phút cho phép đi muộn",
  earlyLeaveGracePeriod: "Số phút cho phép về sớm",
  checkInStartTime: "Thời gian bắt đầu check-in",
  checkInEndTime: "Thời gian kết thúc check-in",
  checkOutStartTime: "Thời gian bắt đầu check-out",
  checkOutEndTime: "Thời gian kết thúc check-out",
  workUnits: "Đơn vị công",
  overtimeMultiplier: "Hệ số làm thêm",
};

const getFieldLabel = (path: PropertyKey[]) => {
  const key = String(path[path.length - 1] ?? "");
  return fieldLabels[key] ?? key;
};

const translateZodMessage = (issue: ZodError["issues"][number]) => {
  const label = getFieldLabel(issue.path);

  if (issue.message.startsWith("Invalid input: expected number")) {
    return `${label} phải là số hợp lệ`;
  }

  if (issue.message.startsWith("Invalid input: expected string")) {
    return `${label} không hợp lệ`;
  }

  return issue.message;
};

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    const formErrors: string[] = [];

    for (const issue of err.issues) {
      const message = translateZodMessage(issue);
      const key = String(issue.path[0] ?? "");

      if (!key) {
        formErrors.push(message);
        continue;
      }

      fieldErrors[key] = [...(fieldErrors[key] ?? []), message];
    }

    const firstMessage =
      Object.values(fieldErrors)[0]?.[0] ??
      formErrors[0] ??
      "Dữ liệu không hợp lệ";

    return res.status(400).json({
      success: false,
      message: firstMessage,
      errorCode: "VALIDATION_ERROR",
      errors: { fieldErrors, formErrors },
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const messageByCode: Record<string, string> = {
      P2002: "Dữ liệu bị trùng (vi phạm ràng buộc duy nhất)",
      P2003: "Không thể cập nhật do ràng buộc dữ liệu",
      P2025: "Không tìm thấy dữ liệu cần cập nhật",
    };
    const statusCode = err.code === "P2025" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: messageByCode[err.code] ?? "Database error",
      errorCode: err.code,
    });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errorCode: "PRISMA_VALIDATION_ERROR",
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "CV file must not exceed 5MB"
          : err.message,
      errorCode: err.code,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
