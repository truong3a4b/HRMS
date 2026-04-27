import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/employee/data/repo/employee_repository.dart';

import '../../../department/presentation/providers/department_list_provider.dart';
import '../../../position/presentation/providers/positionListProvider.dart';
import '../../domain/entities/employee.dart';
import '../widgets/employee_filter_bottom_sheet.dart';

final employeeListProvider =
    AsyncNotifierProvider.autoDispose<EmployeeListNotifier, EmployeeListState>(
      () {
        return EmployeeListNotifier();
      },
    );

class EmployeeListNotifier extends AsyncNotifier<EmployeeListState> {
  late final EmployeeRepository _employeeRepo;

  static const _initialPage = 1;
  static const _defaultLimit = 10;

  @override
  Future<EmployeeListState> build() async {
    _employeeRepo = ref.read(employeeRepositoryProvider);

    final results = await Future.wait([
      _employeeRepo.getEmployees(page: _initialPage, limit: _defaultLimit),
      ref.read(departmentListProvider.future),
      ref.read(positionListProvider.future),
    ]);

    final employees = results[0] as List<Employee>;
    final departments = results[1] as List;
    final positions = results[2] as List;

    return EmployeeListState(
      employees: employees,
      filters: _buildFilters(departments, positions),
      page: _initialPage,
      limit: _defaultLimit,
      hasMore: employees.length == _defaultLimit,
    );
  }

  List<FilterItem> _buildFilters(List departments, List positions) {
    return [
      FilterItem(
        key: 'department',
        title: 'Phòng ban',
        options: [
          FilterOption(value: 'all', label: 'Tất cả phòng ban'),
          ...departments.map((d) => FilterOption(value: d.id, label: d.name)),
        ],
      ),
      FilterItem(
        key: 'position',
        title: 'Chức vụ',
        options: [
          FilterOption(value: 'all', label: 'Tất cả chức vụ'),
          ...positions.map((p) => FilterOption(value: p.id, label: p.name)),
        ],
      ),
      FilterItem(
        key: 'status',
        title: 'Trạng thái',
        options: [
          FilterOption(value: 'all', label: 'Tất cả trạng thái'),
          ...EmployeeStatus.values.map(
            (s) => FilterOption(value: s.name, label: s.displayName),
          ),
        ],
      ),
    ];
  }

  EmployeeFilterParams _parseFilter(FilterResult filterResult, {String? name}) {
    String? normalize(String? value) {
      if (value == null || value == 'all') return null;
      return value;
    }

    final trimmedName = name?.trim();

    return EmployeeFilterParams(
      departmentId: normalize(filterResult['department']?.value),
      positionId: normalize(filterResult['position']?.value),
      status: normalize(filterResult['status']?.value),
      name: trimmedName == null || trimmedName.isEmpty ? null : trimmedName,
    );
  }

  Future<void> refresh({required FilterResult filterResult, String? name}) {
    return fetchEmployees(filterResult: filterResult, name: name);
  }

  Future<void> fetchEmployees({
    required FilterResult filterResult,
    String? name,
  }) async {
    final current = state.whenOrNull(data: (v) => v)
        ?? EmployeeListState(limit: _defaultLimit);

    state = AsyncValue.data(
      current.copyWith(
        isLoading: true,
        errorMessage: null,
        page: _initialPage,
        hasMore: true,
      ),
    );

    final params = _parseFilter(filterResult, name: name);

    final result = await AsyncValue.guard(() async {
      final employees = await _fetchPage(
        page: _initialPage,
        limit: current.limit,
        params: params,
      );

      return current.copyWith(
        employees: employees,
        isLoading: false,
        page: _initialPage,
        hasMore: employees.length == current.limit,
      );
    });

    state = result;
  }

  Future<void> loadMore({
    required FilterResult filterResult,
    String? name,
  }) async {
    final current = state.value;
    if (current == null) return;
    if (current.isLoadingMore || !current.hasMore) return;

    state = AsyncValue.data(
      current.copyWith(isLoadingMore: true, errorMessage: null),
    );

    final params = _parseFilter(filterResult, name: name);
    final nextPage = current.page + 1;

    final result = await AsyncValue.guard(() async {
      final newEmployees = await _fetchPage(
        page: nextPage,
        limit: current.limit,
        params: params,
      );

      return current.copyWith(
        employees: [...current.employees, ...newEmployees],
        page: nextPage,
        isLoadingMore: false,
        hasMore: newEmployees.length == current.limit,
      );
    });

    state = result;
  }

  Future<List<Employee>> _fetchPage({
    required int page,
    required int limit,
    required EmployeeFilterParams params,
  }) {
    return _employeeRepo.getEmployees(
      page: page,
      limit: limit,
      departmentId: params.departmentId,
      positionId: params.positionId,
      employeeStatus: params.status,
      name: params.name,
    );
  }
}

class EmployeeFilterParams {
  final String? departmentId;
  final String? positionId;
  final String? status;
  final String? name;

  const EmployeeFilterParams({
    this.departmentId,
    this.positionId,
    this.status,
    this.name,
  });
}

class EmployeeListState {
  final bool isLoading;
  final bool isLoadingMore;
  final bool hasMore;
  final int page;
  final int limit;
  final String? errorMessage;
  final List<Employee> employees;
  final List<FilterItem> filters;

  EmployeeListState({
    this.isLoading = false,
    this.isLoadingMore = false,
    this.hasMore = true,
    this.page = 1,
    this.limit = 10,
    this.errorMessage,
    this.employees = const [],
    this.filters = const [],
  });

  EmployeeListState copyWith({
    bool? isLoading,
    bool? isLoadingMore,
    bool? hasMore,
    int? page,
    int? limit,
    String? errorMessage,
    List<Employee>? employees,
    List<FilterItem>? filters,
  }) {
    return EmployeeListState(
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      hasMore: hasMore ?? this.hasMore,
      page: page ?? this.page,
      limit: limit ?? this.limit,
      errorMessage: errorMessage,
      employees: employees ?? this.employees,
      filters: filters ?? this.filters,
    );
  }
}
