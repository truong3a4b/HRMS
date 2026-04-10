import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hrms/core/error/app_exception.dart';
import 'package:hrms/core/utils/token_storage.dart';

import '../models/login_response.dart';


class AuthRemote {
  final Dio dio;
  final TokenStorage tokenStorage;

  AuthRemote({required this.dio, required this.tokenStorage});


  Future<LoginResponse> login(String email, String password) async {
    try {
      final response = await dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final token = response.data['data']['accessToken'];
        await tokenStorage.saveAccessToken(token);
        return LoginResponse.fromJson(response.data);
      } else {
        throw AppException(response.data['message']);
      }
    } catch (e) {
      print('AuthRemote login error: $e');
      throw AppException('Đang nhập thất bại');
    }
  }

  Future<void> register(String email, String password) async {
    try {
      final response = await dio.post('/auth/register', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw AppException(response.data['message']);
      }
    } catch (e) {
      print('AuthRemote register error: $e');
      throw AppException('Đăng ký thất bại');
    }
  }

  Future<LoginResponse> verifyOtp(String email, String otp) async {
    try {
      final response = await dio.post('/auth/verify-otp', data: {
        'email': email,
        'otp': otp,
      });

      if (response.statusCode == 200) {
        final token = response.data['data']['accessToken'];
        await tokenStorage.saveAccessToken(token);
        return LoginResponse.fromJson(response.data);
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


}