import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../employee/data/models/employee_dto.dart';

part 'interview_schedule_dto.freezed.dart';
part 'interview_schedule_dto.g.dart';

@freezed
abstract class InterviewScheduleDto with _$InterviewScheduleDto {
  const factory InterviewScheduleDto({
    required String id,
    String? jobApplicationId,
    DateTime? scheduledAt,
    String? title,
    String? type,
    String? location,
    String? interviewerNotes,
    DateTime? candidateResponseAt,
    String? candidateResponseNote,
    required String status,
    String? createdByEmployeeId,
    DateTime? createdAt,
    DateTime? updatedAt,

    // nếu sau này backend include employee tạo lịch
    EmployeeDto? createdBy,
  }) = _InterviewScheduleDto;

  factory InterviewScheduleDto.fromJson(Map<String, dynamic> json) =>
      _$InterviewScheduleDtoFromJson(json);
}

