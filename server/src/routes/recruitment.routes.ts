import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";
import {
  InterviewScheduleStatus,
  JobApplicationStatus,
  RecruitmentJobStatus,
  UserRole,
} from "../../generated/prisma/client";
import { PERMISSIONS } from "../constants/permissions";
import { recruitmentController } from "../controllers/recruitment.controller";
import {
  authMiddleware,
  permissionMiddleware,
} from "../middlewares/auth.middleware";
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
const optionalPhoneSchema = z.preprocess(
  emptyToUndefined,
  z.string().min(8, "Số điện thoại phải có ít nhất 8 ký tự").optional(),
);

const optionalNumberSchema = z.preprocess(
  emptyToUndefined,
  z.coerce.number().nonnegative().optional(),
);

const candidateProfileSchema = z
  .object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").optional(),
    phone: optionalPhoneSchema,
    dateOfBirth: optionalDateSchema,
    address: z.preprocess(
      emptyToUndefined,
      z.string().min(3, "Địa chỉ phải có ít nhất 3 ký tự").optional(),
    ),
    avatar: optionalUrlSchema,
    cvUrl: optionalUrlSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const applyJobSchema = z.object({
  recruitmentJobId: z.string().uuid("recruitmentJobId không hợp lệ"),
  fullName: z.string().min(2).optional(),
  phone: optionalPhoneSchema,
  dateOfBirth: optionalDateSchema,
  address: z.preprocess(
    emptyToUndefined,
    z.string().min(3, "Địa chỉ phải có ít nhất 3 ký tự").optional(),
  ),
  avatar: optionalUrlSchema,
  cvUrl: optionalUrlSchema,
  coverLetter: optionalStringSchema,
  notes: optionalStringSchema,
});

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

const interviewScheduleSchema = z.object({
  scheduledAt: z.coerce.date(),
  location: optionalStringSchema,
  meetingLink: optionalUrlSchema,
  interviewerNotes: optionalStringSchema,
});

const interviewResponseSchema = z.object({
  decision: z.enum([
    InterviewScheduleStatus.CONFIRMED,
    InterviewScheduleStatus.DECLINED,
  ]),
  note: optionalStringSchema,
});

const interviewEvaluationSchema = z.object({
  interviewScheduleId: z.string().uuid("interviewScheduleId không hợp lệ"),
  score: z.coerce.number().int().min(1).max(10).optional(),
  strengths: optionalStringSchema,
  concerns: optionalStringSchema,
  recommendation: optionalStringSchema,
  comments: optionalStringSchema,
});

const applicationDecisionSchema = z.object({
  decision: z.enum([
    JobApplicationStatus.APPROVED,
    JobApplicationStatus.REJECTED,
  ]),
  notes: optionalStringSchema,
});

const offerSchema = z.object({
  departmentId: z.string().uuid("departmentId không hợp lệ"),
  proposedSalary: z.coerce.number().nonnegative("Lương phải là số không âm"),
  proposedHireDate: z.coerce.date(),
  notes: optionalStringSchema,
});

const offerResponseSchema = z.object({
  decision: z.enum([
    JobApplicationStatus.OFFER_ACCEPTED,
    JobApplicationStatus.OFFER_DECLINED,
  ]),
  note: optionalStringSchema,
});

router.get(
  //lay thong tin profile cua candidate
  "/profile",
  authMiddleware(UserRole.CANDIDATE),
  recruitmentController.getMyProfile,
);
router.patch(
  //update thong tin profile cua candidate
  "/profile",
  authMiddleware(UserRole.CANDIDATE),
  validate(candidateProfileSchema),
  recruitmentController.updateMyProfile,
);
router.get(
  //lay danh sach job voi pagination, filter, search
  "/jobs",
  validateRecruitmentJobsQuery,
  recruitmentController.getJobs,
);
router.get("/jobs/:id", recruitmentController.getJobById); //lay chi tiet job theo id
router.post(
  //tao moi job
  "/jobs",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(
    PERMISSIONS.RECRUITMENT_MANAGE_JOB,
    PERMISSIONS.RECRUITMENT_CREATE_JOB,
  ),
  validate(recruitmentJobSchema),
  recruitmentController.createJob,
);
router.patch(
  //update job
  "/jobs/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(
    PERMISSIONS.RECRUITMENT_MANAGE_JOB,
    PERMISSIONS.RECRUITMENT_UPDATE_JOB,
  ),
  validate(recruitmentJobUpdateSchema),
  recruitmentController.updateJob,
);
router.patch(
  //close job
  "/jobs/:id/close",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(
    PERMISSIONS.RECRUITMENT_MANAGE_JOB,
    PERMISSIONS.RECRUITMENT_CLOSE_JOB,
  ),
  recruitmentController.closeJob,
);
router.get(
  //lay thong tin pipeline tong the
  "/pipeline",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_VIEW_PIPELINE),
  recruitmentController.getPipeline,
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
  //lay danh sach ung tuyen cua candidate hien tai
  "/applications/me",
  authMiddleware(UserRole.CANDIDATE),
  recruitmentController.getMyApplications,
);
router.post(
  // ung tuyen vao job
  "/applications",
  authMiddleware(UserRole.CANDIDATE),
  validate(applyJobSchema),
  recruitmentController.applyJob,
);
router.get(
  //lay chi tiet ung tuyen theo id
  "/applications/:id",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_VIEW_APPLICATION),
  recruitmentController.getApplicationById,
);
router.post(
  //schedule phỏng vấn
  "/applications/:id/interviews",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_SCHEDULE_INTERVIEW),
  validate(interviewScheduleSchema),
  recruitmentController.scheduleInterview,
);
router.patch(
  //candidate phản hồi lịch phỏng vấn
  "/applications/:id/interviews/:scheduleId/response",
  authMiddleware(UserRole.CANDIDATE),
  validate(interviewResponseSchema),
  recruitmentController.respondToInterview,
);
router.post(
  //employee submit đánh giá sau phỏng vấn
  "/applications/:id/evaluations",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(PERMISSIONS.RECRUITMENT_SUBMIT_EVALUATION),
  validate(interviewEvaluationSchema),
  recruitmentController.submitEvaluation,
);
router.patch(
  //employee quyết định duyệt hay từ chối ứng tuyển
  "/applications/:id/decision",
  authMiddleware(UserRole.ADMIN, UserRole.EMPLOYEE),
  permissionMiddleware(
    PERMISSIONS.RECRUITMENT_MANAGE_APPLICATION,
    PERMISSIONS.RECRUITMENT_APPROVE_DIRECT,
  ),
  validate(applicationDecisionSchema),
  recruitmentController.decideApplication,
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
router.patch(
  //candidate phản hồi offer
  "/applications/:id/offer-response",
  authMiddleware(UserRole.CANDIDATE),
  validate(offerResponseSchema),
  recruitmentController.respondToOffer,
);

export default router;
