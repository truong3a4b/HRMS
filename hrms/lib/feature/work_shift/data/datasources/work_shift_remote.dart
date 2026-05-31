import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/work_shift_dto.dart';

class WorkShiftRemote {
  final Dio dio;

  WorkShiftRemote(this.dio);

  Future<List<WorkShiftDto>> getWorkShifts() async {
    try {
      final response = await dio.get(
        '/work-shifts',
        queryParameters: {'includeInactive': true},
      );
      final data = response.data['data'] as List<dynamic>;
      return data
          .map((item) => WorkShiftDto.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      debugPrint('WorkShiftRemote getWorkShifts error: $e');
      throw AppException(e.response?.data['message'] ?? 'Lỗi tải ca làm việc');
    }
  }

  Future<WorkShiftDto> getWorkShiftById(String id) async {
    try {
      final response = await dio.get('/work-shifts/$id');
      final data = response.data['data'] as Map<String, dynamic>;
      return WorkShiftDto.fromJson(data);
    } on DioException catch (e) {
      debugPrint('WorkShiftRemote getWorkShiftById error: $e');
      throw AppException(e.response?.data['message'] ?? 'Lỗi tải ca làm việc');
    }
  }
}

final workShiftRemoteProvider = Provider<WorkShiftRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return WorkShiftRemote(dio);
});
