import { Router } from "express";
import { z } from "zod";
import { UserRole } from "../../generated/prisma/client";
import { notificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const sendNotificationSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1),
  title: z.string().min(2, "Title is required"),
  message: z.string().min(2, "Message is required"),
  type: z
    .enum(["GENERAL", "SYSTEM", "RECRUITMENT", "EMPLOYEE", "AUTH", "CUSTOM"])
    .optional(),
  data: z.unknown().optional(),
});

router.get("/me", authMiddleware(), notificationController.getMyNotifications);
router.get(
  "/me/unread-count",
  authMiddleware(),
  notificationController.getUnreadCount,
);
router.patch(
  "/me/read-all",
  authMiddleware(),
  notificationController.markAllAsRead,
);
router.patch(
  "/me/:id/read",
  authMiddleware(),
  notificationController.markAsRead,
);
router.post(
  "/",
  authMiddleware(UserRole.ADMIN),
  validate(sendNotificationSchema),
  notificationController.send,
);

export default router;
