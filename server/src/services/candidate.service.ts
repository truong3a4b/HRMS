import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { recruitmentService } from "./recruitment.service";

type CandidateListFilters = {
  page: number;
  limit: number;
  search?: string;
};

const candidateListSelect = {
  id: true,
  userId: true,
  fullName: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
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
  employee: {
    select: {
      id: true,
      employeeId: true,
      status: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      position: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
} as const;

const candidateDetailSelect = {
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
  employee: {
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      position: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
  applications: {
    orderBy: { appliedAt: "desc" as const },
    select: {
      id: true,
      status: true,
      appliedAt: true,
      updatedAt: true,
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
    },
  },
} as const;

export const candidateService = {
  async getCandidates(filters: CandidateListFilters) {
    const normalizedSearch = filters.search?.trim() ?? "";

    const where: Prisma.CandidateWhereInput = normalizedSearch
      ? {
          OR: [
            { fullName: { contains: normalizedSearch, mode: "insensitive" } },
            { email: { contains: normalizedSearch, mode: "insensitive" } },
            { phone: { contains: normalizedSearch, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        select: candidateListSelect,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.candidate.count({ where }),
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

  async getCandidateById(id: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      select: candidateDetailSelect,
    });

    if (!candidate) {
      throw new ApiError(404, "Candidate not found", "CANDIDATE_NOT_FOUND");
    }

    return candidate;
  },

  getMyProfile(userId: string) {
    return recruitmentService.getMyProfile(userId);
  },

  updateMyProfile(
    userId: string,
    data: Parameters<typeof recruitmentService.updateMyProfile>[1],
  ) {
    return recruitmentService.updateMyProfile(userId, data);
  },

  getMyApplications(userId: string) {
    return recruitmentService.getMyApplications(userId);
  },
};
