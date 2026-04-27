import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/custom_dialog.dart';
import '../../../employee/domain/entities/employee.dart';
import '../../../employee/presentation/providers/employee_by_department_provider.dart';
import '../../domain/entities/update_department_manager_request.dart';
import '../providers/update_department_manager_provider.dart';

class ChangeDepartmentManagerBottomSheet extends ConsumerStatefulWidget {
  final String departmentId;
  final String? currentManagerId;

  const ChangeDepartmentManagerBottomSheet({
    super.key,
    required this.departmentId,
    this.currentManagerId,
  });

  @override
  ConsumerState<ChangeDepartmentManagerBottomSheet> createState() =>
      _ChangeDepartmentManagerBottomSheetState();
}

class _ChangeDepartmentManagerBottomSheetState
    extends ConsumerState<ChangeDepartmentManagerBottomSheet> {
  final TextEditingController searchController = TextEditingController();

  Employee? selectedEmployee;
  String searchText = '';
  bool isSubmitting = false;
  bool initialized = false;

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  void _initSelected(List<Employee> employees) {
    if (initialized) return;

    for (final employee in employees) {
      if (employee.id == widget.currentManagerId) {
        selectedEmployee = employee;
        break;
      }
    }

    initialized = true;
  }

  List<Employee> _filterEmployees(List<Employee> employees) {
    final keyword = searchText.trim().toLowerCase();

    if (keyword.isEmpty) return employees;

    return employees.where((employee) {
      final name = employee.name.toLowerCase();
      final employeeCode = employee.employeeId.toLowerCase();

      return name.contains(keyword) || employeeCode.contains(keyword);
    }).toList();
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) {
        return CustomDialog(
          message: message,
          type: 'error',
          onClose: () => Navigator.pop(context),
        );
      },
    );
  }

  Future<void> _submit() async {
    if (selectedEmployee == null) {
      AppSnackbar.showError(context, 'Vui lòng chọn trưởng phòng');
      return;
    }

    setState(() {
      isSubmitting = true;
    });

    final request = UpdateDepartmentManagerRequest(
      departmentId: widget.departmentId,
      managerId: selectedEmployee!.id,
    );

    try {
      await ref.read(updateDepartmentManagerProvider(request).future);

      if (!mounted) return;

      AppSnackbar.showSuccess(context, 'Đổi trưởng phòng thành công');
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      _showErrorDialog(e.toString());
    } finally {
      if (mounted) {
        setState(() {
          isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final employeesAsync = ref.watch(
      employeesByDepartmentProvider(widget.departmentId),
    );

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.85,
      minChildSize: 0.65,
      maxChildSize: 0.92,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 10),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFD9D9D9),
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              const SizedBox(height: 16),

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Đổi trưởng phòng',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: isSubmitting
                          ? null
                          : () => Navigator.pop(context, false),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),

              const Divider(height: 1),

              Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
                child: TextField(
                  controller: searchController,
                  onChanged: (value) {
                    setState(() {
                      searchText = value;
                    });
                  },
                  decoration: InputDecoration(
                    hintText: 'Tìm theo tên hoặc mã nhân viên',
                    prefixIcon: const Icon(Icons.search),
                    filled: true,
                    fillColor: const Color(0xFFF5F5F5),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),

              Expanded(
                child: employeesAsync.when(
                  data: (employees) {
                    _initSelected(employees);

                    final filteredEmployees = _filterEmployees(employees);

                    if (employees.isEmpty) {
                      return const Center(
                        child: Text(
                          'Phòng ban chưa có nhân viên',
                          style: TextStyle(
                            fontSize: 14,
                            color: Color(0xFF7A7A7A),
                          ),
                        ),
                      );
                    }

                    if (filteredEmployees.isEmpty) {
                      return const Center(
                        child: Text(
                          'Không tìm thấy nhân viên phù hợp',
                          style: TextStyle(
                            fontSize: 14,
                            color: Color(0xFF7A7A7A),
                          ),
                        ),
                      );
                    }

                    return ListView.separated(
                      controller: scrollController,
                      padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                      itemCount: filteredEmployees.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final employee = filteredEmployees[index];
                        final isSelected =
                            selectedEmployee?.id == employee.id;

                        return _ManagerEmployeeItem(
                          employee: employee,
                          isSelected: isSelected,
                          onTap: () {
                            setState(() {
                              selectedEmployee = employee;
                            });
                          },
                        );
                      },
                    );
                  },
                  loading: () => const Center(
                    child: CircularProgressIndicator(),
                  ),
                  error: (error, stackTrace) {
                    return Center(
                      child: Text(
                        error.toString(),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.red,
                          fontSize: 14,
                        ),
                      ),
                    );
                  },
                ),
              ),

              SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  child: SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: AppPrimaryButton(
                      onPressed: isSubmitting ? null : _submit,
                      isLoading: isSubmitting,
                      text: 'Xác nhận',
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ManagerEmployeeItem extends StatelessWidget {
  final Employee employee;
  final bool isSelected;
  final VoidCallback onTap;

  const _ManagerEmployeeItem({
    required this.employee,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF005BAC);

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Ink(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? primaryColor : const Color(0xFFE3E3E3),
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              ClipOval(
                child: Image.asset(
                  employee.avatar ?? 'assets/images/profile.png',
                  width: 44,
                  height: 44,
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
                      'Mã NV: ${employee.employeeId}',
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF7A7A7A),
                      ),
                    ),
                  ],
                ),
              ),

              Icon(
                isSelected
                    ? Icons.radio_button_checked
                    : Icons.radio_button_off,
                color: isSelected ? primaryColor : const Color(0xFFBDBDBD),
              ),
            ],
          ),
        ),
      ),
    );
  }
}