import 'package:hrms/feature/employee/data/mapper/employee_mapper.dart';
import 'package:hrms/feature/recruitment/domain/entities/offer.dart';

import '../models/offer_dto.dart';

extension OfferDtoMapper on OfferDto {
  Offer toEntity() {
    return Offer(
      id: id,
      jobApplicationId: jobApplicationId,
      departmentId: departmentId,
      proposedSalary: proposedSalary?.toDoubleValue(),
      proposedHireDate: proposedHireDate,
      notes: notes,
      candidateNotes: candidateNotes,
      status: _mapOfferStatus(status),
      createdAt: createdAt,
    );
  }
}

OfferStatus _mapOfferStatus(String value) {
  switch (value.toUpperCase()) {
    case 'SENT':
      return OfferStatus.sent;
    case 'ACCEPTED':
      return OfferStatus.accepted;
    case 'DECLINED':
      return OfferStatus.declined;
    default:
      return OfferStatus.sent;
  }
}
