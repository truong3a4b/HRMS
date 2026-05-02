import 'package:flutter/material.dart';

class AppErrorCenter extends StatelessWidget {
  final String errorMessage;
  final VoidCallback? onRetry;

  const AppErrorCenter({super.key, required this.errorMessage, this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              errorMessage,
              style: const TextStyle(color: Colors.red, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: () {
                if (onRetry != null) {
                  onRetry!();
                }
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Tải lại'),
            ),
          ],
        ),
      ),
    );
  }
}
