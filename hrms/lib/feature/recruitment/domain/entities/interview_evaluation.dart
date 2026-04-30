import 'package:hrms/feature/auth/domain/entities/user.dart';

class InterviewEvaluation {
  final String id;
  final String jobApplicationId;
  final User evaluator;
  final int? score;
  final String? strengths;
  final String? concerns;
  final String? recommendation;
  final String? comments;
  final DateTime createdAt;

  InterviewEvaluation({
    required this.id,
    required this.jobApplicationId,
    required this.evaluator,
    this.score,
    this.strengths,
    this.concerns,
    this.recommendation,
    this.comments,
    required this.createdAt,
  });


}