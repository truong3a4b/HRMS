import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../data/repo/recruitment_repo.dart';
import '../../domain/entities/job_application.dart';

final jobApplicationListProvider = AsyncNotifierProvider.autoDispose<
    JobApplicationListNotifier, JobApplicationListState>(
  JobApplicationListNotifier.new,
);

class JobApplicationListNotifier extends AsyncNotifier<JobApplicationListState> {
  late final RecruitmentRepository _repo;

  static const _initialPage = 1;
  static const _defaultLimit = 10;

  @override
  Future<JobApplicationListState> build() async {
    _repo = ref.read(recruitmentRepositoryProvider);

    try{
      final applications = await _repo.fetchApplications(
        page: _initialPage,
        limit: _defaultLimit,
      );

      return JobApplicationListState(
        applications: applications,
        page: _initialPage,
        limit: _defaultLimit,
        hasMore: applications.length == _defaultLimit,
      );
    } on Exception catch (e) {
      debugPrint('Error in JobApplicationListNotifier.build: $e');
      rethrow;
    } catch (e, st){
      debugPrint('Error in JobApplicationListNotifier.build: $e\n$st');
      throw AppException('Lỗi khi tải danh sách ứng tuyển');
    }

  }

  Future<void> refresh({
    String? status,
    String? positionId,
    String? departmentId,
    String? search,
  }) {
    return fetchApplications(
      status: status,
      positionId: positionId,
      departmentId: departmentId,
      search: search,
    );
  }

  Future<void> fetchApplications({
    String? status,
    String? positionId,
    String? departmentId,
    String? search,
  }) async {
    final current = state.value ?? const JobApplicationListState();

    state = AsyncValue.data(
      current.copyWith(
        isLoading: true,
        isLoadingMore: false,
        errorMessage: null,
        page: _initialPage,
        hasMore: true,
      ),
    );

    final result = await AsyncValue.guard(() async {
      final applications = await _repo.fetchApplications(
        status: _normalize(status),
        positionId: _normalize(positionId),
        departmentId: _normalize(departmentId),
        search: _normalize(search),
        page: _initialPage,
        limit: current.limit,
      );

      return current.copyWith(
        applications: applications,
        isLoading: false,
        isLoadingMore: false,
        page: _initialPage,
        hasMore: applications.length == current.limit,
        errorMessage: null,
      );
    });

    state = result;
  }

  Future<void> loadMore({
    String? status,
    String? positionId,
    String? departmentId,
    String? search,
  }) async {
    final current = state.value;
    if (current == null) return;
    if (current.isLoading || current.isLoadingMore || !current.hasMore) return;

    state = AsyncValue.data(
      current.copyWith(
        isLoadingMore: true,
        errorMessage: null,
      ),
    );

    final nextPage = current.page + 1;

    final result = await AsyncValue.guard(() async {
      final newApplications = await _repo.fetchApplications(
        status: _normalize(status),
        positionId: _normalize(positionId),
        departmentId: _normalize(departmentId),
        search: _normalize(search),
        page: nextPage,
        limit: current.limit,
      );

      return current.copyWith(
        applications: [
          ...current.applications,
          ...newApplications,
        ],
        page: nextPage,
        isLoadingMore: false,
        hasMore: newApplications.length == current.limit,
        errorMessage: null,
      );
    });

    state = result;
  }

  String? _normalize(String? value) {
    final text = value?.trim();
    if (text == null || text.isEmpty || text == 'all') return null;
    return text;
  }
}

class JobApplicationListState {
  final bool isLoading;
  final bool isLoadingMore;
  final bool hasMore;
  final int page;
  final int limit;
  final String? errorMessage;
  final List<JobApplication> applications;

  const JobApplicationListState({
    this.isLoading = false,
    this.isLoadingMore = false,
    this.hasMore = true,
    this.page = 1,
    this.limit = 10,
    this.errorMessage,
    this.applications = const [],
  });

  JobApplicationListState copyWith({
    bool? isLoading,
    bool? isLoadingMore,
    bool? hasMore,
    int? page,
    int? limit,
    String? errorMessage,
    List<JobApplication>? applications,
  }) {
    return JobApplicationListState(
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      hasMore: hasMore ?? this.hasMore,
      page: page ?? this.page,
      limit: limit ?? this.limit,
      errorMessage: errorMessage,
      applications: applications ?? this.applications,
    );
  }
}