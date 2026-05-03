import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/feature/account/presentation/providers/profile_provider.dart';
import 'package:hrms/feature/recruitment/presentation/providers/jobs/recruitment_job_list_provider.dart';

import '../../../../../core/utils/currency_convert.dart';
import '../../../../../core/utils/time_convert.dart';
import '../../../../../core/widget/app_primary_button.dart';
import '../../../../../core/widget/app_snackbar.dart';
import '../../../../account/presentation/providers/permission_provider.dart';
import '../../../../auth/domain/entities/user.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../../position/domain/entities/position.dart';
import '../../../domain/entities/apply_job_request.dart';
import '../../../domain/entities/recruitment_job.dart';
import '../../providers/jobs/recruitment_job_action_provider.dart';
import '../../providers/jobs/recruitment_job_detail_provider.dart';
import '../../widgets/apply_job_bottom_sheet.dart';

class RecruitmentJobDetailScreen extends ConsumerWidget {
  final String jobId;

  const RecruitmentJobDetailScreen({super.key, required this.jobId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobAsync = ref.watch(recruitmentJobDetailProvider(jobId));
    final actionAsync = ref.watch(recruitmentJobActionProvider);
    final user = ref.watch(authNotifierProvider).value?.user;
    final permissions = ref.watch(permissionProvider).value ?? {};

    final isCandidate = user?.role == UserRole.candidate;
    final canManageJob =
        user?.role == UserRole.admin ||
        permissions.contains(Permission.recruitmentManageJob) ;

    ref.listen(recruitmentJobActionProvider, (prev, next) {
      next.whenOrNull(
        error: (err, _) {
          if (!context.mounted) return;

          AppSnackbar.showError(context, err.toString());
        },
      );
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),
        title: const Text(
          'Chi tiết tuyển dụng',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w700,
            fontSize: 20,
          ),
        ),
        titleSpacing: 0,
        actions: [
          jobAsync.maybeWhen(
            data: (job) {
              if (!canManageJob) return const SizedBox();

              return PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, color: Colors.black),
                onSelected: (value) async {
                  if (value == 'edit') {
                    final success = await context.push<bool>(
                      '/update-recruitment-job/${job.id}',
                    );

                    if (success == true) {
                      ref.invalidate(recruitmentJobDetailProvider(job.id));
                    }
                  }

                  if (value == 'close') {
                    final success = await ref
                        .read(recruitmentJobActionProvider.notifier)
                        .closeJob(job.id);
                    if (!context.mounted) return;
                    if (success) {
                      AppSnackbar.showSuccess(
                        context,
                        'Đã đóng tin tuyển dụng',
                      );
                      ref.invalidate(recruitmentJobListProvider);

                      context.pop(true);
                    }
                  }
                  if(value == 'open') {
                    final success = await ref
                        .read(recruitmentJobActionProvider.notifier)
                        .openJob(job.id);
                    if (!context.mounted) return;
                    if (success) {
                      AppSnackbar.showSuccess(
                        context,
                        'Đã mở lại tin tuyển dụng',
                      );
                      ref.invalidate(recruitmentJobListProvider);
                    }
                  }
                },
                itemBuilder: (context) => [
                  if (job.status == RecruitmentJobStatus.OPEN) ...[
                    const PopupMenuItem(value: 'edit', child: Text('Chỉnh sửa')),
                    const PopupMenuItem(
                      value: 'close',
                      child: Text('Đóng tin tuyển dụng'),
                    ),
                  ],

                  if(job.status == RecruitmentJobStatus.CLOSED)
                    const PopupMenuItem(
                      value: 'open',
                      child: Text('Mở lại tin tuyển dụng'),
                    ),
                ],
              );
            },
            orElse: () => const SizedBox(),
          ),
        ],
      ),
      body: jobAsync.when(
        data: (job) => _buildContent(job),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Text(
            e.toString(),
            style: const TextStyle(color: Colors.red),
            textAlign: TextAlign.center,
          ),
        ),
      ),
      bottomNavigationBar: jobAsync.maybeWhen(
        data: (job) {
          if (!isCandidate) return null;
          if (job.status != RecruitmentJobStatus.OPEN) return null;
          print('Job applied: ${job.isApplied}');
          return SafeArea(
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
              color: Colors.white,
              child: SizedBox(
                height: 50,
                width: double.infinity,
                child: AppPrimaryButton(
                  isLoading: actionAsync.isLoading,
                  text: job.isApplied ? 'Đã ứng tuyển' : 'Ứng tuyển ngay',
                  onPressed: job.isApplied
                      ? null
                      : () async {
                          final success =
                              await showModalBottomSheet<bool>(
                                context: context,
                                isScrollControlled: true,
                                backgroundColor: Colors.white,
                                builder: (context) => ApplyJobBottomSheet(
                                  recruitmentJobId: job.id,
                                ),
                              );
                          if (success == true) {
                            ref.invalidate(recruitmentJobDetailProvider(job.id));
                            ref.invalidate(profileProvider);
                          }

                        },
                ),
              ),
            ),
          );
        },
        orElse: () => null,
      ),
    );
  }

  Widget _buildContent(RecruitmentJob job) {
    final salaryText = _salaryText(job.salaryMin, job.salaryMax);

    return RefreshIndicator(
      onRefresh: () async {},
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          children: [
            _HeaderCard(job: job),
            const SizedBox(height: 16),
            _InfoSectionCard(
              title: 'Thông tin tuyển dụng',
              items: [
                _InfoItem(label: 'Chức danh', value: job.position?.name ?? '-'),
                _InfoItem(
                  label: 'Phòng ban',
                  value: job.department?.name ?? '-',
                ),
                _InfoItem(label: 'Số lượng', value: job.quantity.toString()),
                _InfoItem(label: 'Mức lương', value: salaryText),
                _InfoItem(
                  label: 'Hạn nộp',
                  value: TimeConvert.convertDateTimeToString(job.deadline),
                ),
                _InfoItem(label: 'Trạng thái', value: job.status.displayName),
              ],
            ),
            const SizedBox(height: 16),
            _TextSectionCard(
              title: 'Mô tả công việc',
              content: job.description,
            ),
            const SizedBox(height: 16),
            _TextSectionCard(
              title: 'Yêu cầu ứng viên',
              content: job.requirements,
            ),
            const SizedBox(height: 16),
            _TextSectionCard(title: 'Quyền lợi', content: job.benefits),
          ],
        ),
      ),
    );
  }

  String _salaryText(double? min, double? max) {
    if (min == null && max == null) return 'Thỏa thuận';

    if (min != null && max != null) {
      return '${CurrencyConvert.convertToCurrency(min)} - ${CurrencyConvert.convertToCurrency(max)}';
    }

    if (min != null) {
      return 'Từ ${CurrencyConvert.convertToCurrency(min)}';
    }

    return 'Đến ${CurrencyConvert.convertToCurrency(max)}';
  }
}

