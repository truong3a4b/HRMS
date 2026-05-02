import 'package:flutter/material.dart';
import 'package:hrms/feature/recruitment/presentation/widgets/section_card.dart';

import '../../../../core/utils/time_convert.dart';
import '../../domain/entities/interview_evaluation.dart';
import 'add_evaluation_bottom_sheet.dart';

class EvaluationSection extends StatelessWidget {
  final String applicationId;
  final List<InterviewEvaluation> evaluations;
  final bool canEvaluate;

  const EvaluationSection({
    super.key,
    required this.applicationId,
    required this.evaluations,
    this.canEvaluate = false,
  });

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Đánh giá ứng viên',
      icon: Icons.rate_review_outlined,
      canAdd: canEvaluate,
      onAdd: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (context) => AddEvaluationBottomSheet(
            jobApplicationId: applicationId,
          ),
        );
      },
      child: evaluations.isEmpty
          ? const Text(
        'Chưa có đánh giá',
              style: TextStyle(fontSize: 13, color: Color(0xFF7A7A7A)),
      )
          : Column(
              children: evaluations
                  .map((evaluation) => _EvaluationItem(evaluation: evaluation))
                  .toList(),
      ),
    );
  }
}

class _EvaluationItem extends StatelessWidget {
  final InterviewEvaluation evaluation;

  const _EvaluationItem({required this.evaluation});

  @override
  Widget build(BuildContext context) {
    final score = evaluation.score;
    final title = evaluation.title?.trim().isNotEmpty == true
        ? evaluation.title!
        : 'Đánh giá ứng viên';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F7F7),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEAEAEA)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.assignment_turned_in_outlined,
                size: 18,
                color: Color(0xFF0069B4),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1A1A1A),
                  ),
                ),
              ),
              _ScoreBadge(score: score),
            ],
          ),

          const SizedBox(height: 10),

          _SmallInfoRow(
            icon: Icons.person_outline,
            text: 'Người đánh giá: ${evaluation.evaluator.name}',
          ),

          const SizedBox(height: 5),

          _SmallInfoRow(
            icon: Icons.access_time,
            text:
            'Ngày đánh giá: ${TimeConvert.convertDateTimeToString(evaluation.createdAt)}',
          ),

          if (_hasText(evaluation.strengths)) ...[
            const SizedBox(height: 10),
            _PreviewBlock(
              title: 'Điểm mạnh',
              content: evaluation.strengths!,
              color: const Color(0xFF16A34A),
            ),
          ],

          if (_hasText(evaluation.concerns)) ...[
            const SizedBox(height: 8),
            _PreviewBlock(
              title: 'Điểm cần lưu ý',
              content: evaluation.concerns!,
              color: const Color(0xFFF59E0B),
            ),
          ],

          if (_hasText(evaluation.recommendation)) ...[
            const SizedBox(height: 8),
            _PreviewBlock(
              title: 'Đề xuất',
              content: evaluation.recommendation!,
              color: const Color(0xFF0069B4),
            ),
          ],

          const SizedBox(height: 8),

          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () {
                // context.push('/interview-evaluation-detail/${evaluation.id}');
              },
              child: const Text('Xem chi tiết'),
            ),
          ),
        ],
      ),
    );
  }

  bool _hasText(String? value) {
    return value != null && value.trim().isNotEmpty;
  }
}

class _ScoreBadge extends StatelessWidget {
  final int? score;

  const _ScoreBadge({required this.score});

  @override
  Widget build(BuildContext context) {
    final hasScore = score != null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: hasScore
            ? const Color(0xFF0069B4).withValues(alpha: 0.1)
            : const Color(0xFFEAEAEA),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        hasScore ? '$score/10' : 'Chưa chấm',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: hasScore ? const Color(0xFF0069B4) : const Color(0xFF7A7A7A),
        ),
      ),
    );
  }
}

class _SmallInfoRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _SmallInfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 15, color: const Color(0xFF7A7A7A)),
        const SizedBox(width: 5),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 13, color: Color(0xFF7A7A7A)),
          ),
        ),
      ],
    );
  }
}

class _PreviewBlock extends StatelessWidget {
  final String title;
  final String content;
  final Color color;

  const _PreviewBlock({
    required this.title,
    required this.content,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            content,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 13,
              height: 1.35,
              color: Color(0xFF4A4A4A),
            ),
          ),
        ],
      ),
    );
  }
}
