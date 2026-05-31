import 'package:flutter/material.dart';

import 'attendance_utils.dart';

class AttendanceStatusBadge extends StatelessWidget {
  final String status;

  const AttendanceStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: attendanceStatusBackground(status),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        attendanceStatusLabel(status),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: attendanceStatusColor(status),
        ),
      ),
    );
  }
}
