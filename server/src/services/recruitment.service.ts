import {
  JobApplicationStatus,
  InterviewScheduleStatus,
  NotificationType,
  OfferStatus,
  Prisma,
  RecruitmentJobStatus,
  Gender,
  UserRole,
} from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { employeeService } from "./employee.service";
import { ApiError } from "../utils/apiError";
import { sendInterviewInvitationEmail, sendOfferEmail } from "../config/brevo";
import { env } from "../config/env";
import { notificationService } from "./notification.service";

type CandidateProfileInput = {
  fullName?: string | null;
  phone?: string | null;
  dateOfBirth?: Date | null;
  gender?: Gender | null;
  address?: string | null;
  avatar?: string | null;
  cvUrl?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  religion?: string | null;
  bankAccount?: string | null;
  bank?: any | null;
  identityCardNumber?: string | null;
  identityCardIssueDate?: Date | null;
  frontIdentityCardImage?: string | null;
  backIdentityCardImage?: string | null;
  province?: any | null;
  ward?: any | null;
};

type ApplyJobInput = CandidateProfileInput & {
  recruitmentJobId: string;
  coverLetter?: string;
  notes?: string;
};

type RecruitmentJobInput = {
  positionId: string;
  departmentId: string;
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  quantity: number;
  deadline?: Date | null;
  status?: RecruitmentJobStatus;
};

type RecruitmentJobUpdateInput = Partial<RecruitmentJobInput>;

type InterviewScheduleInput = {
  title: string;
  scheduledAt: Date;
  type: string;
  location?: string;
  interviewerNotes?: string;
};

type InterviewResponseInput = {
  decision: InterviewScheduleStatus;
  note?: string;
};

type InterviewEvaluationInput = {
  title: string;
  score?: number;
  strengths?: string;
  concerns?: string;
  recommendation?: string;
  comments?: string;
};

type InterviewEvaluationUpdateInput = Partial<InterviewEvaluationInput>;

type OfferInput = {
  departmentId: string;
  proposedSalary: number;
  proposedHireDate: Date;
  notes?: string;
};

type ApplicationListFilters = {
  status?: JobApplicationStatus;
  positionId?: string;
  recruitmentJobId?: string;
  page: number;
  limit: number;
  search?: string;
};

type RecruitmentJobListFilters = {
  page: number;
  limit: number;
  search?: string;
  positionId?: string;
  departmentId?: string;
  canViewAllStatuses?: boolean;
};

const candidateProfileSelect = {
  id: true,
  userId: true,
  fullName: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
  address: true,
  avatar: true,
  cvUrl: true,
  maritalStatus: true,
  nationality: true,
  religion: true,
  bankAccount: true,
  bank: true,
  identityCardNumber: true,
  identityCardIssueDate: true,
  frontIdentityCardImage: true,
  backIdentityCardImage: true,
  province: true,
  ward: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      role: true,
    },
  },
} as const;

const recruitmentJobInclude = {
  position: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  department: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
} satisfies Prisma.RecruitmentJobInclude;

const applicationListSelect = {
  id: true,
  status: true,
  appliedAt: true,
  updatedAt: true,
  cancelledAt: true,
  candidateId: true,
  candidateAvatar: true,
  candidateName: true,
  candidateEmail: true,
  candidatePhone: true,
  candidateCvUrl: true,
  position: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  department: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  recruitmentJob: {
    select: {
      id: true,
      title: true,
      status: true,
      deadline: true,
    },
  },
} satisfies Prisma.JobApplicationSelect;

const applicationDetailInclude = {
  recruitmentJob: {
    select: {
      id: true,
      title: true,
      status: true,
      deadline: true,
    },
  },
  position: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  department: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  interviewSchedules: {
    orderBy: { scheduledAt: "desc" as const },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      type: true,
      location: true,
      status: true,
    },
  },
  evaluations: {
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      title: true,
      score: true,
      evaluator: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          status: true,
        },
      },
    },
  },
  offers: {
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      departmentId: true,
      proposedSalary: true,
      proposedHireDate: true,
      notes: true,
      candidateNote: true,
      status: true,
      createdAt: true,
    },
  },
} as any;

const activeApplicationStatuses = new Set<string>([
  JobApplicationStatus.APPLIED,
  JobApplicationStatus.INTERVIEWING,
  JobApplicationStatus.OFFER_SENT,
]);

const finalApplicationStatuses = new Set<string>([
  JobApplicationStatus.REJECTED,
  JobApplicationStatus.ONBOARDED,
  JobApplicationStatus.CANCELLED,
]);

//Kiểm tra xem trạng thái của đơn có phải là trạng thái cuối cùng hay không
const isApplicationFinal = (status: JobApplicationStatus | string) =>
  finalApplicationStatuses.has(status as string);

//Kiểm tra xem trạng thái của đơn có phải là trạng thái đang hoạt động hay không
const isRecruitmentJobExpired = (deadline: Date | null | undefined) =>
  !!deadline && deadline.getTime() < Date.now();

const applicationInclude = applicationDetailInclude;

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000);

const automaticDeclineNote =
  "Automatically declined because the candidate did not respond in time.";

const recruitmentNotificationPermissionKeys = [
  "RECRUITMENT_MANAGE_JOB",
  "RECRUITMENT_VIEW_APPLICATION",
  "RECRUITMENT_MANAGE_APPLICATION",
  "RECRUITMENT_APPROVE_DIRECT",
] as const;

