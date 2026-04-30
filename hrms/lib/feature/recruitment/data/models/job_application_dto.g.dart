// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'job_application_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_JobApplicationDto _$JobApplicationDtoFromJson(Map<String, dynamic> json) =>
    _JobApplicationDto(
      id: json['id'] as String,
      status: json['status'] as String,
      appliedAt: DateTime.parse(json['appliedAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
      rejectedAt: json['rejectedAt'] == null
          ? null
          : DateTime.parse(json['rejectedAt'] as String),
      offerSentAt: json['offerSentAt'] == null
          ? null
          : DateTime.parse(json['offerSentAt'] as String),
      offerRespondedAt: json['offerRespondedAt'] == null
          ? null
          : DateTime.parse(json['offerRespondedAt'] as String),
      onboardedAt: json['onboardedAt'] == null
          ? null
          : DateTime.parse(json['onboardedAt'] as String),
      proposedSalary: (json['proposedSalary'] as num?)?.toDouble(),
      candidate: CandidateDto.fromJson(
        json['candidate'] as Map<String, dynamic>,
      ),
      position: PositionDto.fromJson(json['position'] as Map<String, dynamic>),
      department: DepartmentDto.fromJson(
        json['department'] as Map<String, dynamic>,
      ),
      recruitmentJob: RecruitmentJobDto.fromJson(
        json['recruitmentJob'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$JobApplicationDtoToJson(_JobApplicationDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'status': instance.status,
      'appliedAt': instance.appliedAt.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      'rejectedAt': instance.rejectedAt?.toIso8601String(),
      'offerSentAt': instance.offerSentAt?.toIso8601String(),
      'offerRespondedAt': instance.offerRespondedAt?.toIso8601String(),
      'onboardedAt': instance.onboardedAt?.toIso8601String(),
      'proposedSalary': instance.proposedSalary,
      'candidate': instance.candidate,
      'position': instance.position,
      'department': instance.department,
      'recruitmentJob': instance.recruitmentJob,
    };
