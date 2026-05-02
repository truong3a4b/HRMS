import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';
import 'package:hrms/core/network/dio_client.dart';
import 'package:hrms/core/share/models/app_response.dart';
import 'package:hrms/core/utils/extract_error.dart';
import 'package:hrms/feature/recruitment/data/models/interview_evaluation_dto.dart';
import 'package:hrms/feature/recruitment/data/models/interview_schedule_dto.dart';

import '../../../../core/utils/platform_file_actions.dart';
import '../models/job_application_dto.dart';
import '../models/recruitment_job_dto.dart';

class RecruitmentRemote {
  final Dio dio;

  RecruitmentRemote({required this.dio});

  //Lay danh sach cac vi tri tuyen dung, co the loc theo chuc danh, phong ban, tu khoa
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

  //
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

  //Tao moi vi tri tuyen dung
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

  //Cap nhat thong tin vi tri tuyen dung
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

  //Dong vi tri tuyen dung
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

  //Mo lai vi tri tuyen dung
  Future<bool> reopenRecruitmentJob(String id) async {
    try {
      await dio.patch('/recruitment/jobs/$id/reopen');
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote reopenRecruitmentJob error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi mở lại vị trí tuyển dụng',
      );
    }
  }

  //Ung tuyen vao vi tri tuyen dung, co the kem theo file CV
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

  //get application detail
  Future<JobApplicationDto> getApplicationById(String id) async {
    try {
      final response = await dio.get('/recruitment/applications/$id');

      final appResponse = AppResponse.fromJson(response.data);
      return JobApplicationDto.fromJson(appResponse.data);
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote getApplicationById error: $e');

      final errorMessage = ExtractError.extractFirstError(e.response?.data);
      throw AppException(errorMessage);
    }
  }

  //Tao lich phỏng vấn cho ứng viên
  Future<bool> addInterviewSchedule(String applicationId,Map<String, dynamic> data) async {
    try {
      await dio.post('/recruitment/applications/$applicationId/interviews', data: data);
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote addInterviewSchedule error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi tạo lịch phỏng vấn',
      );
    }
  }

  //Xem chi tiết lịch phỏng vấn
  Future<InterviewScheduleDto> getInterviewScheduleById({required String applicationId, required String interviewScheduleId}) async {
    try{
      final response = await dio.get('/recruitment/applications/$applicationId/interviews/$interviewScheduleId');
      final appResponse = AppResponse.fromJson(response.data);
      return InterviewScheduleDto.fromJson(appResponse.data);
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote getInterviewScheduleById error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi tải chi tiết lịch phỏng vấn',
      );
    }
  }

  //Phan hoi lich phong van
  Future<bool> respondInterviewSchedule(String applicationId, String interviewScheduleId, Map<String, dynamic> data) async {
    try {
      await dio.post('/recruitment/applications/$applicationId/interviews/$interviewScheduleId/respond', data: data);
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote respondInterviewSchedule error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi phản hồi lịch phỏng vấn',
      );
    }
  }

  //Danh gia ung vien
  Future<bool> evaluateCandidate(String applicationId, Map<String, dynamic> data) async {
    try {
      await dio.post('/recruitment/applications/$applicationId/evaluations', data: data);
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote evaluateInterviewSchedule error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi đánh giá ứng viên',
      );
    }
  }

  //Xem chi tiết đánh giá ung vien
  Future<InterviewEvaluationDto> getCandidateEvaluationById({required String applicationId,required String evaluationId}) async {
    try {
      final response = await dio.get('/recruitment/applications/$applicationId/evaluations/$evaluationId');
      final appResponse = AppResponse.fromJson(response.data);
      return InterviewEvaluationDto.fromJson(appResponse.data);
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote getCandidateEvaluationById error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi tải chi tiết đánh giá ứng viên',
      );
    }
  }

  //Cap nhat ket qua danh gia ung vien
  Future<bool> updateCandidateEvaluation(String applicationId, String evaluationId, Map<String, dynamic> data) async {
    try {
      await dio.patch(
          '/recruitment/applications/$applicationId/evaluations/$evaluationId',
          data: data);
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote updateCandidateEvaluation error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi cập nhật đánh giá ứng viên',
      );
    }
  }

  //Xoa danh gia ung vien
  Future<bool> deleteCandidateEvaluation(String applicationId, String evaluationId) async {
    try {
      await dio.delete('/recruitment/applications/$applicationId/evaluations/$evaluationId');
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote deleteCandidateEvaluation error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi xóa đánh giá ứng viên',
      );
    }
  }

  //Gui offer cho ung vien
  Future<bool> sendJobOffer(String applicationId, Map<String, dynamic> data) async{
    try {
      await dio.post('/recruitment/applications/$applicationId/offer', data: data);
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote sendJobOffer error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi gửi offer cho ứng viên',
      );
    }
  }

  //Ung vien phan hoi offer
  Future<bool> respondJobOffer(String applicationId, Map<String, dynamic> data) async {
    try {
      await dio.post(
          '/recruitment/applications/$applicationId/offer/respond',
          data: data);
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote respondJobOffer error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi phản hồi offer của ứng viên',
      );
    }
  }

  //Huy ung tuyen
  Future<bool> cancelApplication(String applicationId) async {
    try {
      await dio.post('/recruitment/applications/$applicationId/cancel');
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote cancelApplication error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi hủy ứng tuyển',
      );
    }
  }

  //tu choi ung tuyen
  Future<bool> rejectApplication(String applicationId, Map<String, dynamic> data) async {
    try {
      await dio.post(
          '/recruitment/applications/$applicationId/reject', data: data);
      return true;
    } on DioException catch (e) {
      debugPrint('RecruitmentRemote rejectApplication error: $e');
      throw AppException(
        e.response?.data['message'] ?? 'Lỗi từ chối ứng viên',
      );
    }
  }
}

final recruitmentRemoteProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return RecruitmentRemote(dio: dio);
});
