import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repo/employee_repository.dart';
import '../../domain/entities/employee.dart';

final employeeDetailProvider = FutureProvider.family<Employee, String>((
  ref,
  employeeId,
) {
  final repo = ref.read(employeeRepositoryProvider);
  return repo.getEmployeeById(employeeId);
});
