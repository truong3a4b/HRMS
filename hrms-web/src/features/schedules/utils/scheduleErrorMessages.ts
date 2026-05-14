type ApiErrorLike = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
};

const exactMessages: Record<string, string> = {
  "At least one future schedule detail is required":
    "Vui lòng chọn ít nhất một ngày làm việc trong tương lai.",
  "At least one approver is required": "Vui lòng chọn ít nhất một người duyệt.",
  "Requester cannot be an approver or watcher of the same request":
    "Người gửi yêu cầu không thể đồng thời là người duyệt hoặc người theo dõi.",
  "month must be in YYYY-MM format": "Tháng phải có định dạng YYYY-MM.",
  "month query parameter required (YYYY-MM)":
    "Vui lòng chọn tháng cần xem theo định dạng YYYY-MM.",
  "date query parameter required (YYYY-MM-DD)":
    "Vui lòng chọn ngày cần xem theo định dạng YYYY-MM-DD.",
  "date must be in YYYY-MM-DD format": "Ngày phải có định dạng YYYY-MM-DD.",
  "date is invalid": "Ngày không hợp lệ.",
  "Employee not found": "Không tìm thấy nhân viên.",
  "Employee profile not found": "Không tìm thấy hồ sơ nhân viên.",
  "workShiftId or workShiftIds is required":
    "Vui lòng chọn ít nhất một ca làm việc.",
  "At least one field is required": "Vui lòng nhập ít nhất một thông tin cần cập nhật.",
  Unauthorized: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  Forbidden: "Bạn không có quyền thực hiện thao tác này.",
  Created: "Đã tạo thành công.",
  OK: "Thành công.",
};

function translateServerMessage(message: string) {
  const normalized = message.trim();

  if (exactMessages[normalized]) {
    return exactMessages[normalized];
  }

  if (normalized.startsWith("User not found:")) {
    return `Không tìm thấy người dùng: ${normalized.replace("User not found:", "").trim()}`;
  }

  if (normalized.startsWith("Work shift not found:")) {
    return `Không tìm thấy ca làm việc: ${normalized.replace("Work shift not found:", "").trim()}`;
  }

  if (normalized.startsWith("Invalid schedule date:")) {
    return `Ngày làm việc không hợp lệ: ${normalized.replace("Invalid schedule date:", "").trim()}`;
  }

  if (normalized.startsWith("Invalid start time:")) {
    return `Giờ bắt đầu không hợp lệ: ${normalized.replace("Invalid start time:", "").trim()}`;
  }

  if (normalized.startsWith("Invalid end time:")) {
    return `Giờ kết thúc không hợp lệ: ${normalized.replace("Invalid end time:", "").trim()}`;
  }

  if (normalized.startsWith("Schedule dates must be within registration month:")) {
    return `Ngày đăng ký phải nằm trong tháng đã chọn: ${normalized
      .replace("Schedule dates must be within registration month:", "")
      .trim()}`;
  }

  if (normalized.startsWith("Work shifts overlap on ")) {
    return normalized
      .replace("Work shifts overlap on", "Các ca làm việc bị trùng thời gian vào ngày")
      .replace(" and ", " và ");
  }

  return normalized;
}

export function getScheduleErrorMessage(error: unknown, fallback: string) {
  const apiError = error as ApiErrorLike;
  const message =
    apiError?.response?.data?.message ??
    apiError?.response?.data?.error ??
    apiError?.message;

  if (typeof message === "string" && message.trim()) {
    return translateServerMessage(message);
  }

  return fallback;
}
