import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';

import '../../../data/repo/recruitment_repo.dart';

final interviewScheduleActionProvider =
    AsyncNotifierProvider<InterviewScheduleActionNotifier, void>(
      InterviewScheduleActionNotifier.new,
    );

class InterviewScheduleActionNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<bool> addInterviewSchedule(Map<String, dynamic> request) async {
    state = const AsyncValue.loading();

    try {
      final repo = ref.read(recruitmentRepositoryProvider);
      final applicationId = request['jobApplicationId'];
      if (applicationId == null) {
        throw AppException('Thiếu jobApplicationId trong request');
      }
      await repo.addInterviewSchedule(applicationId, request);
      state = const AsyncValue.data(null);
      return true;
    } on AppException catch (e, st) {
      state = AsyncValue.error(e.message, st);
      return false;
    } catch (e, st) {
      debugPrint(
        'InterviewScheduleActionNotifier addInterviewSchedule error: $e',
      );
      debugPrint('Stack trace: $st');
      state = AsyncValue.error("Lỗi khi tạo lịch phỏng vấn:", st);
      return false;
    }
  }

  //Phan hoi lich phong van
  Future<bool> respondInterviewSchedule(Map<String, dynamic> request) async {
    state = const AsyncValue.loading();

    try {
      final repo = ref.read(recruitmentRepositoryProvider);
      final applicationId = request['jobApplicationId'];
      final interviewScheduleId = request['interviewScheduleId'];
      if (applicationId == null || interviewScheduleId == null) {
        throw AppException('Thiếu jobApplicationId hoặc interviewScheduleId trong request');
      }
      await repo.respondInterviewSchedule(applicationId, interviewScheduleId, request);
      state = const AsyncValue.data(null);
      return true;
    } on AppException catch (e, st) {
      state = AsyncValue.error(e.message, st);
      return false;
    } catch (e, st) {
      debugPrint(
        'InterviewScheduleActionNotifier respondInterviewSchedule error: $e',
      );
      debugPrint('Stack trace: $st');
      state = AsyncValue.error("Lỗi khi phản hồi lịch phỏng vấn:", st);
      return false;
    }
  }
}
