import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:dio_http_formatter/dio_http_formatter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hrms/feature/auth/presentation/providers/auth_provider.dart';

import '../utils/token_storage.dart';
import 'auth_interceptor.dart';

final baseDioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: 'http://192.168.2.16:5000/api',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ),
  );
  final cookieJar = ref.watch(cookieJarProvider);
  dio.interceptors.addAll([
    CookieManager(cookieJar),
    HttpFormatter(),
    AccessTokenInterceptor(
      readToken: () => ref.read(tokenStorageProvider).readAccessToken(),
    ),
  ]);
  return dio;
});

class RiverpodAuthSessionHandler implements AuthSessionHandler {
  final Future<String?> Function() readToken;
  final Future<bool> Function() onRefreshToken;
  final Future<void> Function() onLogout;

  RiverpodAuthSessionHandler({
    required this.readToken,
    required this.onRefreshToken,
    required this.onLogout,
  });

  @override
  Future<String?> readAccessToken() => readToken();

  @override
  Future<bool> refreshToken() => onRefreshToken();

  @override
  Future<void> logout() => onLogout();
}

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: 'http://192.168.2.16:5000/api',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ),
  );
  final cookieJar = ref.watch(cookieJarProvider);

  dio.interceptors.addAll([
    CookieManager(cookieJar),
    HttpFormatter(),
    AuthInterceptor(
      dio: dio,
      authSession: RiverpodAuthSessionHandler(
        readToken: () => ref.read(tokenStorageProvider).readAccessToken(),
        onRefreshToken: () =>
            ref.read(authNotifierProvider.notifier).refreshToken(),
        onLogout: () => ref.read(authNotifierProvider.notifier).autoLogout(),
      ),
    ),
  ]);

  return dio;
});

class AccessTokenInterceptor extends Interceptor {
  final Future<String?> Function() readToken;

  AccessTokenInterceptor({required this.readToken});

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await readToken();

    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    handler.next(options);
  }
}
