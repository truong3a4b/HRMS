// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'interview_schedule_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_InterviewScheduleDto _$InterviewScheduleDtoFromJson(
  Map<String, dynamic> json,
) => _InterviewScheduleDto(
  id: json['id'] as String,
  jobApplicationId: json['jobApplicationId'] as String?,
  scheduledAt: json['scheduledAt'] == null
      ? null
      : DateTime.parse(json['scheduledAt'] as String),
  title: json['title'] as String?,
  type: json['type'] as String?,
  location: json['location'] as String?,
  interviewerNotes: json['interviewerNotes'] as String?,
  candidateResponseAt: json['candidateResponseAt'] == null
      ? null
      : DateTime.parse(json['candidateResponseAt'] as String),
  candidateResponseNote: json['candidateResponseNote'] as String?,
  status: json['status'] as String,
  createdByEmployeeId: json['createdByEmployeeId'] as String?,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
  createdBy: json['createdBy'] == null
      ? null
      : EmployeeDto.fromJson(json['createdBy'] as Map<String, dynamic>),
);

Map<String, dynamic> _$InterviewScheduleDtoToJson(
  _InterviewScheduleDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'jobApplicationId': instance.jobApplicationId,
  'scheduledAt': instance.scheduledAt?.toIso8601String(),
  'title': instance.title,
  'type': instance.type,
  'location': instance.location,
  'interviewerNotes': instance.interviewerNotes,
  'candidateResponseAt': instance.candidateResponseAt?.toIso8601String(),
  'candidateResponseNote': instance.candidateResponseNote,
  'status': instance.status,
  'createdByEmployeeId': instance.createdByEmployeeId,
  'createdAt': instance.createdAt?.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
  'createdBy': instance.createdBy,
};
