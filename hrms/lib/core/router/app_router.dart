import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/feature/account/presentation/screens/account_screen.dart';
import 'package:hrms/feature/auth/presentation/providers/auth_state.dart';
import 'package:hrms/feature/auth/presentation/screens/verify_otp_screen.dart';
import 'package:hrms/feature/employee/presentation/screens/add_employee_screen.dart';
import 'package:hrms/feature/home/presentation/screens/home_screen.dart';
import 'package:hrms/feature/notification/presentation/screens/notification_screen.dart';
import 'package:hrms/feature/task/presentation/screens/task-screen.dart';

import '../../feature/auth/presentation/providers/auth_provider.dart';
import '../../feature/auth/presentation/screens/login_screen.dart';
import '../../feature/auth/presentation/screens/register_screen.dart';
import '../../feature/auth/presentation/screens/splash_screen.dart';
import '../../feature/employee/presentation/screens/employee_detail_screen.dart';
import '../../feature/employee/presentation/screens/employee_list_screen.dart';
import '../widget/main_shell_page.dart';
import 'auth_router_notifier.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final refreshListenable = ref.watch(authRouterNotifierProvider);
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: refreshListenable,
    routes: [
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/verify-otp',
        name: 'verify-otp',
        builder: (context, state) => const VerifyOtpScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShellPage(
            currentIndex: navigationShell.currentIndex,
            onTap: (index) {
              navigationShell.goBranch(
                index,
                initialLocation: index == navigationShell.currentIndex,
              );
            },
            child: navigationShell,
          );
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/task',
                builder: (context, state) => const TaskScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/notification',
                builder: (context, state) => const NotificationScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/account',
                builder: (context, state) => const AccountScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/employee-list',
        name: 'employee-list',
        builder: (context, state) => const EmployeeListScreen(),
      ),
      GoRoute(
        path: '/employee-detail/:employeeId',
        name: 'employee-detail',
        builder: (context, state) {
          final employeeId = state.pathParameters['employeeId']!;
          return EmployeeDetailScreen(employeeId: employeeId);
        },
      ),
      GoRoute(
        path: '/add-employee',
        name: 'add-employee',
        builder: (context, state) => const AddEmployeeScreen(),
      )
    ],
    redirect: (context, state) {
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
    },
  );
});
