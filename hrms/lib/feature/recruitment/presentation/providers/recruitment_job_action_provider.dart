import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repo/recruitment_repo.dart';

class RecruitmentJobActionNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<bool> applyJob(String jobId) async {
    state = const AsyncValue.loading();

    try {
      final repo = ref.read(recruitmentRepositoryProvider);
      final result = await repo.applyJob(jobId);
      state = const AsyncValue.data(null);
      return result;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> closeJob(String jobId) async {
    state = const AsyncValue.loading();

    try {
      final repo = ref.read(recruitmentRepositoryProvider);
      final result = await repo.closeRecruitmentJob(jobId);
      state = const AsyncValue.data(null);
      return result;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }
}

final recruitmentJobActionProvider =
AsyncNotifierProvider<RecruitmentJobActionNotifier, void>(
  RecruitmentJobActionNotifier.new,
);