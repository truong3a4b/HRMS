import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/utils/time_convert.dart';
import '../../../../../core/widget/app_primary_button.dart';
import '../../../../../core/widget/app_snackbar.dart';
import '../../../../../core/widget/custom_dialog.dart';
import '../../../../department/domain/entities/department.dart';
import '../../../../department/presentation/providers/department_list_provider.dart';
import '../../../../../core/widget/date_picker_field.dart';
import '../../../../../core/widget/normal_text_field.dart';
import '../../../../../core/widget/select_field.dart';
import '../../../../position/domain/entities/position.dart';
import '../../../../position/presentation/providers/positionListProvider.dart';
import '../../../domain/entities/recruitment_job.dart';
import '../../../domain/entities/recruitment_job_request.dart';
import '../../providers/jobs/recruitment_job_detail_provider.dart';
import '../../providers/jobs/recruitment_job_list_provider.dart';
import '../../providers/jobs/update_recruitment_job_provider.dart';

class UpdateRecruitmentJobScreen extends ConsumerStatefulWidget {
  final String jobId;

  const UpdateRecruitmentJobScreen({super.key, required this.jobId});

  @override
  ConsumerState<UpdateRecruitmentJobScreen> createState() =>
      _EditRecruitmentJobScreenState();
}

class _EditRecruitmentJobScreenState
    extends ConsumerState<UpdateRecruitmentJobScreen> {
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

  bool _initialized = false;
  bool _isSubmitting = false;

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

  void _initForm(RecruitmentJob job) {
    if (_initialized) return;

    titleController.text = job.title;
    descriptionController.text = job.description;
    requirementsController.text = job.requirements;
    benefitsController.text = job.benefits;
    salaryMinController.text = job.salaryMin?.toStringAsFixed(0) ?? '';
    salaryMaxController.text = job.salaryMax?.toStringAsFixed(0) ?? '';
    quantityController.text = job.quantity.toString();

    selectedPosition = job.position;
    selectedDepartment = job.department;
    selectedDeadline = job.deadline;

    _initialized = true;
  }

  bool _validate() {
    final title = titleController.text.trim();
    final description = descriptionController.text.trim();
    final requirements = requirementsController.text.trim();
    final benefits = benefitsController.text.trim();

    if (title.length < 2) {
      AppSnackbar.showError(context, 'Tiêu đề phải có ít nhất 2 ký tự');
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

    if (description.length < 10) {
      AppSnackbar.showError(context, 'Mô tả phải có ít nhất 10 ký tự');
      return false;
    }

    if (requirements.length < 10) {
      AppSnackbar.showError(context, 'Yêu cầu phải có ít nhất 10 ký tự');
      return false;
    }

    if (benefits.length < 3) {
      AppSnackbar.showError(context, 'Phúc lợi phải có ít nhất 3 ký tự');
      return false;
    }

    final salaryMin = double.tryParse(salaryMinController.text.trim());
    final salaryMax = double.tryParse(salaryMaxController.text.trim());

    if (salaryMin != null && salaryMax != null && salaryMin > salaryMax) {
      AppSnackbar.showError(
        context,
        'Lương tối thiểu không được lớn hơn lương tối đa',
      );
      return false;
    }

    final quantity = int.tryParse(quantityController.text.trim());
    if (quantity == null || quantity <= 0) {
      AppSnackbar.showError(context, 'Số lượng tuyển phải lớn hơn 0');
      return false;
    }


    return true;
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (_) => CustomDialog(message: message, type: 'error'),
    );
  }

  Future<void> _submit() async {
    if (!_validate()) return;

    setState(() => _isSubmitting = true);

    final request = RecruitmentJobRequest(
      id: widget.jobId,
      positionId: selectedPosition!.id,
      departmentId: selectedDepartment!.id,
      title: titleController.text.trim(),
      description: descriptionController.text.trim(),
      requirements: requirementsController.text.trim(),
      benefits: benefitsController.text.trim(),
      salaryMin: double.tryParse(salaryMinController.text.trim())!,
      salaryMax: double.tryParse(salaryMaxController.text.trim())!,
      quantity: int.tryParse(quantityController.text.trim())!,
      deadline: selectedDeadline!,
    );

    try {
      await ref.read(updateRecruitmentJobProvider(request).future);

      if (!mounted) return;

      ref.invalidate(recruitmentJobDetailProvider(widget.jobId));
      ref.invalidate(recruitmentJobListProvider);

      AppSnackbar.showSuccess(context, 'Cập nhật tin tuyển dụng thành công');
      context.pop(true);
    } catch (e) {
      if (!mounted) return;
      _showErrorDialog(e.toString());
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final jobAsync = ref.watch(recruitmentJobDetailProvider(widget.jobId));
    final departmentsAsync = ref.watch(departmentListProvider);
    final positionsAsync = ref.watch( positionListProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
          onPressed: _isSubmitting ? null : () => context.pop(),
        ),
        title: const Text(
          'Cập nhật tin tuyển dụng',
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
      body: jobAsync.when(
        data: (job) {
          _initForm(job);

          return departmentsAsync.when(
            data: (departments) {
              return positionsAsync.when(
                data: (positions) => _buildContent(
                  departments: departments,
                  positions: positions,
                ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => _ErrorText(error: e),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => _ErrorText(error: e),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorText(error: e),
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          color: Colors.white,
          child: SizedBox(
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

  Widget _buildContent({
    required List<Department> departments,
    required List<Position> positions,
  }) {
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
              options: positions,
              value: selectedPosition,
              onChanged: (position) {
                setState(() => selectedPosition = position);
              },
              itemLabel: (position) => position.name,
            ),
            const SizedBox(height: 16),

            SelectField<Department>(
              title: 'Chọn phòng ban',
              options: departments,
              value: selectedDepartment,
              onChanged: (department) {
                setState(() => selectedDepartment = department);
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
                text: selectedDeadline == null
                    ? ''
                    : TimeConvert.convertDateTimeToString(selectedDeadline!),
              ),
              onDateSelected: (date) {
                setState(() => selectedDeadline = date);
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorText extends StatelessWidget {
  final Object error;

  const _ErrorText({required this.error});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        error.toString(),
        textAlign: TextAlign.center,
        style: const TextStyle(color: Colors.red, fontSize: 14),
      ),
    );
  }
}
