import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

abstract class AuthSessionHandler {
  Future<String?> readAccessToken();
  Future<bool> refreshToken();
  Future<void> logout();
}

class PendingRequest {
  final RequestOptions requestOptions;
  final Completer<Response<dynamic>> completer;

  PendingRequest({
    required this.requestOptions,
    required this.completer,
  });
}

class AuthInterceptor extends QueuedInterceptor {
  final Dio dio;
  final AuthSessionHandler authSession;

  bool _isRefreshing = false;
  bool _isLoggingOut = false;

  final List<PendingRequest> _pendingRequests = [];

  AuthInterceptor({
    required this.dio,
    required this.authSession,
  });

  bool _shouldSkipAuth(RequestOptions options) {
    if (options.extra['skipAuth'] == true) return true;

    final path = options.path;
    return path.contains('/users/login') ||
        path.contains('/users/signup') ||
        path.contains('/users/refresh-token');
  }

  bool _canRetryRequest(RequestOptions options) {
    if (options.extra['noRetry'] == true) return false;

    final data = options.data;

    // Tránh retry các request stream/file upload phức tạp
    if (data is Stream) return false;
    if (data is FormData) {
      // FormData đôi khi vẫn retry được, nhưng dễ lỗi với file stream.
      // An toàn nhất là không retry tự động.
      return false;
    }

    return true;
  }

  @override
  Future<void> onRequest(
      RequestOptions options,
      RequestInterceptorHandler handler,
      ) async {
    try {
      if (!_shouldSkipAuth(options)) {
        final token = await authSession.readAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
      }

      handler.next(options);
    } catch (e, st) {
      debugPrint('AuthInterceptor onRequest error: $e\n$st');
      handler.reject(
        DioException(
          requestOptions: options,
          error: e,
          type: DioExceptionType.unknown,
        ),
      );
    }
  }

  @override
  Future<void> onError(
      DioException err,
      ErrorInterceptorHandler handler,
      ) async {
    final requestOptions = err.requestOptions;
    final statusCode = err.response?.statusCode;

    if (_shouldSkipAuth(requestOptions)) {
      handler.next(err);
      return;
    }

    if (statusCode != 401) {
      handler.next(err);
      return;
    }

    if (!_canRetryRequest(requestOptions)) {
      handler.next(err);
      return;
    }

    if (requestOptions.extra['retried'] == true) {
      await _logoutSafely();
      handler.next(err);
      return;
    }

    if (_isRefreshing) {
      final completer = Completer<Response<dynamic>>();

      _pendingRequests.add(
        PendingRequest(
          requestOptions: requestOptions,
          completer: completer,
        ),
      );

      try {
        final response = await completer.future;
        handler.resolve(response);
      } catch (_) {
        handler.next(err);
      }
      return;
    }

    _isRefreshing = true;

    try {
      final refreshSuccess = await authSession.refreshToken();

      if (!refreshSuccess) {
        await _failAllPending(err);
        await _logoutSafely();
        handler.next(err);
        return;
      }

      final pending = List<PendingRequest>.from(_pendingRequests);
      _pendingRequests.clear();

      // Reset cờ sớm để request mới đi qua bình thường
      _isRefreshing = false;

      await _retryPendingInParallel(pending);

      final response = await _retryRequest(requestOptions);
      handler.resolve(response);
    } catch (e, st) {
      debugPrint('AuthInterceptor refresh error: $e\n$st');
      await _failAllPending(e);
      await _logoutSafely();
      _isRefreshing = false;
      handler.next(err);
    } finally {
      _isRefreshing = false;
    }
  }

  Future<void> _retryPendingInParallel(List<PendingRequest> pendingRequests) async {
    await Future.wait(
      pendingRequests.map((pending) async {
        try {
          final response = await _retryRequest(pending.requestOptions);
          if (!pending.completer.isCompleted) {
            pending.completer.complete(response);
          }
        } catch (e) {
          if (!pending.completer.isCompleted) {
            pending.completer.completeError(e);
          }
        }
      }),
    );
  }

  Future<void> _failAllPending(Object error) async {
    final pending = List<PendingRequest>.from(_pendingRequests);
    _pendingRequests.clear();

    for (final item in pending) {
      if (!item.completer.isCompleted) {
        item.completer.completeError(error);
      }
    }
  }

  Future<void> _logoutSafely() async {
    if (_isLoggingOut) return;

    _isLoggingOut = true;
    try {
      await authSession.logout();
    } catch (e, st) {
      debugPrint('AuthInterceptor logout error: $e\n$st');
    } finally {
      _isLoggingOut = false;
    }
  }

  Future<Response<dynamic>> _retryRequest(RequestOptions requestOptions) async {
    final token = await authSession.readAccessToken();

    final headers = Map<String, dynamic>.from(requestOptions.headers);
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    } else {
      headers.remove('Authorization');
    }

    final newOptions = Options(
      method: requestOptions.method,
      headers: headers,
      responseType: requestOptions.responseType,
      contentType: requestOptions.contentType,
      followRedirects: requestOptions.followRedirects,
      receiveDataWhenStatusError: requestOptions.receiveDataWhenStatusError,
      validateStatus: requestOptions.validateStatus,
      sendTimeout: requestOptions.sendTimeout,
      receiveTimeout: requestOptions.receiveTimeout,
      extra: {
        ...requestOptions.extra,
        'retried': true,
      },
    );

    return dio.request<dynamic>(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      cancelToken: requestOptions.cancelToken,
      onSendProgress: requestOptions.onSendProgress,
      onReceiveProgress: requestOptions.onReceiveProgress,
      options: newOptions,
    );
  }
}