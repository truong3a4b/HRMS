import 'package:go_router/go_router.dart';

import '../../feature/position/presentation/screens/add_position_screen.dart';
import '../../feature/position/presentation/screens/position_list_screen.dart';
import '../../feature/position/presentation/screens/update_position_screen.dart';
import 'app_routes.dart';

final positionRoutes = <RouteBase>[
  GoRoute(
    path: AppRoutes.positionList,
    name: 'positionList',
    builder: (context, state) => const PositionListScreen(),
  ),
  GoRoute(
    path: AppRoutes.addPosition,
    name: 'addPosition',
    builder: (context, state) {
      return const AddPositionScreen();
    },
  ),
  GoRoute(
    path: '/update-position/:positionId',
    name: 'updatePosition',
    builder: (context, state) {
      final positionId = state.pathParameters['positionId'];
      if (positionId == null) {
        return const PositionListScreen();
      }
      return UpdatePositionScreen(positionId: positionId);
    },
  ),
];
