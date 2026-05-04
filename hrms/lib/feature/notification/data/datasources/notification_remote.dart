import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';
import 'package:hrms/core/network/dio_client.dart';

import '../models/notification_dto.dart';

class NotificationRemote {
  final Dio dio;

  NotificationRemote(this.dio);

  Future<List<NotificationDto>> getMyNotifications({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await dio.get(
        '/notifications/me',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      final data = response.data['data'] as Map<String, dynamic>;
      final items = data['items'] as List<dynamic>;
      return items.map((e) => NotificationDto.fromJson(e)).toList();

    } on DioException catch (e) {
      debugPrint('NotificationRemote getMyNotifications error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi tải danh sách thông báo',
      );
    }
  }

  Future<int> getUnreadCount() async {
    try {
      final response = await dio.get('/notifications/me/unread-count');

      final data = response.data['data'];

      if (data is int) {
        return data;
      }

      if (data is Map<String, dynamic>) {
        return data['unreadCount'] ?? data['count'] ?? 0;
      }

      return 0;
    } on DioException catch (e) {
      debugPrint('NotificationRemote getUnreadCount error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi tải số thông báo chưa đọc',
      );
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await dio.patch('/notifications/me/$id/read');
    } on DioException catch (e) {
      debugPrint('NotificationRemote markAsRead error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi đánh dấu đã đọc thông báo',
      );
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await dio.patch('/notifications/me/read-all');
    } on DioException catch (e) {
      debugPrint('NotificationRemote markAllAsRead error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi đánh dấu tất cả đã đọc',
      );
    }
  }

}

final notificationRemoteProvider = Provider<NotificationRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return NotificationRemote(dio);
});