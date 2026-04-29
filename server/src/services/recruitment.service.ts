import {
  JobApplicationStatus,
  InterviewScheduleStatus,
  Prisma,
  RecruitmentJobStatus,
} from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { employeeService } from "./employee.service";
import { ApiError } from "../utils/apiError";

type CandidateProfileInput = {
  fullName?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  avatar?: string;
  cvUrl?: string;
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
  salaryMin?: number;
  salaryMax?: number;
  quantity: number;
  deadline?: Date;
  status?: RecruitmentJobStatus;
};

type RecruitmentJobUpdateInput = Partial<RecruitmentJobInput>;

type InterviewScheduleInput = {
  scheduledAt: Date;
  location?: string;
  meetingLink?: string;
  interviewerNotes?: string;
};

type InterviewResponseInput = {
  decision: InterviewScheduleStatus;
  note?: string;
};

type InterviewEvaluationInput = {
  interviewScheduleId: string;
  score?: number;
  strengths?: string;
  concerns?: string;
  recommendation?: string;
  comments?: string;
};

type ApplicationDecisionInput = {
  decision: JobApplicationStatus;
  notes?: string;
};

type OfferInput = {
  departmentId: string;
  proposedSalary: number;
  proposedHireDate: Date;
  notes?: string;
};

type OfferResponseInput = {
  decision: JobApplicationStatus;
  note?: string;
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
};

const candidateProfileSelect = {
  id: true,
  userId: true,
  fullName: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  address: true,
  avatar: true,
  cvUrl: true,
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
      role: true,
    },
  },
} satisfies Prisma.RecruitmentJobInclude;

const candidateSummarySelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  avatar: true,
} as const;

