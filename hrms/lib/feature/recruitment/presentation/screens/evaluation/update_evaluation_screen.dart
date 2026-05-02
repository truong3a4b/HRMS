import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/widget/app_primary_button.dart';
import '../../../../../core/widget/app_snackbar.dart';
import '../../../../../core/widget/custom_dialog.dart';
import '../../../../../core/widget/normal_text_field.dart';
import '../../../domain/entities/interview_evaluation.dart';
import '../../providers/application/job_application_detail_provider.dart';
import '../../providers/evaluation/evaluation_detail_provider.dart';
import '../../providers/evaluation/interview_evaluation_action_provider.dart';

class UpdateEvaluationScreen extends ConsumerStatefulWidget {
  final String applicationId;
  final String evaluationId;

  const UpdateEvaluationScreen({
    super.key,
    required this.applicationId,
    required this.evaluationId,
  });

  @override
  ConsumerState<UpdateEvaluationScreen> createState() =>
      _UpdateEvaluationScreenState();
}

class _UpdateEvaluationScreenState
    extends ConsumerState<UpdateEvaluationScreen> {
  final titleController = TextEditingController();
  final scoreController = TextEditingController();
  final strengthsController = TextEditingController();
  final concernsController = TextEditingController();
  final recommendationController = TextEditingController();
  final commentsController = TextEditingController();

  bool _initialized = false;
  bool _isSubmitting = false;

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

  void _initForm(InterviewEvaluation evaluation) {
    if (_initialized) return;

    titleController.text = evaluation.title ?? '';
    scoreController.text = evaluation.score?.toString() ?? '';
    strengthsController.text = evaluation.strengths ?? '';
    concernsController.text = evaluation.concerns ?? '';
    recommendationController.text = evaluation.recommendation ?? '';
    commentsController.text = evaluation.comments ?? '';

    _initialized = true;
  }

  bool _validate() {
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

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (_) => CustomDialog(
        message: message,
        type: 'error',
      ),
    );
  }

  Future<void> _submit() async {
    if (!_validate()) return;

    setState(() {
      _isSubmitting = true;
    });

    final request = {
      'jobApplicationId': widget.applicationId,
      'evaluationId': widget.evaluationId,
      'title': titleController.text.trim(),
      'score': int.parse(scoreController.text.trim()),
      'strengths': strengthsController.text.trim(),
      'concerns': concernsController.text.trim(),
      'recommendation': recommendationController.text.trim(),
      'comments': commentsController.text.trim(),
    };

    try {
      final success = await ref
          .read(interviewEvaluationActionProvider.notifier)
          .updateEvaluation(request);

      if (!mounted) return;

      if (success) {
        ref.invalidate(
          evaluationDetailProvider(
            (
            applicationId: widget.applicationId,
            evaluationId: widget.evaluationId,
            ),
          ),
        );

        ref.invalidate(jobApplicationDetailProvider(widget.applicationId));

        AppSnackbar.showSuccess(context, 'Cập nhật đánh giá thành công');
        context.pop(true);
      }
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
    final evaluationAsync = ref.watch(
      evaluationDetailProvider(
        (
        applicationId: widget.applicationId,
        evaluationId: widget.evaluationId,
        ),
      ),
    );

    final actionAsync = ref.watch(interviewEvaluationActionProvider);

    ref.listen(interviewEvaluationActionProvider, (previous, next) {
      next.whenOrNull(
        error: (error, _) {
          if (!mounted) return;
          AppSnackbar.showError(context, error.toString());
        },
      );
    });

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
          'Cập nhật đánh giá',
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
      body: evaluationAsync.when(
        data: (evaluation) {
          _initForm(evaluation);
          return _buildContent();
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Text(
            error.toString(),
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.red, fontSize: 14),
          ),
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
              onPressed: _isSubmitting || actionAsync.isLoading ? null : _submit,
              isLoading: _isSubmitting || actionAsync.isLoading,
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
              'THÔNG TIN ĐÁNH GIÁ',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 20),

            NormalTextField(
              controller: titleController,
              hintText: 'Tiêu đề đánh giá',
            ),
            const SizedBox(height: 16),

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

            const SizedBox(height: 28),
            const Text(
              'NỘI DUNG NHẬN XÉT',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 20),

            NormalTextField(
              controller: strengthsController,
              hintText: 'Điểm mạnh',
              maxLines: 4,
            ),
            const SizedBox(height: 16),

            NormalTextField(
              controller: concernsController,
              hintText: 'Điểm cần lưu ý',
              maxLines: 4,
            ),
            const SizedBox(height: 16),

            NormalTextField(
              controller: recommendationController,
              hintText: 'Đề xuất',
              maxLines: 4,
            ),
            const SizedBox(height: 16),

            NormalTextField(
              controller: commentsController,
              hintText: 'Ghi chú thêm',
              maxLines: 4,
            ),
          ],
        ),
      ),
    );
  }
}