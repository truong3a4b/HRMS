import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../employee/data/models/employee_dto.dart';

part 'interview_evaluation_dto.freezed.dart';
part 'interview_evaluation_dto.g.dart';

@freezed
abstract class InterviewEvaluationDto with _$InterviewEvaluationDto {
  const factory InterviewEvaluationDto({
    required String id,
    String? jobApplicationId,
    String? evaluatorEmployeeId,
    String? title,
    int? score,
    String? strengths,
    String? concerns,
    String? recommendation,
    String? comments,
    DateTime? createdAt,
    DateTime? updatedAt,
    EmployeeDto? evaluator,
  }) = _InterviewEvaluationDto;

  factory InterviewEvaluationDto.fromJson(Map<String, dynamic> json) =>
      _$InterviewEvaluationDtoFromJson(json);
}
