import 'package:hrms/feature/employee/domain/entities/employee.dart';

class InterviewEvaluation {
  final String id;
  final String jobApplicationId;
  final Employee evaluator;
  final String? title;
  final int? score;
  final String? strengths;
  final String? concerns;
  final String? recommendation;
  final String? comments;
  final DateTime createdAt;

  InterviewEvaluation({
    required this.id,
    required this.jobApplicationId,
    this.title,
    required this.evaluator,
    this.score,
    this.strengths,
    this.concerns,
    this.recommendation,
    this.comments,
    required this.createdAt,
  });


}