import '../../domain/entities/attendance.dart';
import '../models/attendance_dto.dart';

extension AttendanceEmployeeMapper on AttendanceEmployeeDto {
  AttendanceEmployee toEntity() {
    return AttendanceEmployee(
      id: id,
      employeeId: employeeId,
      name: name,
      email: email,
    );
  }
}

extension AttendanceDeviceSummaryMapper on AttendanceDeviceSummaryDto {
  AttendanceDeviceSummary toEntity() {
    return AttendanceDeviceSummary(id: id, name: name, code: code);
  }
}

extension AttendanceLogMapper on AttendanceLogDto {
  AttendanceLog toEntity() {
    return AttendanceLog(
      id: id,
      employeeId: employeeId,
      deviceId: deviceId,
      fingerId: fingerId,
      timestamp: timestamp,
      createdAt: createdAt,
      device: device.toEntity(),
    );
  }
}

extension AttendanceHistoryDataMapper on AttendanceHistoryDataDto {
  AttendanceHistoryData toEntity() {
    return AttendanceHistoryData(
      employee: employee.toEntity(),
      month: month,
      page: page,
      limit: limit,
      total: total,
      totalPages: totalPages,
      logs: logs.map((log) => log.toEntity()).toList(),
    );
  }
}

extension AttendanceRecordDetailMapper on AttendanceRecordDetailDto {
  AttendanceRecordDetail toEntity() {
    return AttendanceRecordDetail(
      id: id,
      workShiftId: workShiftId,
      workShiftCode: workShiftCode,
      workShiftName: workShiftName,
      status: status,
      checkInTime: checkInTime,
      checkOutTime: checkOutTime,
      shiftStartClock: shiftStartClock,
      shiftEndClock: shiftEndClock,
      shiftIsOvertime: shiftIsOvertime,
      workUnits: workUnits,
      countedWorkUnits: countedWorkUnits,
      countedOvertimeUnits: countedOvertimeUnits,
      isLate: isLate,
      isEarlyLeave: isEarlyLeave,
    );
  }
}

extension AttendanceTimesheetDayMapper on AttendanceTimesheetDayDto {
  AttendanceTimesheetDay toEntity() {
    return AttendanceTimesheetDay(
      id: id,
      date: date,
      standardWorkUnits: standardWorkUnits,
      actualWorkUnits: actualWorkUnits,
      workedUnits: workedUnits,
      overtimeUnits: overtimeUnits,
      bonusUnits: bonusUnits,
      lateCount: lateCount,
      earlyLeaveCount: earlyLeaveCount,
      lateEarlyCount: lateEarlyCount,
      leaveCount: leaveCount,
      absentCount: absentCount,
      leaveOrAbsentCount: leaveOrAbsentCount,
      isLeaveDay: isLeaveDay,
      recordDetails: recordDetails.map((detail) => detail.toEntity()).toList(),
    );
  }
}

extension AttendanceTimesheetTotalsMapper on AttendanceTimesheetTotalsDto {
  AttendanceTimesheetTotals toEntity() {
    return AttendanceTimesheetTotals(
      standardWorkUnits: standardWorkUnits,
      actualWorkUnits: actualWorkUnits,
      workedUnits: workedUnits,
      overtimeUnits: overtimeUnits,
      bonusUnits: bonusUnits,
      lateCount: lateCount,
      earlyLeaveCount: earlyLeaveCount,
      lateEarlyCount: lateEarlyCount,
      leaveCount: leaveCount,
      absentCount: absentCount,
      leaveOrAbsentDays: leaveOrAbsentDays,
      leaveDays: leaveDays,
    );
  }
}

extension AttendanceTimesheetDataMapper on AttendanceTimesheetDataDto {
  AttendanceTimesheetData toEntity() {
    return AttendanceTimesheetData(
      employee: employee.toEntity(),
      month: month,
      totals: totals.toEntity(),
      days: days.map((day) => day.toEntity()).toList(),
    );
  }
}

extension AttendanceDailySummaryMapper on AttendanceDailySummaryDto {
  AttendanceDailySummary toEntity() {
    return AttendanceDailySummary(
      date: date,
      lateCount: lateCount,
      earlyLeaveCount: earlyLeaveCount,
      missingCheckInCount: missingCheckInCount,
      missingCheckOutCount: missingCheckOutCount,
      leaveCount: leaveCount,
      absentCount: absentCount,
    );
  }
}
