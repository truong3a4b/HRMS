// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'offer_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_OfferDto _$OfferDtoFromJson(Map<String, dynamic> json) => _OfferDto(
  id: json['id'] as String,
  jobApplicationId: json['jobApplicationId'] as String?,
  departmentId: json['departmentId'] as String?,
  proposedSalary: json['proposedSalary'] as String?,
  proposedHireDate: json['proposedHireDate'] == null
      ? null
      : DateTime.parse(json['proposedHireDate'] as String),
  notes: json['notes'] as String?,
  candidateNotes: json['candidateNotes'] as String?,
  status: json['status'] as String,
  createdAt: DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$OfferDtoToJson(_OfferDto instance) => <String, dynamic>{
  'id': instance.id,
  'jobApplicationId': instance.jobApplicationId,
  'departmentId': instance.departmentId,
  'proposedSalary': instance.proposedSalary,
  'proposedHireDate': instance.proposedHireDate?.toIso8601String(),
  'notes': instance.notes,
  'candidateNotes': instance.candidateNotes,
  'status': instance.status,
  'createdAt': instance.createdAt.toIso8601String(),
};
