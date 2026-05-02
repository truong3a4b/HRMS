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

  //update evaluation, currently only used for update title, score, strengths, concerns, recommendation, comments
  Future<bool> updateEvaluation(Map<String, dynamic> request) async {
    state = const AsyncValue.loading();
    try{
      final repo = ref.read(recruitmentRepositoryProvider);
      final applicationId = request['jobApplicationId'];
      final evaluationId = request['evaluationId'];
      if (applicationId == null || evaluationId == null) {
        throw AppException('Thiếu jobApplicationId hoặc evaluationId trong request');
      }

      await repo.updateCandidateEvaluation(applicationId, evaluationId, request);
      state = const AsyncValue.data(null);
      return true;
    } on AppException catch (e, st) {
      state = AsyncValue.error(e.message, st);
      return false;
    } catch (e, st) {
      debugPrint(
        'InterviewEvaluationActionNotifier updateEvaluation error: $e',
      );
      debugPrint('Stack trace: $st');
      state = AsyncValue.error('Lỗi khi cập nhật đánh giá ứng viên', st);
      return false;
    }
  }

  //delete evaluation
  Future<bool> deleteEvaluation(String applicationId, String evaluationId) async {
    state = const AsyncValue.loading();
    try{
      final repo = ref.read(recruitmentRepositoryProvider);
      await repo.deleteCandidateEvaluation(applicationId, evaluationId);
      state = const AsyncValue.data(null);
      return true;
    } on AppException catch (e, st) {
      state = AsyncValue.error(e.message, st);
      return false;
    } catch (e, st) {
      debugPrint(
        'InterviewEvaluationActionNotifier deleteEvaluation error: $e',
      );
      debugPrint('Stack trace: $st');
      state = AsyncValue.error('Lỗi khi xóa đánh giá ứng viên', st);
      return false;
    }
  }

}
