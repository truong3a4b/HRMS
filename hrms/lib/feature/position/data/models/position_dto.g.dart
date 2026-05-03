// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'position_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_PositionDto _$PositionDtoFromJson(Map<String, dynamic> json) => _PositionDto(
  id: json['id'] as String,
  name: json['name'] as String,
  code: json['code'] as String?,
  description: json['description'] as String?,
  permissions:
      (json['permissions'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$PositionDtoToJson(_PositionDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'code': instance.code,
      'description': instance.description,
      'permissions': instance.permissions,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };
