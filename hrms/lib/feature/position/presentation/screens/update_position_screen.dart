import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widget/app_confirm_dialog.dart';
import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/custom_dialog.dart';
import '../../../../core/widget/normal_text_field.dart';
import '../../domain/entities/update_position_request.dart';
import '../../domain/entities/position.dart';
import '../providers/edit_position_provider.dart';
import '../providers/positionListProvider.dart';
import '../widgets/permission_group_card.dart';

class UpdatePositionScreen extends ConsumerStatefulWidget {
  final String positionId;

  const UpdatePositionScreen({
    super.key,
    required this.positionId,
  });

  @override
  ConsumerState<UpdatePositionScreen> createState() =>
      _UpdatePositionScreenState();
}

class _UpdatePositionScreenState extends ConsumerState<UpdatePositionScreen> {
  final nameController = TextEditingController();
  final descriptionController = TextEditingController();

  final Set<Permission> selectedPermissions = {};

  bool initialized = false;
  bool isSaving = false;
  bool isDeleting = false;

  @override
  void dispose() {
    nameController.dispose();
    descriptionController.dispose();
    super.dispose();
  }

  void _initForm(Position position) {
    if (initialized) return;

    nameController.text = position.name;
    descriptionController.text = position.description ?? '';
    selectedPermissions.addAll(position.permissions);

    initialized = true;
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

  Future<void> _save() async {
    if (!_validate()) return;

    setState(() {
      isSaving = true;
    });

    final request = UpdatePositionRequest(
      id: widget.positionId,
      name: nameController.text.trim(),
      description: descriptionController.text.trim().isEmpty
          ? null
          : descriptionController.text.trim(),
      permissionKeys: selectedPermissions.map((e) => e.key).toList(),
    );

    try {
      await ref.read(updatePositionProvider(request).future);

      if (!mounted) return;

      AppSnackbar.showSuccess(context, 'Cập nhật chức vụ thành công');
      ref.invalidate(positionDetailProvider(widget.positionId));
      ref.invalidate(positionListProvider);
      context.pop(true);
    } catch (e) {
      if (!mounted) return;
      _showErrorDialog(e.toString());
    } finally {
      if (mounted) {
        setState(() {
          isSaving = false;
        });
      }
    }
  }

  Future<void> _delete() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AppConfirmDialog(
          title: 'Xóa chức vụ',
          message: 'Bạn có chắc chắn muốn xóa chức vụ này không?',
          confirmText: 'Xóa',
          onCancel: () => Navigator.pop(context, false),
          onConfirm: () => Navigator.pop(context, true),
        );
      },
    );

    if (confirm != true) return;

    setState(() {
      isDeleting = true;
    });

    try {
      await ref.read(deletePositionProvider(widget.positionId).future);

      if (!mounted) return;

      AppSnackbar.showSuccess(context, 'Xóa chức vụ thành công');
      ref.invalidate(positionListProvider);
      context.pop(true);
    } catch (e) {
      if (!mounted) return;
      _showErrorDialog(e.toString());
    } finally {
      if (mounted) {
        setState(() {
          isDeleting = false;
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
    final positionAsync = ref.watch(positionDetailProvider(widget.positionId));
    final isSubmitting = isSaving || isDeleting;

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
          'Cập nhật chức vụ',
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
      body: positionAsync.when(
        data: (position) {
          _initForm(position);
          return _buildContent();
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) {
          return Center(
            child: Text(
              error.toString(),
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red, fontSize: 14),
            ),
          );
        },
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          color: Colors.white,
          child: Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 50,
                  child: ElevatedButton(
                    onPressed: isSubmitting ? null : _delete,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFFEBEE),
                      foregroundColor: Colors.red,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: isDeleting
                        ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                        : const Text(
                      'Xóa',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 50,
                  child: AppPrimaryButton(
                    onPressed: isSubmitting ? null : _save,
                    isLoading: isSaving,
                    text: 'Lưu',
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    final groups = Permission.values.map((p) => p.group).toSet().toList();
    final isAllSelected =
        selectedPermissions.length == Permission.values.length;

    return SingleChildScrollView(
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
    );
  }
}