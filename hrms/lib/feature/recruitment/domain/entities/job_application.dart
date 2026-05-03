import 'dart:ui';

import 'package:hrms/feature/candidate/domain/entities/candidate.dart';
import 'package:hrms/feature/department/domain/entities/department.dart';
import 'package:hrms/feature/position/domain/entities/position.dart';
import 'package:hrms/feature/recruitment/domain/entities/interview_evaluation.dart';
import 'package:hrms/feature/recruitment/domain/entities/interview_schedule.dart';
import 'package:hrms/feature/recruitment/domain/entities/recruitment_job.dart';

import 'offer.dart';

class JobApplication {
  final String id;
  final Candidate candidate;
  final RecruitmentJob job;
  final Position position;
  final Department department;
  final JobApplicationStatus status;
  final List<InterviewSchedule> interviewSchedules;
  final List<InterviewEvaluation> interviewEvaluations;
  final Offer? offer;
  final double? proposedSalary;
  final String? coverLetter;
  final String? notes;
  final DateTime appliedAt;
  final DateTime? updatedAt;
  final DateTime? rejectedAt;
  final DateTime? cancelledAt;
  final DateTime? offerSentAt;
  final DateTime? offerRespondedAt;
  final DateTime? onboardedAt;

  JobApplication({
    required this.id,
    required this.candidate,
    required this.job,
    required this.position,
    required this.department,
    required this.status,
    this.interviewSchedules = const [],
    this.interviewEvaluations = const [],
    this.offer,
    this.proposedSalary,
    this.coverLetter,
    this.notes,
    required this.appliedAt,
    this.updatedAt,
    this.rejectedAt,
    this.cancelledAt,
    this.offerSentAt,
    this.offerRespondedAt,
    this.onboardedAt,
  });
}

enum JobApplicationStatus {
  notApplied,
  applied,
  interviewing,
  cancelled,
  rejected,
  offerSent,
  offerDeclined,
  onboarded,
}

extension JobApplicationStatusX on JobApplicationStatus {
  String get key {
    switch (this) {
      case JobApplicationStatus.notApplied:
        return 'NOT_APPLIED';
      case JobApplicationStatus.applied:
        return 'APPLIED';
      case JobApplicationStatus.interviewing:
        return 'INTERVIEWING';
      case JobApplicationStatus.cancelled:
        return 'CANCELLED';
      case JobApplicationStatus.rejected:
        return 'REJECTED';
      case JobApplicationStatus.offerSent:
        return 'OFFER_SENT';
      case JobApplicationStatus.offerDeclined:
        return 'OFFER_DECLINED';
      case JobApplicationStatus.onboarded:
        return 'ONBOARDED';
    }
  }

  String get displayName {
    switch (this) {
      case JobApplicationStatus.notApplied:
        return 'Chưa ứng tuyển';
      case JobApplicationStatus.applied:
        return 'Đã ứng tuyển';
      case JobApplicationStatus.interviewing:
        return 'Đang xét duyệt';
      case JobApplicationStatus.cancelled:
        return 'Đã hủy';
      case JobApplicationStatus.rejected:
        return 'Từ chối';
      case JobApplicationStatus.offerSent:
        return 'Đã gửi offer';
      case JobApplicationStatus.offerDeclined:
        return 'Từ chối offer';
      case JobApplicationStatus.onboarded:
        return 'Đã onboard';
    }
  }

  Color get color {
    switch (this) {
      case JobApplicationStatus.applied:
        return const Color(0xFF0069B4);
      case JobApplicationStatus.interviewing:
        return const Color(0xFF8E44AD);
      case JobApplicationStatus.onboarded:
        return const Color(0xFF16A34A);
      case JobApplicationStatus.rejected:
      case JobApplicationStatus.offerDeclined:
      case JobApplicationStatus.cancelled:
        return const Color(0xFFDC2626);
      case JobApplicationStatus.offerSent:
        return const Color(0xFFF59E0B);
      case JobApplicationStatus.notApplied:
        return const Color(0xFF7A7A7A);
    }
  }
}

class RecruitmentTimelineEvent {
  final String title;
  final String description;
  final DateTime createdAt;

  const RecruitmentTimelineEvent({
    required this.title,
    required this.description,
    required this.createdAt,
  });
}

extension JobApplicationTimelineX on JobApplication {
  List<RecruitmentTimelineEvent> get timeline {
    final events = <RecruitmentTimelineEvent>[];

    events.add(
      RecruitmentTimelineEvent(
        title: 'Đã ứng tuyển',
        description:
            '${candidate.name} đã gửi đơn ứng tuyển vị trí ${position.name}.',
        createdAt: appliedAt,
      ),
    );

    for (final schedule in interviewSchedules) {
      events.add(
        RecruitmentTimelineEvent(
          title: schedule.status.displayName,
          description: _buildInterviewDescription(schedule),
          createdAt: schedule.createdAt,
        ),
      );
    }

    for (final evaluation in interviewEvaluations) {
      events.add(
        RecruitmentTimelineEvent(
          title: 'Đã thêm đánh giá ',
          description:
              '${evaluation.evaluator.name} đã đánh giá ứng viên'
              '${evaluation.score == null ? '' : ' với điểm ${evaluation.score}/10'}.',
          createdAt: evaluation.createdAt,
        ),
      );
    }

    if (rejectedAt != null) {
      events.add(
        RecruitmentTimelineEvent(
          title: 'Đã từ chối ứng viên',
          description: 'Đơn ứng tuyển đã bị từ chối.',
          createdAt: rejectedAt!,
        ),
      );
    }

    if(cancelledAt != null) {
      events.add(
        RecruitmentTimelineEvent(
          title: 'Đã hủy ứng tuyển',
          description: 'Ứng viên đã hủy đơn ứng tuyển.',
          createdAt: cancelledAt!,
        ),
      );
    }

    if (offerSentAt != null) {
      events.add(
        RecruitmentTimelineEvent(
          title: 'Đã gửi offer',
          description: 'Thư mời nhận việc đã được gửi cho ứng viên.',
          createdAt: offerSentAt!,
        ),
      );
    }

    if (offerRespondedAt != null) {
      events.add(
        RecruitmentTimelineEvent(
          title: _buildOfferResponseTitle(status),
          description: _buildOfferResponseDescription(status),
          createdAt: offerRespondedAt!,
        ),
      );
    }

    if (onboardedAt != null) {
      events.add(
        RecruitmentTimelineEvent(
          title: 'Đã onboard',
          description:
              'Ứng viên đã được chuyển sang quy trình tiếp nhận nhân sự.',
          createdAt: onboardedAt!,
        ),
      );
    }

    events.sort((a, b) => a.createdAt.compareTo(b.createdAt));

    return events;
  }

  String _buildInterviewDescription(InterviewSchedule schedule) {
    final typeText = schedule.type == null || schedule.type!.trim().isEmpty
        ? 'Phỏng vấn'
        : schedule.type!;

    return '$typeText tại ${schedule.location}.';
  }

  String _buildOfferResponseTitle(JobApplicationStatus status) {
    switch (status) {
      case JobApplicationStatus.offerDeclined:
        return 'Ứng viên đã từ chối offer';
      default:
        return 'Ứng viên đã phản hồi offer';
    }
  }

  String _buildOfferResponseDescription(JobApplicationStatus status) {
    switch (status) {
      case JobApplicationStatus.offerDeclined:
        return 'Ứng viên đã từ chối thư mời nhận việc.';
      default:
        return 'Ứng viên đã phản hồi thư mời nhận việc.';
    }
  }
}