// Lấy danh sách userId của các admin và các nhân viên có quyền liên quan đến tuyển dụng để gửi thông báo
const getRecruitmentNotificationRecipientIds = async () => {
  const [admins, recruitmentEmployees] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: UserRole.ADMIN,
      },
      select: {
        id: true,
      },
    }),
    prisma.employee.findMany({
      where: {
        userId: {
          not: null,
        },
        position: {
          permissions: {
            some: {
              permission: {
                key: {
                  in: recruitmentNotificationPermissionKeys as unknown as string[],
                },
              },
            },
          },
        },
      },
      select: {
        userId: true,
      },
    }),
  ]);

  return [
    ...admins.map((user) => user.id),
    ...recruitmentEmployees
      .map((employee) => employee.userId)
      .filter((userId): userId is string => !!userId),
  ];
};

// Tự động từ chối các lịch phỏng vấn và offer quá hạn mà ứng viên chưa phản hồi
const expirePendingRecruitmentResponses = async () => {
  const now = new Date();
  const interviewCutoff = hoursAgo(
    env.RECRUITMENT_INTERVIEW_RESPONSE_TIMEOUT_HOURS,
  );
  const offerCutoff = hoursAgo(env.RECRUITMENT_OFFER_RESPONSE_TIMEOUT_HOURS);

  await prisma.$transaction(async (tx) => {
    const expiredInterviews = await tx.interviewSchedule.findMany({
      where: {
        status: InterviewScheduleStatus.INVITED,
        createdAt: { lte: interviewCutoff },
      },
      select: {
        id: true,
        jobApplicationId: true,
      },
    });

    //Nếu có lịch phỏng vấn nào quá hạn mà vẫn đang ở trạng thái "Đã mời", tự động chuyển sang "Từ chối" và cập nhật thời gian phản hồi của ứng viên là thời điểm hiện tại
    if (expiredInterviews.length > 0) {
      await tx.interviewSchedule.updateMany({
        where: {
          id: { in: expiredInterviews.map((schedule) => schedule.id) },
          status: InterviewScheduleStatus.INVITED,
        },
        data: {
          status: InterviewScheduleStatus.DECLINED,
          candidateResponseAt: now,
          candidateResponseNote: automaticDeclineNote,
        },
      });
    }

    const expiredOffers = await tx.offer.findMany({
      where: {
        status: OfferStatus.SENT,
        createdAt: { lte: offerCutoff },
        jobApplication: {
          status: JobApplicationStatus.OFFER_SENT,
        },
      },
      select: {
        id: true,
        jobApplicationId: true,
      },
    });

    if (expiredOffers.length > 0) {
      const applicationIds = [
        ...new Set(expiredOffers.map((offer) => offer.jobApplicationId)),
      ];

      await tx.offer.updateMany({
        where: {
          id: { in: expiredOffers.map((offer) => offer.id) },
          status: OfferStatus.SENT,
        },
        data: {
          status: OfferStatus.DECLINED,
          candidateNote: automaticDeclineNote,
        },
      });

      await tx.jobApplication.updateMany({
        where: {
          id: { in: applicationIds },
          status: JobApplicationStatus.OFFER_SENT,
        },
        data: {
          status: JobApplicationStatus.OFFER_DECLINED,
        },
      });
    }
  });
};

// Lấy thông tin ứng viên dựa trên userId, nếu không tìm thấy thì ném ra lỗi 404
const getCandidateByUserId = async (userId: string) => {
  const candidate = await prisma.candidate.findUnique({
    where: { userId },
    select: candidateProfileSelect,
  });

  if (!candidate) {
    throw new ApiError(
      404,
      "Candidate profile not found",
      "CANDIDATE_NOT_FOUND",
    );
  }

  return candidate;
};

// Kiểm tra xem đơn có thuộc về ứng viên hay không, nếu không thì ném ra lỗi 404
const ensureApplicationOwner = async (
  applicationId: string,
  userId: string,
) => {
  const candidate = await getCandidateByUserId(userId);
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      candidateId: candidate.id,
    },
    include: applicationInclude,
  });

  if (!application) {
    throw new ApiError(
      404,
      "Job application not found",
      "JOB_APPLICATION_NOT_FOUND",
    );
  }

  return { candidate, application };
};

// Lấy thông tin tuyển dụng dựa trên id, nếu không tìm thấy thì ném ra lỗi 404
const getRecruitmentJobOrThrow = async (id: string) => {
  const recruitmentJob = await prisma.recruitmentJob.findUnique({
    where: { id },
    include: recruitmentJobInclude,
  });

  if (!recruitmentJob) {
    throw new ApiError(
      404,
      "Recruitment job not found",
      "RECRUITMENT_JOB_NOT_FOUND",
    );
  }

  return recruitmentJob;
};

// Kiểm tra xem công việc tuyển dụng có đang mở hay không, nếu không thì ném ra lỗi 400
const ensureRecruitmentJobOpen = (recruitmentJob: {
  status: RecruitmentJobStatus;
  deadline: Date | null;
}) => {
  if (recruitmentJob.status !== RecruitmentJobStatus.OPEN) {
    throw new ApiError(
      400,
      "Recruitment job is not open",
      "RECRUITMENT_JOB_NOT_OPEN",
    );
  }

  if (isRecruitmentJobExpired(recruitmentJob.deadline)) {
    throw new ApiError(
      400,
      "Recruitment job deadline has passed",
      "RECRUITMENT_JOB_DEADLINE_PASSED",
    );
  }
};

// Kiểm tra xem công việc tuyển dụng có thể chỉnh sửa hay không, nếu không thì ném ra lỗi 400
const ensureRecruitmentJobEditable = (recruitmentJob: {
  status: RecruitmentJobStatus;
}) => {
  if (recruitmentJob.status !== RecruitmentJobStatus.OPEN) {
    throw new ApiError(
      400,
      "Recruitment job can no longer be edited",
      "RECRUITMENT_JOB_LOCKED",
    );
  }
};

