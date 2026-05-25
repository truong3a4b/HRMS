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

const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const allowedExcelMimeTypes = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);

const cvFieldNames = new Set(["cv", "cvFile", "file"]);
const imageFieldNames = new Set([
  "avatar",
  "avatarFile",
  "frontIdentityCardImage",
  "frontIdentityCardImageFile",
  "frontIdentityCardFile",
  "backIdentityCardImage",
  "backIdentityCardImageFile",
  "backIdentityCardFile",
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

const createUpload = (options?: { allowImages?: boolean }) =>
  multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (cvFieldNames.has(file.fieldname) && allowedCvMimeTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    if (
      options?.allowImages &&
      imageFieldNames.has(file.fieldname) &&
      allowedImageMimeTypes.has(file.mimetype)
    ) {
      callback(null, true);
      return;
    }

    if (imageFieldNames.has(file.fieldname)) {
      callback(
        new ApiError(
          400,
          "Image file must be a JPG, PNG, or WEBP file",
          "INVALID_IMAGE_FILE_TYPE",
        ),
      );
      return;
    }

      callback(
        new ApiError(
          400,
          "CV file must be a PDF, DOC, or DOCX file",
          "INVALID_CV_FILE_TYPE",
        ),
      );
      return;
  },
  });

const upload = createUpload();
const uploadProfile = createUpload({ allowImages: true });
const uploadEmployeeExcel = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (
      allowedExcelMimeTypes.has(file.mimetype) ||
      extension === ".xlsx" ||
      extension === ".xls"
    ) {
      callback(null, true);
      return;
    }

    callback(
      new ApiError(
        400,
        "Employee import file must be an XLS or XLSX file",
        "INVALID_EMPLOYEE_IMPORT_FILE_TYPE",
      ),
    );
  },
});

const uploadCvFields = upload.fields([
  { name: "cv", maxCount: 1 },
  { name: "cvFile", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

const uploadProfileFields = uploadProfile.fields([
  { name: "cv", maxCount: 1 },
  { name: "cvFile", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "avatar", maxCount: 1 },
  { name: "avatarFile", maxCount: 1 },
  { name: "frontIdentityCardImage", maxCount: 1 },
  { name: "frontIdentityCardImageFile", maxCount: 1 },
  { name: "frontIdentityCardFile", maxCount: 1 },
  { name: "backIdentityCardImage", maxCount: 1 },
  { name: "backIdentityCardImageFile", maxCount: 1 },
  { name: "backIdentityCardFile", maxCount: 1 },
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

export const uploadProfileFiles: RequestHandler = (req, res, next) => {
  uploadProfileFields(req, res, (error) => {
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

export const uploadEmployeeImportExcel: RequestHandler =
  uploadEmployeeExcel.single("file");

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

const getUploadedFileByFieldNames = (
  req: Request,
  fieldNames: string[],
): Express.Multer.File | undefined => {
  const files = req.files;
  if (!files) return undefined;

  if (Array.isArray(files)) {
    return files.find((file) => fieldNames.includes(file.fieldname));
  }

  for (const fieldName of fieldNames) {
    const file = files[fieldName]?.[0];
    if (file) return file;
  }

  return undefined;
};

const getImagePublicIdByFile = (
  file: Express.Multer.File,
  fallback: string,
): string => {
  const baseName =
    path
      .basename(file.originalname, path.extname(file.originalname))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || fallback;

  return `${Date.now()}-${baseName}`;
};

const uploadImageBufferToCloudinary = (
  file: Express.Multer.File,
  fallbackPublicId: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_PROFILE_IMAGE_FOLDER,
        public_id: getImagePublicIdByFile(file, fallbackPublicId),
        resource_type: "image",
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

const parseJsonFormField = (value: unknown) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return value;

  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    trimmed === "null"
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
};

const normalizeJsonFormFields = (req: Request) => {
  for (const fieldName of ["bank", "province", "ward"]) {
    if (fieldName in req.body) {
      req.body[fieldName] = parseJsonFormField(req.body[fieldName]);
    }
  }
};

type UploadedImageMapping = {
  bodyField: string;
  fieldNames: string[];
  fallbackPublicId: string;
  file: Express.Multer.File;
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

export const attachUploadedProfileFileUrls = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    normalizeJsonFormFields(req);

    const fileMappings = [
      {
        bodyField: "avatar",
        fieldNames: ["avatar", "avatarFile"],
        fallbackPublicId: "avatar",
      },
      {
        bodyField: "frontIdentityCardImage",
        fieldNames: [
          "frontIdentityCardImage",
          "frontIdentityCardImageFile",
          "frontIdentityCardFile",
        ],
        fallbackPublicId: "front-identity-card",
      },
      {
        bodyField: "backIdentityCardImage",
        fieldNames: [
          "backIdentityCardImage",
          "backIdentityCardImageFile",
          "backIdentityCardFile",
        ],
        fallbackPublicId: "back-identity-card",
      },
    ];

    const uploadedCvFile = normalizeUploadedCvFile(req);
    const imageUploads: UploadedImageMapping[] = fileMappings
      .map((mapping) => ({
        ...mapping,
        file: getUploadedFileByFieldNames(req, mapping.fieldNames),
      }))
      .filter(
        (mapping): mapping is UploadedImageMapping =>
          mapping.file !== undefined,
      );

    if (!uploadedCvFile && imageUploads.length === 0) {
      next();
      return;
    }

    ensureCloudinaryConfigured();

    if (uploadedCvFile) {
      const result = await uploadCvBufferToCloudinary(uploadedCvFile);
      req.body.cvUrl = getCvViewUrl(result);
    }

    await Promise.all(
      imageUploads.map(async (mapping) => {
        const result = await uploadImageBufferToCloudinary(
          mapping.file,
          mapping.fallbackPublicId,
        );
        req.body[mapping.bodyField] = result.secure_url;
      }),
    );

    next();
  } catch (error) {
    next(error);
  }
};
