import '../../../department/domain/entities/department.dart';
import '../../../position/domain/entities/position.dart';

class RecruitmentJob {
  final String id;
  final String title;
  final String description;
  final String requirements;
  final String benefits;
  final double? salaryMin;
  final double? salaryMax;
  final int quantity;
  final DateTime? deadline;
  final RecruitmentJobStatus status;
  final Position? position;
  final Department? department;
  final bool isApplied;

  RecruitmentJob({
    required this.id,
    required this.title,
    required this.description,
    required this.requirements,
    required this.benefits,
    this.salaryMin,
    this.salaryMax,
    required this.quantity,
    this.deadline,
    required this.status,
    this.position,
    this.department,
    this.isApplied = false,
  });
}

enum RecruitmentJobStatus {
  OPEN,
  CLOSED,
  CANCELLED,
}

extension RecruitmentJobStatusX on RecruitmentJobStatus {
  String get displayName {
    switch (this) {
      case RecruitmentJobStatus.OPEN:
        return 'Đang tuyển';
      case RecruitmentJobStatus.CLOSED:
        return 'Đã đóng';
      case RecruitmentJobStatus.CANCELLED:
        return 'Đã hủy';
    }
  }
}