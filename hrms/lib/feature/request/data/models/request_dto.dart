class RequestUserDto {
  final String id;
  final String email;
  final String role;
  final String? employeeId;
  final String? employeeCode;
  final String? employeeName;

  const RequestUserDto({
    required this.id,
    required this.email,
    required this.role,
    this.employeeId,
    this.employeeCode,
    this.employeeName,
  });

  factory RequestUserDto.fromJson(Map<String, dynamic> json) {
    final employee = json['employee'] as Map<String, dynamic>?;
    return RequestUserDto(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? '',
      employeeId: employee?['id'] as String?,
      employeeCode: employee?['employeeId'] as String?,
      employeeName: employee?['name'] as String?,
    );
  }
}

class RequestApprovalDto {
  final String id;
  final String requestId;
  final String approverId;
  final int stepOrder;
  final String status;
  final String? note;
  final DateTime? decidedAt;
  final RequestUserDto? approver;

  const RequestApprovalDto({
    required this.id,
    required this.requestId,
    required this.approverId,
    required this.stepOrder,
    required this.status,
    this.note,
    this.decidedAt,
    this.approver,
  });

  factory RequestApprovalDto.fromJson(Map<String, dynamic> json) {
    return RequestApprovalDto(
      id: json['id'] as String? ?? '',
      requestId: json['requestId'] as String? ?? '',
      approverId: json['approverId'] as String? ?? '',
      stepOrder: json['stepOrder'] as int? ?? 0,
      status: json['status'] as String? ?? 'PENDING',
      note: json['note'] as String?,
      decidedAt: _toDate(json['decidedAt']),
      approver: json['approver'] is Map<String, dynamic>
          ? RequestUserDto.fromJson(json['approver'] as Map<String, dynamic>)
          : null,
    );
  }
}

class RequestWatcherDto {
  final String id;
  final String userId;
  final RequestUserDto? user;

  const RequestWatcherDto({required this.id, required this.userId, this.user});

  factory RequestWatcherDto.fromJson(Map<String, dynamic> json) {
    return RequestWatcherDto(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      user: json['user'] is Map<String, dynamic>
          ? RequestUserDto.fromJson(json['user'] as Map<String, dynamic>)
          : null,
    );
  }
}

class RequestWorkShiftDto {
  final String id;
  final String name;
  final String? startTime;
  final String? endTime;

  const RequestWorkShiftDto({
    required this.id,
    required this.name,
    this.startTime,
    this.endTime,
  });

  factory RequestWorkShiftDto.fromJson(Map<String, dynamic> json) {
    return RequestWorkShiftDto(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Ca làm',
      startTime: json['startTime'] as String?,
      endTime: json['endTime'] as String?,
    );
  }
}

class LeaveRequestDetailDto {
  final DateTime? startDate;
  final DateTime? endDate;
  final String leaveType;
  final RequestWorkShiftDto? workShift;
  final String? reason;

  const LeaveRequestDetailDto({
    this.startDate,
    this.endDate,
    required this.leaveType,
    this.workShift,
    this.reason,
  });

  factory LeaveRequestDetailDto.fromJson(Map<String, dynamic> json) {
    return LeaveRequestDetailDto(
      startDate: _toDate(json['startDate']),
      endDate: _toDate(json['endDate']),
      leaveType: json['leaveType'] as String? ?? 'OTHER',
      workShift: json['workShift'] is Map<String, dynamic>
          ? RequestWorkShiftDto.fromJson(
              json['workShift'] as Map<String, dynamic>,
            )
          : null,
      reason: json['reason'] as String?,
    );
  }
}

class LateEarlyRequestDetailDto {
  final DateTime? date;
  final String requestType;
  final DateTime? startDate;
  final DateTime? endDate;
  final RequestWorkShiftDto? workShift;
  final String? reason;

  const LateEarlyRequestDetailDto({
    this.date,
    required this.requestType,
    this.startDate,
    this.endDate,
    this.workShift,
    this.reason,
  });

  factory LateEarlyRequestDetailDto.fromJson(Map<String, dynamic> json) {
    return LateEarlyRequestDetailDto(
      date: _toDate(json['date']),
      requestType: json['requestType'] as String? ?? 'LATE_ARRIVAL',
      startDate: _toDate(json['startDate']),
      endDate: _toDate(json['endDate']),
      workShift: json['workShift'] is Map<String, dynamic>
          ? RequestWorkShiftDto.fromJson(
              json['workShift'] as Map<String, dynamic>,
            )
          : null,
      reason: json['reason'] as String?,
    );
  }
}

class AttendanceCorrectionRequestDetailDto {
  final DateTime? attendanceDate;
  final RequestWorkShiftDto? workShift;
  final String? addedWorkUnits;
  final String? reason;

  const AttendanceCorrectionRequestDetailDto({
    this.attendanceDate,
    this.workShift,
    this.addedWorkUnits,
    this.reason,
  });

