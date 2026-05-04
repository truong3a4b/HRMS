import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/datasources/notification_socket_service.dart';

final notificationSocketServiceProvider =
Provider<NotificationSocketService>((ref) {
  final service = NotificationSocketService(ref);

  ref.onDispose(() {
    service.disconnect();
  });

  return service;
});