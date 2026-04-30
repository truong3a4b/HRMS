import path from "path";
import { NextFunction, Request, RequestHandler, Response } from "express";
import multer from "multer";
import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

const allowedCvMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const cvMimeTypeToExtension: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
};

const getFileExtension = (file: Express.Multer.File) => {
  return (
    path.extname(file.originalname).toLowerCase() ||
    cvMimeTypeToExtension[file.mimetype] ||
    ""
  );
};

const getCvPublicIdByFile = (file: Express.Multer.File): string => {
  const extension = getFileExtension(file);

  const baseName =
    path
      .basename(file.originalname, path.extname(file.originalname))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "cv";

  // Với resource_type="raw", public_id NÊN chứa extension.
  return `${Date.now()}-${baseName}${extension}`;
};

const getCvViewUrl = (result: UploadApiResponse): string => {
  // Link xem/mở file trực tiếp.
  // PDF thường mở được trên browser.
  // DOC/DOCX thường sẽ tải xuống hoặc mở bằng app bên ngoài.
  return result.secure_url;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedCvMimeTypes.has(file.mimetype)) {
      callback(
        new ApiError(
          400,
          "CV file must be a PDF, DOC, or DOCX file",
          "INVALID_CV_FILE_TYPE",
        ),
      );
      return;
    }

    callback(null, true);
  },
});

const uploadCvFields = upload.fields([
  { name: "cv", maxCount: 1 },
  { name: "cvFile", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

const normalizeUploadedCvFile = (
  req: Request,
): Express.Multer.File | undefined => {
  if (req.file) return req.file;

  const files = req.files;
  if (!files) return undefined;

  if (Array.isArray(files)) {
    return files.find((f) => ["cv", "cvFile", "file"].includes(f.fieldname));
  }

  return files.cv?.[0] ?? files.cvFile?.[0] ?? files.file?.[0];
};

export const uploadCv: RequestHandler = (req, res, next) => {
  uploadCvFields(req, res, (error) => {
    if (error) {
      next(error);
      return;
    }

    const uploadedCvFile = normalizeUploadedCvFile(req);

    if (uploadedCvFile) {
      req.file = uploadedCvFile;
    }

    next();
  });
};

const ensureCloudinaryConfigured = () => {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw new ApiError(
      500,
      "Cloudinary is not configured",
      "CLOUDINARY_NOT_CONFIGURED",
    );
  }
};

const uploadCvBufferToCloudinary = (
  file: Express.Multer.File,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_CV_FOLDER || "hrms/cvs",
        public_id: getCvPublicIdByFile(file),
        resource_type: "raw",
        type: "upload",
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(file.buffer);
  });
};

export const attachUploadedCvUrl = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      next();
      return;
    }

    ensureCloudinaryConfigured();

    const result = await uploadCvBufferToCloudinary(req.file);

    req.body.cvUrl = getCvViewUrl(result);

    next();
  } catch (error) {
    next(error);
  }
};
