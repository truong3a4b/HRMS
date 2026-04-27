// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'department_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_DepartmentDto _$DepartmentDtoFromJson(Map<String, dynamic> json) =>
    _DepartmentDto(
      id: json['id'] as String,
      name: json['name'] as String,
      code: json['code'] as String?,
      description: json['description'] as String?,
      manager: json['manager'] as Map<String, dynamic>?,
      employeeCount: (json['employeeCount'] as num?)?.toInt(),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$DepartmentDtoToJson(_DepartmentDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'code': instance.code,
      'description': instance.description,
      'manager': instance.manager,
      'employeeCount': instance.employeeCount,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };
