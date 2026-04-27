import 'package:dio/dio.dart';
import 'package:hrms/feature/auth/data/models/user_dto.dart';

import '../../../../core/error/app_exception.dart';

class ProfileRemote {
  final Dio dio;

  ProfileRemote({required this.dio});

  Future<UserDto> fetchProfile() async {
    try {
      final response = await dio.get('/employees/me');

      return UserDto.fromJson(response.data['data']);
    } on DioException catch (e) {
      print('Profile Remote getCurrentUser error: $e');
      throw AppException('Phiên đăng nhập hết hạn');
    }
  }
}
