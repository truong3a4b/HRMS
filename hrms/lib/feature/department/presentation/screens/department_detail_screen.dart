import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/core/widget/app_confirm_dialog.dart';

import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/custom_dialog.dart';
import '../../../employee/domain/entities/employee.dart';
import '../../../employee/presentation/providers/employee_by_department_provider.dart';
import '../../domain/entities/department.dart';
import '../providers/delete_department_provider.dart';
import '../providers/department_detail_provider.dart';
import '../providers/department_list_provider.dart';
import '../widgets/change_department_manager_bottom_sheet.dart';

class DepartmentDetailScreen extends ConsumerWidget {
  final String departmentId;

  const DepartmentDetailScreen({super.key, required this.departmentId});

  //ham goi dialog xac nhan xoa phong ban
  Future<void> _confirmDeleteDepartment(
    BuildContext context,
    WidgetRef ref,
    String departmentId,
  ) async {
    final confirm = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AppConfirmDialog(
          title: 'Xóa phòng ban',
          message: 'Bạn có chắc chắn muốn xóa phòng ban này không?',
          onCancel: () => Navigator.pop(context, false),
          onConfirm: () => Navigator.pop(context, true),
        );
      },
    );

    if (confirm != true) return;

    try {
      await ref.read(deleteDepartmentProvider(departmentId).future);

      if (!context.mounted) return;

      AppSnackbar.showSuccess(context, 'Xóa phòng ban thành công');
      ref.invalidate(departmentListProvider);
      context.pop(true);
    } catch (e) {
      if (!context.mounted) return;

      showDialog(
        context: context,
        builder: (context) {
          return CustomDialog(
            message: e.toString(),
            type: 'error',
          );
        },
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final departmentAsync = ref.watch(departmentDetailProvider(departmentId));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF3F8FB),
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),

        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, color: Colors.black),
            onSelected: (value) async {
              if (value == 'delete') {
                await _confirmDeleteDepartment(context, ref, departmentId);
              }
            },
            itemBuilder: (context) => const [
              PopupMenuItem(
                value: 'delete',
                child: Text(
                  'Xóa phòng ban',
                  style: TextStyle(color: Colors.red),
                ),
              ),
            ],
          ),
        ],
      ),
      body: departmentAsync.when(
        data: (department) => _DepartmentDetailContent(department: department),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) {
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

class _DepartmentDetailContent extends ConsumerWidget {
  final Department department;

  const _DepartmentDetailContent({required this.department});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final employeesAsync = ref.watch(
      employeesByDepartmentProvider(department.id),
    );

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        child: Column(
          children: [
            _Header(department: department),
            const SizedBox(height: 16),

            _InfoSectionCard(
              title: 'Thông tin cơ bản',
              canEdit: true,
              onEdit: () async {
                final success = await context.push<bool>(
                  '/edit-department-basic-info/${department.id}',
                );

                if (success == true) {
                  ref.invalidate(departmentDetailProvider(department.id));
                }
              },
              items: [
                _InfoItem(label: 'Tên phòng ban', value: department.name),
                _InfoItem(
                  label: 'Mô tả',
                  value: department.description?.isNotEmpty == true
                      ? department.description!
                      : '-',
                ),
              ],
            ),

            const SizedBox(height: 16),

            _ManagerSectionCard(
              manager: department.manager,
              onChangeManager: () async {
                final success = await showModalBottomSheet<bool>(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (_) {
                    return ChangeDepartmentManagerBottomSheet(
                      departmentId: department.id,
                      currentManagerId: department.manager?.id,
                    );
                  },
                );

                if (success == true) {
                  ref.invalidate(departmentDetailProvider(department.id));
                  ref.invalidate(employeesByDepartmentProvider(department.id));
                }
              },
            ),

            const SizedBox(height: 16),

            _EmployeeListSection(employeesAsync: employeesAsync),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final Department department;

  const _Header({required this.department});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(0, 8, 0, 10),
      decoration: const BoxDecoration(color: Color(0xFFF3F8FB)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            department.name,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: Color(0xFF2F2F2F),
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }
}

class _ManagerSectionCard extends StatelessWidget {
  final Employee? manager;
  final VoidCallback? onChangeManager;

  const _ManagerSectionCard({required this.manager, this.onChangeManager});

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Trưởng phòng',
      trailing: IconButton(
        onPressed: onChangeManager,
        icon: const Icon(Icons.swap_horiz, color: Color(0xFF0E67B2)),
      ),
      child: manager == null
          ? const Text(
              'Chưa có trưởng phòng',
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF7A7A7A),
                fontWeight: FontWeight.w500,
              ),
            )
          : InkWell(
              onTap: () {
                context.push('/employee-detail/${manager!.id}');
              },
              child: Row(
                children: [
                  ClipOval(
                    child: Image.asset(
                      manager!.avatar ?? 'assets/images/profile.png',
                      width: 46,
                      height: 46,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          manager!.name,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF1A1A1A),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          manager!.email,
                          style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF7A7A7A),
                          ),
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

class _EmployeeListSection extends StatelessWidget {
  final AsyncValue<List<Employee>> employeesAsync;

  const _EmployeeListSection({required this.employeesAsync});

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Danh sách nhân viên',
      child: employeesAsync.when(
        data: (employees) {
          if (employees.isEmpty) {
            return const Text(
              'Phòng ban chưa có nhân viên',
              style: TextStyle(fontSize: 14, color: Color(0xFF7A7A7A)),
            );
          }

          return Column(
            children: employees.map((employee) {
              return _EmployeeMiniCard(employee: employee);
            }).toList(),
          );
        },
        loading: () => const Padding(
          padding: EdgeInsets.symmetric(vertical: 12),
          child: Center(child: CircularProgressIndicator()),
        ),
        error: (error, stackTrace) {
          return Text(
            error.toString(),
            style: const TextStyle(color: Colors.red, fontSize: 14),
          );
        },
      ),
    );
  }
}

class _EmployeeMiniCard extends StatelessWidget {
  final Employee employee;

  const _EmployeeMiniCard({required this.employee});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.push('/employee-detail/${employee.id}'),
      child: Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: Row(
          children: [
            ClipOval(
              child: Image.asset(
                employee.avatar ?? 'assets/images/profile.png',
                width: 42,
                height: 42,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    employee.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1A1A1A),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    employee.position?.name ?? '-',
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF7A7A7A),
                    ),
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

class _InfoSectionCard extends StatelessWidget {
  final String title;
  final List<_InfoItem> items;
  final bool canEdit;
  final VoidCallback? onEdit;

  const _InfoSectionCard({
    required this.title,
    required this.items,
    this.canEdit = false,
    this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: title,
      trailing: canEdit
          ? IconButton(
              onPressed: onEdit,
              icon: const Icon(Icons.edit_outlined, color: Color(0xFF0E67B2)),
            )
          : null,
      child: Column(
        children: items.map((item) => _InfoRow(item: item)).toList(),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;
  final Widget? trailing;

  const _SectionCard({required this.title, required this.child, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE8E8E8)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF2F2F2F),
                  ),
                ),
              ),
              if (trailing != null)
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F7FB),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: trailing,
                ),
            ],
          ),
          const SizedBox(height: 18),
          child,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final _InfoItem item;

  const _InfoRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              item.label,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF9A9A9A),
                fontWeight: FontWeight.w500,
                height: 1.35,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              item.value,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF333333),
                fontWeight: FontWeight.w600,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoItem {
  final String label;
  final String value;

  const _InfoItem({required this.label, required this.value});
}
