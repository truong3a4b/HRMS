import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../feature/auth/presentation/providers/auth_provider.dart';
import '../../feature/auth/presentation/providers/auth_state.dart';
import 'app_routes.dart';

final authRouterNotifierProvider =
AsyncNotifierProvider<AuthRouterNotifier, void>(AuthRouterNotifier.new);

class AuthRouterNotifier extends AsyncNotifier<void> implements Listenable {
  VoidCallback? _routerListener;

  @override
  Future<void> build() async {
    // Lắng nghe auth state thay đổi → báo GoRouter redirect lại
    ref.listen<AsyncValue<AuthState>>(
      authNotifierProvider,
          (_, __) => _routerListener?.call(),
    );
  }

  String? redirect(BuildContext context, GoRouterState state) {
    final authAsync = ref.read(authNotifierProvider);
    final location = state.matchedLocation;

    final isAuthRoute = const {
      AppRoutes.login,
      AppRoutes.register,
      AppRoutes.splash,
    }.contains(location);
    final isOtpRoute = location == AppRoutes.verifyOtp;

    // Chưa có auth value → về splash
    if (authAsync.value == null ||
        authAsync.value?.status == AuthStatus.initial) {
      return location == AppRoutes.splash ? null : AppRoutes.splash;
    }

    return switch (authAsync.value?.status) {
    // Đã đăng nhập → không cho vào auth/otp screens
      AuthStatus.authenticated =>
      (isAuthRoute || isOtpRoute) ? AppRoutes.home : null,

    // Chưa đăng nhập → chỉ được ở login/register
      AuthStatus.unauthenticated => isOtpRoute
          ? AppRoutes.register
          : (isAuthRoute ? null : AppRoutes.login),

    // Đang chờ OTP → phải ở verify-otp
      AuthStatus.otpRequired => isOtpRoute ? null : AppRoutes.verifyOtp,

      _ => null,
    };
  }

  @override
  void addListener(VoidCallback listener) => _routerListener = listener;

  @override
  void removeListener(VoidCallback listener) => _routerListener = null;
}