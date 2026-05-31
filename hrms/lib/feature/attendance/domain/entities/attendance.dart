class AttendanceEmployee {
  final String id;
  final String employeeId;
  final String name;
  final String email;

  const AttendanceEmployee({
    required this.id,
    required this.employeeId,
    required this.name,
    required this.email,
  });
}

class AttendanceDeviceSummary {
  final String id;
  final String name;
  final String code;

  const AttendanceDeviceSummary({
    required this.id,
    required this.name,
    required this.code,
  });
}

class AttendanceLog {
  final String id;
  final String employeeId;
  final String deviceId;
  final int fingerId;
  final DateTime timestamp;
  final DateTime createdAt;
  final AttendanceDeviceSummary device;

  const AttendanceLog({
    required this.id,
    required this.employeeId,
    required this.deviceId,
    required this.fingerId,
    required this.timestamp,
    required this.createdAt,
    required this.device,
  });
}

class AttendanceHistoryData {
  final AttendanceEmployee employee;
  final String month;
  final int page;
  final int limit;
  final int total;
  final int totalPages;
  final List<AttendanceLog> logs;

  const AttendanceHistoryData({
    required this.employee,
    required this.month,
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
    required this.logs,
  });
}

class AttendanceRecordDetail {
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

  const AttendanceRecordDetail({
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
}

class AttendanceTimesheetDay {
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
  final List<AttendanceRecordDetail> recordDetails;

  const AttendanceTimesheetDay({
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
}

class AttendanceTimesheetTotals {
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

  const AttendanceTimesheetTotals({
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
}

class AttendanceTimesheetData {
  final AttendanceEmployee employee;
  final String month;
  final AttendanceTimesheetTotals totals;
  final List<AttendanceTimesheetDay> days;

  const AttendanceTimesheetData({
    required this.employee,
    required this.month,
    required this.totals,
    required this.days,
  });
}
