import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';

import '../../data/repo/employee_repository.dart';
import '../../domain/entities/employee.dart';

final employeesByDepartmentProvider =
FutureProvider.autoDispose.family<List<Employee>, String>((ref, departmentId) async {

  try{
    final repo = ref.read(employeeRepositoryProvider);
    final employees = await repo.getEmployees(departmentId: departmentId, limit: -1);
    return employees;
  } on AppException catch (e) {
    debugPrint(e.message);
    throw e;
  }
  catch (e, st) {
    debugPrint('Error fetching employees by department: $e');
    debugPrintStack(stackTrace: st);
    throw AppException('Lỗi không xác định khi tải danh sách nhân viên theo phòng ban');
  }
});