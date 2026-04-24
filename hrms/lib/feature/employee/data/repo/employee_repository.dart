import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/service/address/Ward.dart';
import 'package:hrms/feature/employee/data/mapper/employee_mapper.dart';
import 'package:hrms/feature/employee/domain/entities/basic_info_request.dart';
import 'package:hrms/feature/position/domain/position.dart';
import '../../../../core/service/address/provine_summary.dart';
import '../../../../core/service/bank/bank.dart';
import '../../../department/domain/entities/department.dart';
import '../../domain/entities/add_employee_request.dart';
import '../../domain/entities/employee.dart';
import '../datasources/employee_remote.dart';


class EmployeeRepository {
  final EmployeeRemote remote;

  EmployeeRepository(this.remote);

  // Lấy danh sách nhân viên với các tùy chọn lọc
  Future<List<Employee>> getEmployees({String? positionId, String? departmentId, String? employeeStatus, String? name, int page = 1, int limit = 10}) async {
    final result = await remote.fetchEmployees(positionId: positionId, departmentId: departmentId, employeeStatus: employeeStatus, search: name, page: page, limit: limit);
    return result.map((dto) => dto.toEntity()).toList();
  }

  // Thêm nhân viên mới
  Future<bool> addEmployee(AddEmployeeRequest request) async {
    await Future.delayed(const Duration(seconds: 2));
    return true;
  }

  // Lấy thông tin chi tiết của một nhân viên theo ID
  Future<Employee> getEmployeeById(String employeeId) async {
    final id = Random().nextInt(100).toString();
    await Future.delayed(const Duration(seconds: 2));
    return Employee(
      id: '1',
      employeeId: id,
      name: 'Truongnx',
      email: 'truongnguyen31032004@gmail.com',
      position: Position(id: "1", name: 'Nhân viên'),
      department: Department(id: "1", name: 'Bộ phận Kế toán'),
      status: EmployeeStatus.WORKING,
      phone: '0123456789',
      avatar: 'assets/images/profile.png',
      dateOfBirth: DateTime(1990, 1, 1),
      gender: Gender.MALE,
      address: '123 Đường ABC',
      province: ProvinceSummary(maTinhBNV: 1, name: 'Thành phố Hà Nội'),
      ward:  Ward(code: 10105001, name: "Phường Hoàn Kiếm"),
      hireDate: DateTime(2020, 1, 1),
      salary: 15000000,
      bankAccount: '1234567890',
      bank: Bank(id: "1", name: 'Ngân hàng A'),

    );
  }

  // Cập nhật thông tin cơ bản của nhân viên
  Future<bool> updateEmployeeBasicInfo(BasicInfoRequest request) async {
    await Future.delayed(const Duration(seconds: 2));
    return true;
  }

}

final employeeRepositoryProvider = Provider((ref) {
  final remote = ref.watch(employeeRemoteProvider);
  return EmployeeRepository(remote);
});