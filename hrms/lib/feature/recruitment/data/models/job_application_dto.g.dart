// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'job_application_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_JobApplicationDto _$JobApplicationDtoFromJson(Map<String, dynamic> json) =>
    _JobApplicationDto(
      id: json['id'] as String,
      candidateId: json['candidateId'] as String?,
      recruitmentJobId: json['recruitmentJobId'] as String?,
      positionId: json['positionId'] as String?,
      departmentId: json['departmentId'] as String?,
      candidateAvatar: json['candidateAvatar'] as String?,
      candidateName: json['candidateName'] as String?,
      candidateEmail: json['candidateEmail'] as String?,
      candidatePhone: json['candidatePhone'] as String?,
      candidateAddress: json['candidateAddress'] as String?,
      candidateGender: json['candidateGender'] as String?,
      candidateBirthDate: json['candidateBirthDate'] == null
          ? null
          : DateTime.parse(json['candidateBirthDate'] as String),
      candidateCvUrl: json['candidateCvUrl'] as String?,
      status: json['status'] as String,
      proposedSalary: (json['proposedSalary'] as num?)?.toDouble(),
      proposedHireDate: json['proposedHireDate'] == null
          ? null
          : DateTime.parse(json['proposedHireDate'] as String),
      coverLetter: json['coverLetter'] as String?,
      notes: json['notes'] as String?,
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
      position: PositionDto.fromJson(json['position'] as Map<String, dynamic>),
      department: DepartmentDto.fromJson(
        json['department'] as Map<String, dynamic>,
      ),
      recruitmentJob: RecruitmentJobDto.fromJson(
        json['recruitmentJob'] as Map<String, dynamic>,
      ),
      interviewSchedules:
          (json['interviewSchedules'] as List<dynamic>?)
              ?.map(
                (e) => InterviewScheduleDto.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          const [],
      evaluations:
          (json['evaluations'] as List<dynamic>?)
              ?.map(
                (e) =>
                    InterviewEvaluationDto.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          const [],
      offers:
          (json['offers'] as List<dynamic>?)
              ?.map((e) => OfferDto.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$JobApplicationDtoToJson(_JobApplicationDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'candidateId': instance.candidateId,
      'recruitmentJobId': instance.recruitmentJobId,
      'positionId': instance.positionId,
      'departmentId': instance.departmentId,
      'candidateAvatar': instance.candidateAvatar,
      'candidateName': instance.candidateName,
      'candidateEmail': instance.candidateEmail,
      'candidatePhone': instance.candidatePhone,
      'candidateAddress': instance.candidateAddress,
      'candidateGender': instance.candidateGender,
      'candidateBirthDate': instance.candidateBirthDate?.toIso8601String(),
      'candidateCvUrl': instance.candidateCvUrl,
      'status': instance.status,
      'proposedSalary': instance.proposedSalary,
      'proposedHireDate': instance.proposedHireDate?.toIso8601String(),
      'coverLetter': instance.coverLetter,
      'notes': instance.notes,
      'appliedAt': instance.appliedAt.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      'rejectedAt': instance.rejectedAt?.toIso8601String(),
      'offerSentAt': instance.offerSentAt?.toIso8601String(),
      'offerRespondedAt': instance.offerRespondedAt?.toIso8601String(),
      'onboardedAt': instance.onboardedAt?.toIso8601String(),
      'position': instance.position,
      'department': instance.department,
      'recruitmentJob': instance.recruitmentJob,
      'interviewSchedules': instance.interviewSchedules,
      'evaluations': instance.evaluations,
      'offers': instance.offers,
    };
