import 'package:freezed_annotation/freezed_annotation.dart';

part 'base_option_dto.freezed.dart';
part 'base_option_dto.g.dart';

@freezed
abstract class BaseOptionDto with _$BaseOptionDto {
  const factory BaseOptionDto({
    required String id,
    required String name,
  }) = _BaseOptionDto;

  factory BaseOptionDto.fromJson(Map<String, dynamic> json) =>
      _$BaseOptionDtoFromJson(json);
}
