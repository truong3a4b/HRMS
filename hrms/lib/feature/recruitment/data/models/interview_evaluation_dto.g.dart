// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'interview_evaluation_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_InterviewEvaluationDto _$InterviewEvaluationDtoFromJson(
  Map<String, dynamic> json,
) => _InterviewEvaluationDto(
  id: json['id'] as String,
  jobApplicationId: json['jobApplicationId'] as String?,
  evaluatorEmployeeId: json['evaluatorEmployeeId'] as String?,
  title: json['title'] as String?,
  score: (json['score'] as num?)?.toInt(),
  strengths: json['strengths'] as String?,
  concerns: json['concerns'] as String?,
  recommendation: json['recommendation'] as String?,
  comments: json['comments'] as String?,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
  evaluator: json['evaluator'] == null
      ? null
      : EmployeeDto.fromJson(json['evaluator'] as Map<String, dynamic>),
);

Map<String, dynamic> _$InterviewEvaluationDtoToJson(
  _InterviewEvaluationDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'jobApplicationId': instance.jobApplicationId,
  'evaluatorEmployeeId': instance.evaluatorEmployeeId,
  'title': instance.title,
  'score': instance.score,
  'strengths': instance.strengths,
  'concerns': instance.concerns,
  'recommendation': instance.recommendation,
  'comments': instance.comments,
  'createdAt': instance.createdAt?.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
  'evaluator': instance.evaluator,
};
