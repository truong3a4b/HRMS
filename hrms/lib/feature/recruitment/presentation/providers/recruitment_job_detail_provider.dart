import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repo/recruitment_repo.dart';
import '../../domain/entities/recruitment_job.dart';


final recruitmentJobDetailProvider =
FutureProvider.autoDispose.family<RecruitmentJob, String>((ref, id) async {
  final repo = ref.watch(recruitmentRepositoryProvider);
  return repo.getRecruitmentJobById(id);
});