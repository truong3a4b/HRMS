enum RequestStatus {
  pending,
  processing,
  approved,
  rejected,
  cancelled,
  failed,
}

enum RequestType {
  leave,
  lateEarly,
  attendanceCorrection,
  overtime,
  scheduleApproval,
  payrollApproval,
  bonusPenalty,
  termination,
}

enum RequestApprovalStatus { pending, approved, rejected }

enum ApprovalMode { parallel, sequential }

class RequestUser {
  final String id;
  final String email;
  final String role;
  final String? employeeId;
  final String? employeeCode;
  final String? employeeName;

  const RequestUser({
    required this.id,
    required this.email,
    required this.role,
    this.employeeId,
    this.employeeCode,
    this.employeeName,
  });

  String get displayName =>
      employeeName?.isNotEmpty == true ? employeeName! : email;
}

class RequestApproval {
  final String id;
  final String requestId;
  final String approverId;
  final int stepOrder;
  final RequestApprovalStatus status;
  final String? note;
  final DateTime? decidedAt;
  final RequestUser? approver;

  const RequestApproval({
    required this.id,
    required this.requestId,
    required this.approverId,
    required this.stepOrder,
    required this.status,
    this.note,
    this.decidedAt,
    this.approver,
  });
}

class RequestWatcher {
  final String id;
  final String userId;
  final RequestUser? user;

  const RequestWatcher({required this.id, required this.userId, this.user});
}

class RequestWorkShift {
  final String id;
  final String name;
  final String? startTime;
  final String? endTime;

  const RequestWorkShift({
    required this.id,
    required this.name,
    this.startTime,
    this.endTime,
  });

  String get displayName {
    final time = startTime != null && endTime != null
        ? ' ($startTime-$endTime)'
        : '';
    return '$name$time';
  }
}

class RequestUserOption {
  final String id;
  final String label;

  const RequestUserOption({required this.id, required this.label});
}

class LeaveRequestDetail {
  final DateTime? startDate;
  final DateTime? endDate;
  final String leaveType;
  final RequestWorkShift? workShift;
  final String? reason;

  const LeaveRequestDetail({
    this.startDate,
    this.endDate,
    required this.leaveType,
    this.workShift,
    this.reason,
  });
}

class LateEarlyRequestDetail {
  final DateTime? date;
  final String requestType;
  final DateTime? startDate;
  final DateTime? endDate;
  final RequestWorkShift? workShift;
  final String? reason;

  const LateEarlyRequestDetail({
    this.date,
    required this.requestType,
    this.startDate,
    this.endDate,
    this.workShift,
    this.reason,
  });
}

class AttendanceCorrectionRequestDetail {
  final DateTime? attendanceDate;
  final RequestWorkShift? workShift;
  final String? addedWorkUnits;
  final String? reason;

  const AttendanceCorrectionRequestDetail({
    this.attendanceDate,
    this.workShift,
    this.addedWorkUnits,
    this.reason,
  });
}

class PayrollApprovalRequestDetail {
  final int month;
  final int year;
  final String? note;
  final String? periodName;
  final String? periodStatus;

  const PayrollApprovalRequestDetail({
    required this.month,
    required this.year,
    this.note,
    this.periodName,
    this.periodStatus,
  });
}

class RequestItem {
  final String id;
  final RequestType type;
  final String title;
  final String? description;
  final RequestStatus status;
  final ApprovalMode approvalMode;
  final int currentStep;
  final String requesterId;
  final RequestUser? requester;
  final List<RequestApproval> approvals;
  final List<RequestWatcher> watchers;
  final LeaveRequestDetail? leaveRequest;
  final LateEarlyRequestDetail? lateEarlyRequest;
  final AttendanceCorrectionRequestDetail? attendanceCorrectionRequest;
  final PayrollApprovalRequestDetail? payrollApprovalRequest;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const RequestItem({
    required this.id,
    required this.type,
    required this.title,
    this.description,
    required this.status,
    required this.approvalMode,
    required this.currentStep,
    required this.requesterId,
    this.requester,
    required this.approvals,
    required this.watchers,
    this.leaveRequest,
    this.lateEarlyRequest,
    this.attendanceCorrectionRequest,
    this.payrollApprovalRequest,
    this.createdAt,
    this.updatedAt,
  });
}

