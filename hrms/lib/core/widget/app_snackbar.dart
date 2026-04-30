import 'package:flutter/material.dart';

class AppSnackbar {
  static void showError(BuildContext context, String message) {

    _show(context, message, backgroundColor: Colors.red);
  }

  static void showSuccess(BuildContext context, String message) {
    _show(context, message, backgroundColor: Colors.green);
  }

  static void showInfo(BuildContext context, String message) {
    _show(context, message, backgroundColor: Colors.blue);
  }

  static void _show(
    BuildContext context,
    String message, {
    required Color backgroundColor,
      ScaffoldMessengerState? messenger,
  }) {

    messenger = ScaffoldMessenger.of(context);

    messenger
      .showSnackBar(
        SnackBar(
          content: Text(
            message,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            textAlign: TextAlign.center,
          ),
          behavior: SnackBarBehavior.floating,
          backgroundColor: backgroundColor,
          margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
  }
}
