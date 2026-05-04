import 'package:flutter/material.dart' hide Notification;
import '../../domain/entities/notification.dart';

class NotificationItem extends StatelessWidget {
  final Notification notification;
  final VoidCallback? onTap;

  const NotificationItem({
    super.key,
    required this.notification,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isUnread = !notification.isRead;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Container(
          color: isUnread ? const Color(0xFFFFF2F0) : Colors.white,
          padding: const EdgeInsets.fromLTRB(10, 10, 14, 10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              NotificationAvatar(
                showDot: isUnread,
                type: notification.type,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      notification.title,
                      style: TextStyle(
                        fontSize: 15.5,
                        fontWeight:
                        isUnread ? FontWeight.w700 : FontWeight.w600,
                        color: const Color(0xFF222222),
                        height: 1.15,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      notification.message,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        color: Color(0xFF444444),
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _formatDateTime(notification.createdAt),
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF9E9E9E),
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    final d = dateTime.toLocal();

    String two(int value) => value.toString().padLeft(2, '0');

    return '${two(d.day)}/${two(d.month)}/${d.year} ${two(d.hour)}:${two(d.minute)}';
  }
}

class NotificationAvatar extends StatelessWidget {
  final bool showDot;
  final NotificationType type;

  const NotificationAvatar({
    super.key,
    required this.type,
    this.showDot = false,
  });

  @override
  Widget build(BuildContext context) {
    final icon = switch (type) {
      NotificationType.recruitment => Icons.work_outline,
      NotificationType.employee => Icons.badge_outlined,
      NotificationType.system => Icons.settings_outlined,
      NotificationType.auth => Icons.lock_outline,
      NotificationType.custom => Icons.notifications_outlined,
      NotificationType.general => Icons.notifications_outlined,
    };

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: Color(0xFFF8E9E4),
          ),
          child: Icon(
            icon,
            size: 26,
            color: const Color(0xFFFF8A3D),
          ),
        ),
        if (showDot)
          Positioned(
            top: 2,
            right: 2,
            child: Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: const Color(0xFFFF4D4F),
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.white,
                  width: 2,
                ),
              ),
            ),
          ),
      ],
    );
  }
}