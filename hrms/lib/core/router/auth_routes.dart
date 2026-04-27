import 'package:go_router/go_router.dart';
import 'package:hrms/feature/auth/presentation/screens/login_screen.dart';
import 'package:hrms/feature/auth/presentation/screens/register_screen.dart';
import 'package:hrms/feature/auth/presentation/screens/splash_screen.dart';
import 'package:hrms/feature/auth/presentation/screens/verify_otp_screen.dart';

import 'app_routes.dart';



final authRoutes = <RouteBase>[
  GoRoute(
    path: AppRoutes.splash,
    name: 'splash',
    builder: (context, state) => const SplashScreen(),
  ),
  GoRoute(
    path: AppRoutes.login,
    name: 'login',
    builder: (context, state) => const LoginScreen(),
  ),
  GoRoute(
    path: AppRoutes.register,
    name: 'register',
    builder: (context, state) => const RegisterScreen(),
  ),
  GoRoute(
    path: AppRoutes.verifyOtp,
    name: 'verify-otp',
    builder: (context, state) => const VerifyOtpScreen(),
  ),
];