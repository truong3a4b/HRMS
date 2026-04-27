import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/custom_dialog.dart';
import '../../../employee/presentation/widgets/normal_text_field.dart';
import '../../domain/entities/department.dart';
import '../../domain/entities/update_department_request.dart';
import '../providers/department_detail_provider.dart';
import '../providers/update_department_provider.dart';

class EditDepartmentBasicInfoScreen extends ConsumerStatefulWidget {
  final String departmentId;

  const EditDepartmentBasicInfoScreen({
    super.key,
    required this.departmentId,
  });

  @override
  ConsumerState<EditDepartmentBasicInfoScreen> createState() =>
      _EditDepartmentBasicInfoScreenState();
}

class _EditDepartmentBasicInfoScreenState
    extends ConsumerState<EditDepartmentBasicInfoScreen> {
  final nameController = TextEditingController();
  final descriptionController = TextEditingController();

  bool _initialized = false;
  bool _isSubmitting = false;

  @override
  void dispose() {
    nameController.dispose();
    descriptionController.dispose();
    super.dispose();
  }

  void _initForm(Department department) {
    if (_initialized) return;

    nameController.text = department.name;
    descriptionController.text = department.description ?? '';

    _initialized = true;
  }

  bool _validate() {
    final name = nameController.text.trim();

    if (name.isEmpty) {
      AppSnackbar.showError(context, 'Vui lòng nhập tên phòng ban');
      return false;
    }

    if (name.length < 2) {
      AppSnackbar.showError(context, 'Tên phòng ban phải có ít nhất 2 ký tự');
      return false;
    }

    return true;
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) {
        return CustomDialog(
          message: message,
          type: 'error',
          onClose: () {
            Navigator.pop(context);
          },
        );
      },
    );
  }

  Future<void> _submit() async {
    if (!_validate()) return;

    setState(() {
      _isSubmitting = true;
    });

    final request = UpdateDepartmentRequest(
      id: widget.departmentId,
      name: nameController.text.trim(),
      description: descriptionController.text.trim().isEmpty
          ? null
          : descriptionController.text.trim(),
    );

    try {
      await ref.read(updateDepartmentProvider(request).future);

      if (!mounted) return;

      ref.invalidate(departmentDetailProvider(widget.departmentId));

      AppSnackbar.showSuccess(context, 'Cập nhật phòng ban thành công');
      context.pop(true);
    } catch (e) {
      if (!mounted) return;
      _showErrorDialog(e.toString());
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final departmentAsync = ref.watch(
      departmentDetailProvider(widget.departmentId),
    );

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
          onPressed: _isSubmitting ? null : () => context.pop(),
        ),
        title: const Text(
          'Sửa thông tin phòng ban',
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
          child: Divider(
            height: 1,
            thickness: 1,
            color: Color(0xFFEAEAEA),
          ),
        ),
      ),
      body: departmentAsync.when(
        data: (department) {
          _initForm(department);
          return _buildContent();
        },
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
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          color: Colors.white,
          child: SizedBox(
            width: double.infinity,
            height: 50,
            child: AppPrimaryButton(
              onPressed: _isSubmitting ? null : _submit,
              isLoading: _isSubmitting,
              text: 'Lưu thay đổi',
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'THÔNG TIN PHÒNG BAN',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 20),
            NormalTextField(
              controller: nameController,
              hintText: 'Tên phòng ban',
            ),
            const SizedBox(height: 16),
            NormalTextField(
              controller: descriptionController,
              hintText: 'Mô tả',
              maxLines: 4,
            ),
          ],
        ),
      ),
    );
  }
}