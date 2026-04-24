
import 'package:flutter_riverpod/legacy.dart';
import 'package:hrms/feature/employee/domain/entities/basic_info_request.dart';
import 'package:hrms/feature/employee/domain/entities/employee.dart';

import '../../../../core/service/address/Province.dart';
import '../../../../core/service/address/address_repo.dart';
import '../../../../core/service/bank/bank.dart';
import '../../../../core/service/bank/bank_repo.dart';
import '../../../department/data/repo/department_repository.dart';
import '../../../department/domain/entities/department.dart';
import '../../../position/data/repo/position_repository.dart';
import '../../../position/domain/position.dart';
import '../../data/repo/employee_repository.dart';

final editEmployeeProvider =
StateNotifierProvider.family<EditEmployeeNotifier, EditEmployeeState, String >((ref, employeeId) {
   final EmployeeRepository _employeeRepo = ref.read(employeeRepositoryProvider);
   final PositionRepository _positionRepo = ref.read(positionRepositoryProvider);
   final DepartmentRepository _departmentRepo = ref.read(departmentRepositoryProvider);
   final BankRepo _bankRepo = ref.read(bankRepoProvider);
  final AddressRepo _addressRepo = ref.read(addressRepoProvider);
  return EditEmployeeNotifier(employeeId, _employeeRepo, _positionRepo, _departmentRepo, _bankRepo, _addressRepo);
});

class EditEmployeeNotifier extends StateNotifier<EditEmployeeState> {
  final EmployeeRepository _employeeRepo;
  final PositionRepository _positionRepo;
  final DepartmentRepository _departmentRepo;
  final BankRepo _bankRepo;
  final AddressRepo _addressRepo;
  final String employeeId;
  EditEmployeeNotifier( this.employeeId, this._employeeRepo, this._positionRepo, this._departmentRepo, this._bankRepo, this._addressRepo) : super(EditEmployeeState());


  Future<void> initialize() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await Future.wait([
        _employeeRepo.getEmployeeById(employeeId),
        _positionRepo.getPositions(),
        _departmentRepo.getDepartments(),
        _bankRepo.getBanks(),
        _addressRepo.getProvinces(),
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
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }


  Future<bool> updateEmployeeBasicInfo(BasicInfoRequest request) async {
    state = state.copyWith(isSubmitting: true, errorMessage: null);
    try {
      final result = await _employeeRepo.updateEmployeeBasicInfo(request);
      state = state.copyWith(isSubmitting: false, isSuccess: result);
      return result;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, errorMessage: e.toString());
      return false;
    }
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
      errorMessage: errorMessage ?? this.errorMessage,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

