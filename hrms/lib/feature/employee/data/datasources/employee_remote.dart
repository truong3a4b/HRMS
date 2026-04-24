import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';
import 'package:hrms/core/network/dio_client.dart';

import '../../../../core/share/models/app_response.dart';
import '../models/employee_dto.dart';

class EmployeeRemote {
  final Dio dio;
  EmployeeRemote({required this.dio});

  Future<List<EmployeeDto>> fetchEmployees({String? positionId, String? departmentId, String? employeeStatus, String? search, int page = 1, int limit = 10}) async {
    try {
      final response = await dio.get('/employees', queryParameters: {
        'positionId': positionId,
        'departmentId': departmentId,
        'status': employeeStatus,
        'search': search,
        'page': page,
        'limit': limit,
      });
      if (response.statusCode == 200) {
        final appResponse = AppResponse.fromJson(response.data);
        final data = appResponse.data['items'] as List<dynamic>;
        return data.map((e) => EmployeeDto.fromJson(e)).toList();
      } else {
        debugPrint(
            'EmployeeRemote fetchEmployees error: ${response.data['message']}');
        throw AppException('Lỗi tải dữ liệu');
      }
    } catch (e) {
      debugPrint('EmployeeRemote fetchEmployees error: $e');
      throw AppException('Lỗi tải dữ liệu');
    }
  }
}

final employeeRemoteProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return EmployeeRemote(dio: dio);
});