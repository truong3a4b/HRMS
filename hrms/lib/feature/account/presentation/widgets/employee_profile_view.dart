import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../employee/domain/entities/employee.dart' show Employee;
import 'employee_job_history_tab.dart';
import 'employee_payroll_policy_tab.dart';
import 'employee_work_tab.dart';
import 'personal_profile_tab.dart';
import 'profile_header.dart';

class EmployeeProfileView extends StatelessWidget {
  final Employee employee;
  final bool canEditBasicInfo;
  final bool canEditAdditionalInfo;
  final bool canEditWorkInfo;
  final VoidCallback onRefresh;
  final bool isMine;
  final bool showPayrollPolicy;
  final bool showJobHistory;

  const EmployeeProfileView({
    super.key,
    required this.employee,
    required this.canEditBasicInfo,
    required this.canEditAdditionalInfo,
    required this.canEditWorkInfo,
    required this.onRefresh,
    this.isMine = false,
    this.showPayrollPolicy = true,
    this.showJobHistory = true,
  });

  @override
  Widget build(BuildContext context) {
    final tabs = <Tab>[
      const Tab(text: 'Cá nhân'),
      const Tab(text: 'Công việc'),
      if (showPayrollPolicy) const Tab(text: 'Lương'),
      if (showJobHistory) const Tab(text: 'Lịch sử'),
    ];

    final views = <Widget>[
      ProfilePersonalTab(
        profile: employee,
        canEditBasicInfo: canEditBasicInfo,
        canEditAdditionalInfo: canEditAdditionalInfo,
        onEditBasicInfo: () async {
          final success = await context.push<bool>(
            '/edit-employee-basic-info/${employee.id}',
          );
          if (success == true) onRefresh();
        },
        onEditAdditionalInfo: () async {
          final success = await context.push<bool>(
            '/edit-employee-additional-info/${employee.id}',
          );
          if (success == true) onRefresh();
        },
      ),
      EmployeeWorkTab(
        employee: employee,
        canEditWorkInfo: canEditWorkInfo,
        onEditWorkInfo: () async {
          final success = await context.push<bool>(
            '/edit-employee-job/${employee.id}',
          );
          if (success == true) onRefresh();
        },
      ),
      if (showPayrollPolicy)
        EmployeePayrollPolicyTab(employee: employee, isMine: isMine),
      if (showJobHistory)
        EmployeeJobHistoryTab(employee: employee, isMine: isMine),
    ];

    return DefaultTabController(
      length: tabs.length,
      child: SafeArea(
        child: Column(
          children: [
            ProfileHeader(
              avatar: employee.avatar,
              name: employee.name,
              subtitle:
                  '${employee.position?.name ?? '-'} | ${employee.department?.name ?? '-'}',
              showTabs: true,
              tabs: tabs,
            ),
            Expanded(child: TabBarView(children: views)),
          ],
        ),
      ),
    );
  }
}
