import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/attendance.dart';
import '../datasources/attendance_remote.dart';
import '../mapper/attendance_mapper.dart';

class AttendanceRepository {
  final AttendanceRemote remote;

  AttendanceRepository(this.remote);

  Future<AttendanceHistoryData> getMyHistory(String month) async {
    final dto = await remote.getMyHistory(month);
    return dto.toEntity();
  }

  Future<AttendanceTimesheetData> getMyTimesheet(String month) async {
    final dto = await remote.getMyTimesheet(month);
    return dto.toEntity();
  }

  Future<AttendanceDailySummary> getDailySummary(String date) async {
    final dto = await remote.getDailySummary(date);
    return dto.toEntity();
  }
}

final attendanceRepositoryProvider = Provider<AttendanceRepository>((ref) {
  final remote = ref.watch(attendanceRemoteProvider);
  return AttendanceRepository(remote);
});
