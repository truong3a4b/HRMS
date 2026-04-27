import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../feature/auth/presentation/providers/auth_provider.dart';

class AppConfirmDialog extends StatelessWidget {
  final String title;
  final String message;
  final String confirmText;
  final String cancelText;
  final bool isLoading;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;

  const AppConfirmDialog({
    super.key,
    required this.title,
    required this.message,
    this.confirmText = 'Xác nhận',
    this.cancelText = 'Hủy',
    this.isLoading = false,
    required this.onConfirm,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 16),

            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
              ),
            ),

            const SizedBox(height: 12),

            Text(
              message,
              style: const TextStyle(
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 34),

            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: isLoading ? null : onCancel,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF3F3F3),
                      padding: const EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder( borderRadius: BorderRadius.circular(8), ),
                    ),
                    child: Text(cancelText,style: TextStyle( fontSize: 15, fontWeight: FontWeight.w500, color: Colors.black, ),),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: isLoading ? null : onConfirm,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0E67B2),
                      padding: const EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder( borderRadius: BorderRadius.circular(8), ),
                    ),
                    child: isLoading
                        ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                        : Text(confirmText,style: TextStyle( fontSize: 15, fontWeight: FontWeight.w500, color: Colors.white, ),),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

