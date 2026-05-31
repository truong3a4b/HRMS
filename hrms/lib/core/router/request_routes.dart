import 'package:go_router/go_router.dart';

import '../../feature/request/presentation/screens/request_create_screen.dart';
import '../../feature/request/presentation/screens/request_list_screen.dart';
import 'app_routes.dart';

final requestRoutes = <RouteBase>[
  GoRoute(
    path: AppRoutes.myRequests,
    name: 'myRequests',
    builder: (context, state) =>
        const RequestListScreen(title: 'Yêu cầu của tôi', initialTab: 'mine'),
  ),
  GoRoute(
    path: AppRoutes.employeeRequests,
    name: 'employeeRequests',
    builder: (context, state) => const RequestListScreen(
      title: 'Danh sách yêu cầu',
      initialTab: 'pending',
      showEmployeeTabs: true,
    ),
  ),
  GoRoute(
    path: AppRoutes.createLeaveRequest,
    name: 'createLeaveRequest',
    builder: (context, state) =>
        const RequestCreateScreen(kind: RequestCreateKind.leave),
  ),
  GoRoute(
    path: AppRoutes.createAttendanceCorrectionRequest,
    name: 'createAttendanceCorrectionRequest',
    builder: (context, state) =>
        const RequestCreateScreen(kind: RequestCreateKind.attendanceCorrection),
  ),
];
