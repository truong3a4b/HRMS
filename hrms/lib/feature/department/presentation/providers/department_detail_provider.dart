import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repo/department_repository.dart';
import '../../domain/entities/department.dart';

final departmentDetailProvider =
FutureProvider.autoDispose.family<Department, String>((
    ref,
    departmentId,
    ) {
  final repo = ref.read(departmentRepositoryProvider);
  return repo.getDepartmentById(departmentId);
});