import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';

import '../../../../core/error/app_exception.dart';
import '../../data/repo/request_repository.dart';
import '../../domain/entities/request.dart';

class RequestListFilter {
  final String tab;
  final int page;
  final int limit;
  final String search;
  final RequestStatus? status;
  final RequestType? type;

  const RequestListFilter({
    required this.tab,
    this.page = 1,
    this.limit = 10,
    this.search = '',
    this.status,
    this.type,
  });

  RequestListFilter copyWith({
    String? tab,
    int? page,
    int? limit,
    String? search,
    RequestStatus? status,
    bool clearStatus = false,
    RequestType? type,
    bool clearType = false,
  }) {
    return RequestListFilter(
      tab: tab ?? this.tab,
      page: page ?? this.page,
      limit: limit ?? this.limit,
      search: search ?? this.search,
      status: clearStatus ? null : status ?? this.status,
      type: clearType ? null : type ?? this.type,
    );
  }
}

class RequestListState {
  final List<RequestItem> items;
  final RequestListMeta meta;
  final RequestListFilter filter;
  final bool isLoading;
  final bool isLoadingMore;
  final String? errorMessage;

  const RequestListState({
    required this.items,
    required this.meta,
    required this.filter,
    this.isLoading = false,
    this.isLoadingMore = false,
    this.errorMessage,
  });

  factory RequestListState.initial(String tab) {
    return RequestListState(
      items: const [],
      meta: const RequestListMeta(page: 1, limit: 10, total: 0, totalPages: 1),
      filter: RequestListFilter(tab: tab),
      isLoading: true,
    );
  }

  RequestListState copyWith({
    List<RequestItem>? items,
    RequestListMeta? meta,
    RequestListFilter? filter,
    bool? isLoading,
    bool? isLoadingMore,
    String? errorMessage,
    bool clearError = false,
  }) {
    return RequestListState(
      items: items ?? this.items,
      meta: meta ?? this.meta,
      filter: filter ?? this.filter,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
    );
  }
}

final requestListProvider = StateNotifierProvider.autoDispose
    .family<RequestListNotifier, RequestListState, String>((ref, tab) {
      return RequestListNotifier(
        repo: ref.read(requestRepositoryProvider),
        initialTab: tab,
      )..loadInitial();
    });

class RequestListNotifier extends StateNotifier<RequestListState> {
  final RequestRepository _repo;

  RequestListNotifier({
    required RequestRepository repo,
    required String initialTab,
  }) : _repo = repo,
       super(RequestListState.initial(initialTab));

  Future<void> loadInitial() async {
    await _replace(state.filter);
  }

  Future<void> refresh() async {
    await _replace(state.filter.copyWith(page: 1));
  }

  Future<void> search(String value) async {
    await _replace(state.filter.copyWith(search: value, page: 1));
  }

  Future<void> changeTab(String tab) async {
    await _replace(state.filter.copyWith(tab: tab, page: 1));
  }

  Future<void> changeStatus(RequestStatus? status) async {
    await _replace(
      state.filter.copyWith(
        status: status,
        clearStatus: status == null,
        page: 1,
      ),
    );
  }

  Future<void> changeType(RequestType? type) async {
    await _replace(
      state.filter.copyWith(type: type, clearType: type == null, page: 1),
    );
  }

  Future<void> loadMore() async {
    final current = state;
    if (current.isLoading ||
        current.isLoadingMore ||
        current.meta.page >= current.meta.totalPages) {
      return;
    }

    state = current.copyWith(isLoadingMore: true, clearError: true);
    try {
      final nextFilter = current.filter.copyWith(page: current.meta.page + 1);
      final data = await _repo.getRequests(
        tab: nextFilter.tab,
        page: nextFilter.page,
        limit: nextFilter.limit,
        search: nextFilter.search,
        status: nextFilter.status,
        type: nextFilter.type,
      );
      state = current.copyWith(
        items: [...current.items, ...data.items],
        meta: data.meta,
        filter: nextFilter,
        isLoadingMore: false,
      );
    } catch (e, st) {
      debugPrint(e.toString());
      debugPrint(st.toString());
      state = current.copyWith(
        isLoadingMore: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> _replace(RequestListFilter filter) async {
    state = state.copyWith(isLoading: true, filter: filter, clearError: true);
    try {
      final data = await _repo.getRequests(
        tab: filter.tab,
        page: filter.page,
        limit: filter.limit,
        search: filter.search,
        status: filter.status,
        type: filter.type,
      );
      state = RequestListState(
        items: data.items,
        meta: data.meta,
        filter: filter,
      );
    } on AppException catch (e) {
      debugPrint(e.toString());
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    } catch (e, st) {
      debugPrint(e.toString());
      debugPrint(st.toString());
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Đã có lỗi xảy ra, vui lòng thử lại',
      );
    }
  }
}

final requestDetailProvider = FutureProvider.autoDispose
    .family<RequestItem, String>((ref, id) async {
      final repo = ref.read(requestRepositoryProvider);
      return repo.getRequestById(id);
    });