// Kiểm tra xem dữ liệu cập nhật công việc tuyển dụng chỉ chứa trường trạng thái hay không
const isStatusOnlyRecruitmentJobUpdate = (data: RecruitmentJobUpdateInput) =>
  Object.keys(data).every((key) => key === "status");

function getJsonName(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const obj = value as Record<string, unknown>;

  return typeof obj.name === "string" ? obj.name : undefined;
}

export const recruitmentService = {
  // Lấy danh sách công việc tuyển dụng dựa trên bộ lọc,
  // nếu userId được cung cấp thì xác định các công việc mà ứng viên đã ứng tuyển
  async getJobs(filters: RecruitmentJobListFilters, userId?: string) {
    const normalizedSearch = filters.search?.trim() ?? "";
    const conditions: Prisma.RecruitmentJobWhereInput[] = [];

    if (!filters.canViewAllStatuses) {
      conditions.push({ status: RecruitmentJobStatus.OPEN });
    }

    if (filters.positionId) {
      conditions.push({ positionId: filters.positionId });
    }

    if (filters.departmentId) {
      conditions.push({ departmentId: filters.departmentId });
    }

    if (normalizedSearch) {
      conditions.push({
        OR: [
          { title: { contains: normalizedSearch, mode: "insensitive" } },
          { description: { contains: normalizedSearch, mode: "insensitive" } },
          {
            requirements: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
          { benefits: { contains: normalizedSearch, mode: "insensitive" } },
          {
            position: {
              OR: [
                { name: { contains: normalizedSearch, mode: "insensitive" } },
                { code: { contains: normalizedSearch, mode: "insensitive" } },
              ],
            },
          },
          {
            department: {
              OR: [
                { name: { contains: normalizedSearch, mode: "insensitive" } },
                { code: { contains: normalizedSearch, mode: "insensitive" } },
              ],
            },
          },
        ],
      });
    }

    const where: Prisma.RecruitmentJobWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};

    const [items, total] = await Promise.all([
      prisma.recruitmentJob.findMany({
        where,
        include: recruitmentJobInclude,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
      }),
      prisma.recruitmentJob.count({ where }),
    ]);

    // If userId provided, determine candidate's applied jobs
    let appliedJobIds = new Set<string>();

    if (userId) {
      try {
        const candidate = await getCandidateByUserId(userId);
        if (items.length > 0) {
          const applications = await prisma.jobApplication.findMany({
            where: {
              candidateId: candidate.id,
              recruitmentJobId: { in: items.map((i) => i.id) },
            },
            select: { recruitmentJobId: true },
          });

          applications.forEach((a) => appliedJobIds.add(a.recruitmentJobId!));
        }
      } catch (e) {
        // ignore candidate not found or other errors and treat as not applied
      }
    }

    const itemsWithApplied = items.map((item) => ({
      ...item,
      applied: appliedJobIds.has(item.id),
    }));

    return {
      items: itemsWithApplied,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  },

  // Lấy thông tin chi tiết của công việc tuyển dụng dựa trên id,
  // nếu userId được cung cấp thì xác định xem ứng viên đã ứng tuyển hay chưa
  async getJobById(id: string, userId?: string) {
    const recruitmentJob = await prisma.recruitmentJob.findFirst({
      where: {
        id,
        status: {
          in: [RecruitmentJobStatus.OPEN, RecruitmentJobStatus.CLOSED],
        },
      },
      include: recruitmentJobInclude,
    });

    if (!recruitmentJob) {
      throw new ApiError(
        404,
        "Recruitment job not found",
        "RECRUITMENT_JOB_NOT_FOUND",
      );
    }

    let applied = false;

    if (userId) {
      try {
        const candidate = await getCandidateByUserId(userId);
        const application = await prisma.jobApplication.findFirst({
          where: { candidateId: candidate.id, recruitmentJobId: id },
          select: { id: true },
        });

        applied = !!application;
      } catch (e) {
        // ignore and leave applied = false
      }
    }

    return { ...recruitmentJob, applied };
  },

  // Tạo một công việc tuyển dụng mới, yêu cầu userId của người tạo và dữ liệu công việc
  async createJob(userId: string, data: RecruitmentJobInput) {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!employee) {
      throw new ApiError(
        404,
        "Employee profile not found",
        "EMPLOYEE_NOT_FOUND",
      );
    }

    const [position, department] = await Promise.all([
      prisma.position.findUnique({
        where: { id: data.positionId },
        select: { id: true },
      }),
      prisma.department.findUnique({
        where: { id: data.departmentId },
        select: { id: true },
      }),
    ]);

    if (!position) {
      throw new ApiError(404, "Position not found", "POSITION_NOT_FOUND");
    }

    if (!department) {
      throw new ApiError(404, "Department not found", "DEPARTMENT_NOT_FOUND");
    }

    return prisma.recruitmentJob.create({
      data: {
        positionId: data.positionId,
        departmentId: data.departmentId,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        benefits: data.benefits,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        quantity: data.quantity,
        deadline: data.deadline,
        status: data.status ?? RecruitmentJobStatus.OPEN,
        createdById: employee.id,
      },
      include: recruitmentJobInclude,
    });
  },

  // Cập nhật thông tin công việc tuyển dụng dựa trên id, yêu cầu userId của người cập nhật và dữ liệu cập nhật
  async updateJob(id: string, data: RecruitmentJobUpdateInput) {
    const recruitmentJob = await getRecruitmentJobOrThrow(id);

    const isReopeningClosedJob =
      recruitmentJob.status === RecruitmentJobStatus.CLOSED &&
      data.status === RecruitmentJobStatus.OPEN &&
      isStatusOnlyRecruitmentJobUpdate(data);

    if (!isReopeningClosedJob) {
      ensureRecruitmentJobEditable(recruitmentJob);
    }

    if (data.positionId) {
      const position = await prisma.position.findUnique({
        where: { id: data.positionId },
        select: { id: true },
      });

      if (!position) {
        throw new ApiError(404, "Position not found", "POSITION_NOT_FOUND");
      }
    }

    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId },
        select: { id: true },
      });

      if (!department) {
        throw new ApiError(404, "Department not found", "DEPARTMENT_NOT_FOUND");
      }
    }

    return prisma.recruitmentJob.update({
      where: { id },
      data: {
        ...(data.positionId ? { positionId: data.positionId } : {}),
        ...(data.departmentId ? { departmentId: data.departmentId } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.requirements !== undefined
          ? { requirements: data.requirements }
          : {}),
        ...(data.benefits !== undefined ? { benefits: data.benefits } : {}),
        ...(data.salaryMin !== undefined ? { salaryMin: data.salaryMin } : {}),
        ...(data.salaryMax !== undefined ? { salaryMax: data.salaryMax } : {}),
        ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
        ...(data.deadline !== undefined ? { deadline: data.deadline } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
      include: recruitmentJobInclude,
    });
  },

  // Đóng công việc tuyển dụng dựa trên id, yêu cầu userId của người đóng
  async closeJob(id: string) {
    const recruitmentJob = await getRecruitmentJobOrThrow(id);

    if (recruitmentJob.status !== RecruitmentJobStatus.OPEN) {
      throw new ApiError(
        400,
        "Recruitment job is already closed",
        "RECRUITMENT_JOB_ALREADY_CLOSED",
      );
    }

    return prisma.recruitmentJob.update({
      where: { id },
      data: {
        status: RecruitmentJobStatus.CLOSED,
      },
      include: recruitmentJobInclude,
    });
  },

  // Mở lại công việc tuyển dụng dựa trên id, yêu cầu userId của người mở lại
  async reopenJob(id: string) {
    const recruitmentJob = await getRecruitmentJobOrThrow(id);

    if (recruitmentJob.status !== RecruitmentJobStatus.CLOSED) {
      throw new ApiError(
        400,
        "Only closed recruitment jobs can be reopened",
        "RECRUITMENT_JOB_NOT_CLOSED",
      );
    }

    return prisma.recruitmentJob.update({
      where: { id },
      data: {
        status: RecruitmentJobStatus.OPEN,
      },
      include: recruitmentJobInclude,
    });
  },

  async getMyProfile(userId: string) {
    return getCandidateByUserId(userId);
  },

  async updateMyProfile(userId: string, data: CandidateProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    }

    return prisma.candidate.upsert({
      where: { userId },
      create: {
        userId,
        email: user.email,
        ...data,
      },
      update: {
        email: user.email,
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.dateOfBirth !== undefined
          ? { dateOfBirth: data.dateOfBirth }
          : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
        ...(data.cvUrl !== undefined ? { cvUrl: data.cvUrl } : {}),
        ...(data.maritalStatus !== undefined
          ? { maritalStatus: data.maritalStatus }
          : {}),
        ...(data.nationality !== undefined
          ? { nationality: data.nationality }
          : {}),
        ...(data.religion !== undefined ? { religion: data.religion } : {}),
        ...(data.bankAccount !== undefined
          ? { bankAccount: data.bankAccount }
          : {}),
        ...(data.bank !== undefined ? { bank: data.bank } : {}),
        ...(data.identityCardNumber !== undefined
          ? { identityCardNumber: data.identityCardNumber }
          : {}),
        ...(data.identityCardIssueDate !== undefined
          ? { identityCardIssueDate: data.identityCardIssueDate }
          : {}),
        ...(data.frontIdentityCardImage !== undefined
          ? { frontIdentityCardImage: data.frontIdentityCardImage }
          : {}),
        ...(data.backIdentityCardImage !== undefined
          ? { backIdentityCardImage: data.backIdentityCardImage }
          : {}),
        ...(data.province !== undefined ? { province: data.province } : {}),
        ...(data.ward !== undefined ? { ward: data.ward } : {}),
      },
      select: candidateProfileSelect,
    });
  },

  async applyJob(userId: string, data: ApplyJobInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    }

    const application = await prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.upsert({
        where: { userId },
        create: {
          userId,
          email: user.email,
          fullName: data.fullName,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          avatar: data.avatar,
          cvUrl: data.cvUrl,
          province: data.province,
          ward: data.ward,
        },
        update: {
          email: user.email,
          ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
          ...(data.phone !== undefined ? { phone: data.phone } : {}),
          ...(data.dateOfBirth !== undefined
            ? { dateOfBirth: data.dateOfBirth }
            : {}),
          ...(data.gender !== undefined ? { gender: data.gender } : {}),
          ...(data.address !== undefined ? { address: data.address } : {}),
          ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
          ...(data.cvUrl !== undefined ? { cvUrl: data.cvUrl } : {}),
          ...(data.province !== undefined ? { province: data.province } : {}),
          ...(data.ward !== undefined ? { ward: data.ward } : {}),
        },
        select: candidateProfileSelect,
      });

      const recruitmentJob = await tx.recruitmentJob.findFirst({
        where: {
          id: data.recruitmentJobId,
          status: RecruitmentJobStatus.OPEN,
        },
        include: recruitmentJobInclude,
      });

      if (!recruitmentJob) {
        throw new ApiError(
          400,
          "Recruitment job is not available for application",
          "RECRUITMENT_JOB_NOT_AVAILABLE",
        );
      }

      ensureRecruitmentJobOpen(recruitmentJob);

      const existingActiveApplication = await tx.jobApplication.findFirst({
        where: {
          candidateId: candidate.id,
          status: { in: Array.from(activeApplicationStatuses) as any },
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (existingActiveApplication) {
        throw new ApiError(
          400,
          "Bạn chỉ có thể ứng tuyển một vị trí tại một thời điểm.",
          "ACTIVE_APPLICATION_EXISTS",
        );
      }

      const fullAddress = [
        candidate.address,
        getJsonName(candidate.ward),
        getJsonName(candidate.province),
      ]
        .filter(
          (v): v is string => typeof v === "string" && v.trim().length > 0,
        )
        .join(", ");

      return tx.jobApplication.create({
        data: {
          candidateId: candidate.id,
          recruitmentJobId: recruitmentJob.id,
          positionId: recruitmentJob.positionId,
          departmentId: recruitmentJob.departmentId,
          candidateAvatar: candidate.avatar,
          candidateName: candidate.fullName,
          candidateEmail: candidate.email,
          candidatePhone: candidate.phone,
          candidateCvUrl: candidate.cvUrl,
          candidateAddress: candidate.address,
          status: JobApplicationStatus.APPLIED,
          coverLetter: data.coverLetter,
          notes: data.notes,
        },
        select: applicationListSelect,
      });
    });

    try {
      const recipientIds = await getRecruitmentNotificationRecipientIds();

      if (recipientIds.length > 0) {
        await notificationService.createForUsers({
          userIds: recipientIds,
          type: NotificationType.RECRUITMENT,
          title: "Có ứng viên mới ứng tuyển",
          message: `${application.candidateName || "Một ứng viên"} vừa ứng tuyển vào vị trí ${application.recruitmentJob?.title || "tuyển dụng"}.`,
          senderId: userId,
          data: {
            kind: "JOB_APPLICATION_CREATED",
            applicationId: application.id,
            recruitmentJobId: application.recruitmentJob?.id,
            candidateId: application.candidateId,
            positionId: application.position?.id,
            departmentId: application.department?.id,
          },
        });
      }
    } catch (error) {
      console.error("Failed to create recruitment notification:", error);
    }

    return application;
  },

  async getMyApplications(userId: string) {
    await expirePendingRecruitmentResponses();

    const candidate = await getCandidateByUserId(userId);

    const applications = await prisma.jobApplication.findMany({
      where: { candidateId: candidate.id },
      select: applicationListSelect,
      orderBy: { appliedAt: "desc" },
    });

    return {
      items: applications,
    };
  },

  async getApplications(filters: ApplicationListFilters) {
    await expirePendingRecruitmentResponses();

    const normalizedSearch = filters.search?.trim() ?? "";
    const conditions: Prisma.JobApplicationWhereInput[] = [];

    if (filters.status) {
      conditions.push({ status: filters.status });
    }

    if (filters.positionId) {
      conditions.push({ positionId: filters.positionId });
    }

    if (filters.recruitmentJobId) {
      conditions.push({ recruitmentJobId: filters.recruitmentJobId });
    }

    if (normalizedSearch) {
      conditions.push({
        OR: [
          {
            candidate: {
              OR: [
                {
                  fullName: { contains: normalizedSearch, mode: "insensitive" },
                },
                { email: { contains: normalizedSearch, mode: "insensitive" } },
              ],
            },
          },
          {
            recruitmentJob: {
              OR: [
                { title: { contains: normalizedSearch, mode: "insensitive" } },
                {
                  description: {
                    contains: normalizedSearch,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
          {
            position: {
              OR: [
                { name: { contains: normalizedSearch, mode: "insensitive" } },
                { code: { contains: normalizedSearch, mode: "insensitive" } },
              ],
            },
          },
        ],
      });
    }

    const where: Prisma.JobApplicationWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};

    const [items, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        select: applicationListSelect,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { appliedAt: "desc" },
      }),
      prisma.jobApplication.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  },

  async getApplicationById(id: string) {
    return this.getApplicationByIdWithDetail(id);
  },

  async getApplicationByIdForCandidate(id: string, candidateUserId: string) {
    await expirePendingRecruitmentResponses();

    const { application } = await ensureApplicationOwner(id, candidateUserId);
    return application;
  },

  async getApplicationByIdWithDetail(id: string) {
    await expirePendingRecruitmentResponses();

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: applicationDetailInclude,
    });

    if (!application) {
      throw new ApiError(
        404,
        "Job application not found",
        "JOB_APPLICATION_NOT_FOUND",
      );
    }

    return application;
  },

  async getInterviewScheduleById(applicationId: string, scheduleId: string) {
    await expirePendingRecruitmentResponses();

    const schedule = await prisma.interviewSchedule.findFirst({
      where: {
        id: scheduleId,
        jobApplicationId: applicationId,
      },
    });

    if (!schedule) {
      throw new ApiError(
        404,
        "Interview schedule not found",
        "INTERVIEW_SCHEDULE_NOT_FOUND",
      );
    }

    return schedule;
  },

  async getInterviewScheduleByIdForCandidate(
    applicationId: string,
    scheduleId: string,
    candidateUserId: string,
  ) {
    await ensureApplicationOwner(applicationId, candidateUserId);

    return this.getInterviewScheduleById(applicationId, scheduleId);
  },

  async getEvaluationById(applicationId: string, evaluationId: string) {
    const evaluation = await prisma.interviewEvaluation.findFirst({
      where: {
        id: evaluationId,
        jobApplicationId: applicationId,
      },
      include: {
        evaluator: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!evaluation) {
      throw new ApiError(
        404,
        "Interview evaluation not found",
        "INTERVIEW_EVALUATION_NOT_FOUND",
      );
    }

    return evaluation;
  },

  async getEvaluationByIdForCandidate(
    applicationId: string,
    evaluationId: string,
    candidateUserId: string,
  ) {
    await ensureApplicationOwner(applicationId, candidateUserId);

    return this.getEvaluationById(applicationId, evaluationId);
  },

  async scheduleInterview(
    applicationId: string,
    actorUserId: string,
    data: InterviewScheduleInput,
  ) {
    const application = await this.getApplicationByIdWithDetail(applicationId);

    // Chỉ cho phép lên lịch phỏng vấn nếu đơn đang ở trạng thái "Đã nộp" hoặc "Đang phỏng vấn"
    if (
      application.status !== JobApplicationStatus.APPLIED &&
      application.status !== JobApplicationStatus.INTERVIEWING
    ) {
      throw new ApiError(
        400,
        "Interview can only be scheduled for applications in Applied or Interviewing status",
        "INVALID_APPLICATION_STATUS",
      );
    }

    let createdByEmployeeId: string | null = null;

    // Try to find employee profile for the actor using findUnique (userId is unique)
    try {
      const employee = await prisma.employee.findUnique({
        where: { userId: actorUserId },
        select: { id: true },
      });
      createdByEmployeeId = employee?.id ?? null;
    } catch (e) {
      // Silently ignore employee lookup error - createdByEmployeeId stays null
    }

    return prisma.$transaction(async (tx) => {
      const updatedSchedule = await tx.interviewSchedule.create({
        data: {
          jobApplicationId: applicationId,
          title: data.title,
          scheduledAt: data.scheduledAt,
          type: data.type,
          location: data.location,
          interviewerNotes: data.interviewerNotes,
          createdByEmployeeId,
          status: InterviewScheduleStatus.INVITED,
        },
      });

      await tx.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: JobApplicationStatus.INTERVIEWING,
        },
      });

      // Send interview invitation email to candidate
      try {
        await sendInterviewInvitationEmail(
          application.candidateEmail!,
          application.candidateName || "Ứng viên",
          data.title,
          (application as any).position?.name || "Vị trí",
          data.scheduledAt,
          data.location,
        );
      } catch (emailError) {
        // Log email error but don't fail the schedule creation
        console.error("Failed to send interview invitation email:", emailError);
      }

      return {
        interviewSchedule: updatedSchedule,
      };
    });
  },

  // Ứng viên phản hồi lịch phỏng vấn, yêu cầu applicationId, scheduleId, candidateUserId và dữ liệu phản hồi
  async respondToInterview(
    applicationId: string,
    scheduleId: string,
    candidateUserId: string,
    data: InterviewResponseInput,
  ) {
    await expirePendingRecruitmentResponses();

    await ensureApplicationOwner(applicationId, candidateUserId);

    const schedule = await prisma.interviewSchedule.findFirst({
      where: {
        id: scheduleId,
        jobApplicationId: applicationId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!schedule) {
      throw new ApiError(
        404,
        "Interview schedule not found",
        "INTERVIEW_SCHEDULE_NOT_FOUND",
      );
    }

    if (schedule.status !== InterviewScheduleStatus.INVITED) {
      throw new ApiError(
        400,
        "Interview has already been responded to",
        "INTERVIEW_ALREADY_RESPONDED",
      );
    }

    //Chỉ cho phép ứng viên phản hồi nếu đơn đang ở trạng thái "Đang phỏng vấn" và lịch phỏng vấn đang ở trạng thái "Đã mời"
    const application = await this.getApplicationByIdWithDetail(applicationId);
    if (application.status !== JobApplicationStatus.INTERVIEWING) {
      throw new ApiError(
        400,
        "Interview can only be responded to for applications in Interviewing status",
        "INVALID_APPLICATION_STATUS",
      );
    }

    return prisma.$transaction(async (tx) => {
      const updatedSchedule = await tx.interviewSchedule.update({
        where: { id: scheduleId },
        data: {
          status: data.decision,
          candidateResponseAt: new Date(),
          candidateResponseNote: data.note,
        },
      });

      return {
        interviewSchedule: updatedSchedule,
      };
    });
  },

  // Đánh giá phỏng vấn, yêu cầu applicationId, evaluatorUserId và dữ liệu đánh giá
  async submitEvaluation(
    applicationId: string,
    evaluatorUserId: string,
    data: InterviewEvaluationInput,
  ) {
    const application = await this.getApplicationByIdWithDetail(applicationId);
    const employee = await prisma.employee.findUnique({
      where: { userId: evaluatorUserId },
      select: { id: true },
    });

    if (!employee) {
      throw new ApiError(
        404,
        "Employee profile not found",
        "EMPLOYEE_NOT_FOUND",
      );
    }

    // Chỉ cho phép đánh giá nếu đơn đang ở trạng thái "Đang phỏng vấn"
    if (application.status !== JobApplicationStatus.INTERVIEWING) {
      throw new ApiError(
        400,
        "Interview evaluation can only be submitted for applications in Interviewing status",
        "INVALID_APPLICATION_STATUS",
      );
    }

    return prisma.$transaction(async (tx) => {
      const evaluation = await tx.interviewEvaluation.create({
        data: {
          jobApplicationId: applicationId,
          title: data.title,
          evaluatorEmployeeId: employee.id,
          score: data.score,
          strengths: data.strengths,
          concerns: data.concerns,
          recommendation: data.recommendation,
          comments: data.comments,
        },
      });

      return {
        evaluation: {
          ...evaluation,
          evaluator: employee,
        },
      };
    });
  },

  // Cập nhật đánh giá phỏng vấn, yêu cầu applicationId, evaluationId, evaluatorUserId và dữ liệu cập nhật
  async updateEvaluation(
    applicationId: string,
    evaluationId: string,
    evaluatorUserId: string,
    data: InterviewEvaluationUpdateInput,
  ) {
    const application = await this.getApplicationByIdWithDetail(applicationId);
    const employee = await prisma.employee.findUnique({
      where: { userId: evaluatorUserId },
      select: { id: true },
    });

    if (!employee) {
      throw new ApiError(
        404,
        "Employee profile not found",
        "EMPLOYEE_NOT_FOUND",
      );
    }

    // Chỉ cho phép cập nhật đánh giá nếu đơn đang ở trạng thái "Đang phỏng vấn" và đánh giá thuộc về người đánh giá
    if (application.status !== JobApplicationStatus.INTERVIEWING) {
      throw new ApiError(
        400,
        "Interview evaluation can only be updated for applications in Interviewing status",
        "INVALID_APPLICATION_STATUS",
      );
    }

    const evaluation = await prisma.interviewEvaluation.findFirst({
      where: {
        id: evaluationId,
        jobApplicationId: applicationId,
        evaluatorEmployeeId: employee.id,
      },
    });

    if (!evaluation) {
      throw new ApiError(
        404,
        "Interview evaluation not found",
        "INTERVIEW_EVALUATION_NOT_FOUND",
      );
    }

    const updatedEvaluation = await prisma.interviewEvaluation.update({
      where: { id: evaluationId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.score !== undefined ? { score: data.score } : {}),
        ...(data.strengths !== undefined ? { strengths: data.strengths } : {}),
        ...(data.concerns !== undefined ? { concerns: data.concerns } : {}),
        ...(data.recommendation !== undefined
          ? { recommendation: data.recommendation }
          : {}),
        ...(data.comments !== undefined ? { comments: data.comments } : {}),
      },
    });

    return updatedEvaluation;
  },

  // Xóa đánh giá phỏng vấn, yêu cầu applicationId, evaluationId và evaluatorUserId
  async deleteEvaluation(
    applicationId: string,
    evaluationId: string,
    evaluatorUserId: string,
  ) {
    const application = await this.getApplicationByIdWithDetail(applicationId);
    const employee = await prisma.employee.findUnique({
      where: { userId: evaluatorUserId },
      select: { id: true },
    });

    if (!employee) {
      throw new ApiError(
        404,
        "Employee profile not found",
        "EMPLOYEE_NOT_FOUND",
      );
    }

    // Chỉ cho phép xóa đánh giá nếu đơn đang ở trạng thái "Đang phỏng vấn" và đánh giá thuộc về người xóa
    if (application.status !== JobApplicationStatus.INTERVIEWING) {
      throw new ApiError(
        400,
        "Interview evaluation can only be deleted for applications in Interviewing status",
        "INVALID_APPLICATION_STATUS",
      );
    }

    const evaluation = await prisma.interviewEvaluation.findFirst({
      where: {
        id: evaluationId,
        jobApplicationId: applicationId,
        evaluatorEmployeeId: employee.id,
      },
    });

    if (!evaluation) {
      throw new ApiError(
        404,
        "Interview evaluation not found or you don't have permission to delete it",
        "INTERVIEW_EVALUATION_NOT_FOUND",
      );
    }

    await prisma.interviewEvaluation.delete({
      where: { id: evaluationId },
    });

    return { message: "Interview evaluation deleted successfully" };
  },

  async cancelApplication(applicationId: string, candidateUserId: string) {
    const { candidate, application } = await ensureApplicationOwner(
      applicationId,
      candidateUserId,
    );

    if (isApplicationFinal(application.status)) {
      throw new ApiError(
        400,
        "Cannot cancel an application that is rejected or onboarded",
        "APPLICATION_CANNOT_CANCEL",
      );
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: JobApplicationStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: applicationInclude,
    });

    return {
      application: updatedApplication,
    };
  },

  // Reject ứng viên, yêu cầu applicationId
  async rejectApplication(applicationId: string) {
    const application = await this.getApplicationByIdWithDetail(applicationId);

    if (isApplicationFinal(application.status)) {
      throw new ApiError(
        400,
        "Application is already in a final state",
        "APPLICATION_ALREADY_FINAL",
      );
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: JobApplicationStatus.REJECTED,
        rejectedAt: new Date(),
      },
      include: applicationInclude,
    });

    return updatedApplication;
  },

  // Gửi offer cho ứng viên, yêu cầu applicationId và dữ liệu offer
  async sendOffer(applicationId: string, data: OfferInput) {
    await expirePendingRecruitmentResponses();

    const application = await this.getApplicationByIdWithDetail(applicationId);

    if (isApplicationFinal(application.status)) {
      throw new ApiError(
        400,
        "Cannot send offer for an application that is rejected or onboarded",
        "APPLICATION_CANNOT_SEND_OFFER",
      );
    }

    const department = await prisma.department.findUnique({
      where: { id: data.departmentId },
      select: { id: true },
    });

    if (!department) {
      throw new ApiError(404, "Department not found", "DEPARTMENT_NOT_FOUND");
    }

    return prisma.$transaction(async (tx) => {
      const offer = await tx.offer.create({
        data: {
          jobApplicationId: applicationId,
          departmentId: data.departmentId,
          proposedSalary: data.proposedSalary,
          proposedHireDate: data.proposedHireDate,
          notes: data.notes,
          status: OfferStatus.SENT,
        },
      });

      await tx.jobApplication.update({
        where: { id: applicationId },
        data: {
          departmentId: data.departmentId,
          status: JobApplicationStatus.OFFER_SENT,
        },
      });

      // Send offer email (best-effort)
      try {
        await sendOfferEmail(
          application.candidateEmail!,
          application.candidateName || "Ứng viên",
          (application as any).position?.name || "Vị trí",
          data.proposedSalary,
          data.proposedHireDate,
        );
      } catch (emailError) {
        console.error("Failed to send offer email:", emailError);
      }

      return {
        offer,
      };
    });
  },

  // Ứng viên phản hồi về offer đã nhận được, có thể chấp nhận hoặc từ chối
  async respondToOffer(
    applicationId: string,
    candidateUserId: string,
    data: {
      decision: "ACCEPTED" | "DECLINED";
      note?: string;
    },
  ) {
    await expirePendingRecruitmentResponses();

    const { candidate, application } = await ensureApplicationOwner(
      applicationId,
      candidateUserId,
    );

    if (application.status !== JobApplicationStatus.OFFER_SENT) {
      throw new ApiError(
        400,
        "Offer is not available for response",
        "OFFER_NOT_AVAILABLE",
      );
    }

    // Find latest SENT offer for this application
    const offer = await prisma.offer.findFirst({
      where: { jobApplicationId: applicationId, status: OfferStatus.SENT },
      orderBy: { createdAt: "desc" },
    });

    if (!offer) {
      throw new ApiError(404, "Offer not found", "OFFER_NOT_FOUND");
    }

    if (data.decision === OfferStatus.DECLINED) {
      const updatedOffer = await prisma.offer.update({
        where: { id: offer.id },
        data: {
          status: OfferStatus.DECLINED,
          candidateNote: data.note ?? null,
        },
      });

      const updatedApplication = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: JobApplicationStatus.OFFER_DECLINED,
          notes: data.note,
        },
        include: applicationInclude,
      });

      return {
        application: updatedApplication,
      };
    }

    // ACCEPT
    if (
      !offer.departmentId ||
      !offer.proposedSalary ||
      !offer.proposedHireDate
    ) {
      throw new ApiError(
        400,
        "Offer terms are incomplete",
        "OFFER_TERMS_INCOMPLETE",
      );
    }

    const candidateProfile = await getCandidateByUserId(candidateUserId);

    if (!candidateProfile.fullName) {
      throw new ApiError(
        400,
        "Candidate profile is incomplete",
        "CANDIDATE_PROFILE_INCOMPLETE",
      );
    }

    const employee = await employeeService.createFromCandidate({
      candidateId: candidateProfile.id,
      userId: candidateProfile.userId,
      name: candidateProfile.fullName,
      email: candidateProfile.email,
      phone: candidateProfile.phone ?? undefined,
      avatar: candidateProfile.avatar ?? undefined,
      dateOfBirth: candidateProfile.dateOfBirth ?? undefined,
      address: candidateProfile.address ?? undefined,
      departmentId: offer.departmentId,
      positionId: application.positionId,
      hireDate: offer.proposedHireDate!,
      salary: Number(offer.proposedSalary),
    });

    const updatedOffer = await prisma.offer.update({
      where: { id: offer.id },
      data: { status: OfferStatus.ACCEPTED },
    });

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: JobApplicationStatus.ONBOARDED,
        onboardedAt: new Date(),
        notes: data.note,
      },
      include: applicationInclude,
    });

    return {
      candidate,
      application: updatedApplication,
      employee,
      offer: updatedOffer,
    };
  },

  // Lấy thông tin tổng quan về pipeline tuyển dụng,
  // bao gồm số lượng ứng viên theo trạng thái, theo vị trí và theo công việc tuyển dụng
  async getPipeline() {
    await expirePendingRecruitmentResponses();

    const applications = await prisma.jobApplication.findMany({
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        recruitmentJob: {
          include: recruitmentJobInclude,
        },
        position: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    const countsByStatus = Object.values(JobApplicationStatus).reduce(
      (accumulator, status) => {
        accumulator[status] = 0;
        return accumulator;
      },
      {} as Record<JobApplicationStatus, number>,
    );

    for (const application of applications) {
      countsByStatus[application.status] += 1;
    }

    const byPosition = applications.reduce(
      (accumulator, application) => {
        const key = application.positionId;
        const current = accumulator.get(key) || {
          positionId: application.positionId,
          position: application.position,
          total: 0,
          statuses: Object.values(JobApplicationStatus).reduce(
            (statusAccumulator, status) => {
              statusAccumulator[status] = 0;
              return statusAccumulator;
            },
            {} as Record<JobApplicationStatus, number>,
          ),
        };

        current.total += 1;
        current.statuses[application.status] += 1;
        accumulator.set(key, current);
        return accumulator;
      },
      new Map<
        string,
        {
          positionId: string;
          position: { id: string; name: string; code: string | null };
          total: number;
          statuses: Record<JobApplicationStatus, number>;
        }
      >(),
    );

    const byRecruitmentJob = applications.reduce(
      (accumulator, application) => {
        if (!application.recruitmentJobId || !application.recruitmentJob) {
          return accumulator;
        }

        const key = application.recruitmentJobId;
        const current = accumulator.get(key) || {
          recruitmentJobId: application.recruitmentJobId,
          recruitmentJob: application.recruitmentJob,
          total: 0,
          statuses: Object.values(JobApplicationStatus).reduce(
            (statusAccumulator, status) => {
              statusAccumulator[status] = 0;
              return statusAccumulator;
            },
            {} as Record<JobApplicationStatus, number>,
          ),
        };

        current.total += 1;
        current.statuses[application.status] += 1;
        accumulator.set(key, current);
        return accumulator;
      },
      new Map<
        string,
        {
          recruitmentJobId: string;
          recruitmentJob: Prisma.RecruitmentJobGetPayload<{
            include: typeof recruitmentJobInclude;
          }>;
          total: number;
          statuses: Record<JobApplicationStatus, number>;
        }
      >(),
    );

    return {
      totalApplications: applications.length,
      countsByStatus,
      byPosition: Array.from(byPosition.values()),
      byRecruitmentJob: Array.from(byRecruitmentJob.values()),
      recentApplications: applications.slice(0, 10),
    };
  },
};
