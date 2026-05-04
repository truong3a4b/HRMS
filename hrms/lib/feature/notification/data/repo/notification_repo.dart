import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/notification.dart';
import '../datasources/notification_remote.dart';
import '../mapper/notification_mapper.dart';

class NotificationRepository {
  final NotificationRemote remote;

  NotificationRepository(this.remote);

  Future<List<Notification>> getMyNotifications({
    int page = 1,
    int limit = 20,
  }) async {
    final dto = await remote.getMyNotifications(
      page: page,
      limit: limit,
    );

    return dto.map((e) => e.toEntity()).toList();
  }


  Future<int> getUnreadCount() async {
    return remote.getUnreadCount();
  }

  Future<void> markAsRead(String id) async {
    await remote.markAsRead(id);
  }

  Future<void> markAllAsRead() async {
    await remote.markAllAsRead();
  }


}

final notificationRepositoryProvider =
Provider<NotificationRepository>((ref) {
  final remote = ref.watch(notificationRemoteProvider);
  return NotificationRepository(remote);
});