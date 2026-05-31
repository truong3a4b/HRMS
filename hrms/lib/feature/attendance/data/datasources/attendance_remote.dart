import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/attendance_dto.dart';

class AttendanceRemote {
  final Dio dio;

  AttendanceRemote(this.dio);

  Future<AttendanceHistoryDataDto> getMyHistory(String month) async {
    try {
      final response = await dio.get(
        '/attendance/history/me',
        queryParameters: {'month': month, 'page': 1, 'limit': 100},
      );
      final data = response.data['data'] as Map<String, dynamic>;
      return AttendanceHistoryDataDto.fromJson(data);
    } on DioException catch (e) {
      debugPrint('AttendanceRemote getMyHistory error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi tải lịch sử chấm công',
      );
    }
  }

  Future<AttendanceTimesheetDataDto> getMyTimesheet(String month) async {
    try {
      final response = await dio.get(
        '/attendance/timesheet/me',
        queryParameters: {'month': month},
      );
      final data = response.data['data'] as Map<String, dynamic>;
      return AttendanceTimesheetDataDto.fromJson(data);
    } on DioException catch (e) {
      debugPrint('AttendanceRemote getMyTimesheet error: $e');
      throw AppException(e.response?.data['message'] ?? 'Lỗi tải bảng công');
    }
  }
}

final attendanceRemoteProvider = Provider<AttendanceRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return AttendanceRemote(dio);
});
