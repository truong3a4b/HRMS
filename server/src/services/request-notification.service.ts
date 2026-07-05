import {
  ApprovalMode,
  NotificationType,
  RequestStatus,
  RequestType,
} from "../../generated/prisma/client";
import { notificationService } from "./notification.service";

type RequestNotificationInput = {
  userIds: string[];
  title: string;
  message: string;
  request: {
    id: string;
    type: RequestType;
    status: RequestStatus;
  };
  senderId?: string;
};

const normalizeIds = (values: string[]) => [
  ...new Set(values.map((value) => value.trim()).filter(Boolean)),
];

//Lấy danh sách userId của những người nhận thông báo đầu tiên dựa trên chế độ phê duyệt và danh sách approverIds, watcherIds
export const getInitialRequestRecipientIds = (
  approvalMode: ApprovalMode,
  approverIds: string[],
  watcherIds: string[],
) => [
  ...(approvalMode === ApprovalMode.SEQUENTIAL
    ? approverIds.slice(0, 1)
    : approverIds),
  ...watcherIds,
];

//Gửi thông báo đến những người nhận thông báo đầu tiên dựa trên chế độ phê duyệt và danh sách approverIds, watcherIds
export const notifyRequestWorkflow = async (
  input: RequestNotificationInput,
) => {
  const recipients = normalizeIds(input.userIds).filter(
    (userId) => userId !== input.senderId,
  );

  if (recipients.length === 0) {
    return;
  }

  try {
    await notificationService.createForUsers({
      userIds: recipients,
      title: input.title,
      message: input.message,
      type: NotificationType.EMPLOYEE,
      senderId: input.senderId,
      data: {
        requestId: input.request.id,
        requestType: input.request.type,
        requestStatus: input.request.status,
      },
    });
  } catch (error) {
    console.error("Failed to send request workflow notification:", error);
  }
};
