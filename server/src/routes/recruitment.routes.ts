import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import {
  JobApplicationStatus,
  RecruitmentJobStatus,
  UserRole,
  InterviewScheduleStatus,
  OfferStatus,
} from "../../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import { recruitmentController } from "../controllers/recruitment.controller";
import {
  authMiddleware,
  permissionMiddleware,
  optionalAuth,
} from "../middlewares/auth.middleware";
import {
  attachUploadedCvUrl,
  uploadCv,
} from "../middlewares/upload.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const emptyToUndefined = (value: unknown) => {
  if (value === "" || value === undefined) {
    return undefined;
  }

  return value;
};

const optionalDateSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.date().nullable().optional(),
);
const optionalStringSchema = z.preprocess(
  emptyToUndefined,
  z.string().nullable().optional(),
);

const optionalNumberSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.number().nonnegative().nullable().optional(),
);

const getApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.preprocess(
    emptyToUndefined,
    z.nativeEnum(JobApplicationStatus).optional(),
  ),
  positionId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  recruitmentJobId: z.preprocess(
    emptyToUndefined,
    z.string().uuid().optional(),
  ),
  search: z.preprocess(emptyToUndefined, z.string().optional()),
});

const recruitmentJobListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.preprocess(emptyToUndefined, z.string().optional()),
  positionId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  departmentId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
});

const recruitmentJobSchema = z
  .object({
    positionId: z.string().uuid("positionId không hợp lệ"),
    departmentId: z.string().uuid("departmentId không hợp lệ"),
    title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự"),
    description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
    requirements: z.string().min(10, "Yêu cầu phải có ít nhất 10 ký tự"),
    benefits: z.string().min(3, "Phúc lợi phải có ít nhất 3 ký tự"),
    salaryMin: z.coerce.number().nonnegative("salaryMin phải là số không âm"),
    salaryMax: z.coerce.number().nonnegative("salaryMax phải là số không âm"),
    quantity: z.coerce.number().int().min(1, "quantity phải lớn hơn 0"),
    deadline: z.coerce.date(),
    status: z
      .nativeEnum(RecruitmentJobStatus)
      .optional()
      .default(RecruitmentJobStatus.OPEN),
  })
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMin <= data.salaryMax,
    {
      message: "salaryMin must be less than or equal to salaryMax",
      path: ["salaryMax"],
    },
  );

const recruitmentJobUpdateSchema = z
  .object({
    positionId: z.string().uuid("positionId không hợp lệ").optional(),
    departmentId: z.string().uuid("departmentId không hợp lệ").optional(),
    title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự").optional(),
    description: z
      .string()
      .min(10, "Mô tả phải có ít nhất 10 ký tự")
      .optional(),
    requirements: z
      .string()
      .min(10, "Yêu cầu phải có ít nhất 10 ký tự")
      .optional(),
    benefits: z.string().min(3, "Phúc lợi phải có ít nhất 3 ký tự").optional(),
    salaryMin: optionalNumberSchema,
    salaryMax: optionalNumberSchema,
    quantity: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(1).optional(),
    ),
    deadline: optionalDateSchema,
    status: z.nativeEnum(RecruitmentJobStatus).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMin <= data.salaryMax,
    {
      message: "salaryMin must be less than or equal to salaryMax",
      path: ["salaryMax"],
    },
  );
const optionalUrlSchema = z.preprocess(
  emptyToUndefined,
  z.string().url("URL không hợp lệ").nullable().optional(),
);
const optionalCvUrlSchema = z.preprocess(
  emptyToUndefined,
  z.string().url("CV URL không hợp lệ").nullable().optional(),
);
const optionalPhoneSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .min(8, "Số điện thoại phải có ít nhất 8 ký tự")
    .nullable()
    .optional(),
);
const applyJobSchema = z.object({
  recruitmentJobId: z.string().uuid("recruitmentJobId không hợp lệ"),
  fullName: z.string().min(2).optional(),
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
      .nullable()
      .optional(),
  ),
  address: z.preprocess(
    emptyToUndefined,
    z.string().min(3, "Địa chỉ phải có ít nhất 3 ký tự").nullable().optional(),
  ),
  avatar: optionalUrlSchema,
  cvUrl: optionalCvUrlSchema,
  province: z.preprocess(emptyToUndefined, z.unknown().optional()),
  ward: z.preprocess(emptyToUndefined, z.unknown().optional()),
  coverLetter: optionalStringSchema,
  notes: optionalStringSchema,
});

const validateApplicationsQuery = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    getApplicationsQuerySchema.parse(req.query);
    next();
  } catch (error) {
    next(error);
  }
};

const validateRecruitmentJobsQuery = (
  //validate query params khi lay danh sach job
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    recruitmentJobListQuerySchema.parse(req.query);
    next();
  } catch (error) {
    next(error);
  }
};

const viewApplicationOrOwnCandidateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role === UserRole.CANDIDATE) {
    return next();
  }

  return permissionMiddleware(PERMISSIONS.RECRUITMENT_VIEW_APPLICATION)(
    req,
    res,
    next,
  );
};

const interviewScheduleSchema = z.object({
  title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự"),
  scheduledAt: z.coerce.date(),
  type: z.string().min(3, "Loại phỏng vấn phải có ít nhất 3 ký tự"),
  location: optionalStringSchema,
  interviewerNotes: optionalStringSchema,
});

