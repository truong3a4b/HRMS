import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/utils/time_convert.dart';
import '../../../../../core/widget/app_confirm_dialog.dart';
import '../../../../../core/widget/app_snackbar.dart';
import '../../../../account/presentation/providers/profile_provider.dart';
import '../../../../auth/domain/entities/user.dart';
import '../../../../auth/presentation/providers/auth_provider.dart';
import '../../../domain/entities/interview_evaluation.dart';
import '../../providers/application/job_application_detail_provider.dart';
import '../../providers/evaluation/evaluation_detail_provider.dart';
import '../../providers/evaluation/interview_evaluation_action_provider.dart';

class EvaluationDetailScreen extends ConsumerWidget {
  final String applicationId;
  final String evaluationId;

  const EvaluationDetailScreen({
    super.key,
    required this.applicationId,
    required this.evaluationId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final evaluationAsync = ref.watch(
      evaluationDetailProvider((
        applicationId: applicationId,
        evaluationId: evaluationId,
      )),
    );
    final user = ref.watch(authNotifierProvider).value?.user;
    final profile = ref.watch(profileProvider).value;

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
          'Chi tiết đánh giá',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w700,
            fontSize: 20,
          ),
        ),
        titleSpacing: 0,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, thickness: 1, color: Color(0xFFEAEAEA)),
        ),
        actions: [
          evaluationAsync.maybeWhen(
            data: (evaluation) {
              final showActionButtons =
                  user != null &&
                  profile != null &&
                  user.role != UserRole.candidate &&
                  profile.id == evaluation.evaluator.id;

              if (!showActionButtons) return const SizedBox();
              return PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, color: Colors.black),
                onSelected: (value) async {
                  if (value == 'edit') {
                    context.push('/applications/$applicationId/evaluation-detail/${evaluation.id}/edit');
                  } else if (value == 'delete') {
                    final confirm = await showDialog<bool>(
                      context: context,
                      builder: (context) => AppConfirmDialog(
                        title: 'Xác nhận xóa',
                        message: 'Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.',
                        confirmText: 'Xóa',
                        cancelText: 'Hủy',
                        onConfirm: () => {context.pop(true)},
                        onCancel: () => {context.pop(false)},
                      ),
                    );

                    if (confirm == true) {
                      final success = await ref.read(interviewEvaluationActionProvider.notifier).deleteEvaluation(applicationId, evaluation.id);
                      if(!context.mounted) return;
                      if (success) {
                        AppSnackbar.showSuccess(context, 'Xóa đánh giá thành công');
                        ref.invalidate(jobApplicationDetailProvider(applicationId));
                        context.pop();
                      } else {
                        AppSnackbar.showError(context, 'Xóa đánh giá thất bại. Vui lòng thử lại.');
                      }
                    }
                  }
                },
                itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'edit',
                      child: Text('Chỉnh sửa đánh giá'),
                    ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Text('Xóa đánh giá', style: TextStyle(color: Colors.red)),
                    ),
                ],
              );
            },
            orElse: () => const SizedBox(),
          ),
        ],
      ),
      body: evaluationAsync.when(
        data: (evaluation) => _buildContent(evaluation),
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

  Widget _buildContent(InterviewEvaluation evaluation) {
    return RefreshIndicator(
      onRefresh: () async {},
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(
          children: [
            _HeaderCard(evaluation: evaluation),
            const SizedBox(height: 16),
            _InfoSectionCard(
              title: 'Thông tin đánh giá',
              items: [
                _InfoItem(
                  label: 'Người đánh giá',
                  value: evaluation.evaluator.name,
                ),
                _InfoItem(label: 'Email', value: evaluation.evaluator.email),
                _InfoItem(
                  label: 'Điểm',
                  value: evaluation.score == null
                      ? 'Chưa chấm'
                      : '${evaluation.score}/10',
                ),
                _InfoItem(
                  label: 'Ngày đánh giá',
                  value: TimeConvert.convertDateTimeToString(
                    evaluation.createdAt,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _TextSectionCard(
              title: 'Điểm mạnh',
              content: evaluation.strengths,
              icon: Icons.trending_up_outlined,
              color: const Color(0xFF16A34A),
            ),
            const SizedBox(height: 16),
            _TextSectionCard(
              title: 'Điểm cần lưu ý',
              content: evaluation.concerns,
              icon: Icons.warning_amber_outlined,
              color: const Color(0xFFF59E0B),
            ),
            const SizedBox(height: 16),
            _TextSectionCard(
              title: 'Đề xuất',
              content: evaluation.recommendation,
              icon: Icons.lightbulb_outline,
              color: const Color(0xFF0069B4),
            ),
            const SizedBox(height: 16),
            _TextSectionCard(
              title: 'Ghi chú thêm',
              content: evaluation.comments,
              icon: Icons.notes_outlined,
              color: const Color(0xFF64748B),
            ),
          ],
        ),
      ),
    );
  }
}

class _HeaderCard extends StatelessWidget {
  final InterviewEvaluation evaluation;

  const _HeaderCard({required this.evaluation});

  @override
  Widget build(BuildContext context) {
    final title = evaluation.title?.trim().isNotEmpty == true
        ? evaluation.title!
        : 'Đánh giá phỏng vấn';

    return _BaseCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ScoreBadge(score: evaluation.score),
          const SizedBox(height: 14),
          Text(
            title,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: Color(0xFF2F2F2F),
              height: 1.2,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Người đánh giá: ${evaluation.evaluator.name}',
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

class _ScoreBadge extends StatelessWidget {
  final int? score;

  const _ScoreBadge({required this.score});

  @override
  Widget build(BuildContext context) {
    final hasScore = score != null;

    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: hasScore
              ? const Color(0xFF0069B4).withValues(alpha: 0.12)
              : const Color(0xFF64748B).withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          hasScore ? 'Điểm $score/10' : 'Chưa chấm điểm',
          style: TextStyle(
            color: hasScore ? const Color(0xFF0069B4) : const Color(0xFF64748B),
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _TextSectionCard extends StatelessWidget {
  final String title;
  final String? content;
  final IconData icon;
  final Color color;

  const _TextSectionCard({
    required this.title,
    required this.content,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final text = content?.trim();

    return _BaseCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 19, color: color),
              ),
              const SizedBox(width: 10),
              Expanded(child: _SectionTitle(title)),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            text == null || text.isEmpty ? '-' : text,
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
              item.value.isEmpty ? '-' : item.value,
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
