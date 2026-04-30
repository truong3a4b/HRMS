import '../../../auth/domain/entities/user.dart';

class InterviewSchedule {
  final String id;
  final String jobApplicationId;
  final DateTime scheduledAt;
  final String location;
  final InterviewStatus status;
  final User createdBy;
  final DateTime createdAt;
  final DateTime? updatedAt;

  InterviewSchedule({
    required this.id,
    required this.jobApplicationId,
    required this.scheduledAt,
    required this.location,
    required this.status,
    required this.createdBy,
    required this.createdAt,
    this.updatedAt,
  });
}

enum InterviewStatus {
  invited,
  confirmed,
  declined,
  completed,
  cancelled,
}