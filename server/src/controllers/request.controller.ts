import { NextFunction, Request, Response } from "express";
import {
  ApprovalMode,
  RequestApprovalStatus,
  RequestStatus,
  RequestType,
  UserRole,
} from "../../generated/prisma/client";
import { requestService } from "../services/request.service";
import { ApiError } from "../utils/apiError";
import { sendResponse } from "../utils/response";

const getParamValue = (param: string | string[]) =>
  Array.isArray(param) ? param[0] : param;

const parsePositiveInt = (
  value: unknown,
  fieldName: string,
  defaultValue: number,
) => {
  const parsed = Number(value ?? defaultValue);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError(400, `${fieldName} must be an integer greater than 0`);
  }

  return parsed;
};

const parseEnumValue = <T extends string>(
  value: unknown,
  enumValues: readonly T[],
): T | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  return (enumValues as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
};

const parseListFilters = (req: Request) => {
  const page = parsePositiveInt(req.query.page, "page", 1);
  const limit = parsePositiveInt(req.query.limit, "limit", 10);
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;

  return {
    page,
    limit,
    search,
    status: parseEnumValue(req.query.status, Object.values(RequestStatus)),
    type: parseEnumValue(req.query.type, Object.values(RequestType)),
    approvalMode: parseEnumValue(
      req.query.approvalMode,
      Object.values(ApprovalMode),
    ),
    scope: parseEnumValue(req.query.scope, [
      "all",
      "mine",
      "watching",
      "pending",
      "assigned",
    ] as const),
  };
};

type CreateRequestBody = {
  type: RequestType;
  title: string;
  description?: string;
  approvalMode?: ApprovalMode;
  approverIds: string[];
  watcherIds?: string[];
};

type DecisionBody = {
  decision: RequestApprovalStatus;
  note?: string;
};

const requireUser = (req: Request) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  return user;
};

export const requestController = {
  async getRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const result = await requestService.getRequests(
        user.id,
        user.role,
        parseListFilters(req),
      );

      return sendResponse(res, 200, "Requests fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getMyRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const filters = parseListFilters(req);
      const result = await requestService.getMyRequests(
        user.id,
        user.role,
        filters,
      );

      return sendResponse(
        res,
        200,
        "Your requests fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getMyWatchingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const filters = parseListFilters(req);
      const result = await requestService.getMyWatchingRequests(
        user.id,
        user.role,
        filters,
      );

      return sendResponse(
        res,
        200,
        "Watched requests fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getMyPendingApprovals(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const filters = parseListFilters(req);
      const result = await requestService.getMyPendingApprovals(
        user.id,
        user.role,
        filters,
      );

      return sendResponse(
        res,
        200,
        "Pending approvals fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const requestId = getParamValue(req.params.id);
      const result = await requestService.getRequestById(
        requestId,
        user.id,
        user.role,
      );

      return sendResponse(res, 200, "Request fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const body = req.body as CreateRequestBody;

      const result = await requestService.createRequest(user.id, {
        type: body.type,
        title: body.title,
        description: body.description,
        approvalMode: body.approvalMode,
        approverIds: body.approverIds,
        watcherIds: body.watcherIds,
      });

      return sendResponse(res, 201, "Request created successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async startReview(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const requestId = getParamValue(req.params.id);
      const result = await requestService.startReview(
        requestId,
        user.id,
        user.role,
      );

      return sendResponse(res, 200, "Request is now in processing", result);
    } catch (error) {
      next(error);
    }
  },

  async decideRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const requestId = getParamValue(req.params.id);
      const body = req.body as DecisionBody;

      const result = await requestService.decideRequest(
        requestId,
        user.id,
        user.role,
        {
          decision: body.decision,
          note: body.note,
        },
      );

      return sendResponse(
        res,
        200,
        "Request decision saved successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async completeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const requestId = getParamValue(req.params.id);
      const result = await requestService.completeRequest(
        requestId,
        user.id,
        user.role,
      );

      return sendResponse(res, 200, "Request completed successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async cancelRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const user = requireUser(req);
      const requestId = getParamValue(req.params.id);
      const result = await requestService.cancelRequest(
        requestId,
        user.id,
        user.role,
      );

      return sendResponse(res, 200, "Request cancelled successfully", result);
    } catch (error) {
      next(error);
    }
  },
};
