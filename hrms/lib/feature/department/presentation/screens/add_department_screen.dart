import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/custom_dialog.dart';
import '../../../../core/widget/normal_text_field.dart';
import '../../domain/entities/add_department_request.dart';
import '../providers/add_department_provider.dart';

class AddDepartmentScreen extends ConsumerStatefulWidget {
  const AddDepartmentScreen({super.key});

  @override
  ConsumerState<AddDepartmentScreen> createState() =>
      _AddDepartmentScreenState();
}

class _AddDepartmentScreenState extends ConsumerState<AddDepartmentScreen> {
  final nameController = TextEditingController();
  final descriptionController = TextEditingController();

  bool _isSubmitting = false;

  @override
  void dispose() {
    nameController.dispose();
    descriptionController.dispose();
    super.dispose();
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

    final request = AddDepartmentRequest(
      name: nameController.text.trim(),
      description: descriptionController.text.trim().isEmpty
          ? null
          : descriptionController.text.trim(),
    );

    try {
      await ref.read(addDepartmentProvider(request).future);

      if (!mounted) return;

      AppSnackbar.showSuccess(context, 'Thêm phòng ban thành công');
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
          'Thêm mới phòng ban',
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
      body: _buildContent(),
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
              text: 'Xác nhận',
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
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
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
