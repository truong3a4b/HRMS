import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../account/presentation/providers/profile_provider.dart';
import '../../../account/presentation/widgets/candidate_profile_preview.dart';
import '../../../employee/domain/entities/employee.dart';
import '../providers/candidate_detail_provider.dart';

class CandidateDetailScreen extends ConsumerWidget {
  final String candidateId;
  const CandidateDetailScreen({super.key, required this.candidateId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final candidateAsync = ref.watch(candidateDetailProvider(candidateId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF3F8FB),
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),
        title: const Text(
          'Thông tin ứng viên',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        centerTitle: false,
      ),
      body: candidateAsync.when(
        data: (profile) {
          return CandidateProfileView(candidate: profile, canEditBasicInfo: false, canEditAdditionalInfo: false, canEditCv: false,);

        },
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
}


