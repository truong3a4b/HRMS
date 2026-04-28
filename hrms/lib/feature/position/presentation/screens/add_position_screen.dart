import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/custom_dialog.dart';
import '../../../employee/presentation/widgets/normal_text_field.dart';
import '../../domain/entities/add_position_request.dart';
import '../../domain/entities/position.dart';
import '../providers/add_position_provider.dart';
import '../widgets/permission_group_card.dart';


class AddPositionScreen extends ConsumerStatefulWidget {
  const AddPositionScreen({super.key});

  @override
  ConsumerState<AddPositionScreen> createState() => _AddPositionScreenState();
}

class _AddPositionScreenState extends ConsumerState<AddPositionScreen> {
  final nameController = TextEditingController();
  final descriptionController = TextEditingController();

  final Set<Permission> selectedPermissions = {};
  bool isSubmitting = false;

  @override
  void dispose() {
    nameController.dispose();
    descriptionController.dispose();
    super.dispose();
  }

  bool _validate() {
    final name = nameController.text.trim();

    if (name.isEmpty) {
      AppSnackbar.showError(context, 'Vui lòng nhập tên chức vụ');
      return false;
    }

    if (name.length < 2) {
      AppSnackbar.showError(context, 'Tên chức vụ phải có ít nhất 2 ký tự');
      return false;
    }

    return true;
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (_) {
        return CustomDialog(
          message: message,
          type: 'error',
        );
      },
    );
  }

  Future<void> _submit() async {
    if (!_validate()) return;

    setState(() {
      isSubmitting = true;
    });

    final request = AddPositionRequest(
      name: nameController.text.trim(),
      description: descriptionController.text.trim().isEmpty
          ? null
          : descriptionController.text.trim(),
      permissionKeys: selectedPermissions.map((e) => e.key).toList(),
    );

    try {
      await ref.read(addPositionProvider(request).future);

      if (!mounted) return;

      AppSnackbar.showSuccess(context, 'Thêm chức vụ thành công');
      context.pop(true);
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

  void _toggleAll(bool selected) {
    setState(() {
      if (selected) {
        selectedPermissions.addAll(Permission.values);
      } else {
        selectedPermissions.clear();
      }
    });
  }

  void _toggleGroup(String group, bool selected) {
    final groupPermissions =
    Permission.values.where((p) => p.group == group).toList();

    setState(() {
      if (selected) {
        selectedPermissions.addAll(groupPermissions);
      } else {
        selectedPermissions.removeAll(groupPermissions);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final groups = Permission.values.map((p) => p.group).toSet().toList();
    final isAllSelected =
        selectedPermissions.length == Permission.values.length;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
          onPressed: isSubmitting ? null : () => context.pop(),
        ),
        title: const Text(
          'Thêm mới chức vụ',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        titleSpacing: 0,
        centerTitle: false,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, thickness: 1, color: Color(0xFFEAEAEA)),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'THÔNG TIN CHỨC VỤ',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 20),
            NormalTextField(
              controller: nameController,
              hintText: 'Tên chức vụ',
            ),
            const SizedBox(height: 16),
            NormalTextField(
              controller: descriptionController,
              hintText: 'Mô tả',
              maxLines: 4,
            ),
            const SizedBox(height: 28),
            Row(
              children: [
                const Expanded(
                  child: Text(
                    'PHÂN QUYỀN',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                ),
                TextButton(
                  onPressed: () => _toggleAll(!isAllSelected),
                  child: Text(isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...groups.map((group) {
              final permissions =
              Permission.values.where((p) => p.group == group).toList();

              return PermissionGroupCard(
                groupName: group,
                permissions: permissions,
                selectedPermissions: selectedPermissions,
                onToggleGroup: _toggleGroup,
                onTogglePermission: (permission, selected) {
                  setState(() {
                    if (selected) {
                      selectedPermissions.add(permission);
                    } else {
                      selectedPermissions.remove(permission);
                    }
                  });
                },
              );
            }),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          color: Colors.white,
          child: SizedBox(
            height: 50,
            width: double.infinity,
            child: AppPrimaryButton(
              onPressed: isSubmitting ? null : _submit,
              isLoading: isSubmitting,
              text: 'Xác nhận',
            ),
          ),
        ),
      ),
    );
  }
}

