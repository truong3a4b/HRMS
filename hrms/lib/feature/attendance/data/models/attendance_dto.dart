class AttendanceEmployeeDto {
  final String id;
  final String employeeId;
  final String name;
  final String email;

  const AttendanceEmployeeDto({
    required this.id,
    required this.employeeId,
    required this.name,
    required this.email,
  });

  factory AttendanceEmployeeDto.fromJson(Map<String, dynamic> json) {
    return AttendanceEmployeeDto(
      id: json['id'] as String,
      employeeId: json['employeeId'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
    );
  }
}

class AttendanceDeviceSummaryDto {
  final String id;
  final String name;
  final String code;

  const AttendanceDeviceSummaryDto({
    required this.id,
    required this.name,
    required this.code,
  });

  factory AttendanceDeviceSummaryDto.fromJson(Map<String, dynamic> json) {
    return AttendanceDeviceSummaryDto(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      code: json['code'] as String? ?? '',
    );
  }
}

class AttendanceLogDto {
  final String id;
  final String employeeId;
  final String deviceId;
  final int fingerId;
  final DateTime timestamp;
  final DateTime createdAt;
  final AttendanceDeviceSummaryDto device;

  const AttendanceLogDto({
    required this.id,
    required this.employeeId,
    required this.deviceId,
    required this.fingerId,
    required this.timestamp,
    required this.createdAt,
    required this.device,
  });

  factory AttendanceLogDto.fromJson(Map<String, dynamic> json) {
    return AttendanceLogDto(
      id: json['id'] as String,
      employeeId: json['employeeId'] as String? ?? '',
      deviceId: json['deviceId'] as String? ?? '',
      fingerId: _toInt(json['fingerId']),
      timestamp: _toDate(json['timestamp']),
      createdAt: _toDate(json['createdAt']),
      device: AttendanceDeviceSummaryDto.fromJson(
        json['device'] as Map<String, dynamic>? ?? const {},
      ),
    );
  }
}

class AttendanceHistoryDataDto {
  final AttendanceEmployeeDto employee;
  final String month;
  final int page;
  final int limit;
  final int total;
  final int totalPages;
  final List<AttendanceLogDto> logs;

  const AttendanceHistoryDataDto({
    required this.employee,
    required this.month,
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
    required this.logs,
  });

  factory AttendanceHistoryDataDto.fromJson(Map<String, dynamic> json) {
    return AttendanceHistoryDataDto(
      employee: AttendanceEmployeeDto.fromJson(
        json['employee'] as Map<String, dynamic>? ?? const {},
      ),
      month: json['month'] as String? ?? '',
      page: _toInt(json['page'], fallback: 1),
      limit: _toInt(json['limit'], fallback: 20),
      total: _toInt(json['total']),
      totalPages: _toInt(json['totalPages'], fallback: 1),
      logs: (json['logs'] as List<dynamic>? ?? const [])
          .map(
            (item) => AttendanceLogDto.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
    );
  }
}

class AttendanceRecordDetailDto {
  final String id;
  final String workShiftId;
  final String? workShiftCode;
  final String workShiftName;
  final String status;
  final DateTime? checkInTime;
  final DateTime? checkOutTime;
  final String? shiftStartClock;
  final String? shiftEndClock;
  final bool shiftIsOvertime;
  final double workUnits;
  final double countedWorkUnits;
  final double countedOvertimeUnits;
  final bool isLate;
  final bool isEarlyLeave;

  const AttendanceRecordDetailDto({
    required this.id,
    required this.workShiftId,
    this.workShiftCode,
    required this.workShiftName,
    required this.status,
    this.checkInTime,
    this.checkOutTime,
    this.shiftStartClock,
    this.shiftEndClock,
    required this.shiftIsOvertime,
    required this.workUnits,
    required this.countedWorkUnits,
    required this.countedOvertimeUnits,
    required this.isLate,
    required this.isEarlyLeave,
  });

  factory AttendanceRecordDetailDto.fromJson(Map<String, dynamic> json) {
    return AttendanceRecordDetailDto(
      id: json['id'] as String,
      workShiftId: json['workShiftId'] as String? ?? '',
      workShiftCode: json['workShiftCode'] as String?,
      workShiftName: json['workShiftName'] as String? ?? '',
      status: json['status'] as String? ?? '',
      checkInTime: _toNullableDate(json['checkInTime']),
      checkOutTime: _toNullableDate(json['checkOutTime']),
      shiftStartClock: json['shiftStartClock'] as String?,
      shiftEndClock: json['shiftEndClock'] as String?,
      shiftIsOvertime: json['shiftIsOvertime'] as bool? ?? false,
      workUnits: _toDouble(json['workUnits']),
      countedWorkUnits: _toDouble(json['countedWorkUnits']),
      countedOvertimeUnits: _toDouble(json['countedOvertimeUnits']),
      isLate: json['isLate'] as bool? ?? false,
      isEarlyLeave: json['isEarlyLeave'] as bool? ?? false,
    );
  }
}

class AttendanceTimesheetDayDto {
  final String? id;
  final DateTime date;
  final double standardWorkUnits;
  final double actualWorkUnits;
  final double workedUnits;
  final double overtimeUnits;
  final double bonusUnits;
  final int lateCount;
  final int earlyLeaveCount;
  final int lateEarlyCount;
  final int leaveCount;
  final int absentCount;
  final int leaveOrAbsentCount;
  final bool isLeaveDay;
  final List<AttendanceRecordDetailDto> recordDetails;

  const AttendanceTimesheetDayDto({
    this.id,
    required this.date,
    required this.standardWorkUnits,
    required this.actualWorkUnits,
    required this.workedUnits,
    required this.overtimeUnits,
    required this.bonusUnits,
    required this.lateCount,
    required this.earlyLeaveCount,
    required this.lateEarlyCount,
    required this.leaveCount,
    required this.absentCount,
    required this.leaveOrAbsentCount,
    required this.isLeaveDay,
    required this.recordDetails,
  });

  factory AttendanceTimesheetDayDto.fromJson(Map<String, dynamic> json) {
    return AttendanceTimesheetDayDto(
      id: json['id'] as String?,
      date: _toDate(json['date']),
      standardWorkUnits: _toDouble(json['standardWorkUnits']),
      actualWorkUnits: _toDouble(
        json['actualWorkUnits'] ?? json['workedUnits'],
      ),
      workedUnits: _toDouble(json['workedUnits']),
      overtimeUnits: _toDouble(json['overtimeUnits']),
      bonusUnits: _toDouble(json['bonusUnits']),
      lateCount: _toInt(json['lateCount']),
      earlyLeaveCount: _toInt(json['earlyLeaveCount']),
      lateEarlyCount: _toInt(json['lateEarlyCount']),
      leaveCount: _toInt(json['leaveCount']),
      absentCount: _toInt(json['absentCount']),
      leaveOrAbsentCount: _toInt(json['leaveOrAbsentCount']),
      isLeaveDay: json['isLeaveDay'] as bool? ?? false,
      recordDetails: (json['recordDetails'] as List<dynamic>? ?? const [])
          .map(
            (item) => AttendanceRecordDetailDto.fromJson(
              item as Map<String, dynamic>,
            ),
          )
          .toList(),
    );
  }
}

class AttendanceTimesheetTotalsDto {
  final double standardWorkUnits;
  final double actualWorkUnits;
  final double workedUnits;
  final double overtimeUnits;
  final double bonusUnits;
  final int lateCount;
  final int earlyLeaveCount;
  final int lateEarlyCount;
  final int leaveCount;
  final int absentCount;
  final int leaveOrAbsentDays;
  final int leaveDays;

  const AttendanceTimesheetTotalsDto({
    required this.standardWorkUnits,
    required this.actualWorkUnits,
    required this.workedUnits,
    required this.overtimeUnits,
    required this.bonusUnits,
    required this.lateCount,
    required this.earlyLeaveCount,
    required this.lateEarlyCount,
    required this.leaveCount,
    required this.absentCount,
    required this.leaveOrAbsentDays,
    required this.leaveDays,
  });

  factory AttendanceTimesheetTotalsDto.fromJson(Map<String, dynamic> json) {
    return AttendanceTimesheetTotalsDto(
      standardWorkUnits: _toDouble(json['standardWorkUnits']),
      actualWorkUnits: _toDouble(
        json['actualWorkUnits'] ?? json['workedUnits'],
      ),
      workedUnits: _toDouble(json['workedUnits']),
      overtimeUnits: _toDouble(json['overtimeUnits']),
      bonusUnits: _toDouble(json['bonusUnits']),
      lateCount: _toInt(json['lateCount']),
      earlyLeaveCount: _toInt(json['earlyLeaveCount']),
      lateEarlyCount: _toInt(json['lateEarlyCount']),
      leaveCount: _toInt(json['leaveCount']),
      absentCount: _toInt(json['absentCount']),
      leaveOrAbsentDays: _toInt(json['leaveOrAbsentDays']),
      leaveDays: _toInt(json['leaveDays']),
    );
  }
}

class AttendanceTimesheetDataDto {
  final AttendanceEmployeeDto employee;
  final String month;
  final AttendanceTimesheetTotalsDto totals;
  final List<AttendanceTimesheetDayDto> days;

  const AttendanceTimesheetDataDto({
    required this.employee,
    required this.month,
    required this.totals,
    required this.days,
  });

  factory AttendanceTimesheetDataDto.fromJson(Map<String, dynamic> json) {
    return AttendanceTimesheetDataDto(
      employee: AttendanceEmployeeDto.fromJson(
        json['employee'] as Map<String, dynamic>? ?? const {},
      ),
      month: json['month'] as String? ?? '',
      totals: AttendanceTimesheetTotalsDto.fromJson(
        json['totals'] as Map<String, dynamic>? ?? const {},
      ),
      days: (json['days'] as List<dynamic>? ?? const [])
          .map(
            (item) => AttendanceTimesheetDayDto.fromJson(
              item as Map<String, dynamic>,
            ),
          )
          .toList(),
    );
  }
}

class AttendanceDailySummaryDto {
  final String date;
  final int lateCount;
  final int earlyLeaveCount;
  final int missingCheckInCount;
  final int missingCheckOutCount;
  final int leaveCount;
  final int absentCount;

  const AttendanceDailySummaryDto({
    required this.date,
    required this.lateCount,
    required this.earlyLeaveCount,
    required this.missingCheckInCount,
    required this.missingCheckOutCount,
    required this.leaveCount,
    required this.absentCount,
  });

  factory AttendanceDailySummaryDto.fromJson(Map<String, dynamic> json) {
    return AttendanceDailySummaryDto(
      date: json['date'] as String? ?? '',
      lateCount: _toInt(json['lateCount']),
      earlyLeaveCount: _toInt(json['earlyLeaveCount']),
      missingCheckInCount: _toInt(json['missingCheckInCount']),
      missingCheckOutCount: _toInt(json['missingCheckOutCount']),
      leaveCount: _toInt(json['leaveCount']),
      absentCount: _toInt(json['absentCount']),
    );
  }
}

double _toDouble(dynamic value, {double fallback = 0}) {
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? fallback;
  return fallback;
}

int _toInt(dynamic value, {int fallback = 0}) {
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? fallback;
  return fallback;
}

DateTime _toDate(dynamic value) {
  if (value is DateTime) return value;
  if (value is String) {
    return DateTime.tryParse(value)?.toLocal() ?? DateTime(0);
  }
  return DateTime(0);
}

DateTime? _toNullableDate(dynamic value) {
  if (value == null) return null;
  final date = _toDate(value);
  return date.year == 0 ? null : date;
}
