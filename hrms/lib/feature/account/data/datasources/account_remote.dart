import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/service/address/Ward.dart';
import 'package:hrms/core/service/address/provine_summary.dart';
import 'package:hrms/core/utils/extract_error.dart';
import 'package:hrms/core/utils/platform_file_actions.dart';
import 'package:hrms/feature/candidate/domain/entities/candidate.dart';
import 'package:hrms/feature/employee/domain/entities/employee.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../../employee/data/models/employee_dto.dart';
import '../../../candidate/data/models/candidate_dto.dart';

class AccountRemote {
  final Dio dio;

  AccountRemote({required this.dio});

  Future<EmployeeDto> fetchEmployeeProfile() async {
    try {
      final response = await dio.get('/employees/me');

      return EmployeeDto.fromJson(response.data['data']);
    } on DioException catch (e) {
      print('Profile Remote getCurrentUser error: $e');
      throw AppException('Lỗi tải thông tin cá nhân');
    }
  }

  Future<CandidateDto> fetchCandidateProfile() async {
    try {
      final response = await dio.get('/candidates/profile');

      return CandidateDto.fromJson(response.data['data']);
    } on DioException catch (e) {
      print('Profile Remote getCurrentUser error: $e');
      throw AppException('Lỗi tải thông tin cá nhân');
    }
  }

  Future<bool> updateCandidateProfile(
    Map<String, dynamic> data, {
    PickedCvFile? cvFile,
  }) async {
    try {
      if (cvFile == null) {
        await dio.patch('/candidates/profile', data: data);
        return true;
      }

      final formData = FormData.fromMap(data);
      formData.files.add(
        MapEntry(
          'cv',
          MultipartFile.fromBytes(cvFile.bytes, filename: cvFile.name),
        ),
      );

      await dio.patch(
        '/candidates/profile',
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
          extra: {'noRetry': true},
        ),
      );
      return true;
    } on DioException catch (e) {
      final errorMessage = ExtractError.extractFirstError(e.response?.data);
      throw AppException(errorMessage);
    }
  }

  Future<List<String>> fetchPermissions() async {
    try {
      final response = await dio.get('/auth/my-permissions');
      final data = response.data['data']['permissions'] as List<dynamic>;
      return data.map((e) => e.toString()).toList();
    } on DioException catch (e) {
      print('Profile Remote fetchPermissions error: $e');
      throw AppException('Lỗi tải quyền truy cập');
    }
  }

}

final accountRemoteProvider = Provider<AccountRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return AccountRemote(dio: dio);
});
