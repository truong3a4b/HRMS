import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hrms/feature/recruitment/presentation/providers/application/job_application_detail_provider.dart';

import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/normal_text_field.dart';
import '../providers/evaluation/interview_evaluation_action_provider.dart';

class AddEvaluationBottomSheet extends ConsumerStatefulWidget {
  final String jobApplicationId;

  const AddEvaluationBottomSheet({
    super.key,
    required this.jobApplicationId,
  });

  @override
  ConsumerState<AddEvaluationBottomSheet> createState() =>
      _AddEvaluationBottomSheetState();
}

class _AddEvaluationBottomSheetState
    extends ConsumerState<AddEvaluationBottomSheet> {
  late final TextEditingController titleController;
  late final TextEditingController scoreController;
  late final TextEditingController strengthsController;
  late final TextEditingController concernsController;
  late final TextEditingController recommendationController;
  late final TextEditingController commentsController;

  @override
  void initState() {
    super.initState();
    titleController = TextEditingController();
    scoreController = TextEditingController();
    strengthsController = TextEditingController();
    concernsController = TextEditingController();
    recommendationController = TextEditingController();
    commentsController = TextEditingController();
  }

  @override
  void dispose() {
    titleController.dispose();
    scoreController.dispose();
    strengthsController.dispose();
    concernsController.dispose();
    recommendationController.dispose();
    commentsController.dispose();
    super.dispose();
  }

  bool _validateForm() {
    if (titleController.text.trim().length < 2) {
      AppSnackbar.showError(context, 'Tiêu đề phải có ít nhất 2 ký tự');
      return false;
    }

    final score = int.tryParse(scoreController.text.trim());
    if (score == null || score < 0 || score > 10) {
      AppSnackbar.showError(context, 'Điểm đánh giá phải nằm trong khoảng 0-10');
      return false;
    }

    if (strengthsController.text.trim().isEmpty &&
        concernsController.text.trim().isEmpty &&
        recommendationController.text.trim().isEmpty &&
        commentsController.text.trim().isEmpty) {
      AppSnackbar.showError(context, 'Vui lòng nhập nội dung đánh giá');
      return false;
    }

    return true;
  }

  Future<void> _submit() async {
    if (!_validateForm()) return;

    final request = {
      'jobApplicationId': widget.jobApplicationId,
      'title': titleController.text.trim(),
      'score': int.parse(scoreController.text.trim()),
      'strengths': strengthsController.text.trim(),
      'concerns': concernsController.text.trim(),
      'recommendation': recommendationController.text.trim(),
      'comments': commentsController.text.trim(),
    };

    final success = await ref
        .read(interviewEvaluationActionProvider.notifier)
        .evaluateCandidate(request);

    if (!mounted) return;

    if (success) {
      AppSnackbar.showSuccess(context, 'Thêm đánh giá thành công');
      ref.invalidate(jobApplicationDetailProvider(widget.jobApplicationId));
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final actionState = ref.watch(interviewEvaluationActionProvider);

    ref.listen(interviewEvaluationActionProvider, (prev, next) {
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
        snap: false,
        initialChildSize: 0.86,
        minChildSize: 0.86,
        maxChildSize: 0.86,
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
                      'Thêm đánh giá ứng viên',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Nhập nhận xét và điểm đánh giá sau buổi phỏng vấn.',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 20),
                    NormalTextField(
                      controller: titleController,
                      hintText: 'Tiêu đề đánh giá',
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: scoreController,
                      keyboardType: TextInputType.number,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(2),
                      ],
                      decoration: InputDecoration(
                        labelText: 'Điểm đánh giá (0-10)',
                        hintText: 'Điểm đánh giá (0-10)',
                        filled: true,
                        fillColor: Colors.transparent,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 16,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFD8D8D8)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFF0E67B2),
                            width: 1.2,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    NormalTextField(
                      controller: strengthsController,
                      hintText: 'Điểm mạnh',
                      maxLines: 3,
                    ),
                    const SizedBox(height: 14),
                    NormalTextField(
                      controller: concernsController,
                      hintText: 'Điểm cần lưu ý',
                      maxLines: 3,
                    ),
                    const SizedBox(height: 14),
                    NormalTextField(
                      controller: recommendationController,
                      hintText: 'Đề xuất',
                      maxLines: 3,
                    ),
                    const SizedBox(height: 14),
                    NormalTextField(
                      controller: commentsController,
                      hintText: 'Ghi chú thêm',
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
                          text: 'Thêm đánh giá',
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
}
