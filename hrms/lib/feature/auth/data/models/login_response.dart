import 'package:freezed_annotation/freezed_annotation.dart';
import 'login_data_dto.dart';

part 'login_response.freezed.dart';
part 'login_response.g.dart';

@freezed
abstract class LoginResponse with _$LoginResponse {
  const factory LoginResponse({
    @JsonKey(name: "success")
    required bool success,
    @JsonKey(name: "message")
    required String message,
    @JsonKey(name: "data")
    required LoginDataDto data,
  }) = _LoginResponse;

  factory LoginResponse.fromJson(Map<String, dynamic> json) => _$LoginResponseFromJson(json);
}

