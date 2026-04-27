import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';
import 'package:hrms/core/network/dio_client.dart';
import 'package:hrms/core/utils/extract_error.dart';

import '../../../../core/share/models/app_response.dart';
import '../models/employee_dto.dart';

class EmployeeRemote {
  final Dio dio;
  EmployeeRemote({required this.dio});

  // Fetch employees with optional filters and pagination
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
        final appResponse = AppResponse.fromJson(response.data);
        final data = appResponse.data['items'] as List<dynamic>;
        return data.map((e) => EmployeeDto.fromJson(e)).toList();

    } on DioException catch (e) {
      debugPrint('EmployeeRemote fetchEmployees error: $e');
      throw AppException(e.response?.data['message'] ?? 'Lỗi tải dữ liệu');
    }
  }

  // Add a new employee
  Future<bool> addEmployee(Map<String, dynamic> employeeData) async {
    try{
      await dio.post('/employees', data: employeeData);
      return true;
    } on DioException catch (e) {
      debugPrint('EmployeeRemote addEmployee error: $e');

      final errorMessage = ExtractError.extractFirstError(e.response?.data);

      throw AppException(errorMessage);
    }
  }

  //Get employee details by ID
  Future<EmployeeDto> getEmployeeById(String id) async {
    try {
      final response = await dio.get('/employees/$id');
      final appResponse = AppResponse.fromJson(response.data);
      return EmployeeDto.fromJson(appResponse.data);
    } on DioException catch (e) {
      debugPrint('EmployeeRemote getEmployeeById error: $e');
      throw AppException(e.response?.data['message'] ?? 'Lỗi tải dữ liệu');
    }
  }

  // Update employee basic info
  Future<bool> updateEmployeeBasicInfo(String id, Map<String, dynamic> basicInfo) async {
    try {
      await dio.patch('/employees/$id/basic', data: basicInfo);
      return true;
    } on DioException catch (e) {
      debugPrint('EmployeeRemote updateEmployeeBasicInfo error: $e');
      final errorMessage = ExtractError.extractFirstError(e.response?.data);
      throw AppException(errorMessage);
    }
  }

  //Update employee job info
  Future<bool> updateEmployeeJobInfo(String id, Map<String, dynamic> jobInfo) async {
    try {
      await dio.patch('/employees/$id/job', data: jobInfo);
      return true;
    } on DioException catch (e) {
      debugPrint('EmployeeRemote updateEmployeeJobInfo error: $e');
      final errorMessage = ExtractError.extractFirstError(e.response?.data);
      throw AppException(errorMessage);
    }
  }
}

final employeeRemoteProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return EmployeeRemote(dio: dio);
});