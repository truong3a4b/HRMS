import 'package:freezed_annotation/freezed_annotation.dart';

part 'offer_dto.freezed.dart';
part 'offer_dto.g.dart';

@freezed
abstract class OfferDto with _$OfferDto {
  const factory OfferDto({
    required String id,
    String? jobApplicationId,
    String? departmentId,
    String? proposedSalary,
    DateTime? proposedHireDate,
    String? notes,
    String? candidateNotes,
    required String status,
    required DateTime createdAt,
  }) = _OfferDto;

  factory OfferDto.fromJson(Map<String, dynamic> json) =>
      _$OfferDtoFromJson(json);
}

