import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/service/address/address_repo.dart';
import 'package:hrms/feature/position/domain/entities/position.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/service/address/Province.dart';
import '../../../../core/service/address/province_provider.dart';
import '../../../../core/service/bank/bank.dart';
import '../../../../core/service/bank/bank_provider.dart';
import '../../../../core/service/bank/bank_repo.dart';
import '../../../department/data/repo/department_repository.dart';
import '../../../department/domain/entities/department.dart';
import '../../../department/presentation/providers/department_list_provider.dart';
import '../../../position/data/repo/position_repository.dart';
import '../../../position/presentation/providers/positionListProvider.dart';
import '../../data/repo/employee_repository.dart';
import '../../domain/entities/add_employee_request.dart';
import '../../domain/entities/employee.dart';

final addEmployeeProvider =
    AsyncNotifierProvider.autoDispose<AddEmployeeNotifier, AddEmployeeState>(() {
      return AddEmployeeNotifier();
    });

class AddEmployeeNotifier extends AsyncNotifier<AddEmployeeState> {
  late final EmployeeRepository _employeeRepo;

  @override
  Future<AddEmployeeState> build() async {
    _employeeRepo = ref.read(employeeRepositoryProvider);

    try {
      final result = await Future.wait([
        ref.watch(positionListProvider.future),
        ref.watch(departmentListProvider.future),
        ref.watch(bankProvider.future),
        ref.watch(provinceProvider.future),
      ]);

      final positions = result[0] as List<Position>;
      final departments = result[1] as List<Department>;
      final banks = result[2] as List<Bank>;
      final provinces = result[3] as List<Province>;

      return AddEmployeeState(
        positions: positions,
        departments: departments,
        banks: banks,
        provinces: provinces,
      );
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  Future<bool> addEmployee(AddEmployeeRequest request) async {
    state = AsyncValue.data(
      state.value!.copyWith(isLoading: true, errorMessage: null),
    );
    try{
      final success = await _employeeRepo.addEmployee(request);
      state = AsyncValue.data(
        state.value!.copyWith(isLoading: false, isSuccess: success),
      );
    } catch (e) {
      state = AsyncValue.data(
        state.value!.copyWith(isLoading: false, errorMessage: e.toString()),
      );
    }
    return state.value?.isSuccess ?? false;
  }

  void closeDialog() {
    state = AsyncValue.data(
      state.value!.copyWith(isSuccess: false, errorMessage: null),
    );
  }
}

class AddEmployeeState {
  final List<Position> positions;
  final List<Department> departments;
  final List<Bank> banks;
  final List<Province> provinces;
  final List<Gender> genders = Gender.values;
  final bool isLoading;
  final String? errorMessage;
  final bool isSuccess;

  AddEmployeeState({
    this.positions = const [],
    this.departments = const [],
    this.banks = const [],
    this.provinces = const [],
    this.isLoading = false,
    this.errorMessage,
    this.isSuccess = false,
  });

  AddEmployeeState copyWith({
    List<Position>? positions,
    List<Department>? departments,
    List<Bank>? banks,
    List<Province>? provinces,
    bool? isLoading,
    String? errorMessage,
    bool? isSuccess,
  }) {
    return AddEmployeeState(
      positions: positions ?? this.positions,
      departments: departments ?? this.departments,
      banks: banks ?? this.banks,
      provinces: provinces ?? this.provinces,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

