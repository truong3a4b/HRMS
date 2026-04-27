import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../data/repo/department_repository.dart';
import '../../domain/entities/update_department_request.dart';

final updateDepartmentProvider =
FutureProvider.autoDispose.family<void, UpdateDepartmentRequest>((
    ref,
    request,
    ) async {
  try {
    final repo = ref.read(departmentRepositoryProvider);
    await repo.updateDepartment(request);
  } on AppException catch (e) {
    debugPrint(e.toString());
    throw e;
  } catch (e, st) {
    debugPrint(e.toString());
    debugPrint(st.toString());
    throw AppException('Đã có lỗi xảy ra, vui lòng thử lại');
  }
});