import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../employee/data/repo/employee_repository.dart';
import '../../../employee/domain/entities/employee.dart';

final employeesByDepartmentProvider =
FutureProvider.autoDispose.family<List<Employee>, String>((ref, departmentId) async {
  final employeeRepo = ref.read(employeeRepositoryProvider);

  return employeeRepo.getEmployees(
    departmentId: departmentId,
  );
});