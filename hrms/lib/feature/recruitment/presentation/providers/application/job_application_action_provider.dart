import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';

import '../../../data/repo/recruitment_repo.dart';

final jobApplicationActionProvider =
    AsyncNotifierProvider<JobApplicationActionNotifier, void>(
      JobApplicationActionNotifier.new,
    );

class JobApplicationActionNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  //Huy don xin viec
  Future<bool> cancelApplication(String applicationId) async {
    state = const AsyncValue.loading();
    try {
      final repo = ref.read(recruitmentRepositoryProvider);
      await repo.cancelRecruitment(applicationId);
      state = const AsyncValue.data(null);
      return true;
    } on AppException catch (e, st) {
      debugPrint('JobApplicationActionProvider cancelApplication error: $e');
      state = AsyncValue.error(e.toString(), st);
      return false;
    } catch (e, st) {
      debugPrint('JobApplicationActionProvider cancelApplication error: $e');
      debugPrint('Stack trace: $st');
      state = AsyncValue.error(e.toString(), st);
      return false;
    }
  }

  //Tu choi don xin viec
  Future<bool> rejectApplication(Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final repo = ref.read(recruitmentRepositoryProvider);
      final applicationId = data['applicationId'];
      if (applicationId == null) {
        throw AppException('Thiếu applicationId trong request');
      }

      await repo.rejectCandidate(applicationId, data);

      state = const AsyncValue.data(null);
      return true;
    } on AppException catch (e, st) {
      debugPrint('JobApplicationActionProvider rejectApplication error: $e');
      state = AsyncValue.error(e.toString(), st);
      return false;
    } catch (e, st) {
      debugPrint('JobApplicationActionProvider rejectApplication error: $e');
      debugPrint('Stack trace: $st');
      state = AsyncValue.error(e.toString(), st);
      return false;
    }
  }
}
