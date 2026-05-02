import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/core/widget/app_error_center.dart';
import 'package:hrms/feature/auth/domain/entities/user.dart';

import '../../../../../core/widget/app_primary_button.dart';
import '../../../../../core/widget/app_response_dialog.dart';
import '../../../../auth/presentation/providers/user_provider.dart';
import '../../../domain/entities/interview_schedule.dart';
import '../../providers/interview/interview_schedule_action_provider.dart';
import '../../providers/interview/interview_schedule_detail_provider.dart';

class InterviewScheduleDetailScreen extends ConsumerWidget {
  final String interviewScheduleId;
  final String applicationId;

  const InterviewScheduleDetailScreen({
    super.key,
    required this.applicationId,
    required this.interviewScheduleId,
  });

  //Phản hồi lịch phỏng vấn
  Future<void> _onResponse(
      BuildContext context,
      WidgetRef ref,
      InterviewStatus status,
      ) async {
    final noteController = TextEditingController();

    final result = await showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AppResponseDialog(
          title: status == InterviewStatus.confirmed
              ? 'Xác nhận phỏng vấn'
              : 'Từ chối phỏng vấn',
          message: status == InterviewStatus.confirmed
              ? 'Bạn có chắc chắn muốn xác nhận tham gia buổi phỏng vấn này không?'
              : 'Bạn có chắc chắn muốn từ chối buổi phỏng vấn này không?',
          controller: noteController,
          confirmText: status == InterviewStatus.confirmed
              ? 'Xác nhận'
              : 'Từ chối',
          onCancel: () {
            Navigator.pop(dialogContext);
          },
          onConfirm: () {
            Navigator.pop(dialogContext, noteController.text.trim());
          },
        );
      },
    );

    if (result == null) return;

    final request = {
      'jobApplicationId': applicationId,
      'interviewScheduleId': interviewScheduleId,
      'decision': status.value,
      'note': result,
    };

    final success = await ref
        .read(interviewScheduleActionProvider.notifier)
        .respondInterviewSchedule(request);

    if (!context.mounted) return;

    if (success) {
      ref.invalidate(
        interviewScheduleDetailProvider((
        applicationId: applicationId,
        scheduleId: interviewScheduleId,
        )),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scheduleAsync = ref.watch(
      interviewScheduleDetailProvider((
        applicationId: applicationId,
        scheduleId: interviewScheduleId,
      )),
    );

    final actionState = ref.watch(interviewScheduleActionProvider);

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
          'Chi tiết phỏng vấn',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w700,
            fontSize: 20,
          ),
        ),
        titleSpacing: 0,
      ),
      body: scheduleAsync.when(
        data: (schedule) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(
              interviewScheduleDetailProvider((
                applicationId: applicationId,
                scheduleId: interviewScheduleId,
              )),
            );
          },
          child: _InterviewScheduleDetailContent(schedule: schedule),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => AppErrorCenter(errorMessage: e.toString()),
      ),
      bottomNavigationBar: scheduleAsync.maybeWhen(
        data: (data) => _buildActionButtons(
          context,
          ref,
          data,
          actionState.isLoading,
        ),
        orElse: () => const SizedBox.shrink()
      )
    );
  }

  Widget _buildActionButtons(
    BuildContext context,
    WidgetRef ref,
    InterviewSchedule schedule,
    bool isActionLoading,
  ) {
    final user = ref.read(userProvider).value;
    if (schedule.status == InterviewStatus.invited && user != null && user.role == UserRole.candidate) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        child: Row(
          children: [
            Expanded(
              child: SizedBox(
                height: 50,
                child: OutlinedButton(
                  onPressed: isActionLoading
                      ? null
                      : () => _onResponse(
                    context,
                    ref,
                    InterviewStatus.declined,
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF334155),
                    side: const BorderSide(color: Color(0xFFCBD5E1)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Từ chối',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: SizedBox(
                height: 50,
                child: AppPrimaryButton(
                  onPressed: isActionLoading
                      ? null
                      : () => _onResponse(
                    context,
                    ref,
                    InterviewStatus.confirmed,
                  ),
                  isLoading: isActionLoading,
                  text: 'Xác nhận',
                ),
              ),
            ),
          ],
        ),
      );
    }

    return const SizedBox.shrink();
  }
}

class _InterviewScheduleDetailContent extends StatelessWidget {
  final InterviewSchedule schedule;

  const _InterviewScheduleDetailContent({required this.schedule});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        children: [
          _HeaderCard(schedule: schedule),
          const SizedBox(height: 16),
          _InfoSectionCard(
            title: 'Thông tin phỏng vấn',
            items: [
              _InfoItem(label: 'Tiêu đề', value: schedule.title ?? '-'),
              _InfoItem(
                label: 'Thời gian',
                value: _formatDateTime(schedule.scheduledAt),
              ),
              _InfoItem(
                label: 'Hình thức',
                value: _interviewTypeText(schedule.type),
              ),
              _InfoItem(
                label: 'Địa điểm',
                value: schedule.location.isEmpty ? '-' : schedule.location,
              ),
              _InfoItem(
                label: 'Trạng thái',
                value: schedule.status.displayName,
              ),
              _InfoItem(
                label: 'Người tạo',
                value: schedule.createdBy?.name ?? '-',
              ),
              _InfoItem(
                label: 'Ngày tạo',
                value: _formatDateTime(schedule.createdAt),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _TextSectionCard(
            title: 'Ghi chú người phỏng vấn',
            content: schedule.interviewerNotes,
          ),
          const SizedBox(height: 16),
          _InfoSectionCard(
            title: 'Phản hồi ứng viên',
            items: [
              _InfoItem(
                label: 'Thời gian phản hồi',
                value: schedule.candidateResponseAt == null
                    ? '-'
                    : _formatDateTime(schedule.candidateResponseAt!),
              ),
              _InfoItem(
                label: 'Ghi chú phản hồi',
                value: schedule.candidateResponseNote ?? '-',
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _interviewTypeText(String? type) {
    switch (type?.toLowerCase()) {
      case 'offline':
        return 'Trực tiếp';
      case 'online':
        return 'Trực tuyến';
      case 'phone':
        return 'Qua điện thoại';
      default:
        return type ?? '-';
    }
  }

  String _formatDateTime(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year.toString();
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');

    return '$day/$month/$year $hour:$minute';
  }
}

class _HeaderCard extends StatelessWidget {
  final InterviewSchedule schedule;

  const _HeaderCard({required this.schedule});

  @override
  Widget build(BuildContext context) {
    return _BaseCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _StatusBadge(status: schedule.status),
          const SizedBox(height: 12),
          Text(
            schedule.title ?? 'Phỏng vấn',
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: Color(0xFF2F2F2F),
              height: 1.2,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            '${_formatDateTime(schedule.scheduledAt)} | ${schedule.location}',
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

  String _formatDateTime(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year.toString();
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');

    return '$day/$month/$year $hour:$minute';
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(title),
          const SizedBox(height: 18),
          ...items.map((e) => _InfoRow(item: e)),
        ],
      ),
    );
  }
}

class _TextSectionCard extends StatelessWidget {
  final String title;
  final String? content;

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
            content == null || content!.trim().isEmpty ? '-' : content!,
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
            width: 125,
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
  final InterviewStatus status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      InterviewStatus.invited => const Color(0xFF2563EB),
      InterviewStatus.confirmed => const Color(0xFF22C55E),
      InterviewStatus.declined => const Color(0xFFEF4444),
      InterviewStatus.completed => const Color(0xFF7C3AED),
      InterviewStatus.cancelled => const Color(0xFF64748B),
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
