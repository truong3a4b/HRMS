import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/repo/recruitment_repo.dart';
import '../../../domain/entities/recruitment_job.dart';

final recruitmentJobListProvider =
FutureProvider.autoDispose<List<RecruitmentJob>>((ref) async {
  final repo = ref.watch(recruitmentRepositoryProvider);

  return repo.getRecruitmentJobs(
    page: 1,
    limit: 10,
  );
});