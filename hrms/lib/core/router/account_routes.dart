import 'package:go_router/go_router.dart';
import 'package:hrms/feature/account/presentation/screens/edit_candidate_profile_screen.dart';
import 'package:hrms/feature/account/presentation/screens/profile_screen.dart';


final accountRoutes = <RouteBase>[
  GoRoute(
    path: '/profile',
    name: 'profile',
    builder: (context, state) => const ProfileScreen(),
  ),
  GoRoute(
    path: '/edit-candidate-profile',
    name: 'editCandidateProfile',
    builder: (context, state) => const EditCandidateProfileScreen(),
  ),

];
