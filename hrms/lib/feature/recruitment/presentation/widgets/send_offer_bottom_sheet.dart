import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widget/app_back_button.dart';
import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/date_picker_field.dart';
import '../../../../core/widget/normal_text_field.dart';
import '../../domain/entities/job_application.dart';
import '../providers/application/job_application_detail_provider.dart';
import '../providers/offer/offer_action_provider.dart';

class SendOfferBottomSheet extends ConsumerStatefulWidget {
  final JobApplication application;

  const SendOfferBottomSheet({
    super.key,
    required this.application,
  });

  @override
  ConsumerState<SendOfferBottomSheet> createState() =>
      _SendOfferBottomSheetState();
}

class _SendOfferBottomSheetState extends ConsumerState<SendOfferBottomSheet> {
  late final TextEditingController salaryController;
  late final TextEditingController notesController;

  DateTime? selectedHireDate;

  @override
  void initState() {
    super.initState();
    salaryController = TextEditingController();
    notesController = TextEditingController();
  }

  @override
  void dispose() {
    salaryController.dispose();
    notesController.dispose();
    super.dispose();
  }

  bool _validateForm() {
    final salaryText = salaryController.text.trim();

    if (salaryText.isEmpty) {
      AppSnackbar.showError(context, 'Vui lòng nhập lương đề xuất');
      return false;
    }

    final salary = double.tryParse(salaryText);
    if (salary == null || salary <= 0) {
      AppSnackbar.showError(context, 'Lương đề xuất không hợp lệ');
      return false;
    }

    if (selectedHireDate == null) {
      AppSnackbar.showError(context, 'Vui lòng chọn ngày nhận việc');
      return false;
    }

    return true;
  }

  Future<void> _submit() async {
    if (!_validateForm()) return;

    final request = {
      'jobApplicationId': widget.application.id,
      'departmentId': widget.application.department.id,
      'proposedSalary': salaryController.text.trim(),
      'proposedHireDate': selectedHireDate!.toIso8601String(),
      'notes': notesController.text.trim(),
    };

    final success = await ref
        .read(offerActionProvider.notifier)
        .sendOffer(request);

    if (!mounted) return;

    if (success) {
      AppSnackbar.showSuccess(context, 'Gửi offer thành công');
      ref.invalidate(jobApplicationDetailProvider(widget.application.id));
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final actionState = ref.watch(offerActionProvider);

    ref.listen(offerActionProvider, (prev, next) {
      next.whenOrNull(
        error: (err, _) {
          if (!mounted) return;
          AppSnackbar.showError(context, err.toString());
        },
      );
    });

    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      child: DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        minChildSize: 0.7,
        maxChildSize: 0.85,
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
                      'Gửi offer nhận việc',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Gửi offer cho ứng viên ${widget.application.candidate.name}.',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 20),

                    NormalTextField(
                      controller: salaryController,
                      hintText: 'Lương đề xuất',
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 14),

                    DatePickerField(
                      hintText: 'Ngày nhận việc',
                      controller: TextEditingController(
                        text: selectedHireDate == null
                            ? ''
                            : _formatDate(selectedHireDate!),
                      ),
                      firstDate: DateTime.now(),
                      onDateSelected: (date) {
                        if (date == null) return;
                        setState(() {
                          selectedHireDate = date;
                        });
                      },
                    ),
                    const SizedBox(height: 14),

                    NormalTextField(
                      controller: notesController,
                      hintText: 'Ghi chú offer',
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
                          text: 'Gửi offer',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  String _formatDate(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final year = date.year;
    return '$day/$month/$year';
  }
}