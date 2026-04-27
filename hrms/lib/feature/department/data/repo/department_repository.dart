import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/department/data/datasources/department_remote.dart';
import 'package:hrms/feature/department/domain/entities/update_department_manager_request.dart';

import '../../domain/entities/add_department_request.dart';
import '../../domain/entities/department.dart';
import '../../domain/entities/update_department_request.dart';
import '../mapper/department_mapper.dart';

class DepartmentRepository {
  final DepartmentRemote remote;

  DepartmentRepository(this.remote);

  Future<List<Department>> getDepartments() async {
    final dtos = await remote.getDepartments();
    return dtos.map((dto) => dto.toEntity()).toList();
  }

  Future<Department> getDepartmentById(String id) async {
    final dto = await remote.getDepartmentById(id);
    return dto.toEntity();
  }

  //add department
  Future<void> addDepartment(AddDepartmentRequest request) async {
    await remote.addDepartment(request.toJson());
  }

  //update department
  Future<void> updateDepartment(UpdateDepartmentRequest request) async {
    await remote.updateDepartment(request.id, request.toJson());
  }

  //select manager
  Future<void> selectManager(UpdateDepartmentManagerRequest request) async {
    await remote.selectManager(request.departmentId, request.managerId);
  }

  //delete department
  Future<void> deleteDepartment(String id) async {
    await remote.deleteDepartment(id);
  }

}

final departmentRepositoryProvider = Provider((ref) {
  final remote = ref.watch(departmentRemoteProvider);
  return DepartmentRepository(remote);
});