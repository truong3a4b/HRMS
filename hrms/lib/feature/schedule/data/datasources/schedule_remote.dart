import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/work_schedule_dto.dart';

class ScheduleRemote {
  final Dio dio;

  ScheduleRemote(this.dio);

  Future<List<WorkScheduleDto>> getMySchedule(String month) async {
    try {
      final response = await dio.get(
        '/schedule-assignments/me',
        queryParameters: {'month': month},
      );
      final data = response.data['data'] as List<dynamic>? ?? const [];
      return data
          .map((item) => WorkScheduleDto.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      debugPrint('ScheduleRemote getMySchedule error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi tải lịch làm việc',
      );
    }
  }
}

final scheduleRemoteProvider = Provider<ScheduleRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return ScheduleRemote(dio);
});
