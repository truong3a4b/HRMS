import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../data/repo/department_repository.dart';
import '../../domain/entities/department.dart';

final departmentListProvider = AsyncNotifierProvider<DepartmentListNotifier, List<Department>>(
  () {
    return DepartmentListNotifier();
  },
);

class DepartmentListNotifier extends AsyncNotifier<List<Department>> {
  @override
  Future<List<Department>> build() async {
    try {
      final departmentRepo = ref.read(departmentRepositoryProvider);
      final departments = await departmentRepo.getDepartments();
      return departments;
    } on AppException catch (e) {
      debugPrint(e.message);
      throw e;
    } catch (e, st) {
      debugPrint('Error fetching departments: $e');
      debugPrintStack(stackTrace: st);
      throw AppException('Lỗi không xác định khi tải danh sách phòng ban');
    }
  }


}