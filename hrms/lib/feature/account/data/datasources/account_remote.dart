import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/app_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../../employee/data/models/employee_dto.dart';

class AccountRemote {
  final Dio dio;

  AccountRemote({required this.dio});

  Future<EmployeeDto> fetchProfile() async {
    try {
      final response = await dio.get('/employees/me');

      return EmployeeDto.fromJson(response.data['data']);
    } on DioException catch (e) {
      print('Profile Remote getCurrentUser error: $e');
      throw AppException('Phiên đăng nhập hết hạn');
    }
  }

  Future<List<String>> fetchPermissions() async {
    try {
      final response = await dio.get('/auth/my-permissions');
      final data = response.data['data']['permissions'] as List<dynamic>;
      return data.map((e) => e.toString()).toList();
    } on DioException catch (e) {
      print('Profile Remote fetchPermissions error: $e');
      throw AppException('Lỗi tải quyền truy cập');
    }
  }
}
final accountRemoteProvider = Provider<AccountRemote>((ref) {
  final dio = ref.watch(dioProvider);
  return AccountRemote(dio: dio);
});