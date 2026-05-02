import 'package:hrms/feature/department/domain/entities/department.dart';

class Offer {
  final String id;
  final String? jobApplicationId;
  final String? departmentId;
  final double? proposedSalary;
  final DateTime? proposedHireDate;
  final String? notes;
  final String? candidateNotes;
  final OfferStatus status;
  final DateTime createdAt;

  Offer({
    required this.id,
    this.jobApplicationId,
    this.departmentId,
    this.proposedSalary,
    this.proposedHireDate,
    this.notes,
    this.candidateNotes,
    required this.status,
    required this.createdAt,
  });

}

enum OfferStatus {
  sent,
  accepted,
  declined,
}

extension OfferStatusExtension on OfferStatus {
  String get displayName {
    switch (this) {
      case OfferStatus.sent:
        return 'Đã gửi';
      case OfferStatus.accepted:
        return 'Đã chấp nhận';
      case OfferStatus.declined:
        return 'Đã từ chối';
    }
  }
  String get value {
    switch (this) {
      case OfferStatus.sent:
        return 'SENT';
      case OfferStatus.accepted:
        return 'ACCEPTED';
      case OfferStatus.declined:
        return 'DECLINED';
    }
  }
}