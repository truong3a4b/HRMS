import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';
import 'package:hrms/feature/employee/data/repo/employee_repository.dart';

import '../../../department/data/repo/department_repository.dart';
import '../../../department/domain/entities/department.dart';
import '../../../position/data/repo/position_repository.dart';
import '../../../position/domain/position.dart';
import '../../domain/entities/employee.dart';
import '../widgets/employee_filter_bottom_sheet.dart';


final employeeListProvider = AsyncNotifierProvider.autoDispose<EmployeeListNotifier, EmployeeListState>(() {
  return EmployeeListNotifier();
});

class EmployeeListNotifier extends AsyncNotifier<EmployeeListState> {
  late final EmployeeRepository _employeeRepo;
  late final DepartmentRepository _departmentRepo;
  late final PositionRepository _positionRepo;


  @override
  Future<EmployeeListState> build() async {
    _employeeRepo = ref.read(employeeRepositoryProvider);
    _departmentRepo = ref.read(departmentRepositoryProvider);
    _positionRepo = ref.read(positionRepositoryProvider);

    try{
      final result = await Future.wait([
        _employeeRepo.getEmployees(),
        _departmentRepo.getDepartments(),
        _positionRepo.getPositions(),
      ]);
      final employees = result[0] as List<Employee>;
      final departments = result[1] as List<Department>;
      final positions = result[2] as List<Position>;
      final filters = [
        FilterItem(
          key: 'department',
          title: 'Phòng ban',
          options: [
            FilterOption(value: "all", label: 'Tất cả phòng ban'),
            ...departments.map((d) => FilterOption(value: d.id, label: d.name)),
          ],
        ),
        FilterItem(
          key: 'position',
          title: 'Chức vụ',
          options: [
            FilterOption(value: "all", label: 'Tất cả chức vụ'),
            ...positions.map((p) => FilterOption(value: p.id, label: p.name)),
          ],
        ),
        FilterItem(
          key: 'status',
          title: 'Trạng thái',
          options: [
            FilterOption(value: "all", label: 'Tất cả trạng thái'),
            ...EmployeeStatus.values.map((s) => FilterOption(value: s.name, label: s.displayName)),
          ],
        ),
      ];
      return EmployeeListState(employees: employees, filters: filters);
    }catch(e) {
      throw AppException(e.toString());
    }
  }


  Future<void> refresh({required FilterResult filterResult, String? name}) async {
    if(state.value == null) return;

    fetchEmployees(filterResult: filterResult, name: name);

  }

  Future<void> fetchEmployees({required FilterResult filterResult, String? name}) async {
    state = AsyncValue.data(state.value!.copyWith(isLoading: true, errorMessage: null));
    String? positionId = filterResult['position'].value ;
    String? departmentId = filterResult['department'].value ;




    final result = await AsyncValue.guard(() async {

      if(positionId == "all") positionId = null;
      if(departmentId == "all") departmentId = null;
      if(name!= null && name!.trim().isEmpty) name = null;
      final employees = await _employeeRepo.getEmployees(positionId: positionId, departmentId: departmentId, name: name);
      return state.value!.copyWith(employees: employees, isLoading: false);
    });
    state = result;
  }

}


class EmployeeListState {
  final bool isLoading;
  final String? errorMessage;
  final List<Employee> employees;
  final List<FilterItem> filters;


  EmployeeListState({
    this.isLoading = false,
    this.errorMessage,
    this.employees = const [],
    this.filters = const [],
  });

  EmployeeListState copyWith({
    bool? isLoading,
    String? errorMessage,
    List<Employee>? employees,
    List<FilterItem>? filters,
  }) {
    return EmployeeListState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
      employees: employees ?? this.employees,
      filters: filters ?? this.filters,
    );
  }
}
