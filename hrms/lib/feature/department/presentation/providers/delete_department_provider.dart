import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../data/repo/department_repository.dart';

final deleteDepartmentProvider =
FutureProvider.autoDispose.family<void, String>((ref, departmentId) async {
  try {
    final repo = ref.read(departmentRepositoryProvider);
    await repo.deleteDepartment(departmentId);
  } on AppException catch (e) {
    debugPrint(e.toString());
    throw e;
  } catch (e, st) {
    debugPrint(e.toString());
    debugPrint(st.toString());
    throw AppException('Đã có lỗi xảy ra, vui lòng thử lại');
  }
});