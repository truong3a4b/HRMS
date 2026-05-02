import 'package:go_router/go_router.dart';
import 'package:hrms/feature/candidate/presentation/screens/candidate_detail_screen.dart';
import 'package:hrms/feature/recruitment/presentation/screens/application/job_application_list_screen.dart';
import 'package:hrms/feature/recruitment/presentation/screens/jobs/update_recruitment_job_screen.dart';

import '../../feature/recruitment/presentation/screens/interview/interview_schedule_detail_screen.dart';
import '../../feature/recruitment/presentation/screens/jobs/add_recruitment_job_screen.dart';
import '../../feature/recruitment/presentation/screens/application/job_application_detail_screen.dart';
import '../../feature/recruitment/presentation/screens/jobs/recruitment_job_detail_screen.dart';
import '../../feature/recruitment/presentation/screens/jobs/recruitment_job_list_screen.dart';

final recruitmentRoutes = <RouteBase>[
  GoRoute(
    path: '/recruitment-job-list',
    name: 'recruitment-job-list',
    builder: (context, state) => const RecruitmentJobListScreen(),
  ),
  GoRoute(
    path: '/add-recruitment-job',
    name: 'add-recruitment-job',
    builder: (context, state) {
      return const AddRecruitmentJobScreen();
    },
  ),
  GoRoute(
    path: '/recruitment-job-detail/:id',
    name: 'recruitment-job-detail',
    builder: (context, state) {
      final id = state.pathParameters['id']!;
      return RecruitmentJobDetailScreen(jobId: id);
    },
  ),
  GoRoute(path: '/update-recruitment-job/:id',
  name: 'update-recruitment-job',
  builder: (context, state) {
    final id = state.pathParameters['id']!;
    return UpdateRecruitmentJobScreen(jobId: id);
  },
  ),

  GoRoute(
    path: '/job-application-list',
    name: 'job-application-list',
    builder: (context, state) {
      return JobApplicationListScreen();
    },
  ),
  GoRoute(
    path: '/job-application-detail/:id',
    builder: (context, state) {
      final id = state.pathParameters['id']!;
      return JobApplicationDetailScreen(applicationId: id);
    },
  ),
  GoRoute(
    path: '/candidate-detail/:id',
    name: 'candidate-detail',
    builder: (context, state) {
      final id = state.pathParameters['id']!;
      return CandidateDetailScreen(candidateId: id);
    },
  ),
  GoRoute(path: '/applications/:applicationId/interview-schedule-detail/:id',
    name: 'interview-schedule-detail',
    builder: (context, state) {
      final applicationId = state.pathParameters['applicationId']!;
      final id = state.pathParameters['id']!;
      return InterviewScheduleDetailScreen(applicationId: applicationId,interviewScheduleId: id);
    },
  ),
];
