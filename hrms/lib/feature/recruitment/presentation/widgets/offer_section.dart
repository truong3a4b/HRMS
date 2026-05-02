import 'package:flutter/material.dart';
import 'package:hrms/feature/recruitment/presentation/widgets/section_card.dart';

import '../../../../core/utils/time_convert.dart';
import '../../domain/entities/job_application.dart';
import '../../domain/entities/offer.dart';
import 'info_row.dart';

class OfferSection extends StatelessWidget {
  final JobApplication application;
  final bool canSendOffer;
  final bool canRespondOffer;

  const OfferSection({
    super.key,
    required this.application,
    required this.canSendOffer,
    required this.canRespondOffer,
  });

  @override
  Widget build(BuildContext context) {
    final offer = application.offer;

    return SectionCard(
      title: 'Offer nhận việc',
      icon: Icons.local_offer_outlined,
      child: offer == null
          ? Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Chưa có offer cho ứng viên này.',
            style: TextStyle(fontSize: 13, color: Color(0xFF7A7A7A)),
          ),
          if (canSendOffer) ...[
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  //_showSendOfferBottomSheet(context, application);
                },
                icon: const Icon(Icons.send_outlined),
                label: const Text('Gửi offer'),
              ),
            ),
          ],
        ],
      )
          : Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InfoRow(
            label: 'Lương đề xuất',
            value: '${offer.proposedSalary} VNĐ',
          ),
          InfoRow(
            label: 'Ngày nhận việc',
            value: TimeConvert.convertDateTimeToString(
              offer.proposedHireDate,
            ),
          ),
          InfoRow(
            label: 'Trạng thái',
            value: offer.status.displayName,
          ),
          const SizedBox(height: 8),
          _TextBlock(title: 'Ghi chú HR', content: offer.notes),
          const SizedBox(height: 8),
          _TextBlock(
            title: 'Phản hồi ứng viên',
            content: offer.candidateNotes,
          ),

          if (canRespondOffer &&
              application.status == JobApplicationStatus.offerSent) ...[
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      //_showDeclineOfferDialog(context, application);
                    },
                    child: const Text('Từ chối'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      //_showAcceptOfferDialog(context, application);
                    },
                    child: const Text('Đồng ý'),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _TextBlock extends StatelessWidget {
  final String title;
  final String? content;

  const _TextBlock({required this.title, required this.content});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 5),
        Text(
          content == null || content!.trim().isEmpty ? '-' : content!,
          style: const TextStyle(
            fontSize: 13,
            color: Color(0xFF5A5A5A),
            height: 1.4,
          ),
        ),
      ],
    );
  }
}