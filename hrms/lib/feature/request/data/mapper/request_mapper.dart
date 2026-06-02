import '../../domain/entities/request.dart';
import '../models/request_dto.dart';

extension RequestUserMapper on RequestUserDto {
  RequestUser toEntity() {
    return RequestUser(
      id: id,
      email: email,
      role: role,
      employeeId: employeeId,
      employeeCode: employeeCode,
      employeeName: employeeName,
    );
  }
}

extension RequestApprovalMapper on RequestApprovalDto {
  RequestApproval toEntity() {
    return RequestApproval(
      id: id,
      requestId: requestId,
      approverId: approverId,
      stepOrder: stepOrder,
      status: _approvalStatusFromApi(status),
      note: note,
      decidedAt: decidedAt,
      approver: approver?.toEntity(),
    );
  }
}

extension RequestWatcherMapper on RequestWatcherDto {
  RequestWatcher toEntity() {
    return RequestWatcher(id: id, userId: userId, user: user?.toEntity());
  }
}

extension RequestWorkShiftMapper on RequestWorkShiftDto {
  RequestWorkShift toEntity() {
    return RequestWorkShift(
      id: id,
      name: name,
      startTime: startTime,
      endTime: endTime,
    );
  }
}

extension RequestItemMapper on RequestItemDto {
  RequestItem toEntity() {
    return RequestItem(
      id: id,
      type: _typeFromApi(type),
      title: title,
      description: description,
      status: _statusFromApi(status),
      approvalMode: approvalMode == 'SEQUENTIAL'
          ? ApprovalMode.sequential
          : ApprovalMode.parallel,
      requesterId: requesterId,
      requester: requester?.toEntity(),
      approvals: approvals.map((item) => item.toEntity()).toList(),
      watchers: watchers.map((item) => item.toEntity()).toList(),
      leaveRequest: leaveRequest == null
          ? null
          : LeaveRequestDetail(
              startDate: leaveRequest!.startDate,
              endDate: leaveRequest!.endDate,
              leaveType: leaveRequest!.leaveType,
              workShift: leaveRequest!.workShift?.toEntity(),
              reason: leaveRequest!.reason,
            ),
      lateEarlyRequest: lateEarlyRequest == null
          ? null
          : LateEarlyRequestDetail(
              date: lateEarlyRequest!.date,
              requestType: lateEarlyRequest!.requestType,
              startDate: lateEarlyRequest!.startDate,
              endDate: lateEarlyRequest!.endDate,
              workShift: lateEarlyRequest!.workShift?.toEntity(),
              reason: lateEarlyRequest!.reason,
            ),
      attendanceCorrectionRequest: attendanceCorrectionRequest == null
          ? null
          : AttendanceCorrectionRequestDetail(
              attendanceDate: attendanceCorrectionRequest!.attendanceDate,
              workShift: attendanceCorrectionRequest!.workShift?.toEntity(),
              addedWorkUnits: attendanceCorrectionRequest!.addedWorkUnits,
              reason: attendanceCorrectionRequest!.reason,
            ),
      payrollApprovalRequest: payrollApprovalRequest == null
          ? null
          : PayrollApprovalRequestDetail(
              month: payrollApprovalRequest!.month,
              year: payrollApprovalRequest!.year,
              note: payrollApprovalRequest!.note,
              periodName: payrollApprovalRequest!.periodName,
              periodStatus: payrollApprovalRequest!.periodStatus,
            ),
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}

extension RequestListMapper on RequestListDataDto {
  RequestListData toEntity() {
    return RequestListData(
      items: items.map((item) => item.toEntity()).toList(),
      meta: RequestListMeta(
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      ),
    );
  }
}

RequestStatus _statusFromApi(String value) {
  switch (value) {
    case 'PROCESSING':
      return RequestStatus.processing;
    case 'APPROVED':
      return RequestStatus.approved;
    case 'REJECTED':
      return RequestStatus.rejected;
    case 'CANCELLED':
      return RequestStatus.cancelled;
    case 'FAILED':
      return RequestStatus.failed;
    case 'PENDING':
    default:
      return RequestStatus.pending;
  }
}

RequestType _typeFromApi(String value) {
  switch (value) {
    case 'LATE_EARLY':
      return RequestType.lateEarly;
    case 'ATTENDANCE_CORRECTION':
      return RequestType.attendanceCorrection;
    case 'OVERTIME':
      return RequestType.overtime;
    case 'SCHEDULE_APPROVAL':
      return RequestType.scheduleApproval;
    case 'PAYROLL_APPROVAL':
      return RequestType.payrollApproval;
    case 'BONUS_PENALTY':
      return RequestType.bonusPenalty;
    case 'TERMINATION':
      return RequestType.termination;
    case 'LEAVE':
    default:
      return RequestType.leave;
  }
}

RequestApprovalStatus _approvalStatusFromApi(String value) {
  switch (value) {
    case 'APPROVED':
      return RequestApprovalStatus.approved;
    case 'REJECTED':
      return RequestApprovalStatus.rejected;
    case 'PENDING':
    default:
      return RequestApprovalStatus.pending;
  }
}
