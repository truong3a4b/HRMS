import 'package:go_router/go_router.dart';
import 'package:hrms/feature/department/presentation/screens/add_department_screen.dart';
import 'package:hrms/feature/department/presentation/screens/department_detail_screen.dart';
import 'package:hrms/feature/department/presentation/screens/department_list_screen.dart';
import 'package:hrms/feature/department/presentation/screens/edit_department_basic_info_screen.dart';

import 'app_routes.dart';

final departmentRoutes = <RouteBase>[
  GoRoute(
    path: AppRoutes.departmentList,
    name: 'department-list',
    builder: (context, state) => const DepartmentListScreen(),
  ),
  GoRoute(
    path: '/department-detail/:departmentId',
    name: 'department-detail',
    builder: (context, state) {
      final departmentId = state.pathParameters['departmentId']!;
      return DepartmentDetailScreen(departmentId: departmentId);
    },
  ),
  GoRoute(
    path: AppRoutes.addDepartment,
    name: 'add-department',
    builder: (context, state) => const AddDepartmentScreen(),
  ),
  GoRoute(
    path: '/edit-department-basic-info/:departmentId', // fix: thêm leading /
    name: 'edit-department-basic-info',
    builder: (context, state) {
      final departmentId = state.pathParameters['departmentId']!;
      return EditDepartmentBasicInfoScreen(departmentId: departmentId);
    },
  ),
];