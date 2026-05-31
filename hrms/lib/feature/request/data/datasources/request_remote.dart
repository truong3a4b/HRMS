import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/request_dto.dart';

class RequestRemote {
  final Dio dio;

  RequestRemote(this.dio);

  Future<RequestListDataDto> getRequests({
    required String tab,
    required int page,
    required int limit,
    String? search,
    String? status,
    String? type,
  }) async {
    try {
      final params = <String, dynamic>{
        'page': page,
        'limit': limit,
        if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
        if (status != null && status.isNotEmpty) 'status': status,
        if (type != null && type.isNotEmpty) 'type': type,
      };

      final String path;
      if (tab == 'pending') {
        path = '/requests/me/pending-approvals';
      } else if (tab == 'watching') {
        path = '/requests/me/watching';
      } else if (tab == 'reviewed') {
        path = '/requests';
        params['scope'] = 'reviewed';
      } else {
        path = '/requests/me';
      }

      final response = await dio.get(path, queryParameters: params);
      final data = response.data['data'] as Map<String, dynamic>;
      return RequestListDataDto.fromJson(data);
    } on DioException catch (e) {
      debugPrint('RequestRemote getRequests error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không tải được danh sách yêu cầu',
      );
    }
  }

  Future<RequestItemDto> getRequestById(String id) async {
    try {
      final response = await dio.get('/requests/$id');
      final data = response.data['data'] as Map<String, dynamic>;
      return RequestItemDto.fromJson(data);
    } on DioException catch (e) {
      debugPrint('RequestRemote getRequestById error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không tải được chi tiết yêu cầu',
      );
    }
  }

  Future<List<Map<String, dynamic>>> getEmployeeUserOptions() async {
    try {
      final response = await dio.get(
        '/employees',
        queryParameters: {'page': 1, 'limit': -1, 'search': ''},
      );
      final data = response.data['data'] as Map<String, dynamic>;
      return (data['items'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .toList();
    } on DioException catch (e) {
      debugPrint('RequestRemote getEmployeeUserOptions error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không tải được danh sách người duyệt',
      );
    }
  }

  Future<List<RequestWorkShiftDto>> getMyLeaveShiftsByDate(String date) async {
    try {
      final response = await dio.get(
        '/requests/leave/shifts',
        queryParameters: {'date': date},
      );
      final data = response.data['data'] as List<dynamic>? ?? const [];
      return data
          .whereType<Map<String, dynamic>>()
          .map(RequestWorkShiftDto.fromJson)
          .toList();
    } on DioException catch (e) {
      debugPrint('RequestRemote getMyLeaveShiftsByDate error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không tải được ca làm theo ngày nghỉ',
      );
    }
  }

  Future<List<RequestWorkShiftDto>> getMyScheduleShiftsByDate(
    String date,
  ) async {
    try {
      final response = await dio.get(
        '/requests/schedule-shifts',
        queryParameters: {'date': date},
      );
      final data = response.data['data'] as List<dynamic>? ?? const [];
      return data
          .whereType<Map<String, dynamic>>()
          .map(RequestWorkShiftDto.fromJson)
          .toList();
    } on DioException catch (e) {
      debugPrint('RequestRemote getMyScheduleShiftsByDate error: $e');
      throw AppException(
        e.response?.data['message'] ??
            'Không tải được ca làm theo ngày đã chọn',
      );
    }
  }

  Future<RequestItemDto> createLeaveRequest(
    Map<String, dynamic> payload,
  ) async {
    try {
      final response = await dio.post('/requests/leave', data: payload);
      final data = response.data['data'] as Map<String, dynamic>;
      return RequestItemDto.fromJson(data);
    } on DioException catch (e) {
      debugPrint('RequestRemote createLeaveRequest error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không thể gửi đơn xin nghỉ phép',
      );
    }
  }

  Future<RequestItemDto> createAttendanceCorrectionRequest(
    Map<String, dynamic> payload,
  ) async {
    try {
      final response = await dio.post(
        '/requests/attendance-correction',
        data: payload,
      );
      final data = response.data['data'] as Map<String, dynamic>;
      return RequestItemDto.fromJson(data);
    } on DioException catch (e) {
      debugPrint('RequestRemote createAttendanceCorrectionRequest error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không thể gửi đề xuất cộng công',
      );
    }
  }

  Future<RequestItemDto> decideRequest({
    required String id,
    required String decision,
    String? note,
  }) async {
    try {
      final response = await dio.post(
        '/requests/$id/decision',
        data: {
          'decision': decision,
          if (note != null && note.trim().isNotEmpty) 'note': note.trim(),
        },
      );
      final data = response.data['data'] as Map<String, dynamic>;
      return RequestItemDto.fromJson(data);
    } on DioException catch (e) {
      debugPrint('RequestRemote decideRequest error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không lưu được quyết định',
      );
    }
  }

  Future<RequestItemDto> cancelRequest(String id) async {
    try {
      final response = await dio.post('/requests/$id/cancel');
      final data = response.data['data'] as Map<String, dynamic>;
      return RequestItemDto.fromJson(data);
    } on DioException catch (e) {
      debugPrint('RequestRemote cancelRequest error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Không hủy được yêu cầu',
      );
    }
  }
}

final requestRemoteProvider = Provider<RequestRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return RequestRemote(dio);
});
