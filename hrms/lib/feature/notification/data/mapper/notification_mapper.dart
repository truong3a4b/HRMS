import '../../domain/entities/notification.dart';
import '../models/notification_dto.dart';

extension NotificationDtoMapper on NotificationDto {
  Notification toEntity() {
    return Notification(
      id: id,
      type: notification.type.toNotificationType(),
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: isRead,
      createdAt: createdAt,
    );
  }
}
extension NotificationDtoListMapper on List<NotificationDto> {
  List<Notification> toEntityList() {
    return map((dto) => dto.toEntity()).toList();
  }
}


extension NotificationTypeMapper on String {
  NotificationType toNotificationType() {
    switch (toUpperCase()) {
      case 'GENERAL':
        return NotificationType.general;
      case 'SYSTEM':
        return NotificationType.system;
      case 'RECRUITMENT':
        return NotificationType.recruitment;
      case 'EMPLOYEE':
        return NotificationType.employee;
      case 'AUTH':
        return NotificationType.auth;
      case 'CUSTOM':
        return NotificationType.custom;
      default:
        return NotificationType.general; // fallback
    }
  }
}