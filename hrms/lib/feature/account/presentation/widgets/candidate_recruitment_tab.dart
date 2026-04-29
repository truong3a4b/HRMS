import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../recruitment/domain/entities/candidate.dart';
import 'info_seaction_card.dart';

class CandidateRecruitmentTab extends StatelessWidget {
  final Candidate candidate;

  const CandidateRecruitmentTab({super.key, required this.candidate});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: InfoSectionCard(
        title: 'Hồ sơ ứng tuyển',
        canEdit: true,
        onEdit: () {
          context.push('/edit-candidate-profile');
        },
        items: [
          InfoItem(label: 'CV', value: candidate.cvUrl ?? '-'),
        ],
      ),
    );
  }
}