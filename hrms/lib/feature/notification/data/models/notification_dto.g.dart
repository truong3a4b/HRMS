// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_NotificationDto _$NotificationDtoFromJson(Map<String, dynamic> json) =>
    _NotificationDto(
      id: json['id'] as String,
      notificationId: json['notificationId'] as String,
      userId: json['userId'] as String,
      isRead: json['isRead'] as bool,
      readAt: json['readAt'] == null
          ? null
          : DateTime.parse(json['readAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      notification: NotificationContentDto.fromJson(
        json['notification'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$NotificationDtoToJson(_NotificationDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'notificationId': instance.notificationId,
      'userId': instance.userId,
      'isRead': instance.isRead,
      'readAt': instance.readAt?.toIso8601String(),
      'createdAt': instance.createdAt.toIso8601String(),
      'notification': instance.notification,
    };

_NotificationContentDto _$NotificationContentDtoFromJson(
  Map<String, dynamic> json,
) => _NotificationContentDto(
  id: json['id'] as String,
  type: json['type'] as String,
  title: json['title'] as String,
  message: json['message'] as String,
  data: json['data'] as Map<String, dynamic>?,
);

Map<String, dynamic> _$NotificationContentDtoToJson(
  _NotificationContentDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'type': instance.type,
  'title': instance.title,
  'message': instance.message,
  'data': instance.data,
};
