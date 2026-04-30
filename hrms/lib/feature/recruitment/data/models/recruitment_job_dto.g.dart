// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recruitment_job_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_RecruitmentJobDto _$RecruitmentJobDtoFromJson(Map<String, dynamic> json) =>
    _RecruitmentJobDto(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      requirements: json['requirements'] as String?,
      benefits: json['benefits'] as String?,
      salaryMin: json['salaryMin'] as String?,
      salaryMax: json['salaryMax'] as String?,
      quantity: (json['quantity'] as num?)?.toInt(),
      deadline: json['deadline'] == null
          ? null
          : DateTime.parse(json['deadline'] as String),
      status: json['status'] as String,
      positionId: json['positionId'] as String?,
      departmentId: json['departmentId'] as String?,
      position: json['position'] == null
          ? null
          : PositionDto.fromJson(json['position'] as Map<String, dynamic>),
      department: json['department'] == null
          ? null
          : DepartmentDto.fromJson(json['department'] as Map<String, dynamic>),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
      applied: json['applied'] as bool?,
    );

Map<String, dynamic> _$RecruitmentJobDtoToJson(_RecruitmentJobDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'description': instance.description,
      'requirements': instance.requirements,
      'benefits': instance.benefits,
      'salaryMin': instance.salaryMin,
      'salaryMax': instance.salaryMax,
      'quantity': instance.quantity,
      'deadline': instance.deadline?.toIso8601String(),
      'status': instance.status,
      'positionId': instance.positionId,
      'departmentId': instance.departmentId,
      'position': instance.position,
      'department': instance.department,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      'applied': instance.applied,
    };
