import 'package:hrms/feature/employee/data/mapper/employee_mapper.dart';

import '../../../employee/domain/entities/employee.dart';
import '../../domain/entities/interview_evaluation.dart';
import '../models/interview_evaluation_dto.dart';

extension InterviewEvaluationDtoMapper on InterviewEvaluationDto {
  InterviewEvaluation toEntity({String? applicationId}) {
    return InterviewEvaluation(
      id: id,
      jobApplicationId: jobApplicationId ?? applicationId ?? '',
      title: title,
      evaluator: evaluator?.toEntity() ?? _emptyEmployee(),
      score: score,
      strengths: strengths,
      concerns: concerns,
      recommendation: recommendation,
      comments: comments,
      createdAt: createdAt ?? DateTime.now(),
    );
  }
}


Employee _emptyEmployee() {
  return Employee(
    id: '',
    employeeId: '',
    name: 'Chưa xác định',
    email: '',
    status: null,
  );
}