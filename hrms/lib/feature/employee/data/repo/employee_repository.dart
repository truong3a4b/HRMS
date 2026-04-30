
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/employee/data/mapper/employee_mapper.dart';
import 'package:hrms/feature/employee/domain/entities/basic_info_request.dart';
import '../../domain/entities/add_employee_request.dart';
import '../../domain/entities/employee.dart';
import '../../domain/entities/job_request.dart';
import '../datasources/employee_remote.dart';

class EmployeeRepository {
  final EmployeeRemote remote;

  EmployeeRepository(this.remote);

  // Lấy danh sách nhân viên với các tùy chọn lọc
  Future<List<Employee>> getEmployees({
    String? positionId,
    String? departmentId,
    String? employeeStatus,
    String? name,
    int page = 1,
    int limit = 10,
  }) async {
    final result = await remote.fetchEmployees(
      positionId: positionId,
      departmentId: departmentId,
      employeeStatus: employeeStatus,
      search: name,
      page: page,
      limit: limit,
    );
    return result.map((dto) => dto.toEntity()).toList();
  }

  // Thêm nhân viên mới
  Future<bool> addEmployee(AddEmployeeRequest request) async {
    final result = await remote.addEmployee(request.toJson());
    return result;
  }

  // Lấy thông tin chi tiết của một nhân viên theo ID
  Future<Employee> getEmployeeById(String employeeId) async {
    final result = await remote.getEmployeeById(employeeId);
    return result.toEntity();
  }

  // Cập nhật thông tin cơ bản của nhân viên
  Future<bool> updateEmployeeBasicInfo(BasicInfoRequest request) async {
    final result = await remote.updateEmployeeBasicInfo(
      request.id,
      request.toJson(),
    );
    return result;
  }

  // Cập nhật thông tin công việc của nhân viên
  Future<bool> updateEmployeeJobInfo(JobRequest request) async {
    final result = await remote.updateEmployeeJobInfo(
      request.id,
      request.toJson(),
    );
    return result;
  }
}

final employeeRepositoryProvider = Provider((ref) {
  final remote = ref.watch(employeeRemoteProvider);
  return EmployeeRepository(remote);
});
