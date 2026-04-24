import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_client.dart';

class DepartmentRemote {
  final Dio dio;

  DepartmentRemote({required this.dio});
}

final departmentRemoteProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return DepartmentRemote(dio: dio);
});