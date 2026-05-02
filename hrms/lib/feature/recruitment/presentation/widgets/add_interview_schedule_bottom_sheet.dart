import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/feature/recruitment/presentation/providers/application/job_application_detail_provider.dart';

import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/date_picker_field.dart';
import '../../../../core/widget/normal_text_field.dart';
import '../../../../core/widget/select_field.dart';
import '../providers/interview/interview_schedule_action_provider.dart';

class AddInterviewScheduleBottomSheet extends ConsumerStatefulWidget {
  final String jobApplicationId;

  const AddInterviewScheduleBottomSheet({
    super.key,
    required this.jobApplicationId,
  });

  @override
  ConsumerState<AddInterviewScheduleBottomSheet> createState() =>
      _AddInterviewScheduleBottomSheetState();
}

class _AddInterviewScheduleBottomSheetState
    extends ConsumerState<AddInterviewScheduleBottomSheet> {
  late final TextEditingController titleController;
  late final TextEditingController locationController;
  late final TextEditingController interviewerNotesController;

  DateTime? selectedScheduledAt;
  InterviewType? selectedType;

  final interviewTypes = const [
    InterviewType(value: 'ONLINE', label: 'Phỏng vấn online'),
    InterviewType(value: 'OFFLINE', label: 'Phỏng vấn trực tiếp'),
  ];

  @override
  void initState() {
    super.initState();
    titleController = TextEditingController();
    locationController = TextEditingController();
    interviewerNotesController = TextEditingController();
  }

  @override
  void dispose() {
    titleController.dispose();
    locationController.dispose();
    interviewerNotesController.dispose();
    super.dispose();
  }

  bool _validateForm() {
    if (titleController.text.trim().length < 2) {
      AppSnackbar.showError(context, 'Tiêu đề phải có ít nhất 2 ký tự');
      return false;
    }

    if (selectedScheduledAt == null) {
      AppSnackbar.showError(context, 'Vui lòng chọn thời gian phỏng vấn');
      return false;
    }

    if (selectedType == null) {
      AppSnackbar.showError(context, 'Vui lòng chọn loại phỏng vấn');
      return false;
    }

    return true;
  }

  Future<void> _submit() async {
    if (!_validateForm()) return;

    final request = {
      'jobApplicationId': widget.jobApplicationId,
      'title': titleController.text.trim(),
      'scheduledAt': selectedScheduledAt!.toIso8601String(),
      'type': selectedType!.value,
      'location': locationController.text.trim(),
      'interviewerNotes': interviewerNotesController.text.trim(),
    };
    final success = await ref
        .read(interviewScheduleActionProvider.notifier)
        .addInterviewSchedule(request);

    if (!mounted) return;

    if (success) {
      AppSnackbar.showSuccess(context, 'Tạo lịch phỏng vấn thành công');
      ref.invalidate(jobApplicationDetailProvider);
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final actionState = ref.watch(interviewScheduleActionProvider);

    ref.listen(interviewScheduleActionProvider, (prev, next) {
      next.whenOrNull(
        error: (err, _) {
          if (!mounted) return;

          AppSnackbar.showError(context, err.toString());
        },
      );
    });
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      child:DraggableScrollableSheet(
        expand: false,
        snap: false,
        initialChildSize: 0.8,
        minChildSize: 0.8,
        maxChildSize: 0.8,
        builder: (context, scrollController) {
          return Scaffold(
            resizeToAvoidBottomInset: false,
            backgroundColor: Colors.white,
            body: SafeArea(
              child: SingleChildScrollView(
                controller: scrollController,
                padding: EdgeInsets.fromLTRB(
                  20,
                  18,
                  20,
                  20 + MediaQuery.of(context).viewInsets.bottom,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 42,
                        height: 4,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE2E8F0),
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    const Text(
                      'Tạo thư mời phỏng vấn',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Nhập thông tin lịch phỏng vấn để gửi cho ứng viên.',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF64748B),
                      ),
                    ),

                    const SizedBox(height: 20),

                    NormalTextField(
                      controller: titleController,
                      hintText: 'Tiêu đề phỏng vấn',
                    ),
                    const SizedBox(height: 14),

                    DatePickerField(
                      hintText: 'Thời gian phỏng vấn',
                      controller: TextEditingController(
                        text: selectedScheduledAt == null
                            ? ''
                            : _formatDateTime(selectedScheduledAt!),
                      ),
                      firstDate: DateTime.now(),
                      onDateSelected: (date) async {
                        final time = await showTimePicker(
                          context: context,
                          initialTime: TimeOfDay.now(),
                        );

                        if (time == null) return;

                        setState(() {
                          selectedScheduledAt = DateTime(
                            date!.year,
                            date.month,
                            date.day,
                            time.hour,
                            time.minute,
                          );
                        });
                      },
                    ),
                    const SizedBox(height: 14),

                    SelectField<InterviewType>(
                      title: 'Loại phỏng vấn',
                      options: interviewTypes,
                      value: selectedType,
                      isSearchable: false,
                      onChanged: (type) {
                        setState(() {
                          selectedType = type;
                        });
                      },
                      itemLabel: (type) => type.label,
                    ),
                    const SizedBox(height: 14),

                    NormalTextField(
                      controller: locationController,
                      hintText: 'Địa điểm hoặc link phỏng vấn',
                    ),
                    const SizedBox(height: 14),

                    NormalTextField(
                      controller: interviewerNotesController,
                      hintText: 'Ghi chú cho người phỏng vấn',
                      maxLines: 4,
                    ),

                    const SizedBox(height: 22),
                  ],
                ),
              ),
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
                        child: OutlinedButton(
                          onPressed: () => context.pop(),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF334155),
                            side: const BorderSide(color: Color(0xFFCBD5E1)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Hủy',
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: SizedBox(
                        height: 50,
                        child: AppPrimaryButton(
                          onPressed: _submit,
                          isLoading: actionState.isLoading,
                          text: 'Tạo lịch',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      )
    );
  }

  String _formatDateTime(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year;
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');

    return '$day/$month/$year $hour:$minute';
  }
}

class InterviewType {
  final String value;
  final String label;

  const InterviewType({required this.value, required this.label});
}
