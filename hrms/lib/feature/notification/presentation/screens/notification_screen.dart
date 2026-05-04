import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/notification.dart' as entity;
import '../providers/notification_provider.dart';
import '../widgets/notification_item.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationListProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Thông báo',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: Colors.black,
          ),
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, color: Colors.black),
            onSelected: (value) async {
              if (value == 'read_all') {
                await ref
                    .read(notificationListProvider.notifier)
                    .markAllAsRead();
              }
            },
            itemBuilder: (_) => const [
              PopupMenuItem(
                value: 'read_all',
                child: Text('Đánh dấu tất cả đã đọc'),
              ),
            ],
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            height: 1,
            color: const Color(0xFFEAEAEA),
          ),
        ),
      ),
      body: notificationsAsync.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return const Center(
              child: Text('Chưa có thông báo'),
            );
          }

          return RefreshIndicator(
            onRefresh: () {
              return ref.read(notificationListProvider.notifier).refresh();
            },
            child: ListView.separated(
              padding: const EdgeInsets.only(top: 12),
              itemCount: notifications.length,
              separatorBuilder: (_, _) => const SizedBox(height: 4),
              itemBuilder: (context, index) {
                final item = notifications[index];

                return NotificationItem(
                  notification: item,
                  onTap: () async {
                    if (!item.isRead) {
                      await ref
                          .read(notificationListProvider.notifier)
                          .markAsRead(item.id);
                    }
                    if(!context.mounted) return;
                    _handleNavigate(context, item);
                  },
                );
              },
            ),
          );
        },
        loading: () {
          return const Center(
            child: CircularProgressIndicator(),
          );
        },
        error: (error, stackTrace) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(error.toString()),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () {
                    ref.read(notificationListProvider.notifier).refresh();
                  },
                  child: const Text('Tải lại'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _handleNavigate(
      BuildContext context,
      entity.Notification notification,
      ) {
    final data = notification.data;
    if (data == null) return;

    final kind = data['kind'];

    switch (kind) {
      case 'JOB_APPLICATION_CREATED':
        final applicationId = data['applicationId'];
        if (applicationId != null) {
          // context.push('/applications/$applicationId');
        }
        break;

      default:
        break;
    }
  }
}