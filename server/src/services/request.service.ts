import {
  ApprovalMode,
  Prisma,
  RequestApprovalStatus,
  RequestStatus,
  RequestType,
  UserRole,
} from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { applyScheduleAssignments } from "./schedule-assignment.service";
import { ApiError } from "../utils/apiError";

const userSummarySelect = {
  id: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

const requestInclude = {
  requester: {
    select: userSummarySelect,
  },
  approvals: {
    include: {
      approver: {
        select: userSummarySelect,
      },
    },
  },
  watchers: {
    include: {
      user: {
        select: userSummarySelect,
      },
    },
  },
  leaveRequest: true,
} satisfies Prisma.RequestInclude;

export type RequestWithDetails = Prisma.RequestGetPayload<{
  include: typeof requestInclude;
}>;

export type RequestListScope =
  | "all"
  | "mine"
  | "watching"
  | "pending"
  | "assigned";

export type RequestListFilters = {
  page: number;
  limit: number;
  status?: RequestStatus;
  type?: RequestType;
  approvalMode?: ApprovalMode;
  scope?: RequestListScope;
  search?: string;
};

export type CreateRequestInput = {
  type: RequestType;
  title: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

export type ReviewDecisionInput = {
  decision: RequestApprovalStatus;
  note?: string;
};

const finalRequestStatuses = new Set<RequestStatus>([
  RequestStatus.REJECTED,
  RequestStatus.CANCELLED,
  RequestStatus.COMPLETED,
]);

const normalizeIds = (values: string[]) =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))].filter(
    Boolean,
  );

const ensureUsersExist = async (userIds: string[]) => {
  if (userIds.length === 0) {
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
    },
  });

  const foundUserIds = new Set(users.map((user) => user.id));
  const missingUserIds = userIds.filter((userId) => !foundUserIds.has(userId));

  if (missingUserIds.length > 0) {
    throw new ApiError(400, `User not found: ${missingUserIds.join(", ")}`);
  }
};

const sortApprovals = (request: RequestWithDetails) => ({
  ...request,
  approvals: [...request.approvals].sort(
    (left, right) => left.stepOrder - right.stepOrder,
  ),
});

const buildAccessCondition = (
  userId: string,
  scope: RequestListScope | undefined,
  isAdmin: boolean,
): Prisma.RequestWhereInput | undefined => {
  if (isAdmin && (!scope || scope === "all")) {
    return undefined;
  }

  if (scope === "mine") {
    return { requesterId: userId };
  }

  if (scope === "watching") {
    return { watchers: { some: { userId } } };
  }

  if (scope === "pending") {
    return {
      approvals: {
        some: {
          approverId: userId,
          status: RequestApprovalStatus.PENDING,
        },
      },
    };
  }

  if (scope === "assigned") {
    return { approvals: { some: { approverId: userId } } };
  }

  if (isAdmin) {
    return undefined;
  }

  return {
    OR: [
      { requesterId: userId },
      { watchers: { some: { userId } } },
      { approvals: { some: { approverId: userId } } },
    ],
  };
};

const buildBaseWhere = (
  userId: string,
  role: UserRole,
  filters: RequestListFilters,
): Prisma.RequestWhereInput => {
  const conditions: Prisma.RequestWhereInput[] = [];
  const accessCondition = buildAccessCondition(
    userId,
    filters.scope,
    role === UserRole.ADMIN,
  );

  if (accessCondition) {
    conditions.push(accessCondition);
  }

  if (filters.status) {
    conditions.push({ status: filters.status });
  }

  if (filters.type) {
    conditions.push({ type: filters.type });
  }

  if (filters.approvalMode) {
    conditions.push({ approvalMode: filters.approvalMode });
  }

  if (filters.search) {
    const search = filters.search.trim();

    if (search) {
      conditions.push({
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            requester: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      });
    }
  }

  if (conditions.length === 0) {
    return {};
  }

  return {
    AND: conditions,
  };
};

const getRequestByIdWithDetails = async (requestId: string) => {
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
    include: requestInclude,
  });

  if (!request) {
    throw new ApiError(404, "Request not found", "REQUEST_NOT_FOUND");
  }

  return sortApprovals(request);
};

