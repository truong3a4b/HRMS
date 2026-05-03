import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/recruitment/domain/entities/interview_evaluation.dart';

import '../../domain/entities/apply_job_request.dart';
import '../../domain/entities/interview_schedule.dart';
import '../../domain/entities/job_application.dart';
import '../../domain/entities/recruitment_job.dart';
import '../../domain/entities/recruitment_job_request.dart';
import '../datasources/recruitment_remote.dart';
import '../mapper/interview_evaluation_mapper.dart';
import '../mapper/interview_schedule_mapper.dart';
import '../mapper/job_application_mapper.dart';
import '../mapper/recruitment_job_mapper.dart';

class RecruitmentRepository {
  final RecruitmentRemote remote;

  RecruitmentRepository(this.remote);

  Future<List<RecruitmentJob>> getRecruitmentJobs({
    String? positionId,
    String? departmentId,
    String? search,
    int page = 1,
    int limit = 10,
  }) async {
    final result = await remote.fetchRecruitmentJobs(
      positionId: positionId,
      departmentId: departmentId,
      search: search,
      page: page,
      limit: limit,
    );

    return result.map((dto) => dto.toEntity()).toList();
  }

  Future<RecruitmentJob> getRecruitmentJobById(String id) async {
    final result = await remote.getRecruitmentJobById(id);
    return result.toEntity();
  }

  Future<bool> createRecruitmentJob(RecruitmentJobRequest request) async {
    return await remote.createRecruitmentJob(request.toJson());
  }

  Future<bool> updateRecruitmentJob(RecruitmentJobRequest request) async {
    if (request.id == null) {
      throw Exception('Thiếu id tin tuyển dụng');
    }

    return await remote.updateRecruitmentJob(request.id!, request.toJson());
  }

  Future<bool> closeRecruitmentJob(String id) async {
    return await remote.closeRecruitmentJob(id);
  }

  Future<bool> reopenRecruitmentJob(String id) async {
    return await remote.reopenRecruitmentJob(id);
  }

  Future<bool> applyJob(ApplyJobRequest request) async {
    return await remote.applyJob(request.toJson(), cvFile: request.cvFile);
  }

  //get applications list
  Future<List<JobApplication>> fetchApplications({
    String? status,
    String? positionId,
    String? departmentId,
    String? search,
    int page = 1,
    int limit = 10,
  }) async {
    final dtos = await remote.fetchApplications(
      status: status,
      positionId: positionId,
      departmentId: departmentId,
      search: search,
      page: page,
      limit: limit,
    );

    return dtos.map((e) => e.toEntity()).toList();
  }

  //get applications of candidate
  Future<List<JobApplication>> fetchCandidateApplications() async {
    final dtos = await remote.fetchCandidateApplications();
    return dtos.map((e) => e.toEntity()).toList();
  }

  //get application detail
  Future<JobApplication> getApplicationById(String id) async {
    final dto = await remote.getApplicationById(id);
    return dto.toEntity();
  }

  //get application detail for candidate
  Future<JobApplication> fetchCandidateApplicationDetail(String id) async {
    final dto = await remote.getCandidateApplicationDetail(id);
    return dto.toEntity();
  }

  //Tao lich phỏng vấn cho ứng viên
  Future<bool> addInterviewSchedule(
    String applicationId,
    Map<String, dynamic> data,
  ) async {
    return await remote.addInterviewSchedule(applicationId, data);
  }

  //Xem chi tiết lịch phỏng vấn
  Future<InterviewSchedule> getInterviewScheduleById({
    required String applicationId,
    required String interviewScheduleId,
  }) async {
    final dto = await remote.getInterviewScheduleById(
      applicationId: applicationId,
      interviewScheduleId: interviewScheduleId,
    );
    return dto.toEntity();
  }

  //Phan hoi lich phong van
  Future<bool> respondInterviewSchedule(
    String applicationId,
    String interviewScheduleId,
    Map<String, dynamic> data,
  ) async {
    return await remote.respondInterviewSchedule(
      applicationId,
      interviewScheduleId,
      data,
    );
  }

  //Đanh gia ung vien
  Future<bool> evaluateCandidate(
    String applicationId,
    Map<String, dynamic> data,
  ) async {
    return await remote.evaluateCandidate(applicationId, data);
  }

  //Xem chi tiết đánh giá ung vien
  Future<InterviewEvaluation> getCandidateEvaluationById({
    required String applicationId,
    required String evaluationId,
  }) async {
    final dto = await remote.getCandidateEvaluationById(
      applicationId: applicationId,
      evaluationId: evaluationId,
    );
    return dto.toEntity();
  }

  //Sửa đánh giá ung vien
  Future<bool> updateCandidateEvaluation(
    String applicationId,
    String evaluationId,
    Map<String, dynamic> data,
  ) async {
    return await remote.updateCandidateEvaluation(
        applicationId, evaluationId, data);
  }

  //Xoa đánh giá ung vien
  Future<bool> deleteCandidateEvaluation(
    String applicationId,
    String evaluationId,
  ) async {
    return await remote.deleteCandidateEvaluation(applicationId, evaluationId);
  }

  //Gửi offer cho ứng viên
  Future<bool> sendOffer(
    String applicationId,
    Map<String, dynamic> data,
  ) async {
    return await remote.sendJobOffer(applicationId, data);;
  }

  //Ung vien phan hoi offer
  Future<bool> respondOffer(
    String applicationId,
    Map<String, dynamic> data,
  ) async {
    return await remote.respondJobOffer(applicationId, data);
  }

  //Huy dong tuyen dung
  Future<bool> cancelRecruitment(String applicationId) async {
    return await remote.cancelApplication(applicationId);
  }

  //Tu choi ung vien
  Future<bool> rejectCandidate(String applicationId, Map<String, dynamic> data) async {
    return await remote.rejectApplication(applicationId, data);
  }
}

final recruitmentRepositoryProvider = Provider((ref) {
  final remote = ref.watch(recruitmentRemoteProvider);
  return RecruitmentRepository(remote);
});
