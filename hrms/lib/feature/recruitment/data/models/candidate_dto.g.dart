// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'candidate_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CandidateDto _$CandidateDtoFromJson(Map<String, dynamic> json) =>
    _CandidateDto(
      id: json['id'] as String,
      userId: json['userId'] as String,
      fullName: json['fullName'] as String?,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      dateOfBirth: json['dateOfBirth'] == null
          ? null
          : DateTime.parse(json['dateOfBirth'] as String),
      address: json['address'] as String?,
      avatar: json['avatar'] as String?,
      cvUrl: json['cvUrl'] as String?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
      user: json['user'] == null
          ? null
          : UserDto.fromJson(json['user'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$CandidateDtoToJson(_CandidateDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'fullName': instance.fullName,
      'email': instance.email,
      'phone': instance.phone,
      'dateOfBirth': instance.dateOfBirth?.toIso8601String(),
      'address': instance.address,
      'avatar': instance.avatar,
      'cvUrl': instance.cvUrl,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      'user': instance.user,
    };
