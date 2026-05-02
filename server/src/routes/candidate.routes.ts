import { Router } from "express";
import { z } from "zod";
import { UserRole } from "../../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import { candidateController } from "../controllers/candidate.controller";
import {
  authMiddleware,
  permissionMiddleware,
} from "../middlewares/auth.middleware";
import {
  attachUploadedCvUrl,
  uploadCv,
} from "../middlewares/upload.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const emptyToUndefined = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
};

const optionalDateSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.date().optional(),
);
const optionalStringSchema = z.preprocess(
  emptyToUndefined,
  z.string().optional(),
);
const optionalUrlSchema = z.preprocess(
  emptyToUndefined,
  z.string().url("URL không hợp lệ").optional(),
);
const optionalCvUrlSchema = z.preprocess(
  emptyToUndefined,
  z.string().url("CV URL không hợp lệ").optional(),
);
const optionalPhoneSchema = z.preprocess(
  emptyToUndefined,
  z.string().min(8, "Số điện thoại phải có ít nhất 8 ký tự").optional(),
);

const candidateProfileSchema = z
  .object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").optional(),
    phone: optionalPhoneSchema,
    dateOfBirth: optionalDateSchema,
    gender: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .refine(
          (value) => ["MALE", "FEMALE", "OTHER"].includes(value),
          "Giới tính không hợp lệ",
        )
        .optional(),
    ),
    address: z.preprocess(
      emptyToUndefined,
      z.string().min(3, "Địa chỉ phải có ít nhất 3 ký tự").optional(),
    ),
    avatar: optionalUrlSchema,
    cvUrl: optionalCvUrlSchema,
    maritalStatus: optionalStringSchema,
    nationality: optionalStringSchema,
    religion: optionalStringSchema,
    bankAccount: optionalStringSchema,
    bank: z.preprocess(emptyToUndefined, z.unknown().optional()),
    identityCardNumber: optionalStringSchema,
    identityCardIssueDate: optionalDateSchema,
    frontIdentityCardImage: optionalUrlSchema,
    backIdentityCardImage: optionalUrlSchema,
    province: z.preprocess(emptyToUndefined, z.unknown().optional()),
    ward: z.preprocess(emptyToUndefined, z.unknown().optional()),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const candidateListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.preprocess(emptyToUndefined, z.string().optional()),
});

const candidateIdParamSchema = z.object({
  id: z.string().uuid("id không hợp lệ"),
});

const validateCandidateListQuery = (
  req: Parameters<typeof candidateController.getCandidates>[0],
  _res: Parameters<typeof candidateController.getCandidates>[1],
  next: Parameters<typeof candidateController.getCandidates>[2],
) => {
  try {
    candidateListQuerySchema.parse(req.query);
    next();
  } catch (error) {
    next(error);
  }
};

const validateCandidateIdParam = (
  req: Parameters<typeof candidateController.getCandidateById>[0],
  _res: Parameters<typeof candidateController.getCandidateById>[1],
  next: Parameters<typeof candidateController.getCandidateById>[2],
) => {
  try {
    candidateIdParamSchema.parse(req.params);
    next();
  } catch (error) {
    next(error);
  }
};

router.get(
  "/profile",
  authMiddleware(UserRole.CANDIDATE),
  candidateController.getMyProfile,
);
router.patch(
  "/profile",
  authMiddleware(UserRole.CANDIDATE),
  uploadCv,
  attachUploadedCvUrl,
  validate(candidateProfileSchema),
  candidateController.updateMyProfile,
);

//lay danh sach ung vien trong he thong(admin/hr)
router.get(
  "/",
  authMiddleware(UserRole.EMPLOYEE, UserRole.ADMIN),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_VIEW_APPLICATION),
  validateCandidateListQuery,
  candidateController.getCandidates,
);

//lay thong tin ung vien theo id
router.get(
  "/:id",
  authMiddleware(UserRole.EMPLOYEE, UserRole.ADMIN),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_VIEW_APPLICATION),
  validateCandidateIdParam,
  candidateController.getCandidateById,
);

router.get(
  "/applications/me",
  authMiddleware(UserRole.CANDIDATE),
  candidateController.getMyApplications,
);

export default router;