class _HeaderCard extends StatelessWidget {
  final RecruitmentJob job;

  const _HeaderCard({required this.job});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE8E8E8)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _StatusBadge(status: job.status),
          const SizedBox(height: 12),
          Text(
            job.title,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: Color(0xFF2F2F2F),
              height: 1.2,
            ),
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
        ],
      ),
    );
  }
}

class _TextSectionCard extends StatelessWidget {
  final String title;
  final String content;

  const _TextSectionCard({required this.title, required this.content});

  @override
  Widget build(BuildContext context) {
    return _BaseCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(title),
          const SizedBox(height: 12),
          Text(
            content.isEmpty ? '-' : content,
            style: const TextStyle(
              fontSize: 14,
              height: 1.55,
              color: Color(0xFF333333),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoSectionCard extends StatelessWidget {
  final String title;
  final List<_InfoItem> items;

  const _InfoSectionCard({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return _BaseCard(
      child: Column(
        children: [
          Row(children: [Expanded(child: _SectionTitle(title))]),
          const SizedBox(height: 18),
          ...items.map((e) => _InfoRow(item: e)),
        ],
      ),
    );
  }
}

class _BaseCard extends StatelessWidget {
  final Widget child;

  const _BaseCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE8E8E8)),
      ),
      child: child,
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 17,
        fontWeight: FontWeight.w700,
        color: Color(0xFF2F2F2F),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final _InfoItem item;

  const _InfoRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 115,
            child: Text(
              item.label,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF9A9A9A),
                fontWeight: FontWeight.w500,
                height: 1.35,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              item.value,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF333333),
                fontWeight: FontWeight.w600,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoItem {
  final String label;
  final String value;

  const _InfoItem({required this.label, required this.value});
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

    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
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
      ),
    );
  }
}
