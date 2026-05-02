import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';

import '../../../data/repo/recruitment_repo.dart';

final interviewEvaluationActionProvider =
    AsyncNotifierProvider<InterviewEvaluationActionNotifier, void>(
      InterviewEvaluationActionNotifier.new,
    );

class InterviewEvaluationActionNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<bool> evaluateCandidate(Map<String, dynamic> request) async {
    state = const AsyncValue.loading();

    try {
      final repo = ref.read(recruitmentRepositoryProvider);
      final applicationId = request['jobApplicationId'];
      if (applicationId == null) {
        throw AppException('Thiếu jobApplicationId trong request');
      }

      await repo.evaluateCandidate(applicationId, request);
      state = const AsyncValue.data(null);
      return true;
    } on AppException catch (e, st) {
      state = AsyncValue.error(e.message, st);
      return false;
    } catch (e, st) {
      debugPrint(
        'InterviewEvaluationActionNotifier evaluateCandidate error: $e',
      );
      debugPrint('Stack trace: $st');
      state = AsyncValue.error('Lỗi khi đánh giá ứng viên', st);
      return false;
    }
  }
}
