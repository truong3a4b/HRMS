import { NextFunction, Request, Response } from "express";
import { NotificationType } from "../../generated/prisma/client";
import { notificationService } from "../services/notification.service";
import { sendResponse } from "../utils/response";
import { ApiError } from "../utils/apiError";

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

const parseNotificationIds = (value: unknown) => {
  if (!Array.isArray(value)) {
    throw new ApiError(400, "userIds must be an array");
  }

  const userIds = value
    .map((userId) => (typeof userId === "string" ? userId.trim() : ""))
    .filter(Boolean);

  if (userIds.length === 0) {
    throw new ApiError(400, "At least one recipient is required");
  }

  return userIds;
};

type SendNotificationBody = {
  userIds: string[];
  title: string;
  message: string;
  type?: NotificationType;
  data?: unknown;
};

export const notificationController = {
  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as SendNotificationBody;
      const title = String(body.title ?? "").trim();
      const message = String(body.message ?? "").trim();

      if (!title || !message) {
        throw new ApiError(400, "Title and message are required");
      }

      const result = await notificationService.createForUsers({
        userIds: parseNotificationIds(body.userIds),
        title,
        message,
        type: body.type,
        data: body.data as never,
        senderId: req.user?.id ?? null,
      });

      return sendResponse(res, 201, "Notification sent successfully", result);
    } catch (error) {
      next(error);
    }
  },

  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const page = parsePositiveInt(req.query.page, "page", 1);
      const limit = parsePositiveInt(req.query.limit, "limit", 20);
      const result = await notificationService.getMyNotifications(
        userId,
        page,
        limit,
      );

      return sendResponse(
        res,
        200,
        "Notifications fetched successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const count = await notificationService.getUnreadCount(userId);

      return sendResponse(
        res,
        200,
        "Unread notification count fetched successfully",
        {
          unreadCount: count,
        },
      );
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const notificationId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const result = await notificationService.markAsRead(
        userId,
        notificationId,
      );

      return sendResponse(res, 200, "Notification marked as read", result);
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const result = await notificationService.markAllAsRead(userId);

      return sendResponse(res, 200, "All notifications marked as read", result);
    } catch (error) {
      next(error);
    }
  },
};
