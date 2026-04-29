import 'package:go_router/go_router.dart';
import 'package:hrms/feature/account/presentation/screens/profile_screen.dart';

import 'app_routes.dart';

final accountRoutes = <RouteBase>[
  GoRoute(
    path: '/profile',
    name: 'profile',
    builder: (context, state) => const ProfileScreen(),
  ),

];
