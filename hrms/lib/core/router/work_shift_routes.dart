import 'package:go_router/go_router.dart';

import '../../feature/work_shift/presentation/screens/work_shift_detail_screen.dart';
import '../../feature/work_shift/presentation/screens/work_shift_list_screen.dart';
import 'app_routes.dart';

final workShiftRoutes = <RouteBase>[
  GoRoute(
    path: AppRoutes.workShiftList,
    name: 'workShiftList',
    builder: (context, state) => const WorkShiftListScreen(),
  ),
  GoRoute(
    path: '/work-shift-detail/:shiftId',
    name: 'workShiftDetail',
    builder: (context, state) {
      final shiftId = state.pathParameters['shiftId'];
      if (shiftId == null) {
        return const WorkShiftListScreen();
      }
      return WorkShiftDetailScreen(shiftId: shiftId);
    },
  ),
];
