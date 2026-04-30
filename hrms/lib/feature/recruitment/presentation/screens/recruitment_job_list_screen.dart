import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/feature/auth/domain/entities/user.dart';
import 'package:hrms/feature/auth/presentation/providers/user_provider.dart';
import 'package:hrms/feature/position/domain/entities/position.dart';

import '../../../../core/utils/currency_convert.dart';
import '../../../../core/utils/time_convert.dart';
import '../../../account/presentation/providers/permission_provider.dart';
import '../../domain/entities/recruitment_job.dart';
import '../providers/recruitment_job_list_provider.dart';

class RecruitmentJobListScreen extends ConsumerWidget {
  const RecruitmentJobListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobsAsync = ref.watch(recruitmentJobListProvider);
    final user = ref.watch(userProvider).value;
    final permissions = ref.watch(permissionProvider).value!;
    final showAddButton = user?.role == UserRole.admin || permissions.contains(Permission.recruitmentCreateJob);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF3F8FB),
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),
        title: const Text(
          'Vị trí tuyển dụng',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        centerTitle: false,
      ),
      //nut them moi nhan vien
      floatingActionButton: showAddButton ? FloatingActionButton(
        onPressed: () async {
          final success = await context.push<bool>('/add-recruitment-job');
          if (success == true) {
            ref.invalidate(recruitmentJobListProvider);
          }
        },
        backgroundColor: const Color(0xFF0069B4),
        shape: const CircleBorder(),
        child: const Icon(Icons.add, color: Colors.white, size: 30),
      ) : null,
      body: jobsAsync.when(
        data: (jobs) {
          if (jobs.isEmpty) {
            return const Center(child: Text('Chưa có vị trí tuyển dụng'));
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(recruitmentJobListProvider);
            },
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              itemCount: jobs.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final job = jobs[index];

                return RecruitmentJobCard(
                  job: job,
                  onTap: () {
                    context.push('/recruitment-job-detail/${job.id}');
                  },
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Text(
            e.toString(),
            style: const TextStyle(color: Colors.red),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}

class RecruitmentJobCard extends StatelessWidget {
  final RecruitmentJob job;
  final VoidCallback? onTap;

  const RecruitmentJobCard({
    super.key,
    required this.job,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final salaryText = _salaryText(job.salaryMin, job.salaryMax);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE8E8E8)),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    job.title,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF2F2F2F),
                    ),
                  ),
                ),
                _StatusBadge(status: job.status),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              '${job.position?.name ?? '-'} | ${job.department?.name ?? '-'}',
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF55606D),
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 14),
            _JobInfoRow(
              icon: Icons.people_alt_outlined,
              text: 'Số lượng: ${job.quantity}',
            ),
            const SizedBox(height: 8),
            _JobInfoRow(
              icon: Icons.payments_outlined,
              text: salaryText,
            ),
            const SizedBox(height: 8),
            _JobInfoRow(
              icon: Icons.event_outlined,
              text:
              'Hạn nộp: ${TimeConvert.convertDateTimeToString(job.deadline)}',
            ),
          ],
        ),
      ),
    );
  }

  String _salaryText(double? min, double? max) {
    if (min == null && max == null) return 'Lương: Thỏa thuận';
    if (min != null && max != null) {
      return 'Lương: ${CurrencyConvert.convertToCurrency(min)} - ${CurrencyConvert.convertToCurrency(max)}';
    }
    if (min != null) {
      return 'Lương từ: ${CurrencyConvert.convertToCurrency(min)}';
    }
    return 'Lương đến: ${CurrencyConvert.convertToCurrency(max)}';
  }
}

class _JobInfoRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _JobInfoRow({
    required this.icon,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF0E6BA8)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF333333),
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final RecruitmentJobStatus status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      RecruitmentJobStatus.OPEN => const Color(0xFF22C55E),
      RecruitmentJobStatus.CLOSED => const Color(0xFF64748B),
      RecruitmentJobStatus.CANCELLED => const Color(0xFFEF4444),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status.displayName,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}