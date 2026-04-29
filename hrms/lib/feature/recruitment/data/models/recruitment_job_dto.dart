import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../department/data/models/department_dto.dart';
import '../../../position/data/models/position_dto.dart';

part 'recruitment_job_dto.freezed.dart';
part 'recruitment_job_dto.g.dart';

@freezed
abstract class RecruitmentJobDto with _$RecruitmentJobDto {
  const factory RecruitmentJobDto({
    required String id,
    required String title,
    required String description,
    required String requirements,
    required String benefits,
    String? salaryMin,
    String? salaryMax,
    required int quantity,
    DateTime? deadline,
    required String status,
    String? positionId,
    String? departmentId,
    PositionDto? position,
    DepartmentDto? department,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _RecruitmentJobDto;

  factory RecruitmentJobDto.fromJson(Map<String, dynamic> json) =>
      _$RecruitmentJobDtoFromJson(json);
}