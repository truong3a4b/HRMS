import 'package:flutter/material.dart';
import 'package:hrms/feature/recruitment/presentation/widgets/response_offer_bottom_sheet.dart';
import 'package:hrms/feature/recruitment/presentation/widgets/section_card.dart';
import 'package:hrms/feature/recruitment/presentation/widgets/send_offer_bottom_sheet.dart';

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
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (_) => SendOfferBottomSheet(
                      application: application,
                    ),
                  );
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
                  child: SizedBox(
                    height: 42,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          builder: (_) => RespondOfferBottomSheet(
                            applicationId: application.id,
                            isAccepted: false,
                          ),
                        );
                      },
                      icon: const Icon(Icons.close, size: 18),
                      label: const Text(
                        'Từ chối',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFDC2626), // đỏ
                        side: const BorderSide(color: Color(0xFFDC2626)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 42,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          builder: (_) => RespondOfferBottomSheet(
                            applicationId: application.id,
                            isAccepted: true,
                          ),
                        );
                      },
                      icon: const Icon(Icons.check, size: 18),
                      label: const Text(
                        'Đồng ý',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF16A34A),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            )
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