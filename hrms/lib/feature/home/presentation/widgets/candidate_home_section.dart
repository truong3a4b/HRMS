import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../recruitment/domain/entities/job_application.dart';
import '../../../recruitment/domain/entities/recruitment_job.dart';
import '../../../recruitment/presentation/screens/application/my_applications_screen.dart';
import '../../../recruitment/presentation/screens/jobs/recruitment_job_list_screen.dart';
import '../providers/candidate_home_provider.dart';

class CandidateHomeSection extends ConsumerWidget {
  const CandidateHomeSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeAsync = ref.watch(candidateHomeProvider);

    return homeAsync.when(
      data: (state) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _HomeJobSection(jobs: state.jobs),
            const SizedBox(height: 24),
            _HomeApplicationSection(applications: state.applications),
          ],
        );
      },
      loading: () => const Padding(
        padding: EdgeInsets.only(top: 40),
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          e.toString(),
          style: const TextStyle(color: Colors.red),
        ),
      ),
    );
  }
}

class _HomeJobSection extends StatelessWidget {
  final List<RecruitmentJob> jobs;

  const _HomeJobSection({required this.jobs});

  @override
  Widget build(BuildContext context) {
    return _HomeSectionFrame(
      title: 'Việc đang tuyển',
      onSeeMore: () {
        context.push('/recruitment-job-list');
      },
      emptyText: 'Chưa có vị trí tuyển dụng phù hợp.',
      isEmpty: jobs.isEmpty,
      child: Column(
        children: jobs.map((job) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: RecruitmentJobCard(
              job: job,
              onTap: () {
                context.push('/recruitment-job-detail/${job.id}');
              },
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _HomeApplicationSection extends StatelessWidget {
  final List<JobApplication> applications;

  const _HomeApplicationSection({required this.applications});

  @override
  Widget build(BuildContext context) {
    return _HomeSectionFrame(
      title: 'Đơn ứng tuyển của tôi',
      onSeeMore: () {
        context.push('/my-applications');
      },
      emptyText: 'Bạn chưa ứng tuyển công việc nào.',
      isEmpty: applications.isEmpty,
      child: Column(
        children: applications.map((application) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: MyApplicationCard(application: application),
          );
        }).toList(),
      ),
    );
  }
}

class _HomeSectionFrame extends StatelessWidget {
  final String title;
  final VoidCallback onSeeMore;
  final Widget child;
  final bool isEmpty;
  final String emptyText;

  const _HomeSectionFrame({
    required this.title,
    required this.onSeeMore,
    required this.child,
    required this.isEmpty,
    required this.emptyText,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF222222),
                ),
              ),
            ),
            TextButton(
              onPressed: onSeeMore,
              child: const Text(
                'Xem thêm',
                style: TextStyle(
                  color: Color(0xFF0069B4),
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        if (isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE8E8E8)),
            ),
            child: Text(
              emptyText,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF7A7A7A),
                fontWeight: FontWeight.w500,
              ),
            ),
          )
        else
          child,
      ],
    );
  }
}