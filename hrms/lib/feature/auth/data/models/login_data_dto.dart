import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:hrms/feature/auth/data/models/user_dto.dart';

part 'login_data_dto.freezed.dart';
part 'login_data_dto.g.dart';

@freezed
abstract class LoginDataDto with _$LoginDataDto {
  const factory LoginDataDto({
    @JsonKey(name: "accessToken")
    required String accessToken,
    @JsonKey(name: "user")
    required UserDto user,
  }) = _LoginDataDto;

  factory LoginDataDto.fromJson(Map<String, dynamic> json) => _$LoginDataDtoFromJson(json);
}

