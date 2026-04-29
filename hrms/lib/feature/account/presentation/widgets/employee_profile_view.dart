import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/feature/account/presentation/widgets/personal_profile_tab.dart';
import 'package:hrms/feature/account/presentation/widgets/profile_header.dart';
import 'package:hrms/feature/employee/domain/entities/employee.dart' show Employee;

import 'employee_work_tab.dart';

class EmployeeProfileView extends StatelessWidget {
  final Employee employee;
  final bool canEditBasicInfo;
  final bool canEditAdditionalInfo;
  final bool canEditWorkInfo;
  final VoidCallback onRefresh;

  const EmployeeProfileView({
    required this.employee,
    required this.canEditBasicInfo,
    required this.canEditAdditionalInfo,
    required this.canEditWorkInfo,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: SafeArea(
        child: Column(
          children: [
            ProfileHeader(
              avatar: employee.avatar,
              name: employee.name,
              subtitle:
              '${employee.position?.name ?? '-'} | ${employee.department?.name ?? '-'}',
              showTabs: true,
              tabs: const [
                Tab(text: 'Cá nhân'),
                Tab(text: 'Công việc'),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  ProfilePersonalTab(
                    profile: employee,
                    canEditBasicInfo: canEditBasicInfo,
                    canEditAdditionalInfo: canEditAdditionalInfo,
                    onEditBasicInfo: () async {
                      final success = await context.push<bool>(
                        '/edit-employee-basic-info/${employee.id}',
                      );

                      if (success == true) {
                        onRefresh();
                      }
                    },
                    onEditAdditionalInfo: () async {
                      final success = await context.push<bool>(
                        '/edit-employee-additional-info/${employee.id}',
                      );

                      if (success == true) {
                        onRefresh();
                      }
                    },
                  ),
                  EmployeeWorkTab(
                    employee: employee,
                    canEditWorkInfo: canEditWorkInfo,
                    onEditWorkInfo: () async {
                      final success = await context.push<bool>(
                        '/edit-employee-job/${employee.id}',
                      );

                      if (success == true) {
                        onRefresh();
                      }
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}