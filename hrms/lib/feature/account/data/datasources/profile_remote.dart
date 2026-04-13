import 'package:dio/dio.dart';
import 'package:hrms/feature/auth/data/models/user_dto.dart';

import '../../../../core/error/app_exception.dart';

class ProfileRemote {
  final Dio dio;

  ProfileRemote({required this.dio});

  Future<UserDto> fetchProfile() async {
    try {
      final response = await dio.get('/auth/me');

      if (response.statusCode == 200) {
        return UserDto.fromJson(response.data['data']['user']);
      } else {
        throw AppException(response.data['message']);
      }
    } catch (e) {
      print('Profile Remote getCurrentUser error: $e');
      throw AppException('Phiên đăng nhập hết hạn');
    }
  }
}