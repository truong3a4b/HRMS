import 'package:go_router/go_router.dart';

import '../../feature/schedule/presentation/screens/my_schedule_screen.dart';
import 'app_routes.dart';

final scheduleRoutes = <RouteBase>[
  GoRoute(
    path: AppRoutes.mySchedule,
    name: 'mySchedule',
    builder: (context, state) => const MyScheduleScreen(),
  ),
];
