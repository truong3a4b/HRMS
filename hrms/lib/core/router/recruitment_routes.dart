import 'package:go_router/go_router.dart';
import '../../feature/recruitment/presentation/screens/add_recruitment_job_screen.dart';
import '../../feature/recruitment/presentation/screens/recruitment_job_detail_screen.dart';
import '../../feature/recruitment/presentation/screens/recruitment_job_list_screen.dart';


final recruitmentRoutes = <RouteBase>[
  GoRoute(
    path: '/recruitment-job-list',
    name: 'recruitment-job-list',
    builder: (context, state) => const RecruitmentJobListScreen(),
  ),
  GoRoute(path: '/add-recruitment-job', name: 'add-recruitment-job', builder: (context, state) {
    return const AddRecruitmentJobScreen();
  }),
  GoRoute(path: '/recruitment-job-detail/:id', name: 'recruitment-job-detail', builder: (context, state) {
    final id = state.pathParameters['id']!;
    return RecruitmentJobDetailScreen(jobId: id,);
  }),
];
