import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/payroll_dto.dart';

class PayrollRemote {
  final Dio dio;

  PayrollRemote(this.dio);

  Future<List<HolidayDto>> getHolidays({
    required int month,
    required int year,
  }) async {
    try {
      final response = await dio.get(
        '/payroll-policies/holidays',
        queryParameters: {'month': month, 'year': year, 'isActive': true},
      );
      final data = response.data['data'] as List<dynamic>? ?? const [];
      return data
          .whereType<Map<String, dynamic>>()
          .map(HolidayDto.fromJson)
          .toList();
    } on DioException catch (e) {
      debugPrint('PayrollRemote getHolidays error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không tải được danh sách ngày nghỉ lễ',
      );
    }
  }

  Future<List<PayrollSummaryDto>> getMyPayrolls({
    required int month,
    required int year,
  }) async {
    try {
      final response = await dio.get(
        '/payrolls/mine',
        queryParameters: {'month': month, 'year': year},
      );
      final data = response.data['data'] as List<dynamic>? ?? const [];
      return data
          .whereType<Map<String, dynamic>>()
          .map(PayrollSummaryDto.fromJson)
          .toList();
    } on DioException catch (e) {
      debugPrint('PayrollRemote getMyPayrolls error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không tải được bảng lương',
      );
    }
  }

  Future<PayrollDetailDto> getPayrollById(String id) async {
    try {
      final response = await dio.get('/payrolls/$id');
      final data = response.data['data'] as Map<String, dynamic>;
      return PayrollDetailDto.fromJson(data);
    } on DioException catch (e) {
      debugPrint('PayrollRemote getPayrollById error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không tải được chi tiết bảng lương',
      );
    }
  }

  Future<List<BonusPenaltyDto>> getMyBonusPenalties({
    required String month,
    String? status,
  }) async {
    try {
      final params = <String, dynamic>{'month': month};
      if (status != null) {
        params['status'] = status;
      }
      final response = await dio.get(
        '/payroll-policies/bonus-penalties/mine',
        queryParameters: params,
      );
      final data = response.data['data'] as List<dynamic>? ?? const [];
      return data
          .whereType<Map<String, dynamic>>()
          .map(BonusPenaltyDto.fromJson)
          .toList();
    } on DioException catch (e) {
      debugPrint('PayrollRemote getMyBonusPenalties error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không tải được phiếu thưởng/phạt',
      );
    }
  }
}

final payrollRemoteProvider = Provider<PayrollRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return PayrollRemote(dio);
});
