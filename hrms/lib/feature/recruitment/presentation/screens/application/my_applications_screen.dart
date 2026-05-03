import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/utils/time_convert.dart';
import '../../../../../core/widget/app_error_center.dart';
import '../../../domain/entities/job_application.dart';
import '../../providers/application/my_application_list_provider.dart';

class MyApplicationsScreen extends ConsumerWidget {
  const MyApplicationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final applicationsAsync = ref.watch(myApplicationListProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF3F3F3),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),
        title: const Text(
          'Đơn ứng tuyển của tôi',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
      ),
      body: applicationsAsync.when(
        data: (applications) {
          if (applications.isEmpty) {
            return const _EmptyApplications();
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(myApplicationListProvider);
            },
            child: ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 100),
              itemCount: applications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                return MyApplicationCard(application: applications[index]);
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, st) {
          return AppErrorCenter(
            errorMessage: error.toString(),
            onRetry: () => ref.invalidate(myApplicationListProvider),
          );
        },
      ),
    );
  }
}

class MyApplicationCard extends StatelessWidget {
  final JobApplication application;

  const MyApplicationCard({
    super.key,
    required this.application,
  });

  @override
  Widget build(BuildContext context) {
    final job = application.job;

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () {
        context.push('/job-application-detail/${application.id}');
      },
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE8E8E8)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _JobIcon(status: application.status),
                const SizedBox(width: 12),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        job.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF1F2937),
                          height: 1.25,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        '${application.position.name} | ${application.department.name}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF64748B),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),

                const Icon(
                  Icons.arrow_forward_ios,
                  size: 15,
                  color: Color(0xFFB0B0B0),
                ),
              ],
            ),

            const SizedBox(height: 14),

            Row(
              children: [
                _StatusBadge(status: application.status),
                const Spacer(),
                Text(
                  TimeConvert.convertDateTimeToString(application.appliedAt),
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF8A8A8A),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            _ApplicationHint(application: application),
          ],
        ),
      ),
    );
  }
}

class _ApplicationHint extends StatelessWidget {
  final JobApplication application;

  const _ApplicationHint({required this.application});

  @override
  Widget build(BuildContext context) {
    final text = switch (application.status) {
      JobApplicationStatus.applied => 'Hồ sơ của bạn đã được gửi và đang chờ xử lý.',
      JobApplicationStatus.interviewing => 'Bạn đang trong giai đoạn xét duyệt.',
      JobApplicationStatus.offerSent => 'Bạn đã nhận được offer. Vui lòng phản hồi.',
      JobApplicationStatus.offerDeclined => 'Bạn đã từ chối offer.',
      JobApplicationStatus.rejected => 'Đơn ứng tuyển của bạn đã bị từ chối.',
      JobApplicationStatus.cancelled => 'Bạn đã hủy đơn ứng tuyển này.',
      JobApplicationStatus.onboarded => 'Bạn đã được onboard thành nhân viên.',
      _ => 'Theo dõi chi tiết quy trình tuyển dụng.',
    };

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 13,
          color: Color(0xFF475569),
          height: 1.35,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}

class _JobIcon extends StatelessWidget {
  final JobApplicationStatus status;

  const _JobIcon({required this.status});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 46,
      height: 46,
      decoration: BoxDecoration(
        color: status.color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Icon(
        Icons.work_outline,
        color: status.color,
        size: 23,
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final JobApplicationStatus status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: status.color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status.displayName,
        style: TextStyle(
          fontSize: 12,
          color: status.color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _EmptyApplications extends StatelessWidget {
  const _EmptyApplications();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 32),
        child: Text(
          'Bạn chưa ứng tuyển công việc nào.',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            color: Color(0xFF7A7A7A),
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}