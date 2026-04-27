import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/core/error/app_exception.dart';

import '../../data/repo/department_repository.dart';
import '../../domain/entities/update_department_manager_request.dart';

final updateDepartmentManagerProvider = FutureProvider.autoDispose.family<void, UpdateDepartmentManagerRequest>((ref, data) async {
  try{
    final response = await ref.read(departmentRepositoryProvider).selectManager(data);
    return response;

  }on AppException catch(e){
    debugPrint(e.toString());
    throw e;
  } catch (e, st){
    debugPrint(e.toString());
    debugPrint(st.toString());
    throw AppException('An unexpected error occurred');
  }

});