class RequestListMeta {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const RequestListMeta({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });
}

class RequestListData {
  final List<RequestItem> items;
  final RequestListMeta meta;

  const RequestListData({required this.items, required this.meta});
}

extension RequestStatusX on RequestStatus {
  String get apiValue {
    switch (this) {
      case RequestStatus.pending:
        return 'PENDING';
      case RequestStatus.processing:
        return 'PROCESSING';
      case RequestStatus.approved:
        return 'APPROVED';
      case RequestStatus.rejected:
        return 'REJECTED';
      case RequestStatus.cancelled:
        return 'CANCELLED';
      case RequestStatus.failed:
        return 'FAILED';
    }
  }

  String get displayName {
    switch (this) {
      case RequestStatus.pending:
        return 'Chờ xử lý';
      case RequestStatus.processing:
        return 'Đang duyệt';
      case RequestStatus.approved:
        return 'Đã duyệt';
      case RequestStatus.rejected:
        return 'Từ chối';
      case RequestStatus.cancelled:
        return 'Đã hủy';
      case RequestStatus.failed:
        return 'Thất bại';
    }
  }

  bool get isFinal {
    return this == RequestStatus.approved ||
        this == RequestStatus.rejected ||
        this == RequestStatus.cancelled ||
        this == RequestStatus.failed;
  }
}

extension RequestTypeX on RequestType {
  String get apiValue {
    switch (this) {
      case RequestType.leave:
        return 'LEAVE';
      case RequestType.lateEarly:
        return 'LATE_EARLY';
      case RequestType.attendanceCorrection:
        return 'ATTENDANCE_CORRECTION';
      case RequestType.overtime:
        return 'OVERTIME';
      case RequestType.scheduleApproval:
        return 'SCHEDULE_APPROVAL';
      case RequestType.payrollApproval:
        return 'PAYROLL_APPROVAL';
      case RequestType.bonusPenalty:
        return 'BONUS_PENALTY';
      case RequestType.termination:
        return 'TERMINATION';
    }
  }

  String get displayName {
    switch (this) {
      case RequestType.leave:
        return 'Nghỉ phép';
      case RequestType.lateEarly:
        return 'Đi muộn/về sớm';
      case RequestType.attendanceCorrection:
        return 'Bổ sung chấm công';
      case RequestType.overtime:
        return 'Tăng ca';
      case RequestType.scheduleApproval:
        return 'Duyệt lịch';
      case RequestType.payrollApproval:
        return 'Duyệt kỳ lương';
      case RequestType.bonusPenalty:
        return 'Yêu cầu thưởng phạt';
      case RequestType.termination:
        return 'Nghỉ việc';
    }
  }
}

extension RequestApprovalStatusX on RequestApprovalStatus {
  String get apiValue {
    switch (this) {
      case RequestApprovalStatus.pending:
        return 'PENDING';
      case RequestApprovalStatus.approved:
        return 'APPROVED';
      case RequestApprovalStatus.rejected:
        return 'REJECTED';
    }
  }

  String get displayName {
    switch (this) {
      case RequestApprovalStatus.pending:
        return 'Chờ duyệt';
      case RequestApprovalStatus.approved:
        return 'Đã duyệt';
      case RequestApprovalStatus.rejected:
        return 'Từ chối';
    }
  }
}

extension ApprovalModeX on ApprovalMode {
  String get displayName =>
      this == ApprovalMode.parallel ? 'Song song' : 'Tuần tự';
}
