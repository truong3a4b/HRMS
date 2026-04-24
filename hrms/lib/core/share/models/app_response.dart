import 'package:freezed_annotation/freezed_annotation.dart';

part 'app_response.freezed.dart';
part 'app_response.g.dart';

//flutter pub run build_runner build --delete-conflicting-outputs
@freezed
abstract class AppResponse with _$AppResponse {
  const factory AppResponse({
    @JsonKey(name: "success")
    required bool success,
    @JsonKey(name: "message")
    required String message,
    @JsonKey(name: "data")
    required Map<String, dynamic> data,
  }) = _AppResponse;

  factory AppResponse.fromJson(Map<String, dynamic> json) => _$AppResponseFromJson(json);
}

