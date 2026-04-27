import 'package:go_router/go_router.dart';
import 'package:hrms/feature/employee/presentation/screens/add_employee_screen.dart';
import 'package:hrms/feature/employee/presentation/screens/edit_employee_basic_info_screen.dart';
import 'package:hrms/feature/employee/presentation/screens/edit_employee_job_screen.dart';
import 'package:hrms/feature/employee/presentation/screens/employee_detail_screen.dart';
import 'package:hrms/feature/employee/presentation/screens/employee_list_screen.dart';

import 'app_routes.dart';

final employeeRoutes = <RouteBase>[
  GoRoute(
    path: AppRoutes.employeeList,
    name: 'employee-list',
    builder: (context, state) => const EmployeeListScreen(),
  ),
  GoRoute(
    path: '/employee-detail/:employeeId',
    name: 'employee-detail',
    builder: (context, state) {
      final employeeId = state.pathParameters['employeeId']!;
      return EmployeeDetailScreen(employeeId: employeeId);
    },
  ),
  GoRoute(
    path: AppRoutes.addEmployee,
    name: 'add-employee',
    builder: (context, state) => const AddEmployeeScreen(),
  ),
  GoRoute(
    path: '/edit-employee-basic-info/:employeeId',
    name: 'edit-employee-basic-info',
    builder: (context, state) {
      final employeeId = state.pathParameters['employeeId']!;
      return EditEmployeeBasicInfoScreen(employeeId: employeeId);
    },
  ),
  GoRoute(
    path: '/edit-employee-job/:employeeId',
    name: 'edit-employee-job',
    builder: (context, state) {
      final employeeId = state.pathParameters['employeeId']!;
      return EditEmployeeJobScreen(employeeId: employeeId);
    },
  ),
];