  factory AttendanceCorrectionRequestDetailDto.fromJson(
    Map<String, dynamic> json,
  ) {
    return AttendanceCorrectionRequestDetailDto(
      attendanceDate: _toDate(json['attendanceDate']),
      workShift: json['workShift'] is Map<String, dynamic>
          ? RequestWorkShiftDto.fromJson(
              json['workShift'] as Map<String, dynamic>,
            )
          : null,
      addedWorkUnits: json['addedWorkUnits']?.toString(),
      reason: json['reason'] as String?,
    );
  }
}

class PayrollApprovalRequestDetailDto {
  final int month;
  final int year;
  final String? note;
  final String? periodName;
  final String? periodStatus;

  const PayrollApprovalRequestDetailDto({
    required this.month,
    required this.year,
    this.note,
    this.periodName,
    this.periodStatus,
  });

  factory PayrollApprovalRequestDetailDto.fromJson(Map<String, dynamic> json) {
    final period = json['period'] as Map<String, dynamic>?;
    return PayrollApprovalRequestDetailDto(
      month: json['month'] as int? ?? period?['month'] as int? ?? 0,
      year: json['year'] as int? ?? period?['year'] as int? ?? 0,
      note: json['note'] as String?,
      periodName: period?['name'] as String?,
      periodStatus: period?['status'] as String?,
    );
  }
}

class RequestItemDto {
  final String id;
  final String type;
  final String title;
  final String? description;
  final String status;
  final String approvalMode;
  final int currentStep;
  final String requesterId;
  final RequestUserDto? requester;
  final List<RequestApprovalDto> approvals;
  final List<RequestWatcherDto> watchers;
  final LeaveRequestDetailDto? leaveRequest;
  final LateEarlyRequestDetailDto? lateEarlyRequest;
  final AttendanceCorrectionRequestDetailDto? attendanceCorrectionRequest;
  final PayrollApprovalRequestDetailDto? payrollApprovalRequest;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const RequestItemDto({
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

  factory RequestItemDto.fromJson(Map<String, dynamic> json) {
    return RequestItemDto(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? 'LEAVE',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      status: json['status'] as String? ?? 'PENDING',
      approvalMode: json['approvalMode'] as String? ?? 'PARALLEL',
      currentStep: json['currentStep'] as int? ?? 1,
      requesterId: json['requesterId'] as String? ?? '',
      requester: json['requester'] is Map<String, dynamic>
          ? RequestUserDto.fromJson(json['requester'] as Map<String, dynamic>)
          : null,
      approvals: (json['approvals'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(RequestApprovalDto.fromJson)
          .toList(),
      watchers: (json['watchers'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(RequestWatcherDto.fromJson)
          .toList(),
      leaveRequest: json['leaveRequest'] is Map<String, dynamic>
          ? LeaveRequestDetailDto.fromJson(
              json['leaveRequest'] as Map<String, dynamic>,
            )
          : null,
      lateEarlyRequest: json['lateEarlyRequest'] is Map<String, dynamic>
          ? LateEarlyRequestDetailDto.fromJson(
              json['lateEarlyRequest'] as Map<String, dynamic>,
            )
          : null,
      attendanceCorrectionRequest:
          json['attendanceCorrectionRequest'] is Map<String, dynamic>
          ? AttendanceCorrectionRequestDetailDto.fromJson(
              json['attendanceCorrectionRequest'] as Map<String, dynamic>,
            )
          : null,
      payrollApprovalRequest:
          json['payrollApprovalRequest'] is Map<String, dynamic>
          ? PayrollApprovalRequestDetailDto.fromJson(
              json['payrollApprovalRequest'] as Map<String, dynamic>,
            )
          : null,
      createdAt: _toDate(json['createdAt']),
      updatedAt: _toDate(json['updatedAt']),
    );
  }
}

class RequestListMetaDto {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const RequestListMetaDto({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory RequestListMetaDto.fromJson(Map<String, dynamic> json) {
    return RequestListMetaDto(
      page: json['page'] as int? ?? 1,
      limit: json['limit'] as int? ?? 10,
      total: json['total'] as int? ?? 0,
      totalPages: json['totalPages'] as int? ?? 1,
    );
  }
}

class RequestListDataDto {
  final List<RequestItemDto> items;
  final RequestListMetaDto meta;

  const RequestListDataDto({required this.items, required this.meta});

  factory RequestListDataDto.fromJson(Map<String, dynamic> json) {
    return RequestListDataDto(
      items: (json['items'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(RequestItemDto.fromJson)
          .toList(),
      meta: RequestListMetaDto.fromJson(
        json['meta'] as Map<String, dynamic>? ?? const {},
      ),
    );
  }
}

DateTime? _toDate(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  if (value is String) return DateTime.tryParse(value)?.toLocal();
  return null;
}
