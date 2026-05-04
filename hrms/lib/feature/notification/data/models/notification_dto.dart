import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification_dto.freezed.dart';
part 'notification_dto.g.dart';

@freezed
abstract class NotificationDto with _$NotificationDto {
  const factory NotificationDto({
    required String id,
    required String notificationId,
    required String userId,
    required bool isRead,
    DateTime? readAt,
    required DateTime createdAt,

    required NotificationContentDto notification,
  }) = _NotificationDto;

  factory NotificationDto.fromJson(Map<String, dynamic> json) =>
      _$NotificationDtoFromJson(json);
}

@freezed
abstract class NotificationContentDto with _$NotificationContentDto {
  const factory NotificationContentDto({
    required String id,
    required String type,
    required String title,
    required String message,
    Map<String, dynamic>? data,
  }) = _NotificationContentDto;

  factory NotificationContentDto.fromJson(Map<String, dynamic> json) =>
      _$NotificationContentDtoFromJson(json);
}