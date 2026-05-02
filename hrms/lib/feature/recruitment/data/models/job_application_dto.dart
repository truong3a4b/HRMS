import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../candidate/data/models/candidate_dto.dart';
import '../../../department/data/models/department_dto.dart';
import '../../../position/data/models/position_dto.dart';
import 'interview_evaluation_dto.dart';
import 'interview_schedule_dto.dart';
import 'offer_dto.dart';
import 'recruitment_job_dto.dart';

part 'job_application_dto.freezed.dart';
part 'job_application_dto.g.dart';

@freezed
abstract class JobApplicationDto with _$JobApplicationDto {
  const factory JobApplicationDto({
    required String id,

    String? candidateId,
    String? recruitmentJobId,
    String? positionId,
    String? departmentId,
    String? candidateAvatar,
    String? candidateName,
    String? candidateEmail,
    String? candidatePhone,
    String? candidateAddress,
    String? candidateGender,
    DateTime? candidateBirthDate,
    String? candidateCvUrl,

    required String status,
    double? proposedSalary,
    DateTime? proposedHireDate,
    String? coverLetter,
    String? notes,

    required DateTime appliedAt,
    DateTime? updatedAt,
    DateTime? rejectedAt,
    DateTime? offerSentAt,
    DateTime? offerRespondedAt,
    DateTime? onboardedAt,
    required PositionDto position,
    required DepartmentDto department,

    required RecruitmentJobDto recruitmentJob,

    @Default([])
    List<InterviewScheduleDto> interviewSchedules,

    @Default([])
    List<InterviewEvaluationDto> evaluations,
    @Default([])
    List<OfferDto> offers,
  }) = _JobApplicationDto;

  factory JobApplicationDto.fromJson(Map<String, dynamic> json) =>
      _$JobApplicationDtoFromJson(json);
}


