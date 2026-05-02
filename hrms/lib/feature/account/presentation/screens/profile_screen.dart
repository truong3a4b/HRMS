import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../employee/domain/entities/employee.dart';
import '../../../candidate/domain/entities/candidate.dart';
import '../providers/profile_provider.dart';
import '../widgets/candidate_profile_preview.dart';
import '../widgets/candidate_recruitment_tab.dart';
import '../widgets/employee_profile_view.dart';
import '../widgets/personal_profile_tab.dart';
import '../widgets/profile_header.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(profileProvider);

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
          'Thông tin cá nhân',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        centerTitle: false,
      ),
      body: profileAsync.when(
        data: (profile) {
          if (profile is Employee) {
            return EmployeeProfileView(
              employee: profile,
              canEditBasicInfo: true,
              canEditAdditionalInfo: true,
              canEditWorkInfo: true,
              onRefresh: () {
                ref.invalidate(profileProvider);
              },
            );
          }

          if (profile is Candidate) {
            return CandidateProfileView(candidate: profile,canEditAdditionalInfo: true,canEditBasicInfo: true, canEditCv: true, );
          }

          return const Center(child: Text('Không xác định loại hồ sơ'));
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


