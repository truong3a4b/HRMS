import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widget/app_primary_button.dart';
import '../../../../core/widget/app_snackbar.dart';
import '../../../../core/widget/normal_text_field.dart';
import '../providers/application/job_application_detail_provider.dart';
import '../providers/offer/offer_action_provider.dart';

class RespondOfferBottomSheet extends ConsumerStatefulWidget {
  final String applicationId;
  final bool isAccepted;

  const RespondOfferBottomSheet({
    super.key,
    required this.applicationId,
    required this.isAccepted,
  });

  @override
  ConsumerState<RespondOfferBottomSheet> createState() =>
      _RespondOfferBottomSheetState();
}

class _RespondOfferBottomSheetState
    extends ConsumerState<RespondOfferBottomSheet> {
  late final TextEditingController noteController;

  @override
  void initState() {
    super.initState();
    noteController = TextEditingController();
  }

  @override
  void dispose() {
    noteController.dispose();
    super.dispose();
  }

  bool _validateForm() {
    if (!widget.isAccepted && noteController.text.trim().isEmpty) {
      AppSnackbar.showError(context, 'Vui lòng nhập lý do từ chối offer');
      return false;
    }

    return true;
  }

  Future<void> _submit() async {
    if (!_validateForm()) return;

    final request = {
      'jobApplicationId': widget.applicationId,
      'decision': widget.isAccepted ? 'ACCEPTED' : 'DECLINED',
      'note': noteController.text.trim(),
    };

    final success = await ref
        .read(offerActionProvider.notifier)
        .respondOffer(request);

    if (!mounted) return;

    if (success) {
      AppSnackbar.showSuccess(
        context,
        widget.isAccepted
            ? 'Bạn đã đồng ý offer'
            : 'Bạn đã từ chối offer',
      );
      ref.invalidate(jobApplicationDetailProvider(widget.applicationId));
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

    final title = widget.isAccepted ? 'Đồng ý offer' : 'Từ chối offer';
    final desc = widget.isAccepted
        ? 'Xác nhận đồng ý nhận việc theo offer được gửi.'
        : 'Nhập lý do để phản hồi lại offer này.';

    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      child: DraggableScrollableSheet(
        expand: false,
        initialChildSize: widget.isAccepted ? 0.45 : 0.6,
        minChildSize: widget.isAccepted ? 0.45 : 0.6,
        maxChildSize: 0.75,
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
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      desc,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(height: 20),

                    NormalTextField(
                      controller: noteController,
                      hintText: widget.isAccepted
                          ? 'Ghi chú phản hồi nếu có'
                          : 'Lý do từ chối offer',
                      maxLines: 4,
                    ),
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
                          child: const Text('Hủy'),
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
                          text: widget.isAccepted ? 'Đồng ý' : 'Từ chối',
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