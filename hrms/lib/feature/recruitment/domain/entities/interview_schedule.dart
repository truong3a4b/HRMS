

import 'package:hrms/feature/employee/domain/entities/employee.dart';

class InterviewSchedule {
  final String id;
  final String jobApplicationId;
  final String? title;
  final String? type;
  final DateTime scheduledAt;
  final String? interviewerNotes;
  final DateTime? candidateResponseAt;
  final String? candidateResponseNote;
  final String location;
  final InterviewStatus status;
  final Employee? createdBy;
  final DateTime createdAt;
  final DateTime? updatedAt;

  InterviewSchedule({
    required this.id,
    required this.jobApplicationId,
    this.title,
    this.type,
    required this.scheduledAt,
    this.interviewerNotes,
    this.candidateResponseAt,
    this.candidateResponseNote,
    required this.location,
    required this.status,
    this.createdBy,
    required this.createdAt,
    this.updatedAt,
  });
}

enum InterviewStatus { invited, confirmed, declined, completed, cancelled }

extension InterviewStatusX on InterviewStatus {
  String get displayName {
    switch (this) {
      case InterviewStatus.invited:
        return 'Đã mời phỏng vấn';
      case InterviewStatus.confirmed:
        return 'Đã xác nhận';
      case InterviewStatus.declined:
        return 'Đã từ chối';
      case InterviewStatus.completed:
        return 'Đã hoàn thành';
      case InterviewStatus.cancelled:
        return 'Đã hủy';
    }
  }

  String get value {
    switch (this) {
      case InterviewStatus.invited:
        return 'INVITED';
      case InterviewStatus.confirmed:
        return 'CONFIRMED';
      case InterviewStatus.declined:
        return 'DECLINED';
      case InterviewStatus.completed:
        return 'COMPLETED';
      case InterviewStatus.cancelled:
        return 'CANCELLED';
    }
  }
}