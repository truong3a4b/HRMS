import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../auth/data/models/user_dto.dart';
import '../../../employee/data/models/base_option_dto.dart';

part 'candidate_dto.freezed.dart';
part 'candidate_dto.g.dart';

@freezed
abstract class CandidateDto with _$CandidateDto {
  const factory CandidateDto({
    required String id,
    String? userId,

    String? fullName,
    required String email,
    String? phone,
    DateTime? dateOfBirth,
    String? gender,
    String? address,
    String? avatar,
    String? cvUrl,

    String? maritalStatus,
    String? nationality,
    String? religion,

    String? identityCardNumber,
    DateTime? identityCardIssueDate,

    String? frontIdentityCardImage,
    String? backIdentityCardImage,

    BaseOptionDto? province,
    BaseOptionDto? ward,

    DateTime? createdAt,
    DateTime? updatedAt,

    UserDto? user,
  }) = _CandidateDto;

  factory CandidateDto.fromJson(Map<String, dynamic> json) =>
      _$CandidateDtoFromJson(json);
}