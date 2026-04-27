
import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import 'package:hrms/feature/department/presentation/providers/department_list_provider.dart';
import 'package:hrms/feature/employee/domain/entities/basic_info_request.dart';
import 'package:hrms/feature/employee/domain/entities/employee.dart';
import 'package:hrms/feature/position/presentation/providers/positionListProvider.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/service/address/Province.dart';

import '../../../../core/service/address/province_provider.dart';
import '../../../../core/service/bank/bank.dart';
import '../../../../core/service/bank/bank_provider.dart';

import '../../../department/domain/entities/department.dart';

import '../../../position/domain/position.dart';
import '../../data/repo/employee_repository.dart';
import '../../domain/entities/job_request.dart';

final editEmployeeProvider =
StateNotifierProvider.autoDispose.family<EditEmployeeNotifier, EditEmployeeState, String >((ref, employeeId) {
  final EmployeeRepository employeeRepo = ref.read(employeeRepositoryProvider);
  return EditEmployeeNotifier(
    ref: ref,
    employeeId: employeeId,
    employeeRepo: employeeRepo,
  );
});

class EditEmployeeNotifier extends StateNotifier<EditEmployeeState> {
  final Ref ref;
  final EmployeeRepository employeeRepo;
  final String employeeId;
  EditEmployeeNotifier( {
    required this.ref,
    required this.employeeId,
    required this.employeeRepo,
  }) : super(EditEmployeeState());


  Future<void> initialize() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await Future.wait([
        employeeRepo.getEmployeeById(employeeId),
        ref.read(positionListProvider.future),
        ref.read(departmentListProvider.future),
        ref.read(bankProvider.future),
        ref.read(provinceProvider.future),
      ]);

      final employee = result[0] as Employee;
      final positions = result[1] as List<Position>;
      final departments = result[2] as List<Department>;
      final banks = result[3] as List<Bank>;
      final provinces = result[4] as List<Province>;

      state = state.copyWith(
        employee: employee,
        positions: positions,
        departments: departments,
        banks: banks,
        provinces: provinces,
        isLoading: false,
      );
    } on AppException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    }
    catch (e, st) {
      debugPrint('EditEmployeeNotifier initialize error: $e\n$st');
      state = state.copyWith(isLoading: false, errorMessage: "Lỗi không xác định");
    }
  }


  Future<bool> updateEmployeeBasicInfo(BasicInfoRequest request) async {
    state = state.copyWith(isSubmitting: true, errorMessage: null, isSuccess: false,);
    try {
      final result = await employeeRepo.updateEmployeeBasicInfo(request);
      state = state.copyWith(isSubmitting: false, isSuccess: result);
      return result;
    } on AppException catch (e) {
      state = state.copyWith(isSubmitting: false, errorMessage: e.message);
      return false;
    }
    catch (e, st) {
      debugPrint('EditEmployeeNotifier updateEmployeeBasicInfo error: $e\n$st');
      state = state.copyWith(isSubmitting: false, errorMessage: "Lỗi không xác định");
      return false;
    }
  }

  Future<bool> updateEmployeeJobInfo(JobRequest request) async {
    state = state.copyWith(isSubmitting: true, errorMessage: null, isSuccess: false,);
    try {
      final result = await employeeRepo.updateEmployeeJobInfo(request);
      state = state.copyWith(isSubmitting: false, isSuccess: result);
      return result;
    } on AppException catch (e) {
      state = state.copyWith(isSubmitting: false, errorMessage: e.message);
      return false;
    }
    catch (e, st) {
      debugPrint('EditEmployeeNotifier UpdateJobInfo error: $e\n$st');
      state = state.copyWith(isSubmitting: false, errorMessage: "Lỗi không xác định");
      return false;
    }
  }


  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}



class EditEmployeeState {
  final Employee? employee;
  final List<Position> positions;
  final List<Department> departments;
  final List<Bank> banks;
  final List<Province> provinces;
  final List<Gender> genders = Gender.values;


  final bool isLoading;
  final String? errorMessage;
  final bool isSubmitting;
  final bool isSuccess;

  EditEmployeeState({
    this.employee,
    this.positions = const [],
    this.departments = const [],
    this.banks = const [],
    this.provinces = const [],
    this.isLoading = false,
    this.errorMessage,
    this.isSubmitting = false,
    this.isSuccess = false,
  });

  EditEmployeeState copyWith({
    Employee? employee,
    List<Position>? positions,
    List<Department>? departments,
    List<Bank>? banks,
    List<Province>? provinces,
    bool? isLoading,
    String? errorMessage,
    bool? isSubmitting,
    bool? isSuccess,
  }) {
    return EditEmployeeState(
      employee: employee ?? this.employee,
      positions: positions ?? this.positions,
      departments: departments ?? this.departments,
      banks: banks ?? this.banks,
      provinces: provinces ?? this.provinces,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

