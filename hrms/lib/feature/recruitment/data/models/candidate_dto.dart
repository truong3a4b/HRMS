import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../auth/data/models/user_dto.dart';

part 'candidate_dto.freezed.dart';
part 'candidate_dto.g.dart';

@freezed
abstract class CandidateDto with _$CandidateDto {
  const factory CandidateDto({
    required String id,
    required String userId,

    String? fullName,
    required String email,
    String? phone,
    DateTime? dateOfBirth,
    String? address,
    String? avatar,
    String? cvUrl,

    DateTime? createdAt,
    DateTime? updatedAt,

    UserDto? user,
  }) = _CandidateDto;

  factory CandidateDto.fromJson(Map<String, dynamic> json) =>
      _$CandidateDtoFromJson(json);
}