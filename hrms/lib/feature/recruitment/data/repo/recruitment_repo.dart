import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/job_application.dart';
import '../../domain/entities/recruitment_job.dart';
import '../../domain/entities/apply_job_request.dart';
import '../../domain/entities/recruitment_job_request.dart';
import '../datasources/recruitment_remote.dart';
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
}

final recruitmentRepositoryProvider = Provider((ref) {
  final remote = ref.watch(recruitmentRemoteProvider);
  return RecruitmentRepository(remote);
});