const applicationListSelect = {
  id: true,
  status: true,
  appliedAt: true,
  updatedAt: true,
  candidate: {
    select: candidateSummarySelect,
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
  recruitmentJob: {
    select: {
      id: true,
      title: true,
      status: true,
      deadline: true,
    },
  },
  interviewSchedules: {
    orderBy: { scheduledAt: "desc" as const },
    take: 1,
    select: {
      id: true,
      status: true,
      scheduledAt: true,
      location: true,
      meetingLink: true,
      createdAt: true,
    },
  },
} satisfies Prisma.JobApplicationSelect;

const applicationDetailInclude = {
  candidate: {
    select: candidateProfileSelect,
  },
  recruitmentJob: {
    include: recruitmentJobInclude,
  },
  position: true,
  department: true,
  interviewSchedules: {
    orderBy: { scheduledAt: "desc" as const },
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      evaluations: {
        include: {
          evaluator: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  },
  evaluations: {
    orderBy: { createdAt: "desc" as const },
    include: {
      interviewSchedule: true,
      evaluator: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  },
} satisfies Prisma.JobApplicationInclude;

const activeApplicationStatuses = new Set<JobApplicationStatus>([
  JobApplicationStatus.APPLIED,
  JobApplicationStatus.INTERVIEW_INVITED,
  JobApplicationStatus.INTERVIEW_CONFIRMED,
  JobApplicationStatus.INTERVIEW_COMPLETED,
  JobApplicationStatus.APPROVED,
  JobApplicationStatus.OFFER_SENT,
  JobApplicationStatus.OFFER_ACCEPTED,
]);

const finalApplicationStatuses = new Set<JobApplicationStatus>([
  JobApplicationStatus.REJECTED,
  JobApplicationStatus.INTERVIEW_DECLINED,
  JobApplicationStatus.OFFER_DECLINED,
  JobApplicationStatus.ONBOARDED,
]);

const isApplicationActive = (status: JobApplicationStatus) =>
  activeApplicationStatuses.has(status);

const isApplicationFinal = (status: JobApplicationStatus) =>
  finalApplicationStatuses.has(status);

const isRecruitmentJobExpired = (deadline: Date | null | undefined) =>
  !!deadline && deadline.getTime() < Date.now();

const applicationInclude = applicationDetailInclude;

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

const getApplicationOrThrow = async (id: string) => {
  const application = await prisma.jobApplication.findUnique({
    where: { id },
    include: applicationInclude,
  });

  if (!application) {
    throw new ApiError(
      404,
      "Job application not found",
      "JOB_APPLICATION_NOT_FOUND",
    );
  }

  return application;
};

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

export const recruitmentService = {
  async getJobs(filters: RecruitmentJobListFilters) {
    const normalizedSearch = filters.search?.trim() ?? "";
    const conditions: Prisma.RecruitmentJobWhereInput[] = [
      { status: RecruitmentJobStatus.OPEN },
    ];

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

  async getJobById(id: string) {
    const recruitmentJob = await prisma.recruitmentJob.findFirst({
      where: {
        id,
        status: RecruitmentJobStatus.OPEN,
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

    return recruitmentJob;
  },

  async createJob(userId: string, data: RecruitmentJobInput) {
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
        createdById: userId,
      },
      include: recruitmentJobInclude,
    });
  },

  async updateJob(id: string, data: RecruitmentJobUpdateInput) {
    const recruitmentJob = await getRecruitmentJobOrThrow(id);

    ensureRecruitmentJobEditable(recruitmentJob);

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
        ...data,
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

    return prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.upsert({
        where: { userId },
        create: {
          userId,
          email: user.email,
          fullName: data.fullName,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          avatar: data.avatar,
          cvUrl: data.cvUrl,
        },
        update: {
          email: user.email,
          ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
          ...(data.phone !== undefined ? { phone: data.phone } : {}),
          ...(data.dateOfBirth !== undefined
            ? { dateOfBirth: data.dateOfBirth }
            : {}),
          ...(data.address !== undefined ? { address: data.address } : {}),
          ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
          ...(data.cvUrl !== undefined ? { cvUrl: data.cvUrl } : {}),
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
          status: { in: Array.from(activeApplicationStatuses) },
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

      return tx.jobApplication.create({
        data: {
          candidateId: candidate.id,
          recruitmentJobId: recruitmentJob.id,
          positionId: recruitmentJob.positionId,
          departmentId: recruitmentJob.departmentId,
          status: JobApplicationStatus.APPLIED,
          coverLetter: data.coverLetter,
          notes: data.notes,
        },
        select: applicationListSelect,
      });
    });
  },

  async getMyApplications(userId: string) {
    const candidate = await getCandidateByUserId(userId);

    const applications = await prisma.jobApplication.findMany({
      where: { candidateId: candidate.id },
      select: applicationListSelect,
      orderBy: { appliedAt: "desc" },
    });

    return {
      currentApplication:
        applications.find((application) =>
          isApplicationActive(application.status),
        ) ?? null,
      history: applications.filter(
        (application) => !isApplicationActive(application.status),
      ),
      applications,
    };
  },

  async getApplications(filters: ApplicationListFilters) {
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
    return getApplicationOrThrow(id);
  },

  async getApplicationByIdWithDetail(id: string) {
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

  async scheduleInterview(
    applicationId: string,
    actorUserId: string,
    data: InterviewScheduleInput,
  ) {
    const application = await getApplicationOrThrow(applicationId);

    if (isApplicationFinal(application.status)) {
      throw new ApiError(
        400,
        "Application is already in a final state",
        "APPLICATION_ALREADY_FINAL",
      );
    }

    return prisma.$transaction(async (tx) => {
      const updatedSchedule = await tx.interviewSchedule.create({
        data: {
          jobApplicationId: applicationId,
          scheduledAt: data.scheduledAt,
          location: data.location,
          meetingLink: data.meetingLink,
          interviewerNotes: data.interviewerNotes,
          createdByUserId: actorUserId,
          status: InterviewScheduleStatus.INVITED,
        },
      });

      const updatedApplication = await tx.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: JobApplicationStatus.INTERVIEW_INVITED,
        },
        include: applicationInclude,
      });

      return {
        application: updatedApplication,
        interviewSchedule: updatedSchedule,
      };
    });
  },

  async respondToInterview(
    applicationId: string,
    scheduleId: string,
    candidateUserId: string,
    data: InterviewResponseInput,
  ) {
    const { candidate } = await ensureApplicationOwner(
      applicationId,
      candidateUserId,
    );

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

    const nextApplicationStatus =
      data.decision === InterviewScheduleStatus.CONFIRMED
        ? JobApplicationStatus.INTERVIEW_CONFIRMED
        : JobApplicationStatus.INTERVIEW_DECLINED;

    return prisma.$transaction(async (tx) => {
      await tx.interviewSchedule.update({
        where: { id: scheduleId },
        data: {
          status: data.decision,
          candidateResponseAt: new Date(),
          candidateResponseNote: data.note,
        },
      });

      const updatedApplication = await tx.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: nextApplicationStatus,
        },
        include: applicationInclude,
      });

      return {
        candidate,
        application: updatedApplication,
      };
    });
  },

  async submitEvaluation(
    applicationId: string,
    evaluatorUserId: string,
    data: InterviewEvaluationInput,
  ) {
    await getApplicationOrThrow(applicationId);

    const schedule = await prisma.interviewSchedule.findFirst({
      where: {
        id: data.interviewScheduleId,
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

    if (
      !new Set<InterviewScheduleStatus>([
        InterviewScheduleStatus.CONFIRMED,
        InterviewScheduleStatus.COMPLETED,
      ]).has(schedule.status)
    ) {
      throw new ApiError(
        400,
        "Interview must be confirmed before evaluation",
        "INTERVIEW_NOT_READY_FOR_EVALUATION",
      );
    }

    return prisma.$transaction(async (tx) => {
      const evaluation = await tx.interviewEvaluation.create({
        data: {
          jobApplicationId: applicationId,
          interviewScheduleId: data.interviewScheduleId,
          evaluatorUserId,
          score: data.score,
          strengths: data.strengths,
          concerns: data.concerns,
          recommendation: data.recommendation,
          comments: data.comments,
        },
      });

      await tx.interviewSchedule.update({
        where: { id: data.interviewScheduleId },
        data: {
          status: InterviewScheduleStatus.COMPLETED,
        },
      });

      const updatedApplication = await tx.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: JobApplicationStatus.INTERVIEW_COMPLETED,
        },
        include: applicationInclude,
      });

      return {
        application: updatedApplication,
        evaluation,
      };
    });
  },

  async decideApplication(
    applicationId: string,
    data: ApplicationDecisionInput,
  ) {
    const application = await getApplicationOrThrow(applicationId);

    if (application.status === JobApplicationStatus.ONBOARDED) {
      throw new ApiError(
        400,
        "Application is already onboarded",
        "APPLICATION_ALREADY_ONBOARDED",
      );
    }

    if (data.decision === JobApplicationStatus.REJECTED) {
      const updatedApplication = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: JobApplicationStatus.REJECTED,
          rejectedAt: new Date(),
          notes: data.notes,
        },
        include: applicationInclude,
      });

      return updatedApplication;
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: JobApplicationStatus.APPROVED,
        notes: data.notes,
      },
      include: applicationInclude,
    });

    return updatedApplication;
  },

  async sendOffer(applicationId: string, data: OfferInput) {
    const application = await getApplicationOrThrow(applicationId);

    if (
      !new Set<JobApplicationStatus>([
        JobApplicationStatus.APPLIED,
        JobApplicationStatus.APPROVED,
        JobApplicationStatus.INTERVIEW_COMPLETED,
      ]).has(application.status)
    ) {
      throw new ApiError(
        400,
        "Application is not ready for offer",
        "APPLICATION_NOT_READY_FOR_OFFER",
      );
    }

    const department = await prisma.department.findUnique({
      where: { id: data.departmentId },
      select: { id: true },
    });

    if (!department) {
      throw new ApiError(404, "Department not found", "DEPARTMENT_NOT_FOUND");
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        departmentId: data.departmentId,
        proposedSalary: data.proposedSalary,
        proposedHireDate: data.proposedHireDate,
        notes: data.notes,
        status: JobApplicationStatus.OFFER_SENT,
        offerSentAt: new Date(),
      },
      include: applicationInclude,
    });

    return updatedApplication;
  },

  async respondToOffer(
    applicationId: string,
    candidateUserId: string,
    data: OfferResponseInput,
  ) {
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

    if (data.decision === JobApplicationStatus.OFFER_DECLINED) {
      const updatedApplication = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: JobApplicationStatus.OFFER_DECLINED,
          offerRespondedAt: new Date(),
          notes: data.note,
        },
        include: applicationInclude,
      });

      return {
        candidate,
        application: updatedApplication,
      };
    }

    if (
      !application.departmentId ||
      !application.proposedSalary ||
      !application.proposedHireDate
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
      departmentId: application.departmentId,
      positionId: application.positionId,
      hireDate: application.proposedHireDate,
      salary: Number(application.proposedSalary),
    });

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: JobApplicationStatus.ONBOARDED,
        offerRespondedAt: new Date(),
        onboardedAt: new Date(),
        notes: data.note,
      },
      include: applicationInclude,
    });

    return {
      candidate,
      application: updatedApplication,
      employee,
    };
  },

  async getPipeline() {
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
