import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../../core/error/app_exception.dart';
import '../../../data/repo/recruitment_repo.dart';
import '../../../domain/entities/interview_evaluation.dart';

final evaluationDetailProvider = FutureProvider.autoDispose
    .family<InterviewEvaluation, ({String applicationId, String evaluationId})>(
      (ref, params) async {
        final repository = ref.watch(recruitmentRepositoryProvider);
        try {
          final evaluation = await repository.getCandidateEvaluationById(
            applicationId: params.applicationId,
            evaluationId: params.evaluationId,
          );
          return evaluation;
        } on AppException catch (e) {
          rethrow;
        } catch (e, st) {
          debugPrint('EvaluationDetailProvider error: $e');
          debugPrintStack(stackTrace: st);
          throw AppException('Lỗi tải chi tiết đánh giá');
        }
      },
    );
