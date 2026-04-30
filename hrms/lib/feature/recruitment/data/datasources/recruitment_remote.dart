import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';
import 'package:hrms/core/network/dio_client.dart';
import 'package:hrms/core/share/models/app_response.dart';
import 'package:hrms/core/utils/extract_error.dart';

import '../../../../core/utils/platform_file_actions.dart';
import '../models/job_application_dto.dart';
import '../models/recruitment_job_dto.dart';

class RecruitmentRemote {
  final Dio dio;

  RecruitmentRemote({required this.dio});

  Future<List<RecruitmentJobDto>> fetchRecruitmentJobs({
    String? positionId,
    String? departmentId,
    String? search,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await dio.get(
        '/recruitment/jobs',
        queryParameters: {
          'positionId': positionId,
          'departmentId': departmentId,
          'search': search,
          'page': page,
          'limit': limit,
        },
      );

      final appResponse = AppResponse.fromJson(response.data);
      final data = appResponse.data['items'] as List<dynamic>;

      return data.map((e) => RecruitmentJobDto.fromJson(e)).toList();
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote fetchRecruitmentJobs error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi tải vị trí tuyển dụng',
      );
    }
  }

  Future<RecruitmentJobDto> getRecruitmentJobById(String id) async {
    try {
      final response = await dio.get('/recruitment/jobs/$id');

      final appResponse = AppResponse.fromJson(response.data);
      return RecruitmentJobDto.fromJson(appResponse.data);
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote getRecruitmentJobById error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi tải chi tiết vị trí tuyển dụng',
      );
    }
  }

  Future<bool> createRecruitmentJob(Map<String, dynamic> data) async {
    try {
      await dio.post('/recruitment/jobs', data: data);
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote createRecruitmentJob error: $e');

      final errorMessage = ExtractError.extractFirstError(e.response?.data);
      throw AppException(errorMessage);
    }
  }

  Future<bool> updateRecruitmentJob(
    String id,
    Map<String, dynamic> data,
  ) async {
    try {
      await dio.patch('/recruitment/jobs/$id', data: data);
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote updateRecruitmentJob error: $e');

      final errorMessage = ExtractError.extractFirstError(e.response?.data);
      throw AppException(errorMessage);
    }
  }

  Future<bool> closeRecruitmentJob(String id) async {
    try {
      await dio.patch('/recruitment/jobs/$id/close');
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote closeRecruitmentJob error: $e');

      throw AppException(
        e.response?.data['message'] ?? 'Lỗi đóng vị trí tuyển dụng',
      );
    }
  }

  Future<bool> applyJob(
    Map<String, dynamic> data, {
    PickedCvFile? cvFile,
  }) async {
    try {
      if (cvFile == null) {
        await dio.post('/recruitment/applications', data: data);
        return true;
      }
      final formData = FormData.fromMap(data);
      formData.files.add(
        MapEntry(
          'cv',
          MultipartFile.fromBytes(cvFile.bytes, filename: cvFile.name),
        ),
      );

      await dio.post(
        '/recruitment/applications',
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
          extra: {'noRetry': true},
        ),
      );

      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote applyJob error: $e');

      final errorMessage = ExtractError.extractFirstError(e.response?.data);
      throw AppException(errorMessage);
    }
  }

  //get application list
  Future<List<JobApplicationDto>> fetchApplications({
    String? status,
    String? positionId,
    String? departmentId,
    String? search,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await dio.get(
        '/recruitment/applications',
        queryParameters: {
          if (status != null) 'status': status,
          if (positionId != null) 'positionId': positionId,
          if (departmentId != null) 'departmentId': departmentId,
          if (search != null) 'search': search,
          'page': page,
          'limit': limit,
        },
      );

      final appResponse = AppResponse.fromJson(response.data);
      final data = appResponse.data['items'] as List<dynamic>;

      return data
          .map((e) => JobApplicationDto.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote fetchApplications error: $e');

      final errorMessage = ExtractError.extractFirstError(e.response?.data);
      throw AppException(errorMessage);
    }
  }
}

final recruitmentRemoteProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return RecruitmentRemote(dio: dio);
});
