import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repo/notification_repo.dart';
import '../../domain/entities/notification.dart';

final notificationListProvider =
AsyncNotifierProvider<NotificationListNotifier, List<Notification>>(
  NotificationListNotifier.new,
);

class NotificationListNotifier extends AsyncNotifier<List<Notification>> {
  @override
  Future<List<Notification>> build() async {
    final repo = ref.read(notificationRepositoryProvider);
    return repo.getMyNotifications();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();

    try {
      final repo = ref.read(notificationRepositoryProvider);
      final notifications = await repo.getMyNotifications();

      state = AsyncData(notifications);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  Future<void> markAsRead(String id) async {
    final repo = ref.read(notificationRepositoryProvider);

    await repo.markAsRead(id);

    final current = state.value ?? [];

    state = AsyncData([
      for (final item in current)
        if (item.id == id)
          Notification(
            id: item.id,
            type: item.type,
            title: item.title,
            message: item.message,
            data: item.data,
            isRead: true,
            createdAt: item.createdAt,
          )
        else
          item,
    ]);

    ref.invalidate(unreadNotificationCountProvider);
  }

  Future<void> markAllAsRead() async {
    final repo = ref.read(notificationRepositoryProvider);

    await repo.markAllAsRead();

    final current = state.value ?? [];

    state = AsyncData([
      for (final item in current)
        Notification(
          id: item.id,
          type: item.type,
          title: item.title,
          message: item.message,
          data: item.data,
          isRead: true,
          createdAt: item.createdAt,
        ),
    ]);

    ref.invalidate(unreadNotificationCountProvider);
  }

  void addRealtime(Notification notification) {
    final current = state.value ?? [];

    final exists = current.any((e) => e.id == notification.id);
    if (exists) return;

    state = AsyncData([notification, ...current]);

    ref.invalidate(unreadNotificationCountProvider);
  }
}

final unreadNotificationCountProvider = FutureProvider<int>((ref) async {
  final repo = ref.read(notificationRepositoryProvider);
  return repo.getUnreadCount();
});