import 'package:freezed_annotation/freezed_annotation.dart';

part 'position_dto.freezed.dart';
part 'position_dto.g.dart';

@freezed
abstract class PositionDto with _$PositionDto {
  const factory PositionDto({
    required String id,
    required String name,
    String? code,
    String? description,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _PositionDto;

  factory PositionDto.fromJson(Map<String, dynamic> json) =>
      _$PositionDtoFromJson(json);
}
