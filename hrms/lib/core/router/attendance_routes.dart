import 'package:go_router/go_router.dart';

import '../../feature/attendance/presentation/screens/my_attendance_history_screen.dart';
import '../../feature/attendance/presentation/screens/my_attendance_timesheet_screen.dart';
import 'app_routes.dart';

final attendanceRoutes = <RouteBase>[
  GoRoute(
    path: AppRoutes.myAttendanceHistory,
    name: 'myAttendanceHistory',
    builder: (context, state) => const MyAttendanceHistoryScreen(),
  ),
  GoRoute(
    path: AppRoutes.myAttendanceTimesheet,
    name: 'myAttendanceTimesheet',
    builder: (context, state) => const MyAttendanceTimesheetScreen(),
  ),
];
