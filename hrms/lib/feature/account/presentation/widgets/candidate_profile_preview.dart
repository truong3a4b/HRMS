import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/feature/account/presentation/widgets/personal_profile_tab.dart';
import 'package:hrms/feature/account/presentation/widgets/profile_header.dart';

import '../../../candidate/domain/entities/candidate.dart';
import 'candidate_recruitment_tab.dart';

class CandidateProfileView extends StatelessWidget {
  final Candidate candidate;
  final bool canEditBasicInfo;
  final bool canEditAdditionalInfo;
  final bool canEditCv;

  const CandidateProfileView({super.key, required this.candidate, this.canEditBasicInfo = false, this.canEditAdditionalInfo = false, this.canEditCv = false});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          ProfileHeader(
            avatar: candidate.avatar,
            name: candidate.name,
            subtitle: 'Ứng viên',
            showTabs: true,
            tabs: const [
              Tab(text: 'Cá nhân'),
              Tab(text: 'Ứng tuyển'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                ProfilePersonalTab(
                  profile: candidate,
                  canEditBasicInfo: canEditBasicInfo,
                  canEditAdditionalInfo: canEditAdditionalInfo,
                  onEditBasicInfo: () {
                    context.push('/edit-candidate-profile');
                  },
                  onEditAdditionalInfo: () {
                    context.push('/edit-candidate-profile');
                  },
                ),
                CandidateRecruitmentTab(candidate: candidate, canEditCv: canEditCv),
              ],
            ),
          ),
        ],
      ),
    );
  }
}