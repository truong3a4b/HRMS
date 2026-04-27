import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class CustomDialog extends StatelessWidget{
  final String type;
  final String message;

  final VoidCallback? onClose;



  CustomDialog({
    required this.type,
    required this.message,
    this.onClose,
  });

  Widget get icon {
    switch (type) {
      case 'success':
        return const Icon(
          CupertinoIcons.check_mark_circled_solid,
          color: CupertinoColors.activeGreen,
          size: 42,
        );
      case 'error':
        return const Icon(
          CupertinoIcons.clear_circled_solid,
          color: CupertinoColors.systemRed,
          size: 42,
        );
      case 'warning':
        return const Icon(
          Icons.warning_amber_rounded,
          color: CupertinoColors.systemYellow,
          size: 42,
        );
      default:
        return const Icon(
          Icons.info_outline,
          size: 42,
          color: CupertinoColors.activeBlue,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      icon: this.icon,
      backgroundColor: Colors.white,
      content: Text(
        this.message,
        textAlign: TextAlign.center,
        style: const TextStyle(fontSize: 14, color: Colors.black87),
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
            onClose?.call();

          },
          child: Text(
              "Đóng",
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Color(0xFF0A93F6),
              )
          ),
        )
      ],
    );
  }
}