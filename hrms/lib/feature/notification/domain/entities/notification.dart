class Notification {
  final String id;
  final NotificationType type;
  final String title;
  final String message;
  final Map<String, dynamic>? data;
  final bool isRead;
  final DateTime createdAt;

  Notification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.data,
    required this.isRead,
    required this.createdAt,
  });
}

enum NotificationType {
  general,
  system,
  recruitment,
  employee,
  auth,
  custom
}

extension NotificationTypeExtension on NotificationType {
  String get displayName {
    switch (this) {
      case NotificationType.general:
        return 'General';
      case NotificationType.system:
        return 'System';
      case NotificationType.recruitment:
        return 'Recruitment';
      case NotificationType.employee:
        return 'Employee';
      case NotificationType.auth:
        return 'Authentication';
      case NotificationType.custom:
        return 'Custom';
    }
  }

  String get value {
    switch (this) {
      case NotificationType.general:
        return 'GENERAL';
      case NotificationType.system:
        return 'SYSTEM';
      case NotificationType.recruitment:
        return 'RECRUITMENT';
      case NotificationType.employee:
        return 'EMPLOYEE';
      case NotificationType.auth:
        return 'AUTH';
      case NotificationType.custom:
        return 'CUSTOM';
    }
  }
}