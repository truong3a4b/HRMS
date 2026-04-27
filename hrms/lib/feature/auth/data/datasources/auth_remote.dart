import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:hrms/core/error/app_exception.dart';
import 'package:hrms/core/utils/token_storage.dart';
import 'package:hrms/feature/auth/data/models/user_dto.dart';

import '../../../../core/share/models/app_response.dart';

class AuthRemote {
  final Dio dio;
  final TokenStorage tokenStorage;

  AuthRemote({required this.dio, required this.tokenStorage});

  Future<UserDto> login(String email, String password) async {
    try {
      final response = await dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );

      final appResponse = AppResponse.fromJson(response.data);
      final token = appResponse.data['accessToken'];
      await tokenStorage.saveAccessToken(token);
      if (appResponse.data['user'] == null) {
        throw AppException('Dữ liệu người dùng không hợp lệ');
      }
      final userDto = UserDto.fromJson(appResponse.data['user']);
      return userDto;
    } on DioException catch (e) {
      print('AuthRemote login error: $e');
      throw AppException(e.response?.data?['message'] ?? 'Đăng nhập thất bại');
    }
  }

  Future<void> register(String email, String password) async {
    try {
      final response = await dio.post(
        '/auth/register',
        data: {'email': email, 'password': password},
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw AppException(response.data['message']);
      }
    } on DioException catch (e) {
      print('AuthRemote register error: $e');

      throw AppException(e.response?.data?['message'] ?? 'Đăng nhập thất bại');
    }
  }

  Future<UserDto> verifyOtp(String email, String otp) async {
    try {
      final response = await dio.post(
        '/auth/verify-otp',
        data: {'email': email, 'otp': otp},
      );

      if (response.statusCode == 200) {
        final appResponse = AppResponse.fromJson(response.data);
        final token = appResponse.data['accessToken'];
        await tokenStorage.saveAccessToken(token);
        if (response.data['user'] == null) {
          throw AppException('Dữ liệu người dùng không hợp lệ');
        }
        final userDto = UserDto.fromJson(appResponse.data['user']);
        return userDto;
      } else {
        throw AppException(response.data['message']);
      }
    } catch (e) {
      print('AuthRemote verifyOtp error: $e');
      throw AppException('Xác thực OTP thất bại');
    }
  }

  Future<void> logout() async {
    try {
      await dio.post('/auth/logout');
      await tokenStorage.clear();
    } catch (e) {
      print('AuthRemote logout error: $e');
      throw AppException('Đăng xuất thất bại');
    }
  }

  Future<bool> refreshToken() async {
    try {
      final response = await dio.post('/auth/refresh');

      if (response.statusCode == 200) {
        final appResponse = AppResponse.fromJson(response.data);
        final token = appResponse.data['accessToken'];
        await tokenStorage.saveAccessToken(token);
        return true;
      } else {
        debugPrint(
          'AuthRemote refreshToken failed: ${response.data['message']}',
        );
        return false;
      }
    } catch (e) {
      debugPrint('AuthRemote refreshToken error: $e');
      return false;
    }
  }

  Future<UserDto> getCurrentUser() async {
    try {
      final response = await dio.get('/auth/me');

      if (response.statusCode == 200) {
        return UserDto.fromJson(response.data['data']['user']);
      } else {
        throw AppException(response.data['message']);
      }
    } catch (e) {
      debugPrint('AuthRemote getCurrentUser error: $e');
      throw AppException('Phiên đăng nhập hết hạn');
    }
  }
}
