import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';

import '../../../employee/domain/entities/employee.dart';
import '../../data/repo/department_repository.dart';
import '../../domain/entities/add_department_request.dart';

final addDepartmentProvider = FutureProvider.autoDispose.family<void, AddDepartmentRequest>((ref, request) async {
  try{
    final departmentRepository = ref.read(departmentRepositoryProvider);
    await departmentRepository.addDepartment(request);
  }on AppException catch(e){
    debugPrint(e.toString());
    throw e;
  }catch(e, st){
    debugPrint(e.toString());
    debugPrint(st.toString());
    throw AppException( 'Đã có lỗi xảy ra, vui lòng thử lại');
  }
});