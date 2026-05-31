import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/network/dio_client.dart';

class EmployeeExtraRemote {
  final Dio dio;

  EmployeeExtraRemote(this.dio);

  Future<Map<String, dynamic>?> getPayrollProfile({
    required String employeeId,
    required bool isMine,
  }) async {
    try {
      final response = await dio.get(
        isMine ? '/employees/me' : '/employees/$employeeId',
      );
      final data = response.data['data'] as Map<String, dynamic>;
      return data['payrollProfile'] as Map<String, dynamic>?;
    } on DioException catch (e) {
      debugPrint('EmployeeExtraRemote getPayrollProfile error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không tải được chính sách lương',
      );
    }
  }

  Future<List<Map<String, dynamic>>> getJobHistory({
    required String employeeId,
    required bool isMine,
  }) async {
    try {
      final response = await dio.get(
        isMine
            ? '/employees/me/job-history'
            : '/employees/$employeeId/job-history',
      );
      final data = response.data['data'] as List<dynamic>? ?? const [];
      return data.whereType<Map<String, dynamic>>().toList();
    } on DioException catch (e) {
      debugPrint('EmployeeExtraRemote getJobHistory error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không tải được lịch sử công việc',
      );
    }
  }
}

final employeeExtraRemoteProvider = Provider<EmployeeExtraRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return EmployeeExtraRemote(dio);
});
