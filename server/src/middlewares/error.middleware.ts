import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errorCode: "VALIDATION_ERROR",
      errors: err.flatten(),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
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