const assertCanViewRequest = (
  request: RequestWithDetails,
  userId: string,
  isAdmin: boolean,
) => {
  if (isAdmin) {
    return;
  }

  const canView =
    request.requesterId === userId ||
    request.watchers.some((watcher) => watcher.userId === userId) ||
    request.approvals.some((approval) => approval.approverId === userId);

  if (!canView) {
    throw new ApiError(403, "Forbidden");
  }
};

const assertCanActAsApprover = (
  request: RequestWithDetails,
  userId: string,
  isAdmin: boolean,
) => {
  if (isAdmin) {
    return;
  }

  const isAssignedApprover = request.approvals.some(
    (approval) => approval.approverId === userId,
  );

  if (!isAssignedApprover) {
    throw new ApiError(403, "You are not assigned to this request");
  }
};

const assertCanCompleteOrCancel = (
  request: RequestWithDetails,
  userId: string,
  isAdmin: boolean,
) => {
  if (isAdmin || request.requesterId === userId) {
    return;
  }

  throw new ApiError(403, "You can only manage your own request");
};

const updateRequestWithDetails = async (
  requestId: string,
  data: Prisma.RequestUpdateInput,
) => {
  const updatedRequest = await prisma.request.update({
    where: {
      id: requestId,
    },
    data,
    include: requestInclude,
  });

  return sortApprovals(updatedRequest);
};

const getNextSequentialStep = (
  request: RequestWithDetails,
  currentStep: number,
) =>
  request.approvals.find(
    (approval) =>
      approval.stepOrder > currentStep &&
      approval.status === RequestApprovalStatus.PENDING,
  )?.stepOrder ?? null;

