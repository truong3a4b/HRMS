import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../feature/auth/presentation/providers/auth_provider.dart';
import '../../feature/auth/presentation/providers/auth_state.dart';

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
    final goingLogin = location == '/login';
    final goingRegister = location == '/register';
    final goingOtp = location == '/verify-otp';
    final goingSplash = location == '/splash';

    if (authAsync.value == null ||
        authAsync.value?.status == AuthStatus.initial) {
      return goingSplash ? null : '/splash';
    }
    switch (authAsync.value?.status) {
      case AuthStatus.authenticated:
        if (goingLogin || goingRegister || goingOtp || goingSplash) {
          return '/home';
        }
        break;
      case AuthStatus.unauthenticated:
        if (!goingLogin && !goingRegister) {
          if (goingOtp) {
            return '/register';
          } else {
            return '/login';
          }
        }
        break;
      case AuthStatus.otpRequired:
        if (!goingOtp && !goingSplash) {
          return '/verify-otp';
        }
        break;
      default:
    }
    return null;
  }

  @override
  void addListener(VoidCallback listener) => _routerListener = listener;

  @override
  void removeListener(VoidCallback listener) => _routerListener = null;
}