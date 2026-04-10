// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'login_data_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_LoginDataDto _$LoginDataDtoFromJson(Map<String, dynamic> json) =>
    _LoginDataDto(
      accessToken: json['accessToken'] as String,
      user: UserDto.fromJson(json['user'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$LoginDataDtoToJson(_LoginDataDto instance) =>
    <String, dynamic>{
      'accessToken': instance.accessToken,
      'user': instance.user,
    };
