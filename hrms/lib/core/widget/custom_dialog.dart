import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class CustomDialog extends StatelessWidget{
  final String type;
  final String message;
  late final Widget icon;
  final VoidCallback? onClose;



  CustomDialog({
    required this.type,
    required this.message,
    this.onClose,
  }){
    switch (type) {
      case 'success':
        this.icon = Icon(CupertinoIcons.check_mark_circled_solid, color: CupertinoColors.activeGreen, size: 42,);
        break;
      case 'error':
        this.icon = Icon(CupertinoIcons.clear_circled_solid, color: CupertinoColors.systemRed,size: 42,);
        break;
      case 'warning':
        this.icon = Icon(Icons.warning_amber_rounded, color: CupertinoColors.systemYellow, size: 42,);
        break;
      default:
        this.icon = Icon(Icons.info_outline, size: 42, color: CupertinoColors.activeBlue,);
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
            onClose?.call();
            Navigator.of(context).pop();
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