const interviewResponseSchema = z.object({
  decision: z.enum(
    [InterviewScheduleStatus.CONFIRMED, InterviewScheduleStatus.DECLINED],
    {
      error: "Decision phải là CONFIRMED hoặc DECLINED",
    },
  ),
  note: optionalStringSchema,
});

const interviewEvaluationSchema = z.object({
  title: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự"),
  score: z.coerce.number().int().min(1).max(10).optional(),
  strengths: optionalStringSchema,
  concerns: optionalStringSchema,
  recommendation: optionalStringSchema,
  comments: optionalStringSchema,
});

const offerSchema = z.object({
  departmentId: z.string().uuid("departmentId không hợp lệ"),
  proposedSalary: z.coerce.number().nonnegative("Lương phải là số không âm"),
  proposedHireDate: z.coerce.date(),
  notes: optionalStringSchema,
});

router.get(
  //lay danh sach job voi pagination, filter, search
  "/jobs",
  optionalAuth,
  validateRecruitmentJobsQuery,
  recruitmentController.getJobs,
);
router.get("/jobs/:id", optionalAuth, recruitmentController.getJobById); //lay chi tiet job theo id
router.post(
  //tao moi job
  "/jobs",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_MANAGE_JOB),
  validate(recruitmentJobSchema),
  recruitmentController.createJob,
);
router.patch(
  //update job
  "/jobs/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_MANAGE_JOB),
  validate(recruitmentJobUpdateSchema),
  recruitmentController.updateJob,
);
router.patch(
  //close job
  "/jobs/:id/close",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_MANAGE_JOB),
  recruitmentController.closeJob,
);
router.patch(
  //reopen job
  "/jobs/:id/reopen",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_MANAGE_JOB),
  recruitmentController.reopenJob,
);
router.post(
  "/applications",
  authMiddleware(UserRole.CANDIDATE),
  uploadCv,
  attachUploadedCvUrl,
  validate(applyJobSchema),
  recruitmentController.applyJob,
);
router.get(
  //lay danh sach ung tuyen voi pagination, filter, search
  "/applications",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_VIEW_APPLICATION),
  validateApplicationsQuery,
  recruitmentController.getApplications,
);
router.get(
  //lay chi tiet ung tuyen theo id
  "/applications/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CANDIDATE),
  viewApplicationOrOwnCandidateMiddleware,
  recruitmentController.getApplicationById,
);
router.get(
  //lay chi tiet thu moi phong van theo id
  "/applications/:id/interviews/:scheduleId",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CANDIDATE),
  viewApplicationOrOwnCandidateMiddleware,
  recruitmentController.getInterviewScheduleById,
);

router.post(
  //schedule phỏng vấn
  "/applications/:id/interviews",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_MANAGE_APPLICATION),
  validate(interviewScheduleSchema),
  recruitmentController.scheduleInterview,
);
router.post(
  //ứng viên phản hồi lời mời phỏng vấn
  "/applications/:id/interviews/:scheduleId/respond",
  authMiddleware(UserRole.CANDIDATE),
  validate(interviewResponseSchema),
  recruitmentController.respondToInterview,
);
router.post(
  //employee đánh giá ứng viên
  "/applications/:id/evaluations",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_MANAGE_APPLICATION),
  validate(interviewEvaluationSchema),
  recruitmentController.submitEvaluation,
);
router.get(
  //lay chi tiet danh gia  theo id
  "/applications/:id/evaluations/:evaluationId",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CANDIDATE),
  viewApplicationOrOwnCandidateMiddleware,
  recruitmentController.getEvaluationById,
);
//cap nhat danh gia
router.patch(
  "/applications/:id/evaluations/:evaluationId",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_MANAGE_APPLICATION),
  validate(interviewEvaluationSchema),
  recruitmentController.updateEvaluation,
);

//xoa danh gia
router.delete(
  "/applications/:id/evaluations/:evaluationId",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_MANAGE_APPLICATION),
  recruitmentController.deleteEvaluation,
);

router.patch(
  //employee từ chối ứng tuyển
  "/applications/:id/reject",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(
    PERMISSIONS.RECRUITMENT_MANAGE_APPLICATION,
    PERMISSIONS.RECRUITMENT_APPROVE_DIRECT,
  ),
  recruitmentController.rejectApplication,
);

router.post(
  //employee gửi offer cho candidate
  "/applications/:id/offer",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(
    PERMISSIONS.RECRUITMENT_MANAGE_APPLICATION,
    PERMISSIONS.RECRUITMENT_APPROVE_DIRECT,
  ),
  validate(offerSchema),
  recruitmentController.sendOffer,
);

// candidate respond to offer
const offerResponseSchema = z.object({
  decision: z.union([
    z.literal(OfferStatus.ACCEPTED),
    z.literal(OfferStatus.DECLINED),
  ]),
  note: optionalStringSchema,
});

router.post(
  "/applications/:id/offer/respond",
  authMiddleware(UserRole.CANDIDATE),
  validate(offerResponseSchema),
  recruitmentController.respondToOffer,
);

// candidate cancel application
router.post(
  "/applications/:id/cancel",
  authMiddleware(UserRole.CANDIDATE),
  recruitmentController.cancelApplication,
);

export default router;
