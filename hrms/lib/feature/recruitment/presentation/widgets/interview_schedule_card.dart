import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/feature/recruitment/presentation/widgets/section_card.dart';

import '../../../../core/utils/time_convert.dart';
import '../../domain/entities/interview_schedule.dart';
import 'add_interview_schedule_bottom_sheet.dart';
import 'info_row.dart';

class InterviewInvitationSection extends ConsumerStatefulWidget {
  final String applicationId;
  final List<InterviewSchedule> invitations;
  final bool canInvite;

  const InterviewInvitationSection({
    super.key,
    required this.applicationId,
    required this.invitations,
    this.canInvite = false,
  });

  @override
  ConsumerState<InterviewInvitationSection> createState() =>
      _InterviewInvitationSectionState();
}

class _InterviewInvitationSectionState
    extends ConsumerState<InterviewInvitationSection> {
  bool isExpanded = false;

  @override
  Widget build(BuildContext context) {
    final invitations = widget.invitations;

    if (invitations.isEmpty) {
      return SectionCard(
        title: 'Thư mời phỏng vấn',
        icon: Icons.mail_outline,
        canAdd: widget.canInvite,
        onAdd: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (context) =>  AddInterviewScheduleBottomSheet(jobApplicationId: widget.applicationId,),
          );
        },
        child: const Text(
          'Chưa có thư mời phỏng vấn',
          style: TextStyle(fontSize: 13, color: Color(0xFF7A7A7A)),
        ),
      );
    }

    final visibleList = isExpanded ? invitations : invitations.take(1).toList();

    return SectionCard(
      title: 'Thư mời phỏng vấn',
      icon: Icons.mail_outline,
      canAdd: widget.canInvite,
      onAdd: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (context) => AddInterviewScheduleBottomSheet(jobApplicationId: widget.applicationId,),
        );
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ...visibleList.map((item) => InterviewItem(item: item)),

          if (invitations.length > 1) ...[
            const SizedBox(height: 8),
            Center(
              child: TextButton(
                onPressed: () {
                  setState(() {
                    isExpanded = !isExpanded;
                  });
                },
                child: Text(
                  isExpanded ? 'Thu gọn' : 'Xem thêm (${invitations.length})',
                  style: const TextStyle(
                    color: Color(0xFF0069B4),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class InterviewItem extends StatelessWidget {
  final InterviewSchedule item;

  const InterviewItem({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F7F7),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          /// Title
          Text(
            item.title ?? 'Phỏng vấn',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
          ),

          const SizedBox(height: 6),

          /// Thời gian
          InfoRow(
            label: 'Thời gian',
            value: TimeConvert.convertDateTimeToStringWithHour(item.scheduledAt),
          ),

          // Hình thức
          InfoRow(
            label: 'Hình thức',
            value: item.type ?? '-'
          ),

          /// Địa điểm
          InfoRow(label: 'Địa điểm', value: item.location),

          /// Trạng thái
          InfoRow(label: 'Trạng thái', value: item.status.displayName),

          const SizedBox(height: 6),

          /// Action
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () {
                context.push('/applications/${item.jobApplicationId}/interview-schedule-detail/${item.id}');
              },
              child: const Text('Xem chi tiết'),
            ),
          ),
        ],
      ),
    );
  }
}


