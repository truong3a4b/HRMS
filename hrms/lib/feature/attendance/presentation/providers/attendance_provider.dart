import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../data/repo/attendance_repository.dart';
import '../../domain/entities/attendance.dart';

String currentMonthKey() {
  final now = DateTime.now();
  return '${now.year}-${now.month.toString().padLeft(2, '0')}';
}

final attendanceMonthProvider =
    NotifierProvider<AttendanceMonthNotifier, String>(
      AttendanceMonthNotifier.new,
    );

class AttendanceMonthNotifier extends Notifier<String> {
  @override
  String build() => currentMonthKey();

  void setMonth(String month) {
    state = month;
  }
}

final myAttendanceHistoryProvider = FutureProvider.autoDispose
    .family<AttendanceHistoryData, String>((ref, month) async {
      try {
        final repo = ref.read(attendanceRepositoryProvider);
        return repo.getMyHistory(month);
      } on AppException catch (e) {
        debugPrint(e.toString());
        rethrow;
      } catch (e, st) {
        debugPrint(e.toString());
        debugPrint(st.toString());
        throw AppException('Đã có lỗi xảy ra, vui lòng thử lại');
      }
    });

final myAttendanceTimesheetProvider = FutureProvider.autoDispose
    .family<AttendanceTimesheetData, String>((ref, month) async {
      try {
        final repo = ref.read(attendanceRepositoryProvider);
        return repo.getMyTimesheet(month);
      } on AppException catch (e) {
        debugPrint(e.toString());
        rethrow;
      } catch (e, st) {
        debugPrint(e.toString());
        debugPrint(st.toString());
        throw AppException('Đã có lỗi xảy ra, vui lòng thử lại');
      }
    });
