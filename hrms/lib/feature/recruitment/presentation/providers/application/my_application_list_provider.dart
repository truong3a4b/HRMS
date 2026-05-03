import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/repo/recruitment_repo.dart';
import '../../../domain/entities/job_application.dart';

final myApplicationListProvider =
FutureProvider.autoDispose<List<JobApplication>>((ref) async {
  final repo = ref.read(recruitmentRepositoryProvider);
  return repo.fetchCandidateApplications();
});