export const requestService = {
  async getRequests(
    userId: string,
    role: UserRole,
    filters: RequestListFilters,
  ) {
    const where = buildBaseWhere(userId, role, filters);
    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: requestInclude,
        skip,
        take: filters.limit,
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.request.count({ where }),
    ]);

    return {
      items: items.map(sortApprovals),
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  },

  async getMyRequests(
    userId: string,
    role: UserRole,
    filters: Omit<RequestListFilters, "scope">,
  ) {
    return this.getRequests(userId, role, {
      ...filters,
      scope: "mine",
    });
  },

  async getMyWatchingRequests(
    userId: string,
    role: UserRole,
    filters: Omit<RequestListFilters, "scope">,
  ) {
    return this.getRequests(userId, role, {
      ...filters,
      scope: "watching",
    });
  },

  async getMyPendingApprovals(
    userId: string,
    role: UserRole,
    filters: Omit<RequestListFilters, "scope">,
  ) {
    return this.getRequests(userId, role, {
      ...filters,
      scope: "pending",
    });
  },

  async getRequestById(requestId: string, userId: string, role: UserRole) {
    const request = await getRequestByIdWithDetails(requestId);
    assertCanViewRequest(request, userId, role === UserRole.ADMIN);
    return request;
  },

  async createRequest(userId: string, input: CreateRequestInput) {
    const approverIds = normalizeIds(input.approverIds);
    const watcherIds = normalizeIds(input.watcherIds ?? []);

    if (approverIds.length === 0) {
      throw new ApiError(400, "At least one approver is required");
    }

    if (approverIds.includes(userId) || watcherIds.includes(userId)) {
      throw new ApiError(
        400,
        "Requester cannot be an approver or watcher of the same request",
      );
    }

    await ensureUsersExist([...approverIds, ...watcherIds]);

    const request = await prisma.$transaction(async (tx) => {
      const createdRequest = await tx.request.create({
        data: {
          type: input.type,
          title: input.title,
          description: input.description,
          requesterId: userId,
          approvalMode: input.approvalMode ?? ApprovalMode.PARALLEL,
          status: RequestStatus.PENDING,
          currentStep: 1,
          approvals: {
            create: approverIds.map((approverId, index) => ({
              approverId,
              stepOrder: index + 1,
            })),
          },
          watchers: {
            create: watcherIds.map((watcherId) => ({
              userId: watcherId,
            })),
          },
        },
        include: requestInclude,
      });

      return createdRequest;
    });

    return sortApprovals(request);
  },

  async startReview(requestId: string, userId: string, role: UserRole) {
    const request = await getRequestByIdWithDetails(requestId);
    assertCanActAsApprover(request, userId, role === UserRole.ADMIN);

    if (finalRequestStatuses.has(request.status)) {
      throw new ApiError(
        400,
        "Request is already finished",
        "REQUEST_ALREADY_FINAL",
      );
    }

    const approver = request.approvals.find(
      (approval) => approval.approverId === userId,
    );

    if (!approver) {
      throw new ApiError(403, "You are not assigned to this request");
    }

    if (approver.status !== RequestApprovalStatus.PENDING) {
      throw new ApiError(400, "You have already reviewed this request");
    }

    if (request.status === RequestStatus.PENDING) {
      return updateRequestWithDetails(requestId, {
        status: RequestStatus.PROCESSING,
        processingAt: new Date(),
      });
    }

    return request;
  },

  async decideRequest(
    requestId: string,
    userId: string,
    role: UserRole,
    input: ReviewDecisionInput,
  ) {
    //lấy request, kiểm tra quyền, kiểm tra trạng thái request, kiểm tra xem approver đã review chưa
    const request = await getRequestByIdWithDetails(requestId);
    assertCanActAsApprover(request, userId, role === UserRole.ADMIN);

    // chỉ có thể review khi request chưa ở trạng thái cuối cùng
    if (finalRequestStatuses.has(request.status)) {
      throw new ApiError(
        400,
        "Request is already finished",
        "REQUEST_ALREADY_FINAL",
      );
    }

    // tìm approval của approver đang review
    const approval = request.approvals.find(
      (item) => item.approverId === userId,
    );

    if (!approval) {
      throw new ApiError(403, "You are not assigned to this request");
    }

    if (approval.status !== RequestApprovalStatus.PENDING) {
      throw new ApiError(400, "You have already reviewed this request");
    }

    if (request.status === RequestStatus.PENDING) {
      await prisma.request.update({
        where: {
          id: requestId,
        },
        data: {
          status: RequestStatus.PROCESSING,
          processingAt: new Date(),
        },
      });
    }

    const decidedAt = new Date();

    return prisma.$transaction(async (tx) => {
      // cập nhật quyết định của approver đang review
      await tx.requestApproval.update({
        where: {
          requestId_approverId: {
            requestId,
            approverId: userId,
          },
        },
        data: {
          status: input.decision,
          note: input.note,
          decidedAt,
        },
      });

      // lấy lại request sau khi đã cập nhật quyết định của approver
      const latestRequest = await tx.request.findUnique({
        where: {
          id: requestId,
        },
        include: requestInclude,
      });

      if (!latestRequest) {
        throw new ApiError(404, "Request not found", "REQUEST_NOT_FOUND");
      }

      // sắp xếp approvals theo stepOrder để dễ dàng xử lý tiếp theo
      const sortedApprovals = [...latestRequest.approvals].sort(
        (left, right) => left.stepOrder - right.stepOrder,
      );

      // nếu approver reject thì reject luôn request mà không cần quan tâm đến các approver khác
      if (input.decision === RequestApprovalStatus.REJECTED) {
        const updatedRequest = await tx.request.update({
          where: {
            id: requestId,
          },
          data: {
            status: RequestStatus.REJECTED,
            rejectedAt: decidedAt,
          },
          include: requestInclude,
        });

        return sortApprovals(updatedRequest);
      }

      // nếu approver approve và approval mode là sequential thì cần kiểm tra xem có approver nào tiếp theo không, nếu có thì chuyển request sang approver đó, nếu không có thì approve request
      if (latestRequest.approvalMode === ApprovalMode.SEQUENTIAL) {
        // tìm step tiếp theo có status là pending
        const nextStep = getNextSequentialStep(
          latestRequest,
          approval.stepOrder,
        );

        // nếu có approver tiếp theo thì chuyển request sang approver đó, nếu không có approver tiếp theo nào thì approve request
        const updatedRequest = await tx.request.update({
          where: {
            id: requestId,
          },
          data: nextStep
            ? {
                status: RequestStatus.PROCESSING,
                currentStep: nextStep,
              }
            : {
                status: RequestStatus.APPROVED,
                approvedAt: decidedAt,
              },
          include: requestInclude,
        });

        // nếu đã approve và là request phê duyệt lịch thì tiến hành áp dụng lịch làm việc
        if (
          updatedRequest.status === RequestStatus.APPROVED &&
          latestRequest.type === RequestType.SCHEDULE_APPROVAL
        ) {
          const workScheduleRequest = await tx.workScheduleRequest.findUnique({
            where: {
              requestId,
            },
            select: {
              scheduleDetails: true,
            },
          });

          if (!workScheduleRequest) {
            throw new ApiError(
              400,
              "Schedule request data is missing",
              "WORK_SCHEDULE_REQUEST_NOT_FOUND",
            );
          }

          const employee = await tx.employee.findUnique({
            where: {
              userId: latestRequest.requesterId,
            },
            select: {
              id: true,
            },
          });

          if (!employee) {
            throw new ApiError(
              400,
              "Schedule requests can only be approved for employees",
            );
          }

          await applyScheduleAssignments(
            tx,
            [employee.id],
            workScheduleRequest.scheduleDetails as Array<{
              date: string;
              workShiftIds: string[];
            }>,
            decidedAt,
          );
        }

        return sortApprovals(updatedRequest);
      }

      const hasPendingApprovals = sortedApprovals.some(
        (item) => item.status === RequestApprovalStatus.PENDING,
      );

      const updatedRequest = await tx.request.update({
        where: {
          id: requestId,
        },
        data: hasPendingApprovals
          ? {
              status: RequestStatus.PROCESSING,
            }
          : {
              status: RequestStatus.APPROVED,
              approvedAt: decidedAt,
            },
        include: requestInclude,
      });

      if (
        updatedRequest.status === RequestStatus.APPROVED &&
        latestRequest.type === RequestType.SCHEDULE_APPROVAL
      ) {
        const workScheduleRequest = await tx.workScheduleRequest.findUnique({
          where: {
            requestId,
          },
          select: {
            scheduleDetails: true,
          },
        });

        if (!workScheduleRequest) {
          throw new ApiError(
            400,
            "Schedule request data is missing",
            "WORK_SCHEDULE_REQUEST_NOT_FOUND",
          );
        }

        const employee = await tx.employee.findUnique({
          where: {
            userId: latestRequest.requesterId,
          },
          select: {
            id: true,
          },
        });

        if (!employee) {
          throw new ApiError(
            400,
            "Schedule requests can only be approved for employees",
          );
        }

        await applyScheduleAssignments(
          tx,
          [employee.id],
          workScheduleRequest.scheduleDetails as Array<{
            date: string;
            workShiftIds: string[];
          }>,
          decidedAt,
        );
      }

      return sortApprovals(updatedRequest);
    });
  },

  async completeRequest(requestId: string, userId: string, role: UserRole) {
    const request = await getRequestByIdWithDetails(requestId);
    assertCanCompleteOrCancel(request, userId, role === UserRole.ADMIN);

    if (request.status !== RequestStatus.APPROVED) {
      throw new ApiError(
        400,
        "Only approved requests can be completed",
        "REQUEST_NOT_APPROVED",
      );
    }

    const completedAt = new Date();

    return updateRequestWithDetails(requestId, {
      status: RequestStatus.COMPLETED,
      completedAt,
    });
  },

  async cancelRequest(requestId: string, userId: string, role: UserRole) {
    const request = await getRequestByIdWithDetails(requestId);
    assertCanCompleteOrCancel(request, userId, role === UserRole.ADMIN);

    if (request.status === RequestStatus.COMPLETED) {
      throw new ApiError(
        400,
        "Cannot cancel a completed request",
        "REQUEST_ALREADY_COMPLETED",
      );
    }

    if (
      request.status === RequestStatus.CANCELLED ||
      request.status === RequestStatus.REJECTED
    ) {
      throw new ApiError(
        400,
        "Request is already finished",
        "REQUEST_ALREADY_FINAL",
      );
    }

    const cancelledAt = new Date();

    return updateRequestWithDetails(requestId, {
      status: RequestStatus.CANCELLED,
      cancelledAt,
    });
  },
};
