import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../data/repo/schedule_repository.dart';
import '../../domain/entities/work_schedule.dart';

String currentScheduleMonthKey() {
  final now = DateTime.now();
  return '${now.year}-${now.month.toString().padLeft(2, '0')}';
}

final scheduleMonthProvider = NotifierProvider<ScheduleMonthNotifier, String>(
  ScheduleMonthNotifier.new,
);

class ScheduleMonthNotifier extends Notifier<String> {
  @override
  String build() => currentScheduleMonthKey();

  void setMonth(String month) {
    state = month;
  }
}

final myScheduleProvider = FutureProvider.autoDispose
    .family<List<WorkSchedule>, String>((ref, month) async {
      try {
        final repo = ref.read(scheduleRepositoryProvider);
        return repo.getMySchedule(month);
      } on AppException catch (e) {
        debugPrint(e.toString());
        rethrow;
      } catch (e, st) {
        debugPrint(e.toString());
        debugPrint(st.toString());
        throw AppException('Đã có lỗi xảy ra, vui lòng thử lại');
      }
    });
