import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/department/data/datasources/department_remote.dart';

import '../../domain/entities/department.dart';

class DepartmentRepository {
  final DepartmentRemote remote;

  DepartmentRepository(this.remote);

  Future<List<Department>> getDepartments() async {
    await Future.delayed(const Duration(seconds: 2));
    return [
      Department(id: '1', name: 'Bộ phận Kế toán'),
      Department(id: '2', name: 'Bộ phận Nhân sự'),
      Department(id: '3', name: 'Bộ phận IT'),
      Department(id: '4', name: 'Bộ phận Marketing'),
    ];
  }
}

final departmentRepositoryProvider = Provider((ref) {
  final remote = ref.watch(departmentRemoteProvider);
  return DepartmentRepository(remote);
});