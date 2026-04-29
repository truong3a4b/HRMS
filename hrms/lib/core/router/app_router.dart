import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/core/router/account_routes.dart';
import 'package:hrms/core/router/posititon_routes.dart';
import 'package:hrms/core/router/recruitment_routes.dart';
import 'package:hrms/core/router/shell_route.dart';

import 'app_routes.dart';
import 'auth_router_notifier.dart';
import 'auth_routes.dart';
import 'department_routes.dart';
import 'employee_routes.dart';


final routerProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(authRouterNotifierProvider.notifier);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    refreshListenable: notifier,
    redirect: notifier.redirect,
    routes: [
      ...authRoutes,
      shellRoute,
      ...employeeRoutes,
      ...departmentRoutes,
      ...positionRoutes,
      ...accountRoutes,
      ...recruitmentRoutes,
    ],
  );
});