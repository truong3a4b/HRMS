import 'package:flutter/material.dart';

import 'attendance_utils.dart';

class AttendanceMonthSelector extends StatelessWidget {
  final String month;
  final ValueChanged<String> onChanged;

  const AttendanceMonthSelector({
    super.key,
    required this.month,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => onChanged(_addMonth(month, -1)),
            icon: const Icon(Icons.chevron_left, color: Color(0xFF0069B4)),
          ),
          Expanded(
            child: Text(
              formatMonthTitle(month),
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF2F2F2F),
              ),
            ),
          ),
          IconButton(
            onPressed: () => onChanged(_addMonth(month, 1)),
            icon: const Icon(Icons.chevron_right, color: Color(0xFF0069B4)),
          ),
        ],
      ),
    );
  }
}

String _addMonth(String month, int delta) {
  final parts = month.split('-');
  final year = int.tryParse(parts.first) ?? DateTime.now().year;
  final monthNumber = parts.length > 1
      ? int.tryParse(parts[1]) ?? DateTime.now().month
      : DateTime.now().month;
  final date = DateTime(year, monthNumber + delta);
  return '${date.year}-${date.month.toString().padLeft(2, '0')}';
}
