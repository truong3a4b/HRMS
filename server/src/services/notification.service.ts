import { NotificationType, Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { emitNotificationToUsers, notificationEvents } from "../config/socket";
import { ApiError } from "../utils/apiError";

const notificationBaseInclude = {
  sender: {
    select: {
      id: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.NotificationInclude;

const notificationListInclude = {
  notification: {
    include: notificationBaseInclude,
  },
} satisfies Prisma.NotificationRecipientInclude;

export type NotificationListItem = Prisma.NotificationRecipientGetPayload<{
  include: typeof notificationListInclude;
}>;

export type NotificationDetail = Prisma.NotificationGetPayload<{
  include: typeof notificationBaseInclude;
}>;

type CreateNotificationInput = {
  userIds: string[];
  title: string;
  message: string;
  type?: NotificationType;
  data?: Prisma.InputJsonValue;
  senderId?: string | null;
};

const normalizeUserIds = (userIds: string[]) => [
  ...new Set(userIds.map((userId) => userId.trim()).filter(Boolean)),
];

const ensureUsersExist = async (userIds: string[]) => {
  const existingUsers = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
    },
  });

  const existingUserIds = new Set(existingUsers.map((user) => user.id));
  const missingUserIds = userIds.filter(
    (userId) => !existingUserIds.has(userId),
  );

  if (missingUserIds.length > 0) {
    throw new ApiError(400, `User not found: ${missingUserIds.join(", ")}`);
  }
};

export const notificationService = {
  async createForUsers(input: CreateNotificationInput) {
    const userIds = normalizeUserIds(input.userIds);

    if (userIds.length === 0) {
      throw new ApiError(400, "At least one recipient is required");
    }

    await ensureUsersExist(userIds);

    const notification = await prisma.$transaction(async (tx) => {
      const createdNotification = await tx.notification.create({
        data: {
          type: input.type ?? NotificationType.GENERAL,
          title: input.title,
          message: input.message,
          ...(input.data === undefined ? {} : { data: input.data }),
          senderId: input.senderId ?? null,
        },
      });

      await tx.notificationRecipient.createMany({
        data: userIds.map((userId) => ({
          notificationId: createdNotification.id,
          userId,
        })),
      });

      return tx.notification.findUnique({
        where: {
          id: createdNotification.id,
        },
        include: notificationBaseInclude,
      });
    });

    if (!notification) {
      throw new ApiError(500, "Failed to create notification");
    }

    emitNotificationToUsers(userIds, notificationEvents.created, notification);

    return notification;
  },

  async getMyNotifications(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total, unreadCount] = await Promise.all([
      prisma.notificationRecipient.findMany({
        where: {
          userId,
        },
        include: notificationListInclude,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.notificationRecipient.count({
        where: {
          userId,
        },
      }),
      prisma.notificationRecipient.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  },

  async getUnreadCount(userId: string) {
    return prisma.notificationRecipient.count({
      where: {
        userId,
        isRead: false,
      },
    });
  },

  async markAsRead(userId: string, notificationId: string) {
    const existingRecipient = await prisma.notificationRecipient.findUnique({
      where: {
        notificationId_userId: {
          notificationId,
          userId,
        },
      },
      include: notificationListInclude,
    });

    if (!existingRecipient) {
      throw new ApiError(404, "Notification not found");
    }

    const recipient = await prisma.notificationRecipient.update({
      where: {
        notificationId_userId: {
          notificationId,
          userId,
        },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: notificationListInclude,
    });

    emitNotificationToUsers([userId], notificationEvents.read, {
      notificationId,
      isRead: true,
      readAt: recipient.readAt,
    });

    return recipient;
  },

  async markAllAsRead(userId: string) {
    const now = new Date();

    const result = await prisma.notificationRecipient.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: now,
      },
    });

    emitNotificationToUsers([userId], notificationEvents.readAll, {
      userId,
      readAt: now,
      count: result.count,
    });

    return result;
  },
};
