import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/core/utils/time_convert.dart';
import 'package:hrms/core/widget/app_error_center.dart';
import 'package:hrms/feature/account/presentation/providers/permission_provider.dart';
import 'package:hrms/feature/position/domain/entities/position.dart';

import '../../../../../core/utils/platform_file_actions.dart';
import '../../../../../core/widget/app_snackbar.dart';
import '../../../../auth/domain/entities/user.dart';
import '../../../../auth/presentation/providers/user_provider.dart';
import '../../../../candidate/domain/entities/candidate.dart';
import '../../../domain/entities/job_application.dart';
import '../../../domain/entities/recruitment_job.dart';
import '../../providers/application/job_application_detail_provider.dart';
import '../../widgets/evaluation_section.dart';
import '../../widgets/info_row.dart';
import '../../widgets/interview_schedule_card.dart';
import '../../widgets/offer_section.dart';
import '../../widgets/section_card.dart';

class JobApplicationDetailScreen extends ConsumerWidget {
  final String applicationId;

  const JobApplicationDetailScreen({super.key, required this.applicationId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final applicationAsync = ref.watch(
      jobApplicationDetailProvider(applicationId),
    );

    return Scaffold(
      backgroundColor: const Color(0xFFF3F3F3),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),
        title: const Text(
          'Chi tiết đơn ứng tuyển',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, color: Colors.black),
            onSelected: (value) {
              if (value == 'cancel') {
                //_showCancelApplicationDialog(context, ref);
              }

              if (value == 'reject') {
               // _showRejectApplicationDialog(context, ref);
              }
            },
            itemBuilder: (context) => const [
              PopupMenuItem(
                value: 'cancel',
                child: Text('Hủy đơn'),
              ),
              PopupMenuItem(
                value: 'reject',
                child: Text('Từ chối ứng viên'),
              ),
            ],
          ),
        ],
      ),
      body: applicationAsync.when(
        data: (data) => _buildContent(data, ref),
        error: (error, st) {
          return AppErrorCenter(
            errorMessage: error.toString(),
            onRetry: () =>
                ref.invalidate(jobApplicationDetailProvider(applicationId)),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }

  Widget _buildContent(JobApplication data, WidgetRef ref) {
    final Set<Permission> permissions =
        ref.watch(permissionProvider).value ?? {};
    final user = ref.watch(userProvider).value;
    final canAddInterview =
        user != null &&
        (permissions.contains(Permission.recruitmentScheduleInterview) ||
            user.role == UserRole.admin);
    final canEvaluate =
        user != null &&
        (permissions.contains(Permission.recruitmentSubmitEvaluation) ||
            user.role == UserRole.admin);
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 100),
      child: Column(
        children: [
          _CandidateInfoSection(candidate: data.candidate),
          const SizedBox(height: 12),
          _JobInfoSection(application: data),
          const SizedBox(height: 12),
          _ApplicationInfoSection(app: data),
          const SizedBox(height: 12),
          _TimelineSection(events: data.timeline),
          const SizedBox(height: 12),
          InterviewInvitationSection(
            applicationId: applicationId,
            invitations: data.interviewSchedules,
            canInvite: canAddInterview,
          ),
          const SizedBox(height: 12),
          EvaluationSection(
            applicationId: applicationId,
            evaluations: data.interviewEvaluations,
            canEvaluate: canEvaluate,
          ),
          const SizedBox(height: 12),
          OfferSection(
            application: data,
            canSendOffer: true,
            canRespondOffer: true,
          ),
        ],
      ),
    );
  }
}

class _CandidateInfoSection extends StatelessWidget {
  final Candidate candidate;

  const _CandidateInfoSection({required this.candidate});

  Future<void> _openCv(BuildContext context, String? url) async {
    if (url == null || url.trim().isEmpty) {
      AppSnackbar.showError(context, 'Chưa có file CV');
      return;
    }

    try {
      await PlatformFileActions.openUrl(url);
    } catch (_) {
      if (!context.mounted) return;
      AppSnackbar.showError(context, 'Không thể mở file CV');
    }
  }

