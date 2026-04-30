import 'dart:ui';

import 'package:hrms/feature/account/domain/entities/candidate.dart';
import 'package:hrms/feature/department/domain/entities/department.dart';
import 'package:hrms/feature/position/domain/entities/position.dart';
import 'package:hrms/feature/recruitment/domain/entities/recruitment_job.dart';

class JobApplication {
  final String id;
  final Candidate candidate;
  final RecruitmentJob job;
  final Position position;
  final Department department;
  final JobApplicationStatus status;
  final double? proposedSalary;
  final DateTime appliedAt;
  final DateTime? updatedAt;
  final DateTime? rejectedAt;
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
    this.proposedSalary,
    required this.appliedAt,
    this.updatedAt,
    this.rejectedAt,
    this.offerSentAt,
    this.offerRespondedAt,
    this.onboardedAt,
  });
}

enum JobApplicationStatus {
  notApplied,
  applied,
  interviewInvited,
  interviewConfirmed,
  interviewDeclined,
  interviewCompleted,
  approved,
  rejected,
  offerSent,
  offerAccepted,
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
      case JobApplicationStatus.interviewInvited:
        return 'INTERVIEW_INVITED';
      case JobApplicationStatus.interviewConfirmed:
        return 'INTERVIEW_CONFIRMED';
      case JobApplicationStatus.interviewDeclined:
        return 'INTERVIEW_DECLINED';
      case JobApplicationStatus.interviewCompleted:
        return 'INTERVIEW_COMPLETED';
      case JobApplicationStatus.approved:
        return 'APPROVED';
      case JobApplicationStatus.rejected:
        return 'REJECTED';
      case JobApplicationStatus.offerSent:
        return 'OFFER_SENT';
      case JobApplicationStatus.offerAccepted:
        return 'OFFER_ACCEPTED';
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
      case JobApplicationStatus.interviewInvited:
        return 'Mời phỏng vấn';
      case JobApplicationStatus.interviewConfirmed:
        return 'Xác nhận phỏng vấn';
      case JobApplicationStatus.interviewDeclined:
        return 'Từ chối phỏng vấn';
      case JobApplicationStatus.interviewCompleted:
        return 'Đã phỏng vấn';
      case JobApplicationStatus.approved:
        return 'Đã duyệt';
      case JobApplicationStatus.rejected:
        return 'Từ chối';
      case JobApplicationStatus.offerSent:
        return 'Đã gửi offer';
      case JobApplicationStatus.offerAccepted:
        return 'Nhận offer';
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
      case JobApplicationStatus.interviewInvited:
      case JobApplicationStatus.interviewConfirmed:
      case JobApplicationStatus.interviewCompleted:
        return const Color(0xFF8E44AD);
      case JobApplicationStatus.approved:
      case JobApplicationStatus.offerAccepted:
      case JobApplicationStatus.onboarded:
        return const Color(0xFF16A34A);
      case JobApplicationStatus.rejected:
      case JobApplicationStatus.interviewDeclined:
      case JobApplicationStatus.offerDeclined:
        return const Color(0xFFDC2626);
      case JobApplicationStatus.offerSent:
        return const Color(0xFFF59E0B);
      case JobApplicationStatus.notApplied:
        return const Color(0xFF7A7A7A);
    }
  }
}
