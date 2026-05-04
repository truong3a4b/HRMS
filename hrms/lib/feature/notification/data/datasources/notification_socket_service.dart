import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

import '../../data/models/notification_dto.dart';
import '../../data/mapper/notification_mapper.dart';
import '../../presentation/providers/notification_provider.dart';

class NotificationSocketService {
  final Ref ref;

  IO.Socket? _socket;

  NotificationSocketService(this.ref);

  void connect(String token) {
    if (_socket?.connected == true) return;

    _socket = IO.io(
      'http://192.168.1.136:5000',
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({
        'token': token,
      })
          .enableReconnection()
          .setReconnectionAttempts(999)
          .setReconnectionDelay(1000)
          .disableAutoConnect()
          .build(),
    );

    _listenEvents();

    _socket!.connect();
  }

  void _listenEvents() {
    final socket = _socket;
    if (socket == null) return;

    socket.onConnect((_) {
      debugPrint('Notification socket connected');
    });

    socket.onConnectError((error) {
      debugPrint('Notification socket connect error: $error');
    });

    socket.onDisconnect((_) {
      debugPrint('Notification socket disconnected');
    });

    socket.on('notification:connected', (data) {
      debugPrint('Notification socket authenticated: $data');
    });

    socket.on('notification:created', (data) {
      debugPrint('Notification created realtime: $data');

      if (data is! Map) return;

      final dto = NotificationDto.fromJson(
        Map<String, dynamic>.from(data),
      );

      final notification = dto.toEntity();

      ref
          .read(notificationListProvider.notifier)
          .addRealtime(notification);

      ref.invalidate(unreadNotificationCountProvider);
    });

    socket.on('notification:read', (data) {
      ref.invalidate(notificationListProvider);
      ref.invalidate(unreadNotificationCountProvider);
    });

    socket.on('notification:read-all', (data) {
      ref.invalidate(notificationListProvider);
      ref.invalidate(unreadNotificationCountProvider);
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }
}