  @override
  Widget build(BuildContext context) {
    final parts = [
      candidate.address,
      candidate.ward?.name,
      candidate.province?.name,
    ];
    final fullAddress = parts
        .where((e) => e != null && e.trim().isNotEmpty)
        .join(', ');
    return InkWell(
      onTap: () {
        context.push('/candidate-detail/${candidate.id}');
      },
      child: SectionCard(
        title: 'Thông tin ứng viên',
        icon: Icons.person_outline,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _Avatar(candidate: candidate),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        candidate.name,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        candidate.email,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF7A7A7A),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            InfoRow(label: 'Số điện thoại', value: candidate.phone ?? '-'),
            InfoRow(
              label: 'Ngày sinh',
              value: candidate.dateOfBirth == null
                  ? '-'
                  : TimeConvert.convertDateTimeToString(candidate.dateOfBirth!),
            ),
            InfoRow(
              label: 'Địa chỉ',
              value: fullAddress.isEmpty ? '-' : fullAddress,
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: () => _openCv(context, candidate.cvUrl),
              icon: const Icon(Icons.description_outlined, size: 18),
              label: const Text('Xem CV'),
            ),
          ],
        ),
      ),
    );
  }
}

class _JobInfoSection extends StatelessWidget {
  final JobApplication application;

  const _JobInfoSection({required this.application});

  @override
  Widget build(BuildContext context) {
    final job = application.job;

    return InkWell(
      onTap: () {
        context.push('/recruitment-job-detail/${job.id}');
      },
      child: SectionCard(
        title: 'Thông tin công việc',
        icon: Icons.work_outline,
        child: Column(
          children: [
            InfoRow(label: 'Tin tuyển dụng', value: job.title),
            InfoRow(label: 'Vị trí', value: application.position.name),
            InfoRow(label: 'Phòng ban', value: application.department.name),
            InfoRow(
              label: 'Hạn ứng tuyển',
              value: job.deadline == null
                  ? '-'
                  : TimeConvert.convertDateTimeToString(job.deadline!),
            ),
            InfoRow(label: 'Trạng thái tin', value: job.status.displayName),
          ],
        ),
      ),
    );
  }
}

class _ApplicationInfoSection extends StatelessWidget {
  final JobApplication app;

  const _ApplicationInfoSection({required this.app});

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Thông tin ứng tuyển',
      icon: Icons.assignment_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InfoRow(label: 'Trạng thái', value: app.status.displayName),
          InfoRow(
            label: 'Ngày ứng tuyển',
            value: TimeConvert.convertDateTimeToString(app.appliedAt),
          ),
          const SizedBox(height: 8),
          _TextBlock(title: 'Cover letter', content: app.coverLetter),
          const SizedBox(height: 10),
          _TextBlock(title: 'Ghi chú', content: app.notes),
        ],
      ),
    );
  }
}

class _TimelineSection extends StatelessWidget {
  final List<RecruitmentTimelineEvent> events;

  const _TimelineSection({required this.events});

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Quá trình tuyển dụng',
      icon: Icons.timeline_outlined,
      child: Column(
        children: events.map((event) {
          final isLast = event == events.last;

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Container(
                    width: 13,
                    height: 13,
                    decoration: const BoxDecoration(
                      color: Color(0xFF0069B4),
                      shape: BoxShape.circle,
                    ),
                  ),
                  if (!isLast)
                    Container(
                      width: 2,
                      height: 52,
                      color: const Color(0xFFE0E0E0),
                    ),
                ],
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: isLast ? 0 : 14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        event.title,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        event.description,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF7A7A7A),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        TimeConvert.convertDateTimeToString(event.createdAt),
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF9A9A9A),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        }).toList(),
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

class _Avatar extends StatelessWidget {
  final Candidate candidate;

  const _Avatar({required this.candidate});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 52,
      height: 52,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFFD9D9D9)),
        color: Colors.white,
      ),
      child: ClipOval(
        child: Image.asset(
          candidate.avatar ?? 'assets/images/profile.png',
          width: 52,
          height: 52,
          fit: BoxFit.cover,
        ),
      ),
    );
  }
}
