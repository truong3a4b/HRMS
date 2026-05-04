import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../recruitment/data/repo/recruitment_repo.dart';
import '../../../recruitment/domain/entities/job_application.dart';
import '../../../recruitment/domain/entities/recruitment_job.dart';

final candidateHomeProvider =
FutureProvider.autoDispose<CandidateHomeState>((ref) async {
  final repo = ref.read(recruitmentRepositoryProvider);

  final results = await Future.wait([
    repo.getRecruitmentJobs(),
    repo.fetchCandidateApplications(),
  ]);

  final jobs = results[0] as List<RecruitmentJob>;
  final applications = results[1] as List<JobApplication>;

  return CandidateHomeState(
    jobs: jobs.take(3).toList(),
    applications: applications.take(3).toList(),
  );
});

class CandidateHomeState {
  final List<RecruitmentJob> jobs;
  final List<JobApplication> applications;

  const CandidateHomeState({
    required this.jobs,
    required this.applications,
  });
}