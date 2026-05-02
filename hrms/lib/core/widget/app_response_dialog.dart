import 'package:flutter/material.dart';

import 'normal_text_field.dart';

class AppResponseDialog extends StatelessWidget {
  final String title;
  final String message;
  final String confirmText;
  final String cancelText;
  final bool isLoading;
  final TextEditingController controller;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;

  const AppResponseDialog({
    super.key,
    required this.title,
    required this.message,
    required this.controller,
    required this.onConfirm,
    required this.onCancel,
    this.confirmText = 'Xác nhận',
    this.cancelText = 'Hủy',
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Dialog(
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(20, 22, 20, 16 + bottomInset),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: const BoxDecoration(
                color: Color(0xFFE0F0FF),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.mail_outline,
                color: Color(0xFF0E67B2),
                size: 26,
              ),
            ),

            const SizedBox(height: 16),

            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Color(0xFF1F2937),
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 8),

            Text(
              message,
              style: const TextStyle(
                fontSize: 14,
                height: 1.4,
                color: Color(0xFF64748B),
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 20),

            NormalTextField(
              controller: controller,
              hintText: 'Ghi chú phản hồi',
              maxLines: 4,
            ),

            const SizedBox(height: 24),

            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: isLoading ? null : onCancel,
                      style: ElevatedButton.styleFrom(
                        elevation: 0,
                        backgroundColor: const Color(0xFFF3F4F6),
                        foregroundColor: const Color(0xFF374151),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        cancelText,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: isLoading ? null : onConfirm,
                      style: ElevatedButton.styleFrom(
                        elevation: 0,
                        backgroundColor: const Color(0xFF0E67B2),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: isLoading
                          ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                          : Text(
                        confirmText,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}