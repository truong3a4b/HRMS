import 'package:freezed_annotation/freezed_annotation.dart';

part 'department_dto.freezed.dart';
part 'department_dto.g.dart';

@freezed
abstract class DepartmentDto with _$DepartmentDto {
  const factory DepartmentDto({
    required String id,
    required String name,
    required String code,
    String? description,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _DepartmentDto;

  factory DepartmentDto.fromJson(Map<String, dynamic> json) =>
      _$DepartmentDtoFromJson(json);
}