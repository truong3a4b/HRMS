import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:hrms/feature/recruitment/data/models/recruitment_job_dto.dart';

import '../../../account/data/models/candidate_dto.dart';
import '../../../department/data/models/department_dto.dart';
import '../../../position/data/models/position_dto.dart';

part 'job_application_dto.freezed.dart';
part 'job_application_dto.g.dart';

@freezed
abstract class JobApplicationDto with _$JobApplicationDto {
  const factory JobApplicationDto({
    required String id,
    required String status,
    required DateTime appliedAt,
    DateTime? updatedAt,
    DateTime? rejectedAt,
    DateTime? offerSentAt,
    DateTime? offerRespondedAt,
    DateTime? onboardedAt,
    double? proposedSalary,

    required CandidateDto candidate,
    required PositionDto position,
    required DepartmentDto department,

    required RecruitmentJobDto recruitmentJob,
  }) = _JobApplicationDto;

  factory JobApplicationDto.fromJson(Map<String, dynamic> json) =>
      _$JobApplicationDtoFromJson(json);
}