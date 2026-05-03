import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:hrms/feature/account/presentation/providers/permission_provider.dart';
import 'package:hrms/feature/auth/presentation/providers/auth_provider.dart';

import '../../../account/presentation/widgets/employee_profile_view.dart';
import '../../../auth/domain/entities/user.dart';
import '../../../position/domain/entities/position.dart';
import '../providers/employee_detail_provider.dart';

class EmployeeDetailScreen extends ConsumerWidget {
  final String employeeId;

  const EmployeeDetailScreen({
    super.key,
    required this.employeeId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    const bgColor = Color(0xFFF8FAFC);

    final employeeAsync = ref.watch(employeeDetailProvider(employeeId));
    final permission = ref.watch(permissionProvider).value!;
    final user = ref.watch(authNotifierProvider).value!.user;

    final canEditBasicInfo =
        user?.role == UserRole.admin ||
            permission.contains(Permission.employeeUpdateBasic);

    final canEditAdditionalInfo =
        user?.role == UserRole.admin ||
            permission.contains(Permission.employeeUpdateBasic);

    final canEditWorkInfo =
        user?.role == UserRole.admin ||
            permission.contains(Permission.employeeUpdateJob);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: const Color(0xFFF3F8FB),
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),
        actions: [
          IconButton(
            onPressed: () {
              // TODO: more actions
            },
            icon: const Icon(Icons.more_vert, color: Colors.black),
          ),
        ],
      ),
      body: employeeAsync.when(
        data: (employee) {
          return EmployeeProfileView(
            employee: employee,
            canEditBasicInfo: canEditBasicInfo,
            canEditAdditionalInfo: canEditAdditionalInfo,
            canEditWorkInfo: canEditWorkInfo,
            onRefresh: () {
              ref.invalidate(employeeDetailProvider(employee.id));
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) {
          return Center(
            child: Text(
              error.toString(),
              style: const TextStyle(color: Colors.red, fontSize: 14),
              textAlign: TextAlign.center,
            ),
          );
        },
      ),
    );
  }
}
