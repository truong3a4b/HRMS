import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/utils/time_convert.dart';
import '../../../../../core/widget/app_primary_button.dart';
import '../../../../../core/widget/app_snackbar.dart';
import '../../../../../core/widget/custom_dialog.dart';
import '../../../../department/domain/entities/department.dart';
import '../../../../../core/widget/date_picker_field.dart';
import '../../../../../core/widget/normal_text_field.dart';
import '../../../../../core/widget/select_field.dart';
import '../../../../position/domain/entities/position.dart';
import '../../../domain/entities/recruitment_job_request.dart';
import '../../providers/jobs/add_recruitment_job_provider.dart';

class AddRecruitmentJobScreen extends ConsumerStatefulWidget {
  const AddRecruitmentJobScreen({super.key});

  @override
  ConsumerState<AddRecruitmentJobScreen> createState() =>
      _AddRecruitmentJobScreenState();
}

class _AddRecruitmentJobScreenState
    extends ConsumerState<AddRecruitmentJobScreen> {
  final titleController = TextEditingController();
  final descriptionController = TextEditingController();
  final requirementsController = TextEditingController();
  final benefitsController = TextEditingController();
  final salaryMinController = TextEditingController();
  final salaryMaxController = TextEditingController();
  final quantityController = TextEditingController();

  Position? selectedPosition;
  Department? selectedDepartment;
  DateTime? selectedDeadline;

  @override
  void initState() {
    super.initState();

    ref.listenManual<AsyncValue<AddRecruitmentJobState>>(
      addRecruitmentJobProvider,
          (previous, next) {
        final previousError = previous?.value?.errorMessage;
        final currentError = next.value?.errorMessage;

        if (currentError != null && currentError != previousError) {
          showErrorDialog(currentError);
        }
      },
    );
  }

  @override
  void dispose() {
    titleController.dispose();
    descriptionController.dispose();
    requirementsController.dispose();
    benefitsController.dispose();
    salaryMinController.dispose();
    salaryMaxController.dispose();
    quantityController.dispose();
    super.dispose();
  }

  void showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) {
        return CustomDialog(
          message: message,
          type: "error",
          onClose: () {
            ref.read(addRecruitmentJobProvider.notifier).closeDialog();
          },
        );
      },
    );
  }

  bool _validate() {
    if (titleController.text.trim().isEmpty) {
      AppSnackbar.showError(context, 'Vui lòng nhập tiêu đề tuyển dụng');
      return false;
    }

    if (selectedPosition == null) {
      AppSnackbar.showError(context, 'Vui lòng chọn chức danh');
      return false;
    }

    if (selectedDepartment == null) {
      AppSnackbar.showError(context, 'Vui lòng chọn phòng ban');
      return false;
    }

    if (descriptionController.text.trim().length < 10) {
      AppSnackbar.showError(context, 'Mô tả phải có ít nhất 10 ký tự');
      return false;
    }

    if (requirementsController.text.trim().length < 10) {
      AppSnackbar.showError(context, 'Yêu cầu phải có ít nhất 10 ký tự');
      return false;
    }

    if (benefitsController.text.trim().length < 3) {
      AppSnackbar.showError(context, 'Phúc lợi phải có ít nhất 3 ký tự');
      return false;
    }

    final salaryMin = double.tryParse(salaryMinController.text.trim());
    final salaryMax = double.tryParse(salaryMaxController.text.trim());

    if (salaryMin == null || salaryMax == null) {
      AppSnackbar.showError(context, 'Mức lương không hợp lệ');
      return false;
    }

    if (salaryMin > salaryMax) {
      AppSnackbar.showError(context, 'Lương tối thiểu không được lớn hơn lương tối đa');
      return false;
    }

    final quantity = int.tryParse(quantityController.text.trim());

    if (quantity == null || quantity <= 0) {
      AppSnackbar.showError(context, 'Số lượng tuyển phải lớn hơn 0');
      return false;
    }

    if (selectedDeadline == null) {
      AppSnackbar.showError(context, 'Vui lòng chọn hạn nộp hồ sơ');
      return false;
    }

    return true;
  }

  Future<void> _submit() async {
    if (!_validate()) return;

    final request = RecruitmentJobRequest(
      positionId: selectedPosition!.id,
      departmentId: selectedDepartment!.id,
      title: titleController.text.trim(),
      description: descriptionController.text.trim(),
      requirements: requirementsController.text.trim(),
      benefits: benefitsController.text.trim(),
      salaryMin: double.parse(salaryMinController.text.trim()),
      salaryMax: double.parse(salaryMaxController.text.trim()),
      quantity: int.parse(quantityController.text.trim()),
      deadline: selectedDeadline!,
    );

    final success = await ref
        .read(addRecruitmentJobProvider.notifier)
        .addRecruitmentJob(request);

    if (!mounted) return;

    if (success) {
      AppSnackbar.showSuccess(context, 'Thêm vị trí tuyển dụng thành công');
      context.pop(true);
    } else {
      AppSnackbar.showError(context, 'Thêm vị trí tuyển dụng thất bại');
    }
  }

  @override
  Widget build(BuildContext context) {
    final addJobAsync = ref.watch(addRecruitmentJobProvider);
    final isLoading = addJobAsync.value?.isLoading ?? addJobAsync.isLoading;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Thêm vị trí tuyển dụng',
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
      body: addJobAsync.when(
        data: (state) => _buildContent(state),
        error: (e, _) => Center(
          child: Text(
            e.toString(),
            style: const TextStyle(color: Colors.red),
            textAlign: TextAlign.center,
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
      bottomNavigationBar: isLoading
          ? null
          : SafeArea(
        child: Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          color: Colors.white,
          child: SizedBox(
            width: double.infinity,
            height: 50,
            child: AppPrimaryButton(
              onPressed: _submit,
              isLoading: isLoading,
              text: 'Xác nhận',
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(AddRecruitmentJobState state) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'THÔNG TIN VỊ TRÍ',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 20),

            NormalTextField(
              controller: titleController,
              hintText: 'Tiêu đề tuyển dụng',
            ),
            const SizedBox(height: 16),

            SelectField<Position>(
              title: 'Chọn chức danh',
              options: state.positions,
              value: selectedPosition,
              onChanged: (position) {
                setState(() {
                  selectedPosition = position;
                });
              },
              itemLabel: (position) => position.name,
            ),
            const SizedBox(height: 16),

            SelectField<Department>(
              title: 'Chọn phòng ban',
              options: state.departments,
              value: selectedDepartment,
              onChanged: (department) {
                setState(() {
                  selectedDepartment = department;
                });
              },
              itemLabel: (department) => department.name,
            ),

            const SizedBox(height: 28),
            const Text(
              'NỘI DUNG TUYỂN DỤNG',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 20),

            NormalTextField(
              controller: descriptionController,
              hintText: 'Mô tả công việc',
              maxLines: 5,
            ),
            const SizedBox(height: 16),

            NormalTextField(
              controller: requirementsController,
              hintText: 'Yêu cầu ứng viên',
              maxLines: 5,
            ),
            const SizedBox(height: 16),

            NormalTextField(
              controller: benefitsController,
              hintText: 'Quyền lợi',
              maxLines: 5,
            ),

            const SizedBox(height: 28),
            const Text(
              'THÔNG TIN TUYỂN DỤNG',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 20),

            NormalTextField(
              controller: salaryMinController,
              hintText: 'Lương tối thiểu',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),

            NormalTextField(
              controller: salaryMaxController,
              hintText: 'Lương tối đa',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),

            NormalTextField(
              controller: quantityController,
              hintText: 'Số lượng tuyển',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),

            DatePickerField(
              hintText: 'Hạn nộp hồ sơ',
              controller: TextEditingController(
                text: TimeConvert.convertDateTimeToString(selectedDeadline),
              ),
              onDateSelected: (date) {
                setState(() {
                  selectedDeadline = date;
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}