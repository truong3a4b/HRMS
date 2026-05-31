import 'package:go_router/go_router.dart';

import '../../feature/payroll/presentation/screens/holiday_list_screen.dart';
import '../../feature/payroll/presentation/screens/my_bonus_penalty_screen.dart';
import '../../feature/payroll/presentation/screens/my_payroll_screen.dart';
import 'app_routes.dart';

final payrollRoutes = <RouteBase>[
  GoRoute(
    path: AppRoutes.holidayList,
    name: 'holidayList',
    builder: (context, state) => const HolidayListScreen(),
  ),
  GoRoute(
    path: AppRoutes.myPayroll,
    name: 'myPayroll',
    builder: (context, state) => const MyPayrollScreen(),
  ),
  GoRoute(
    path: AppRoutes.myBonusPenalties,
    name: 'myBonusPenalties',
    builder: (context, state) => const MyBonusPenaltyScreen(),
  ),
];
