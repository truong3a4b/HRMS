import 'package:freezed_annotation/freezed_annotation.dart';
import 'dart:convert';

part 'user_dto.freezed.dart';
part 'user_dto.g.dart';

@freezed
abstract class UserDto with _$UserDto {
  const factory UserDto({
    @JsonKey(name: "id")
    required String id,
    @JsonKey(name: "email")
    required String email,
    @JsonKey(name: "role")
    required String role,
  }) = _UserDto;

  factory UserDto.fromJson(Map<String, dynamic> json) => _$UserDtoFromJson(json);
}

